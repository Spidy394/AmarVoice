'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAITranscription } from '@/lib/useAITranscription';
import { toast } from 'sonner';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  Trash2, 
  Volume2,
  FileText,
  Brain,
  Sparkles,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Languages,
  Clock
} from 'lucide-react';

const SimpleAIVoiceRecorder = ({ 
  onRecordingComplete, 
  onTranscriptionComplete,
  onRecordingChange, 
  disabled = false,
  category = 'complaint',
  promptContext = '',
  className = ''
}) => {
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  // AI Transcription state
  const {
    isTranscribing,
    transcription,
    language: detectedLanguage,
    confidence,
    error: transcriptionError,
    processingSteps,
    transcribeAudio,
    cancelTranscription,
    clearTranscription,
    enhanceText
  } = useAITranscription();

  // UI state
  const [showTranscription, setShowTranscription] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhancedText, setEnhancedText] = useState('');

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const MAX_DURATION = 300; // 5 minutes in seconds
  useEffect(() => {
    // Check if browser supports MediaRecorder
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setIsSupported(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Remove audioUrl dependency to prevent infinite loop

  // Cleanup audioUrl when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);
  // Auto-show transcription when available
  useEffect(() => {
    if (transcription && transcription.trim()) {
      setShowTranscription(true);
      if (onTranscriptionComplete) {        onTranscriptionComplete({
          transcription,
          language: detectedLanguage,
          confidence,
          enhanced: enhancedText,
          success: true
        });
      }
    }
  }, [transcription, detectedLanguage, confidence, enhancedText]); // Remove callback from dependencies

  // Notify parent about recording changes
  useEffect(() => {
    if (onRecordingChange) {
      onRecordingChange({
        isRecording,
        hasRecording: !!audioBlob,
        transcription,
        isTranscribing
      });
    }
  }, [isRecording, audioBlob, transcription, isTranscribing]); // Remove callback from dependencies

  const startRecording = async () => {
    if (!isSupported) {
      toast.error('Voice recording is not supported in this browser');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Clear previous transcription
        clearTranscription();
        
        onRecordingComplete?.({
          blob,
          duration: recordingDuration,
          url
        });
        
        // Stop stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= MAX_DURATION) {
            stopRecording();
            toast.warning(`Recording stopped - maximum duration (${MAX_DURATION / 60} minutes) reached`);
          }
          return newDuration;
        });
      }, 1000);

      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      toast.success('Recording stopped');
    }
  };

  const playRecording = () => {
    if (audioRef.current && audioUrl) {
      if (isPaused) {
        audioRef.current.play();
        setIsPaused(false);
      } else {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
      setIsPlaying(true);
    }
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setIsPaused(false);
    setRecordingDuration(0);
    clearTranscription();
    setEnhancedText('');
    setShowTranscription(false);
    toast.info('Recording deleted');
  };

  const handleTranscribe = async () => {
    if (!audioBlob) {
      toast.error('No recording to transcribe');
      return;
    }

    try {
      await transcribeAudio(audioBlob, {
        language: 'auto',
        category,
        promptContext
      });
    } catch (error) {
      console.error('Transcription failed:', error);
    }
  };

  const handleEnhance = async () => {
    if (!transcription?.trim()) {
      toast.error('No transcription to enhance');
      return;
    }

    setIsEnhancing(true);
    try {
      const result = await enhanceText(transcription, {
        context: category,
        language: detectedLanguage || 'auto'
      });

      if (result.success) {
        setEnhancedText(result.enhancedText);
      }
    } catch (error) {
      console.error('Enhancement failed:', error);
    } finally {
      setIsEnhancing(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return (
      <Card className={`w-full ${className}`}>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Voice Recording Not Supported</h3>
            <p className="text-muted-foreground">
              Your browser doesn't support voice recording. Please use a modern browser like Chrome, Firefox, or Safari.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Recording Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice Recorder
            {isRecording && (
              <Badge variant="destructive" className="ml-auto">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1" />
                Recording
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Recording Timer */}
          {(isRecording || recordingDuration > 0) && (
            <div className="flex items-center justify-center space-x-2 text-lg font-mono">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(recordingDuration)}</span>
              {recordingDuration > 0 && (
                <span className="text-sm text-muted-foreground">
                  / {formatDuration(MAX_DURATION)}
                </span>
              )}
            </div>
          )}

          {/* Main Controls */}
          <div className="flex justify-center space-x-2">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                disabled={disabled || isTranscribing}
                size="lg"
                className="bg-red-500 hover:bg-red-600"
              >
                <Mic className="h-5 w-5 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
                size="lg"
                variant="outline"
              >
                <Square className="h-5 w-5 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>

          {/* Playback Controls */}
          {audioUrl && !isRecording && (
            <div className="flex justify-center space-x-2">
              {!isPlaying ? (
                <Button
                  onClick={playRecording}
                  variant="outline"
                  size="sm"
                  disabled={isTranscribing}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Play
                </Button>
              ) : (
                <Button
                  onClick={pausePlayback}
                  variant="outline"
                  size="sm"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}
              
              <Button
                onClick={deleteRecording}
                variant="outline"
                size="sm"
                disabled={isTranscribing}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          )}

          {/* Transcription Button */}
          {audioBlob && !isRecording && (
            <div className="flex justify-center">
              <Button
                onClick={handleTranscribe}
                disabled={isTranscribing || !audioBlob}
                size="lg"
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isTranscribing ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Transcribing...
                  </>
                ) : (
                  <>
                    <Brain className="h-5 w-5 mr-2" />
                    Transcribe with AI
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Hidden audio element */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => {
                setIsPlaying(false);
                setIsPaused(false);
              }}
              style={{ display: 'none' }}
            />
          )}
        </CardContent>
      </Card>

      {/* Processing Steps */}
      {isTranscribing && processingSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              AI Processing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {processingSteps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                  )}
                  <span className={step.completed ? 'text-green-700' : ''}>
                    {step.message}
                  </span>
                </div>
              ))}
            </div>
            {isTranscribing && (
              <div className="mt-4">
                <Button
                  onClick={cancelTranscription}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Transcription Results */}
      {transcription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Transcription Results
              <Badge variant="outline" className="ml-auto">
                <Languages className="h-3 w-3 mr-1" />
                {detectedLanguage?.toUpperCase() || 'AUTO'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Confidence Score */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Confidence:</span>
              <Progress value={confidence} className="flex-1" />
              <span className="text-sm text-muted-foreground">{confidence}%</span>
            </div>

            {/* Original Transcription */}
            <div>
              <h4 className="text-sm font-medium mb-2">Original Transcription:</h4>
              <div className="bg-muted p-3 rounded-md text-sm">
                {transcription}
              </div>
            </div>

            {/* Enhancement Controls */}
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">Enhanced Version:</h4>
              <Button
                onClick={handleEnhance}
                disabled={isEnhancing || !transcription}
                size="sm"
                variant="outline"
              >
                {isEnhancing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Enhancing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Enhance Text
                  </>
                )}
              </Button>
            </div>

            {/* Enhanced Text */}
            {enhancedText && (
              <div className="bg-green-50 border border-green-200 p-3 rounded-md text-sm">
                {enhancedText}
              </div>
            )}

            {/* Error Display */}
            {transcriptionError && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-md text-sm text-red-700">
                <AlertCircle className="h-4 w-4 inline mr-2" />
                {transcriptionError}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SimpleAIVoiceRecorder;
