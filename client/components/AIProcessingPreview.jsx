'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Zap, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';

const AIProcessingPreview = ({ 
  text, 
  audioBlob, 
  language, 
  onAnalysisComplete,
  isProcessing = false 
}) => {
  const [analysis, setAnalysis] = useState(null);
  const [processingStep, setProcessingStep] = useState('');
  const [progress, setProgress] = useState(0);

  // Mock AI analysis - in real implementation, this would call your AI API
  const performAIAnalysis = async (inputText, audioData, lang) => {
    if (!inputText && !audioData) return null;

    const steps = [
      'Analyzing text content...',
      'Detecting language patterns...',
      'Categorizing complaint...',
      'Assessing urgency level...',
      'Generating summary...',
      'Final processing...'
    ];

    // Simulate processing steps
    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(steps[i]);
      setProgress(((i + 1) / steps.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Mock analysis based on text content
    const analysisResult = generateMockAnalysis(inputText, lang);
    setAnalysis(analysisResult);
    onAnalysisComplete?.(analysisResult);
    
    return analysisResult;
  };

  const generateMockAnalysis = (text, language) => {
    const lowerText = text?.toLowerCase() || '';
    
    // Category detection
    let category = 'other';
    let categoryConfidence = 60;
    
    if (lowerText.includes('road') || lowerText.includes('bridge') || lowerText.includes('infrastructure')) {
      category = 'infrastructure';
      categoryConfidence = 85;
    } else if (lowerText.includes('safety') || lowerText.includes('crime') || lowerText.includes('police')) {
      category = 'public-safety';
      categoryConfidence = 90;
    } else if (lowerText.includes('water') || lowerText.includes('pollution') || lowerText.includes('environment')) {
      category = 'environment';
      categoryConfidence = 88;
    } else if (lowerText.includes('bus') || lowerText.includes('transport') || lowerText.includes('traffic')) {
      category = 'transportation';
      categoryConfidence = 82;
    } else if (lowerText.includes('hospital') || lowerText.includes('health') || lowerText.includes('medical')) {
      category = 'health';
      categoryConfidence = 87;
    }
    
    // Urgency detection
    let urgency = 'medium';
    let urgencyConfidence = 70;
    
    if (lowerText.includes('emergency') || lowerText.includes('urgent') || lowerText.includes('immediate')) {
      urgency = 'critical';
      urgencyConfidence = 95;
    } else if (lowerText.includes('danger') || lowerText.includes('serious') || lowerText.includes('important')) {
      urgency = 'high';
      urgencyConfidence = 85;
    } else if (lowerText.includes('minor') || lowerText.includes('small') || lowerText.includes('low priority')) {
      urgency = 'low';
      urgencyConfidence = 80;
    }
    
    // Generate summary
    const summary = text.length > 100 
      ? `${text.substring(0, 97)}...`
      : text;
    
    return {
      category: {
        value: category,
        confidence: categoryConfidence,
        alternatives: getAlternativeCategories(category)
      },
      urgency: {
        value: urgency,
        confidence: urgencyConfidence,
        reasoning: getUrgencyReasoning(urgency, lowerText)
      },
      summary: {
        text: summary,
        keyPoints: extractKeyPoints(text),
        sentiment: analyzeSentiment(lowerText)
      },
      language: {
        detected: language,
        confidence: 92
      },
      processingTime: '2.3s',
      timestamp: new Date().toISOString()
    };
  };

  const getAlternativeCategories = (primary) => {
    const alternatives = {
      'infrastructure': ['transportation', 'utilities'],
      'public-safety': ['governance', 'infrastructure'],
      'environment': ['health', 'utilities'],
      'transportation': ['infrastructure', 'public-safety'],
      'health': ['environment', 'public-safety'],
      'other': ['governance', 'utilities']
    };
    return alternatives[primary] || [];
  };

  const getUrgencyReasoning = (urgency, text) => {
    const reasons = {
      'critical': 'Emergency keywords detected, immediate action required',
      'high': 'Safety concerns or time-sensitive issues identified',
      'medium': 'Standard issue requiring timely attention',
      'low': 'Non-urgent matter for future consideration'
    };
    return reasons[urgency] || 'Standard priority assessment';
  };

  const extractKeyPoints = (text) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    return sentences.slice(0, 3).map(s => s.trim());
  };

  const analyzeSentiment = (text) => {
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'dangerous', 'broken'];
    const positiveWords = ['good', 'excellent', 'great', 'wonderful', 'amazing'];
    
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    
    if (negativeCount > positiveCount) return 'negative';
    if (positiveCount > negativeCount) return 'positive';
    return 'neutral';
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'infrastructure': '🏗️',
      'public-safety': '🚨',
      'environment': '🌱',
      'transportation': '🚌',
      'health': '🏥',
      'education': '🎓',
      'utilities': '⚡',
      'governance': '🏛️',
      'other': '📋'
    };
    return icons[category] || '📋';
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      'critical': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      'high': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      'low': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
    };
    return colors[urgency] || colors.medium;
  };

  useEffect(() => {
    if ((text || audioBlob) && isProcessing) {
      performAIAnalysis(text, audioBlob, language);
    }
  }, [text, audioBlob, language, isProcessing]);

  if (!isProcessing && !analysis) {
    return (
      <Card className="bg-gray-50 dark:bg-gray-800/50 border-dashed border-2 border-gray-300 dark:border-gray-600">
        <CardContent className="p-6 text-center">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">
            AI analysis will appear here after you add content
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AI Analysis Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isProcessing && !analysis && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4 animate-spin" />
              {processingStep}
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            {/* Category */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Category</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="flex items-center gap-1">
                  <span>{getCategoryIcon(analysis.category.value)}</span>
                  <span className="capitalize">{analysis.category.value.replace('-', ' ')}</span>
                  <span className="text-xs opacity-70">({analysis.category.confidence}%)</span>
                </Badge>
                {analysis.category.alternatives.length > 0 && (
                  <span className="text-xs text-gray-500">
                    Alternatives: {analysis.category.alternatives.join(', ')}
                  </span>
                )}
              </div>
            </div>

            {/* Urgency */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <span className="font-medium">Urgency Level</span>
              </div>
              <div className="space-y-1">
                <Badge className={`${getUrgencyColor(analysis.urgency.value)} capitalize`}>
                  {analysis.urgency.value} Priority ({analysis.urgency.confidence}%)
                </Badge>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {analysis.urgency.reasoning}
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-green-500" />
                <span className="font-medium">AI Summary</span>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  {analysis.summary.text}
                </p>
                {analysis.summary.keyPoints.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Key Points:
                    </span>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {analysis.summary.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-blue-500">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Processing Info */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                <span>Processed in {analysis.processingTime}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>Language: {analysis.language.detected.toUpperCase()}</span>
                <span>({analysis.language.confidence}%)</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIProcessingPreview;
