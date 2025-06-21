import AITranscriptionTest from '@/components/AITranscriptionTest';

export default function AITestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            AI Transcription Test
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Test the AI-powered voice transcription functionality using Google's Gemini API. 
            Record your voice and see it transcribed in real-time with confidence scoring.
          </p>
        </div>
        
        <AITranscriptionTest />
      </div>
    </div>
  );
}
