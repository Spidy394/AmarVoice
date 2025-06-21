'use client';

import { useState, useCallback, useRef } from 'react';
import api from './api';
import { toast } from 'sonner';

/**
 * Custom hook for AI-powered voice transcription using Gemini API
 */
export const useAITranscription = () => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [language, setLanguage] = useState('en');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState(null);
  const [processingSteps, setProcessingSteps] = useState([]);

  const abortControllerRef = useRef(null);

  /**
   * Transcribe audio using Gemini API
   * @param {Blob} audioBlob - Audio blob to transcribe
   * @param {Object} options - Transcription options
   * @returns {Promise<Object>} Transcription result
   */
  const transcribeAudio = useCallback(async (audioBlob, options = {}) => {
    if (!audioBlob) {
      throw new Error('Audio blob is required for transcription');
    }

    setIsTranscribing(true);
    setError(null);
    setProcessingSteps([]);
    setTranscription('');

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      // Step 1: Prepare audio data
      setProcessingSteps(prev => [...prev, { step: 'preparing', message: 'Preparing audio data...', completed: false }]);
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      // Add options
      if (options.language) formData.append('language', options.language);
      if (options.promptContext) formData.append('promptContext', options.promptContext);
      if (options.category) formData.append('category', options.category);

      setProcessingSteps(prev => 
        prev.map(p => p.step === 'preparing' ? { ...p, completed: true } : p)
      );

      // Step 2: Upload and process
      setProcessingSteps(prev => [...prev, { step: 'uploading', message: 'Uploading to AI service...', completed: false }]);      const response = await api.post('/ai/transcribe', formData, {
        headers: {
          'Content-Type': undefined, // Let browser set the correct multipart boundary
        },
        signal: abortControllerRef.current.signal,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProcessingSteps(prev => 
            prev.map(p => 
              p.step === 'uploading' 
                ? { ...p, message: `Uploading... ${percentCompleted}%` }
                : p
            )
          );
        },
      });

      setProcessingSteps(prev => 
        prev.map(p => p.step === 'uploading' ? { ...p, completed: true } : p)
      );

      // Step 3: AI Processing
      setProcessingSteps(prev => [...prev, { step: 'transcribing', message: 'AI transcribing speech...', completed: false }]);

      const result = response.data;

      setProcessingSteps(prev => 
        prev.map(p => p.step === 'transcribing' ? { ...p, completed: true } : p)
      );

      // Step 4: Language detection and enhancement
      setProcessingSteps(prev => [...prev, { step: 'enhancing', message: 'Enhancing transcription...', completed: false }]);

      if (result.success) {
        setTranscription(result.transcription);
        setLanguage(result.detectedLanguage || 'en');
        setConfidence(result.confidence || 0);
        
        setProcessingSteps(prev => 
          prev.map(p => p.step === 'enhancing' ? { ...p, completed: true } : p)
        );

        toast.success('Voice transcribed successfully!');
        
        return {
          transcription: result.transcription,
          language: result.detectedLanguage,
          confidence: result.confidence,
          metadata: result.metadata || {},
          success: true
        };
      } else {
        throw new Error(result.error || 'Transcription failed');
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        toast.info('Transcription cancelled');
        setProcessingSteps([]);
        return { success: false, cancelled: true };
      }

      console.error('Transcription error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to transcribe audio';
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      setIsTranscribing(false);
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Real-time transcription for streaming audio
   * @param {MediaStream} stream - Audio stream
   * @param {Object} options - Streaming options
   * @returns {Promise<void>}
   */
  const startRealTimeTranscription = useCallback(async (stream, options = {}) => {
    if (!stream) {
      throw new Error('Audio stream is required');
    }

    setIsTranscribing(true);
    setError(null);
    setTranscription('');

    try {
      // This would implement real-time streaming transcription
      // For now, we'll simulate it with chunked audio processing
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      const audioChunks = [];
      const transcriptionChunks = [];

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
          
          // Process chunk if we have enough data (e.g., 3 seconds)
          if (audioChunks.length >= 3) {
            const chunkBlob = new Blob(audioChunks.splice(0, 3), { type: 'audio/webm' });
            
            try {
              const result = await transcribeAudio(chunkBlob, { 
                ...options, 
                realTime: true 
              });
              
              if (result.success) {
                transcriptionChunks.push(result.transcription);
                setTranscription(transcriptionChunks.join(' '));
              }
            } catch (chunkError) {
              console.error('Chunk transcription error:', chunkError);
            }
          }
        }
      };

      // Start recording in chunks
      mediaRecorder.start(1000); // 1 second chunks

      return () => {
        mediaRecorder.stop();
        setIsTranscribing(false);
      };

    } catch (error) {
      console.error('Real-time transcription error:', error);
      setError(error.message);
      setIsTranscribing(false);
      throw error;
    }
  }, [transcribeAudio]);

  /**
   * Cancel ongoing transcription
   */
  const cancelTranscription = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsTranscribing(false);
    setProcessingSteps([]);
  }, []);

  /**
   * Clear transcription state
   */
  const clearTranscription = useCallback(() => {
    setTranscription('');
    setLanguage('en');
    setConfidence(0);
    setError(null);
    setProcessingSteps([]);
  }, []);

  /**
   * Enhance existing text using AI
   * @param {string} text - Text to enhance
   * @returns {Promise<Object>} Enhanced text result
   */
  const enhanceText = useCallback(async (text, options = {}) => {
    if (!text?.trim()) {
      throw new Error('Text is required for enhancement');
    }

    try {
      const response = await api.post('/ai/enhance-text', {
        text: text.trim(),
        language: options.language || language,
        context: options.context || 'complaint',
        enhancementType: options.enhancementType || 'grammar_and_clarity'
      });

      if (response.data.success) {
        return {
          enhancedText: response.data.enhancedText,
          improvements: response.data.improvements || [],
          confidence: response.data.confidence || 0,
          success: true
        };
      } else {
        throw new Error(response.data.error || 'Text enhancement failed');
      }    } catch (error) {
      console.error('Text enhancement error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to enhance text');
    }
  }, [language]);

  /**
   * Analyze content for categorization and insights
   * @param {string} text - Text to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis result
   */
  const analyzeContent = useCallback(async (text, options = {}) => {
    if (!text?.trim()) {
      throw new Error('Text is required for analysis');
    }

    try {
      const response = await api.post('/ai/analyze', {
        text: text.trim(),
        language: options.language || 'auto',
        context: options.context || 'complaint',
        audioMetadata: options.audioMetadata || {}
      });

      const result = response.data;
      
      if (result.success) {
        return {
          success: true,
          analysis: result.analysis
        };
      } else {
        throw new Error(result.error || 'Analysis failed');
      }

    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Analysis failed';
      throw error;
    }
  }, []);
  return {
    // State
    isTranscribing,
    transcription,
    language,
    confidence,
    error,
    processingSteps,

    // Actions
    transcribeAudio,
    enhanceText,
    analyzeContent,
    cancelTranscription,
    clearTranscription,

    // Computed
    hasTranscription: !!transcription.trim(),
    isReady: !isTranscribing && !error,
    processingProgress: processingSteps.filter(s => s.completed).length / Math.max(processingSteps.length, 1) * 100
  };
};

export default useAITranscription;
