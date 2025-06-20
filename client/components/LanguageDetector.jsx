'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Languages, Globe } from 'lucide-react';

const LanguageDetector = ({ text, onLanguageChange, selectedLanguage, disabled = false }) => {
  const [detectedLanguage, setDetectedLanguage] = useState(null);
  const [confidence, setConfidence] = useState(0);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' }
  ];

  // Simple language detection based on character patterns
  const detectLanguage = (inputText) => {
    if (!inputText || inputText.trim().length < 10) {
      return { language: null, confidence: 0 };
    }

    const bengaliPattern = /[\u0980-\u09FF]/;
    const englishPattern = /[a-zA-Z]/;
    
    const bengaliChars = (inputText.match(/[\u0980-\u09FF]/g) || []).length;
    const englishChars = (inputText.match(/[a-zA-Z]/g) || []).length;
    const totalChars = bengaliChars + englishChars;
    
    if (totalChars === 0) {
      return { language: null, confidence: 0 };
    }

    if (bengaliChars > englishChars) {
      return { 
        language: 'bn', 
        confidence: Math.min(95, (bengaliChars / totalChars) * 100) 
      };
    } else {
      return { 
        language: 'en', 
        confidence: Math.min(95, (englishChars / totalChars) * 100) 
      };
    }
  };

  useEffect(() => {
    const result = detectLanguage(text);
    setDetectedLanguage(result.language);
    setConfidence(result.confidence);
    
    // Auto-select detected language if confidence is high and no manual selection
    if (result.confidence > 70 && !selectedLanguage && result.language) {
      onLanguageChange?.(result.language);
    }
  }, [text, selectedLanguage, onLanguageChange]);

  const handleLanguageSelect = (languageCode) => {
    onLanguageChange?.(languageCode);
  };

  const getLanguageName = (code) => {
    const lang = languages.find(l => l.code === code);
    return lang ? lang.name : code;
  };

  const getLanguageFlag = (code) => {
    const lang = languages.find(l => l.code === code);
    return lang ? lang.flag : '🌐';
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-white/20">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Language</span>
          </div>

          {/* Language Selection Buttons */}
          <div className="flex gap-2">
            {languages.map(lang => (
              <Button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                variant={selectedLanguage === lang.code ? 'default' : 'outline'}
                size="sm"
                disabled={disabled}
                className="flex items-center gap-2"
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </Button>
            ))}
          </div>

          {/* Auto-detection Info */}
          {detectedLanguage && confidence > 50 && (
            <div className="flex items-center gap-2 text-sm">
              <Globe className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">
                Auto-detected: 
              </span>
              <Badge variant="secondary" className="flex items-center gap-1">
                <span>{getLanguageFlag(detectedLanguage)}</span>
                <span>{getLanguageName(detectedLanguage)}</span>
                <span className="text-xs opacity-70">({confidence.toFixed(0)}%)</span>
              </Badge>
            </div>
          )}

          {/* Current Selection */}
          {selectedLanguage && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600 dark:text-gray-400">Selected:</span>
              <Badge variant="default" className="flex items-center gap-1">
                <span>{getLanguageFlag(selectedLanguage)}</span>
                <span>{getLanguageName(selectedLanguage)}</span>
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LanguageDetector;
