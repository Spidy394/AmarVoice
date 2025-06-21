import express from 'express';
import multer from 'multer';
import geminiService from '../services/gemini.service.js';

const router = express.Router();

// Configure multer for audio file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  },
});

/**
 * POST /api/ai/transcribe
 * Transcribe audio file using Gemini API
 */
router.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    console.log('Transcription request received');
    
    if (!req.file) {
      console.log('No audio file provided');
      return res.status(400).json({
        success: false,
        error: 'Audio file is required'
      });
    }

    const { language, promptContext, category, realTime } = req.body;

    // Validate file size
    if (req.file.size === 0) {
      console.log('Empty audio file provided');
      return res.status(400).json({
        success: false,
        error: 'Audio file is empty'
      });
    }

    console.log(`Processing audio transcription: ${req.file.size} bytes, type: ${req.file.mimetype}`);

    // Check if Gemini service is configured
    if (!geminiService.isConfigured()) {
      console.log('Gemini service not configured');
      return res.status(503).json({
        success: false,
        error: 'AI transcription service is not available. Please configure GEMINI_API_KEY.'
      });
    }

    const result = await geminiService.transcribeAudio(req.file.buffer, {
      mimeType: req.file.mimetype,
      language: language || 'auto',
      promptContext: promptContext || '',
      category: category || 'general',
      realTime: realTime === 'true'
    });

    console.log('Transcription completed successfully');
    res.json({
      success: true,
      transcription: result.transcription,
      detectedLanguage: result.detectedLanguage,
      confidence: result.confidence,
      metadata: result.metadata,
      processingTime: result.processingTime
    });

  } catch (error) {
    console.error('Transcription API error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to transcribe audio',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/ai/enhance-text
 * Enhance text using Gemini API for grammar, clarity, and structure
 */
router.post('/enhance-text', async (req, res) => {
  try {
    const { text, language, context, enhancementType } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Text content is required'
      });
    }

    console.log(`Enhancing text: ${text.length} characters`);

    const result = await geminiService.enhanceText(text, {
      language: language || 'auto',
      context: context || 'general',
      enhancementType: enhancementType || 'grammar_and_clarity'
    });

    res.json({
      success: true,
      enhancedText: result.enhancedText,
      improvements: result.improvements,
      confidence: result.confidence,
      processingTime: result.processingTime
    });

  } catch (error) {
    console.error('Text enhancement API error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to enhance text',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/ai/analyze-content
 * Analyze transcribed content for categorization and insights
 */
router.post('/analyze-content', async (req, res) => {
  try {
    const { text, audioMetadata, language, context } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Text content is required for analysis'
      });
    }

    console.log(`Analyzing content: ${text.length} characters`);

    const result = await geminiService.analyzeComplaintContent(text, {
      audioMetadata: audioMetadata || {},
      language: language || 'auto',
      context: context || 'complaint'
    });

    res.json({
      success: true,
      analysis: result
    });

  } catch (error) {
    console.error('Content analysis API error:', error);
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to analyze content',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/ai/status
 * Check AI service status and configuration
 */
router.get('/status', async (req, res) => {
  try {
    const isConfigured = geminiService.isConfigured();
    
    res.json({
      success: true,
      configured: isConfigured,
      features: {
        transcription: isConfigured,
        textEnhancement: isConfigured,
        contentAnalysis: isConfigured,
        realTimeTranscription: isConfigured
      },
      supportedFormats: [
        'audio/webm',
        'audio/wav',
        'audio/mp3',
        'audio/aiff',
        'audio/aac',
        'audio/ogg',
        'audio/flac'
      ]
    });

  } catch (error) {
    console.error('AI status check error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to check AI service status'
    });
  }
});

export default router;
