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
  X,
  RefreshCw,
  Languages,
  Clock
} from 'lucide-react';

const AIVoiceRecorder = ({ 
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
    startRealTimeTranscription,
    cancelTranscription,
    clearTranscription,
    enhanceText,
    hasTranscription,
    processingProgress
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
  const realTimeStopperRef = useRef(null);

  const MAX_DURATION = 300; // 5 minutes in seconds

  useEffect(() => {
    // Check if browser supports MediaRecorder and Web Audio API
    if (!navigator.mediaDevices || !window.MediaRecorder) {
      setIsSupported(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (realTimeStopperRef.current) {
        realTimeStopperRef.current();
      }
    };
  }, [audioUrl]);

  // Auto-show transcription when available
  useEffect(() => {
    if (hasTranscription && !showTranscription) {
      setShowTranscription(true);
    }
  }, [hasTranscription, showTranscription]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      streamRef.current = stream;

      // Start real-time transcription if enabled
      if (enableRealTimeTranscription) {
        try {
          const stopper = await startRealTimeTranscription(stream, {
            category,
            promptContext,
            language: detectedLanguage
          });
          realTimeStopperRef.current = stopper;
        } catch (rtError) {
          console.warn('Real-time transcription failed, falling back to post-recording:', rtError);
          toast.warning('Real-time transcription unavailable, will transcribe after recording');
        }
      }

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        onRecordingComplete?.(blob);
        onRecordingChange?.({ blob, duration: recordingDuration, url });

        // Auto-transcribe if not using real-time transcription
        if (!enableRealTimeTranscription && blob.size > 0) {
          handleTranscribeRecording(blob);
        }
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };

      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration counter
      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= MAX_DURATION) {
            stopRecording();
            return MAX_DURATION;
          }
          return newDuration;
        });
      }, 1000);

      toast.success('Recording started!');

    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      if (realTimeStopperRef.current) {
        realTimeStopperRef.current();
        realTimeStopperRef.current = null;
      }

      toast.success('Recording completed!');
    }
  };

  const handleTranscribeRecording = async (blob) => {
    if (!blob) return;

    try {
      const result = await transcribeAudio(blob, {
        category,
        promptContext,
        language: detectedLanguage
      });

      if (result.success) {
        onTranscriptionComplete?.(result);
        setShowTranscription(true);
      }
    } catch (error) {
      console.error('Transcription failed:', error);
    }
  };

  const handleEnhanceText = async () => {
    if (!transcription.trim()) return;

    setIsEnhancing(true);
    try {
      const result = await enhanceText(transcription, {
        context: category,
        enhancementType: 'grammar_and_clarity'
      });

      if (result.success) {
        setEnhancedText(result.enhancedText);
        toast.success('Text enhanced successfully!');
      }
    } catch (error) {
      toast.error('Failed to enhance text: ' + error.message);
    } finally {
      setIsEnhancing(false);
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
    setRecordingDuration(0);
    setIsPlaying(false);
    setIsPaused(false);
    setShowTranscription(false);
    setEnhancedText('');
    
    clearTranscription();
    onRecordingChange?.(null);
    
    toast.success('Recording deleted');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return (recordingDuration / MAX_DURATION) * 100;
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 80) return 'text-green-600 dark:text-green-400';
    if (conf >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (!isSupported) {
    return (
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
            <MicOff className="w-5 h-5" />
            <span>Voice recording not supported in this browser</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Recording Card */}
      <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-gray-500" />
              <span>AI Voice Recording</span>
              {enableRealTimeTranscription && (
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Real-time
                </Badge>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {formatTime(recordingDuration)} / {formatTime(MAX_DURATION)}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Bar */}
          {(isRecording || recordingDuration > 0) && (
            <div className="space-y-2">
              <Progress 
                value={getProgressPercentage()} 
                className="h-2"
              />
              {isRecording && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Recording...
                  {enableRealTimeTranscription && isTranscribing && (
                    <span className="text-blue-600 dark:text-blue-400">
                      • AI Transcribing
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {!isRecording && !audioBlob && (
              <Button
                onClick={startRecording}
                disabled={disabled}
                className="flex items-center gap-2"
                variant="default"
              >
                <Mic className="w-4 h-4" />
                Start Recording
              </Button>
            )}

            {isRecording && (
              <Button
                onClick={stopRecording}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <Square className="w-4 h-4" />
                Stop Recording
              </Button>
            )}

            {audioBlob && !isRecording && (
              <>
                {!isPlaying ? (
                  <Button
                    onClick={playRecording}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    {isPaused ? 'Resume' : 'Play'}
                  </Button>
                ) : (
                  <Button
                    onClick={pausePlayback}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    Pause
                  </Button>
                )}
                
                {!hasTranscription && !isTranscribing && (
                  <Button
                    onClick={() => handleTranscribeRecording(audioBlob)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Brain className="w-4 h-4" />
                    Transcribe
                  </Button>
                )}

                <Button
                  onClick={deleteRecording}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}

            {isTranscribing && (
              <Button
                onClick={cancelTranscription}
                variant="outline"
                className="flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            )}
          </div>

          {/* Recording Info */}
          {audioBlob && (
            <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <span>Recording ready</span>
                <span>{(audioBlob.size / 1024).toFixed(1)} KB</span>
              </div>
            </div>
          )}

          {/* Audio Element */}
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => {
                setIsPlaying(false);
                setIsPaused(false);
              }}
              className="hidden"
            />
          )}
        </CardContent>
      </Card>

      {/* AI Processing Status */}
      {isTranscribing && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600 animate-pulse" />
                <span className="font-medium">AI Processing</span>
              </div>
              
              <Progress value={processingProgress} className="h-2" />
              
              <div className="space-y-1">
                {processingSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {step.completed ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-blue-500 animate-spin" />
                    )}
                    <span className={step.completed ? 'text-gray-600' : 'text-blue-600'}>
                      {step.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transcription Error */}
      {transcriptionError && (
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Transcription Failed</span>
            </div>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              {transcriptionError}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Transcription Results */}
      {hasTranscription && showTranscription && (
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                <span>AI Transcription</span>
              </div>
              <div className="flex items-center gap-2">
                {detectedLanguage && (
                  <Badge variant="outline" className="text-xs">
                    <Languages className="w-3 h-3 mr-1" />
                    {detectedLanguage.toUpperCase()}
                  </Badge>
                )}
                {confidence > 0 && (
                  <Badge variant="outline" className={`text-xs ${getConfidenceColor(confidence)}`}>
                    {confidence}% confidence
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
              <p className="text-sm leading-relaxed">
                {enhancedText || transcription}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleEnhanceText}
                disabled={isEnhancing || !transcription.trim()}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {isEnhancing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {enhancedText ? 'Re-enhance' : 'Enhance Text'}
              </Button>

              <Button
                onClick={() => setShowTranscription(false)}
                variant="ghost"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {enhancedText && enhancedText !== transcription && (
              <div className="text-xs text-gray-500 border-t pt-2">
                <strong>Original:</strong> {transcription}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIVoiceRecorder;
