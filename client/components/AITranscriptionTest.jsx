'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AIVoiceRecorder from '@/components/SimpleAIVoiceRecorder';
import { useAITranscription } from '@/lib/useAITranscription';
import { toast } from 'sonner';
import { Brain, Mic, FileText, TestTube } from 'lucide-react';

const AITranscriptionTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [isTestingAPI, setIsTestingAPI] = useState(false);

  const {
    transcription,
    isTranscribing,
    language,
    confidence,
    error,
    enhanceText
  } = useAITranscription();

  const testAPIConnection = async () => {
    setIsTestingAPI(true);
    try {
      const response = await fetch('/api/ai/status');
      const data = await response.json();
      
      setTestResult(data);
      
      if (data.success && data.configured) {
        toast.success('AI service is configured and ready!');
      } else {
        toast.warning('AI service is not properly configured');
      }
    } catch (error) {
      console.error('API test failed:', error);
      toast.error('Failed to connect to AI service');
      setTestResult({ 
        success: false, 
        error: error.message,
        configured: false 
      });
    } finally {
      setIsTestingAPI(false);
    }
  };

  const handleTranscriptionComplete = (result) => {
    if (result.success) {
      toast.success(`Transcription completed with ${result.confidence}% confidence`);
    } else {
      toast.error('Transcription failed: ' + result.error);
    }
  };

  const handleTestEnhancement = async () => {
    if (!transcription.trim()) {
      toast.warning('Please transcribe some audio first');
      return;
    }

    try {
      const result = await enhanceText(transcription, {
        context: 'complaint',
        enhancementType: 'grammar_and_clarity'
      });
      
      if (result.success) {
        toast.success('Text enhanced successfully!');
        console.log('Enhanced text:', result.enhancedText);
        console.log('Improvements:', result.improvements);
      }
    } catch (error) {
      toast.error('Enhancement failed: ' + error.message);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-blue-500" />
            AI Transcription Testing Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={testAPIConnection}
              disabled={isTestingAPI}
              className="flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              {isTestingAPI ? 'Testing...' : 'Test AI Service'}
            </Button>
            
            <Button 
              onClick={handleTestEnhancement}
              disabled={!transcription.trim() || isTranscribing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Test Text Enhancement
            </Button>
          </div>

          {testResult && (
            <div className={`p-4 rounded-lg border ${
              testResult.success && testResult.configured 
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
            }`}>
              <h4 className="font-medium mb-2">API Test Results:</h4>
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-purple-500" />
            AI Voice Recorder Test
          </CardTitle>
        </CardHeader>
        <CardContent>          <AIVoiceRecorder
            onTranscriptionComplete={handleTranscriptionComplete}
            category="complaint"
            promptContext="This is a test recording for the AI transcription feature."
          />
          
          {transcription && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium mb-2 text-blue-900 dark:text-blue-100">
                Transcription Result:
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                {transcription}
              </p>
              <div className="flex gap-4 text-xs text-blue-600 dark:text-blue-400">
                <span>Language: {language}</span>
                <span>Confidence: {confidence}%</span>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <h4 className="font-medium mb-2 text-red-900 dark:text-red-100">
                Error:
              </h4>
              <p className="text-sm text-red-800 dark:text-red-200">
                {error}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AITranscriptionTest;
