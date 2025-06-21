'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Lightbulb, 
  CheckSquare, 
  Phone, 
  Clock, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

const AISuggestion = ({ complaint, onGenerateAI, isGenerating = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const aiSuggestion = complaint.aiSuggestion;

  // If no AI suggestion exists and not generating, show generate button
  if (!aiSuggestion?.isGenerated && !isGenerating) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  AI Assistance Available
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Get personalized suggestions for resolving this issue
                </p>
              </div>
            </div>
            <Button 
              onClick={onGenerateAI}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Get AI Suggestion
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show loading state
  if (isGenerating) {
    return (
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100">
                Generating AI Suggestion...
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Analyzing your complaint and creating personalized recommendations
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show AI suggestion
  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                AI Suggestion
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <span>Tailored for {aiSuggestion.userLevel} level</span>
                <Badge 
                  variant="outline" 
                  className="border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300"
                >
                  {aiSuggestion.confidence} confidence
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Quick Summary */}
        <div className="mb-4">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 mt-1 flex-shrink-0" />
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {aiSuggestion.content?.substring(0, 200)}
              {aiSuggestion.content?.length > 200 && !isExpanded && '...'}
              {isExpanded && aiSuggestion.content?.substring(200)}
            </p>
          </div>
        </div>

        {/* Expected Timeline */}
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-300">
            Expected Timeline: {aiSuggestion.expectedTimeline}
          </span>
        </div>

        {isExpanded && (
          <>
            <Separator className="my-4" />
            
            {/* Action Steps */}
            {aiSuggestion.actionSteps && aiSuggestion.actionSteps.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-green-600" />
                  Recommended Actions
                </h5>
                <div className="space-y-2">
                  {aiSuggestion.actionSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Relevant Contacts */}
            {aiSuggestion.relevantContacts && aiSuggestion.relevantContacts.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-purple-600" />
                  Relevant Contacts
                </h5>
                <div className="space-y-3">
                  {aiSuggestion.relevantContacts.map((contact, index) => (
                    <div key={index} className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 border border-white/20">
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {contact.name}
                      </div>
                      <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">
                        {contact.type}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {contact.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Urgency Assessment */}
            <div className="flex items-center gap-2 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-white/20">
              <AlertCircle className={`w-4 h-4 ${
                aiSuggestion.urgencyLevel === 'critical' ? 'text-red-500' :
                aiSuggestion.urgencyLevel === 'high' ? 'text-orange-500' :
                aiSuggestion.urgencyLevel === 'medium' ? 'text-yellow-500' :
                'text-green-500'
              }`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                AI Assessment: {aiSuggestion.urgencyLevel.charAt(0).toUpperCase() + aiSuggestion.urgencyLevel.slice(1)} Priority
              </span>
            </div>

            {/* Generation timestamp */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
              Generated on {new Date(aiSuggestion.generatedAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AISuggestion;
