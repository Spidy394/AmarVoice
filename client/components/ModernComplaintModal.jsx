'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-store';
import api from '@/lib/api';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import VoiceRecorder from './VoiceRecorder';
import SimpleAIVoiceRecorder from './SimpleAIVoiceRecorder';
import LanguageDetector from './LanguageDetector';
import AIProcessingPreview from './AIProcessingPreview';
import { 
  MessageSquare, 
  Mic, 
  Brain, 
  Send, 
  FileText, 
  MapPin,
  AlertTriangle,
  Camera,
  Sparkles,
  CheckCircle,
  X
} from 'lucide-react';

const ModernComplaintModal = ({ isOpen, onClose, onSubmit }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    urgency: 'medium',
    location: {
      address: '',
      coordinates: null
    },
    tags: [],
    isAnonymous: false
  });
  const [textContent, setTextContent] = useState('');
  const [audioRecording, setAudioRecording] = useState(null);
  const [transcriptionData, setTranscriptionData] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState('text');

  const CHARACTER_LIMIT = 500;
  const steps = ['Content', 'AI Analysis', 'Review & Submit'];  // Auto-trigger AI analysis when content changes
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (textContent.trim().length > 10 && !isProcessingAI) {
        setIsProcessingAI(true);
      }
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [textContent]); // Only depend on textContent to avoid loops

  const handleTextChange = (e) => {
    const value = e.target.value;
    if (value.length <= CHARACTER_LIMIT) {
      setTextContent(value);
    }
  };
  const handleAudioRecording = (recordingData) => {
    setAudioRecording(recordingData);
  };

  const handleTranscriptionComplete = (transcriptionResult) => {
    setTranscriptionData(transcriptionResult);
    
    // Auto-populate text content with transcription
    if (transcriptionResult.transcription && !textContent.trim()) {
      setTextContent(transcriptionResult.transcription);
    }
    
    // Update detected language
    if (transcriptionResult.language) {
      setSelectedLanguage(transcriptionResult.language);
    }
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };
  const handleAIAnalysisComplete = (analysis) => {
    setAiAnalysis(analysis);
    setIsProcessingAI(false);
    
    // Auto-populate form with AI analysis
    if (analysis) {
      setFormData(prev => ({
        ...prev,
        category: analysis.category?.value || prev.category,
        urgency: analysis.urgency?.value || prev.urgency,
        title: analysis.summary?.text?.substring(0, 100) + (analysis.summary?.text?.length > 100 ? '...' : '') || prev.title,
        // Don't override description since we use textContent for that
      }));
    }
  };
  const handleSubmit = async () => {
    if (!textContent.trim() && !audioRecording) {
      alert('Please provide either text or voice input');
      return;
    }

    if (!formData.title.trim()) {
      alert('Please provide a title for your complaint');
      return;
    }

    if (!formData.category) {
      alert('Please select a category for your complaint');
      return;
    }

    if (!formData.location.address.trim()) {
      alert('Please provide the location where the issue occurred');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const complaintData = {
        title: formData.title.trim(),
        description: textContent.trim(),
        category: formData.category,
        location: {
          address: formData.location.address.trim(),
          coordinates: formData.location.coordinates
        },
        urgency: formData.urgency || 'medium',
        tags: formData.tags || [],
        isAnonymous: formData.isAnonymous || false,
        language: selectedLanguage,
        aiAnalysis: aiAnalysis,
        transcriptionData: transcriptionData,
        audioRecording: audioRecording ? {
          size: audioRecording.blob?.size,
          duration: audioRecording.duration,
          hasAudio: true
        } : null
      };

      console.log('Submitting complaint data:', complaintData);
      const response = await api.post('/complaints', complaintData);
      
      if (response.data) {
        console.log('Complaint submitted successfully:', response.data);
        onSubmit?.(response.data);
        handleClose();
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      console.error('Response data:', error.response?.data);
      
      // Provide more specific error messages
      if (error.response?.status === 400) {
        alert('Invalid complaint data. Please check all required fields.');
      } else if (error.response?.status === 401) {
        alert('You must be logged in to submit a complaint.');
      } else {
        alert('Failed to submit complaint. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      urgency: 'medium',
      location: { address: '', coordinates: null },
      tags: [],
      isAnonymous: false
    });    setTextContent('');
    setAudioRecording(null);
    setTranscriptionData(null);
    setSelectedLanguage('en');
    setAiAnalysis(null);
    setIsProcessingAI(false);
    setCurrentStep(0);
    setActiveTab('text');
    onClose();
  };

  const getProgressPercentage = () => {
    return ((currentStep + 1) / steps.length) * 100;
  };  const canProceedToNext = () => {
    switch (currentStep) {
      case 0:
        return textContent.trim().length > 10 || audioRecording || transcriptionData;
      case 1:
        return aiAnalysis && !isProcessingAI;
      case 2:
        return formData.title && textContent.trim() && formData.category && formData.location.address.trim();
      default:
        return false;
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Share Your Concern</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Describe your issue in text or record a voice message
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Text Input
                </TabsTrigger>
                <TabsTrigger value="voice" className="flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  Voice Recording
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="complaint-text">Describe your complaint</Label>
                  <Textarea
                    id="complaint-text"
                    placeholder="Explain your issue in detail. What happened? Where did it occur? What needs to be addressed?"
                    value={textContent}
                    onChange={handleTextChange}
                    className="min-h-32 resize-none"
                  />
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      {textContent.length}/{CHARACTER_LIMIT} characters
                    </span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(textContent.length / CHARACTER_LIMIT) * 100} 
                        className="w-20 h-2"
                      />
                      {textContent.length >= CHARACTER_LIMIT * 0.9 && (
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>              <TabsContent value="voice" className="space-y-4">
                <SimpleAIVoiceRecorder
                  onRecordingComplete={handleAudioRecording}
                  onTranscriptionComplete={handleTranscriptionComplete}
                  onRecordingChange={handleAudioRecording}
                  category={formData.category || 'complaint'}
                  promptContext="This is a civic complaint recording. Please transcribe clearly for official documentation."
                />
                
                {transcriptionData && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        AI Transcription Complete
                      </span>
                      {transcriptionData.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {transcriptionData.confidence}% confidence
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Your voice has been automatically transcribed and added to the text field. 
                      You can edit the text above if needed.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <LanguageDetector
              text={textContent}
              onLanguageChange={handleLanguageChange}
              selectedLanguage={selectedLanguage}
            />
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                AI Analysis
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our AI is analyzing your complaint to categorize and prioritize it
              </p>
            </div>

            <AIProcessingPreview
              text={textContent}
              audioBlob={audioRecording?.blob}
              language={selectedLanguage}
              onAnalysisComplete={handleAIAnalysisComplete}
              isProcessing={isProcessingAI}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Review & Submit</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Review the details and submit your complaint
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief title for your complaint"
                  className={!formData.title.trim() ? "border-red-300 focus:border-red-500" : ""}
                />
                {!formData.title.trim() && (
                  <p className="text-sm text-red-600">Title is required</p>
                )}
              </div>              <div className="space-y-2">
                <Label>Category *</Label>
                <div className="flex items-center gap-2">
                  {formData.category ? (
                    <Badge className="capitalize">
                      {formData.category.replace('-', ' ')}
                    </Badge>
                  ) : (
                    <p className="text-sm text-red-600">Category is required - AI will auto-detect this</p>
                  )}
                  {aiAnalysis && aiAnalysis.category && (
                    <span className="text-xs text-gray-500">
                      (AI suggested with {aiAnalysis.category.confidence || 0}% confidence)
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Urgency Level</Label>
                <div className="flex items-center gap-2">
                  <Badge variant={formData.urgency === 'critical' ? 'destructive' : 'secondary'}>
                    {formData.urgency} Priority
                  </Badge>
                  {aiAnalysis && (
                    <span className="text-xs text-gray-500">
                      (AI suggested: {aiAnalysis.urgency.reasoning})
                    </span>
                  )}
                </div>
              </div>              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location.address}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    location: { ...prev.location, address: e.target.value }
                  }))}
                  placeholder="Address or location where the issue occurred"
                  className={!formData.location.address.trim() ? "border-red-300 focus:border-red-500" : ""}
                />
                {!formData.location.address.trim() && (
                  <p className="text-sm text-red-600">Location is required</p>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Summary</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {textContent.substring(0, 200)}
                  {textContent.length > 200 ? '...' : ''}
                </p>                {audioRecording && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Mic className="w-4 h-4" />
                    <span>Voice recording included ({audioRecording.duration}s)</span>
                  </div>
                )}
                {transcriptionData && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Brain className="w-4 h-4" />
                    <span>AI transcription: {transcriptionData.confidence}% confidence</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Submit New Complaint
          </DialogTitle>
          <DialogDescription>
            Use our AI-powered system to efficiently categorize and prioritize your civic complaint
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{steps[currentStep]}</span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </div>

        <Separator />

        {/* Step Content */}
        <div className="min-h-96">
          {getStepContent()}
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
                {currentStep < steps.length - 1 ? (
                <Button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canProceedToNext()}
                  className="flex items-center gap-2"
                >
                  Next
                  {!canProceedToNext() && currentStep === 0 && (
                    <span className="text-xs opacity-70">
                      (Add content first)
                    </span>
                  )}
                  {!canProceedToNext() && currentStep === 1 && (
                    <span className="text-xs opacity-70">
                      (Waiting for AI analysis)
                    </span>
                  )}
                  {!canProceedToNext() && currentStep === 2 && (
                    <span className="text-xs opacity-70">
                      (Complete required fields)
                    </span>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceedToNext() || isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Complaint
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModernComplaintModal;
