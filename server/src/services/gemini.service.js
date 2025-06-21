import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiService {
  constructor() {
    this.genAI = null;
    this.client = null;
    this.initialized = false;
  }
  
  /**
   * Initialize the Gemini service lazily
   */
  initialize() {
    if (this.initialized) return;
    
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found in environment variables');
      this.genAI = null;
      this.client = null;
    } else {
      try {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.client = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        console.log('Gemini AI service initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Gemini AI service:', error);
        this.genAI = null;
        this.client = null;
      }
    }
    this.initialized = true;
  }

  /**
   * Generate AI suggestions for a complaint based on user level, location, and issue type
   * @param {Object} complaint - The complaint object
   * @param {Object} user - The user object with reputation/level info
   * @returns {Promise<Object>} AI suggestion object
   */  async generateComplaintSuggestion(complaint, user) {
    this.initialize(); // Ensure service is initialized
    
    if (!this.genAI) {
      throw new Error('Gemini API not configured. Please set GEMINI_API_KEY environment variable.');
    }

    try {
      // Determine user level based on reputation
      const userLevel = this.getUserLevel(user.reputation);      const prompt = this.buildSuggestionPrompt(complaint, user, userLevel);
      const result = await this.client.generateContent([{ text: prompt }]);
      const response = await result.response;
      const text = response.text();
      
      // Parse the AI response
      const suggestion = this.parseAISuggestion(text);
      
      return {
        content: suggestion.content,
        actionSteps: suggestion.actionSteps,
        relevantContacts: suggestion.relevantContacts,
        expectedTimeline: suggestion.expectedTimeline,
        urgencyLevel: suggestion.urgencyLevel,
        userLevel: userLevel,
        generatedAt: new Date(),
        confidence: suggestion.confidence || 'medium'
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate AI suggestion: ' + error.message);
    }
  }

  /**
   * Determine user level based on reputation score
   * @param {number} reputation - User's reputation score
   * @returns {string} User level
   */
  getUserLevel(reputation) {
    if (reputation >= 1000) return 'expert';
    if (reputation >= 500) return 'experienced';
    if (reputation >= 100) return 'intermediate';
    return 'beginner';
  }

  /**
   * Build the prompt for AI suggestion generation
   * @param {Object} complaint - The complaint object
   * @param {Object} user - The user object
   * @param {string} userLevel - The user's experience level
   * @returns {string} The formatted prompt
   */
  buildSuggestionPrompt(complaint, user, userLevel) {
    const locationContext = this.getLocationContext(complaint.location);
    const categoryGuidance = this.getCategoryGuidance(complaint.category);
    
    return `You are an AI assistant specialized in helping citizens resolve public complaints and civic issues in India. Generate practical, realistic suggestions for the following complaint.

COMPLAINT DETAILS:
- Title: ${complaint.title}
- Category: ${complaint.category}
- Description: ${complaint.description}
- Urgency: ${complaint.urgency}
- Location: ${complaint.location.address}${complaint.location.city ? `, ${complaint.location.city}` : ''}${complaint.location.district ? `, ${complaint.location.district}` : ''}${complaint.location.state ? `, ${complaint.location.state}` : ''}

USER PROFILE:
- Experience Level: ${userLevel} (reputation: ${user.reputation})
- User Location: ${user.location || 'Not specified'}
- Verified Status: ${user.isVerified ? 'Government Verified' : 'Not verified'}

CONTEXT GUIDELINES:
${locationContext}
${categoryGuidance}

INSTRUCTIONS FOR USER LEVEL "${userLevel.toUpperCase()}":
${this.getUserLevelInstructions(userLevel)}

Please provide actionable suggestions considering:
1. The user's experience level and capability
2. The specific location and local governance structure
3. The category and nature of the issue
4. Realistic timelines and expectations
5. Appropriate authorities and escalation paths

Respond in the following JSON format:
{
  "content": "A clear, practical suggestion (200-400 words) explaining what the user should do and why. Consider their experience level.",
  "actionSteps": [
    "Step 1: Immediate action to take",
    "Step 2: Follow-up action", 
    "Step 3: Escalation step if needed"
  ],
  "relevantContacts": [
    {
      "type": "Primary Authority",
      "name": "Specific department/office name",
      "description": "When and how to contact them"
    }
  ],
  "expectedTimeline": "Realistic timeframe (e.g. '1-2 weeks', '2-4 weeks')",
  "urgencyLevel": "low/medium/high/critical",
  "confidence": "low/medium/high"
}

Make suggestions practical, location-aware, and appropriate for the user's experience level.`;
  }

  /**
   * Get location-specific context for better suggestions
   * @param {Object} location - Location object from complaint
   * @returns {string} Location context
   */
  getLocationContext(location) {
    // Basic Indian governance context - this could be enhanced with more specific location data
    return `LOCATION CONTEXT:
- India follows a three-tier governance system: Central, State, and Local (Municipal/Panchayat)
- Local issues are typically handled by Municipal Corporations, Municipalities, or Panchayats
- State-level departments handle broader infrastructure and policy issues
- Emergency services and critical issues may require immediate escalation`;
  }

  /**
   * Get category-specific guidance
   * @param {string} category - Complaint category
   * @returns {string} Category guidance
   */
  getCategoryGuidance(category) {
    const categoryMap = {
      'infrastructure': 'Infrastructure issues typically involve PWD, Municipal Corporation, or local development authorities.',
      'public-safety': 'Safety issues should be reported to local police, fire department, or disaster management authorities.',
      'environment': 'Environmental concerns involve Pollution Control Board, Forest Department, or Municipal waste management.',
      'transportation': 'Transport issues are handled by RTO, Traffic Police, or local transport authorities.',
      'health': 'Health issues involve PHCs, District Health Officer, or state health departments.',
      'education': 'Education matters are handled by Block Education Officer, District Education Officer, or school management.',
      'utilities': 'Utility services involve electricity board, water department, or telecom authorities.',
      'governance': 'Governance issues may require RTI applications, Grievance Redressal Officer, or higher administrative levels.',
      'other': 'General civic issues typically start with local Municipal/Panchayat offices.'
    };

    return `CATEGORY GUIDANCE: ${categoryMap[category] || categoryMap['other']}`;
  }

  /**
   * Get user level specific instructions
   * @param {string} userLevel - User experience level
   * @returns {string} Level-specific instructions
   */
  getUserLevelInstructions(userLevel) {
    const instructions = {
      'beginner': `
- Provide step-by-step guidance with clear explanations
- Include basic information about government processes
- Suggest starting with local authorities
- Explain documentation requirements
- Provide contact methods and office hours`,
      
      'intermediate': `
- Assume basic knowledge of government processes
- Provide efficient pathways and shortcuts
- Include alternative approaches if first attempt fails
- Suggest parallel actions for faster resolution
- Mention relevant laws or regulations briefly`,
      
      'experienced': `
- Focus on strategic approaches and best practices
- Include advanced escalation options
- Suggest leveraging networks and contacts
- Mention legal remedies if applicable
- Provide nuanced timing advice`,
      
      'expert': `
- Provide sophisticated strategies and systemic approaches
- Include policy-level considerations
- Suggest collaboration with advocacy groups
- Mention precedent cases or successful strategies
- Focus on sustainable long-term solutions`
    };

    return instructions[userLevel] || instructions['beginner'];
  }

  /**
   * Parse the AI response and extract structured suggestion
   * @param {string} responseText - Raw AI response
   * @returns {Object} Parsed suggestion object
   */
  parseAISuggestion(responseText) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          content: parsed.content || 'AI suggestion generated successfully.',
          actionSteps: Array.isArray(parsed.actionSteps) ? parsed.actionSteps : [],
          relevantContacts: Array.isArray(parsed.relevantContacts) ? parsed.relevantContacts : [],
          expectedTimeline: parsed.expectedTimeline || 'Timeline varies based on issue complexity',
          urgencyLevel: parsed.urgencyLevel || 'medium',
          confidence: parsed.confidence || 'medium'
        };
      }
      
      // Fallback if JSON parsing fails
      return this.createFallbackSuggestion(responseText);
    } catch (error) {
      console.error('Error parsing AI suggestion:', error);
      return this.createFallbackSuggestion(responseText);
    }
  }

  /**
   * Create a fallback suggestion when parsing fails
   * @param {string} responseText - Raw response text
   * @returns {Object} Fallback suggestion object
   */
  createFallbackSuggestion(responseText) {
    return {
      content: responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''),
      actionSteps: [
        'Contact the relevant local authority for your area',
        'Document the issue with photos and written description',
        'Follow up within appropriate timeframe',
        'Escalate to higher authorities if no response'
      ],
      relevantContacts: [{
        type: 'Local Authority',
        name: 'Municipal Corporation / Panchayat Office',
        description: 'Start with your local civic body for most issues'
      }],
      expectedTimeline: 'Varies depending on issue complexity and local response time',
      urgencyLevel: 'medium',
      confidence: 'low'
    };
  }

  /**
   * Generate follow-up suggestions based on complaint status
   * @param {Object} complaint - The complaint object
   * @param {string} status - Current status of the complaint
   * @returns {Promise<string>} Follow-up suggestion
   */
  async generateFollowUpSuggestion(complaint, status) {
    if (!this.genAI) {
      return 'Continue monitoring the progress and follow up with relevant authorities if needed.';
    }

    try {
      const prompt = `
Given a civic complaint with status "${status}", provide a brief follow-up suggestion (100-200 words) for the citizen.

Complaint: ${complaint.title}
Category: ${complaint.category}
Current Status: ${status}
Location: ${complaint.location.city || 'India'}

Provide practical next steps or advice based on the current status. Be specific and actionable.
`;      const result = await this.client.generateContent([{ text: prompt }]);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Follow-up suggestion error:', error);
      return 'Continue monitoring the progress and follow up with relevant authorities if needed.';
    }
  }  /**
   * Check if the service is properly configured
   * @returns {boolean} True if service is ready
   */
  isConfigured() {
    this.initialize(); // Ensure service is initialized
    return this.client !== null;
  }

  /**
   * Transcribe audio to text using Gemini API
   * @param {Buffer} audioBuffer - Audio file buffer
   * @param {Object} options - Transcription options
   * @returns {Promise<Object>} Transcription result
   */  async transcribeAudio(audioBuffer, options = {}) {
    this.initialize();
    
    if (!this.client) {
      throw new Error('Gemini API not configured. Please set GEMINI_API_KEY environment variable.');
    }

    const startTime = Date.now();

    try {
      console.log(`Starting transcription for ${audioBuffer.length} bytes of audio`);
      
      // Build the prompt for transcription
      const prompt = this.buildTranscriptionPrompt(options);
      
      // Convert buffer to base64 for Gemini API
      const audioData = audioBuffer.toString('base64');
      
      // Prepare the content with audio data using the correct format for generateContent
      const parts = [
        { text: prompt },
        {
          inlineData: {
            mimeType: options.mimeType || 'audio/webm',
            data: audioData
          }
        }
      ];

      console.log('Sending request to Gemini API...');
      
      const result = await this.client.generateContent(parts);
      const response = await result.response;
      const rawText = response.text();
      
      console.log('Received response from Gemini API');
      
      // Parse the transcription response
      const transcriptionResult = this.parseTranscriptionResponse(rawText, options);
      
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(2) + 's';
      
      return {
        transcription: transcriptionResult.text,
        detectedLanguage: transcriptionResult.language || options.language || 'en',
        confidence: transcriptionResult.confidence || 85,
        metadata: {
          duration: transcriptionResult.duration,
          wordCount: transcriptionResult.wordCount,
          audioSize: audioBuffer.length,
          mimeType: options.mimeType
        },
        processingTime
      };

    } catch (error) {
      console.error('Gemini transcription error:', error);
      
      // Provide more specific error messages
      if (error.message?.includes('PERMISSION_DENIED')) {
        throw new Error('API key is invalid or does not have permission to access Gemini API');
      } else if (error.message?.includes('QUOTA_EXCEEDED')) {
        throw new Error('API quota exceeded. Please try again later.');
      } else if (error.message?.includes('INVALID_ARGUMENT')) {
        throw new Error('Invalid audio format or corrupted file');
      }
      
      throw new Error('Failed to transcribe audio: ' + error.message);
    }
  }

  /**
   * Build transcription prompt based on options
   * @param {Object} options - Transcription options
   * @returns {string} Formatted prompt
   */
  buildTranscriptionPrompt(options) {
    const { language, promptContext, category, realTime } = options;
    
    let prompt = `Please transcribe the audio content accurately. `;
    
    if (language && language !== 'auto') {
      prompt += `The audio is expected to be in ${language.toUpperCase()} language. `;
    } else {
      prompt += `Detect the language and transcribe accordingly. `;
    }
    
    if (category === 'complaint' || category === 'civic') {
      prompt += `This is a civic complaint or public issue recording. Focus on clear, formal transcription suitable for official documentation. `;
    }
    
    if (promptContext) {
      prompt += `Context: ${promptContext}. `;
    }
    
    if (realTime) {
      prompt += `This is part of a real-time transcription. Prioritize speed while maintaining accuracy. `;
    }
    
    prompt += `\n\nProvide the transcription in the following JSON format:
{
  "text": "The complete transcribed text",
  "language": "detected language code (e.g., 'en', 'hi', 'bn')",
  "confidence": 85,
  "wordCount": 150,
  "duration": "estimated duration in seconds"
}

Focus on accuracy, proper punctuation, and clear sentence structure.`;
    
    return prompt;
  }

  /**
   * Parse transcription response from Gemini
   * @param {string} responseText - Raw response from API
   * @param {Object} options - Original options
   * @returns {Object} Parsed transcription data
   */
  parseTranscriptionResponse(responseText, options) {
    try {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          text: parsed.text || responseText,
          language: parsed.language || options.language || 'en',
          confidence: parsed.confidence || 85,
          wordCount: parsed.wordCount || (parsed.text ? parsed.text.split(' ').length : 0),
          duration: parsed.duration || 0
        };
      }
      
      // Fallback to raw text
      return {
        text: responseText.trim(),
        language: options.language || 'en',
        confidence: 75,
        wordCount: responseText.trim().split(' ').length,
        duration: 0
      };
      
    } catch (error) {
      console.error('Error parsing transcription response:', error);
      return {
        text: responseText.trim(),
        language: options.language || 'en',
        confidence: 70,
        wordCount: responseText.trim().split(' ').length,
        duration: 0
      };
    }
  }

  /**
   * Enhance text using AI for grammar, clarity, and structure
   * @param {string} text - Text to enhance
   * @param {Object} options - Enhancement options
   * @returns {Promise<Object>} Enhancement result
   */
  async enhanceText(text, options = {}) {
    this.initialize();
    
    if (!this.genAI) {
      throw new Error('Gemini API not configured. Please set GEMINI_API_KEY environment variable.');
    }

    const startTime = Date.now();

    try {      const prompt = this.buildEnhancementPrompt(text, options);
      const result = await this.client.generateContent([{ text: prompt }]);
      const response = await result.response;
      const rawText = response.text();
      
      const enhancementResult = this.parseEnhancementResponse(rawText, text);
      const processingTime = ((Date.now() - startTime) / 1000).toFixed(2) + 's';
      
      return {
        enhancedText: enhancementResult.enhancedText,
        improvements: enhancementResult.improvements,
        confidence: enhancementResult.confidence,
        processingTime
      };

    } catch (error) {
      console.error('Gemini text enhancement error:', error);
      throw new Error('Failed to enhance text: ' + error.message);
    }
  }

  /**
   * Build text enhancement prompt
   * @param {string} text - Original text
   * @param {Object} options - Enhancement options
   * @returns {string} Enhancement prompt
   */
  buildEnhancementPrompt(text, options) {
    const { language, context, enhancementType } = options;
    
    let prompt = `Please enhance the following text for better grammar, clarity, and structure. `;
    
    if (context === 'complaint' || context === 'civic') {
      prompt += `This is a civic complaint or public issue. Enhance it to be professional, clear, and suitable for official documentation while preserving the original meaning and concerns. `;
    }
    
    if (language && language !== 'auto') {
      prompt += `The text is in ${language.toUpperCase()} language. `;
    }
    
    switch (enhancementType) {
      case 'grammar_only':
        prompt += `Focus only on grammar corrections. `;
        break;
      case 'clarity':
        prompt += `Focus on improving clarity and readability. `;
        break;
      case 'formal':
        prompt += `Make the text more formal and professional. `;
        break;
      default:
        prompt += `Improve grammar, clarity, and overall structure. `;
    }
    
    prompt += `\n\nOriginal text:\n"${text}"\n\nProvide the response in the following JSON format:
{
  "enhancedText": "The improved version of the text",
  "improvements": [
    "List of specific improvements made",
    "Grammar corrections",
    "Clarity improvements"
  ],
  "confidence": 90
}

Maintain the original meaning and tone while improving quality.`;
    
    return prompt;
  }

  /**
   * Parse enhancement response
   * @param {string} responseText - Raw response
   * @param {string} originalText - Original text for fallback
   * @returns {Object} Parsed enhancement data
   */
  parseEnhancementResponse(responseText, originalText) {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          enhancedText: parsed.enhancedText || originalText,
          improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
          confidence: parsed.confidence || 80
        };
      }
      
      // If no JSON, treat the response as enhanced text
      return {
        enhancedText: responseText.trim(),
        improvements: ['Text enhanced for clarity and grammar'],
        confidence: 75
      };
      
    } catch (error) {
      console.error('Error parsing enhancement response:', error);
      return {
        enhancedText: originalText,
        improvements: [],
        confidence: 0
      };
    }
  }

  /**
   * Analyze complaint content for categorization and insights
   * @param {string} text - Content to analyze
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis result
   */
  async analyzeComplaintContent(text, options = {}) {
    this.initialize();
    
    if (!this.genAI) {
      throw new Error('Gemini API not configured. Please set GEMINI_API_KEY environment variable.');
    }

    try {      const prompt = this.buildAnalysisPrompt(text, options);
      const result = await this.client.generateContent([{ text: prompt }]);
      const response = await result.response;
      const rawText = response.text();
      
      return this.parseAnalysisResponse(rawText);

    } catch (error) {
      console.error('Gemini content analysis error:', error);
      throw new Error('Failed to analyze content: ' + error.message);
    }
  }

  /**
   * Build content analysis prompt
   * @param {string} text - Text to analyze
   * @param {Object} options - Analysis options
   * @returns {string} Analysis prompt
   */
  buildAnalysisPrompt(text, options) {
    const { audioMetadata, language, context } = options;
    
    let prompt = `Analyze the following civic complaint content and provide categorization and insights.\n\n`;
    
    if (audioMetadata && Object.keys(audioMetadata).length > 0) {
      prompt += `Audio metadata: ${JSON.stringify(audioMetadata)}\n`;
    }
    
    prompt += `Content: "${text}"\n\nProvide analysis in the following JSON format:
{
  "category": {
    "primary": "infrastructure|public-safety|environment|transportation|health|education|utilities|governance|other",
    "confidence": 85,
    "reasoning": "Why this category was chosen"
  },
  "urgency": {
    "level": "low|medium|high|critical",
    "confidence": 80,
    "reasoning": "Urgency assessment reasoning"
  },
  "sentiment": {
    "tone": "frustrated|concerned|urgent|calm|angry",
    "intensity": 70
  },
  "keyEntities": [
    "location names",
    "department names",
    "person names",
    "specific issues"
  ],
  "suggestedActions": [
    "immediate steps",
    "follow-up actions"
  ],
  "summary": "Brief summary of the complaint"
}

Focus on Indian civic context and governance structure.`;
    
    return prompt;
  }

  /**
   * Parse analysis response
   * @param {string} responseText - Raw response
   * @returns {Object} Parsed analysis data
   */
  parseAnalysisResponse(responseText) {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback analysis
      return {
        category: { primary: 'other', confidence: 50, reasoning: 'Unable to determine category' },
        urgency: { level: 'medium', confidence: 50, reasoning: 'Default assessment' },
        sentiment: { tone: 'concerned', intensity: 60 },
        keyEntities: [],
        suggestedActions: ['Contact relevant authorities'],
        summary: 'Analysis unavailable'
      };
      
    } catch (error) {
      console.error('Error parsing analysis response:', error);
      return {
        category: { primary: 'other', confidence: 0, reasoning: 'Parsing error' },
        urgency: { level: 'medium', confidence: 0, reasoning: 'Parsing error' },
        sentiment: { tone: 'unknown', intensity: 0 },
        keyEntities: [],
        suggestedActions: [],
        summary: 'Analysis failed'
      };
    }
  }
}

export default new GeminiService();
