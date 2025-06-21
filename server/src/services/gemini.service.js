import { GoogleGenAI } from '@google/genai';

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
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
      this.model = null;
    } else {
      this.genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      this.model = this.genAI.models;
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
      const userLevel = this.getUserLevel(user.reputation);
      
      const prompt = this.buildSuggestionPrompt(complaint, user, userLevel);
        const result = await this.model.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      });
      const response = result.response;
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
`;      const result = await this.model.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      });
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Follow-up suggestion error:', error);
      return 'Continue monitoring the progress and follow up with relevant authorities if needed.';
    }
  }
  /**
   * Check if the service is properly configured
   * @returns {boolean} True if service is ready
   */
  isConfigured() {
    this.initialize(); // Ensure service is initialized
    return this.genAI !== null;
  }
}

export default new GeminiService();
