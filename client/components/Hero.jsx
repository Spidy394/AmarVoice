"use client";

import { motion } from "framer-motion";
import { Command, ArrowRight, MessageSquare, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useMounted, useTimer } from "@/lib/optimization-hooks";

// Memoized Particle component to prevent unnecessary re-renders
const Particle = memo(({ particle }) => (
  <div
    className="absolute w-2 h-2 bg-gradient-to-r from-green-400 to-blue-400 rounded-full opacity-20 dark:opacity-10 float"
    style={{
      left: `${particle.left}%`,
      top: `${particle.top}%`,
      animationDelay: `${particle.animationDelay}s`,
      animationDuration: `${particle.animationDuration}s`,
      willChange: 'transform'
    }}
  />
));
Particle.displayName = 'Particle';

// Memoized AudioBar component to prevent unnecessary re-renders
const AudioBar = memo(({ bar }) => (
  <div
    className="w-1 sm:w-1.5 bg-gradient-to-t from-purple-600 to-pink-400 rounded-full animate-pulse"
    style={{
      height: `${bar.height}px`,
      animationDelay: `${bar.animationDelay}s`,
      animationDuration: `${bar.animationDuration}s`,
      willChange: 'height'
    }}
  />
));
AudioBar.displayName = 'AudioBar';

const HeroSection = () => {
  // Memoized random particle positions to prevent re-generation
  const particlePositions = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 6,
      animationDuration: 4 + Math.random() * 4
    }));
  }, []);

  // Memoized audio bar heights to prevent re-generation
  const audioBarHeights = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => ({
      id: i,
      height: Math.random() * 50 + 20,
      animationDelay: i * 0.1,
      animationDuration: 1.2
    }));
  }, []);

  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const mounted = useMounted();
  const { time: recordingTime, start: startRecording } = useTimer(0, 1000);
    // Start recording simulation when component mounts
  useEffect(() => {
    if (mounted) {
      startRecording();
    }
  }, [mounted, startRecording]);
  // Memoized time formatter to prevent recreation
  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Memoized callback to prevent re-renders
  const handleSubmitComplaint = useCallback(() => {
    setIsComplaintModalOpen(true);
  }, []);

  return (
    <>      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative min-h-[100dvh] flex flex-col items-center justify-center px-3 sm:px-4 pt-20 sm:pt-24 pb-8 sm:pb-12 bg-background overflow-hidden"
        style={{ willChange: 'transform' }}
      >
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-blue-50/20 to-purple-50/30 dark:from-green-950/20 dark:via-blue-950/10 dark:to-purple-950/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_80%,rgba(34,197,94,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(168,85,247,0.04),transparent_70%)] dark:bg-[radial-gradient(circle_at_40%_40%,rgba(168,85,247,0.03),transparent_70%)]" />          {/* Floating particles */}
        {mounted && (
          <div className="absolute inset-0 overflow-hidden">
            {particlePositions.map((particle) => (
              <Particle key={particle.id} particle={particle} />
            ))}
          </div>
        )}{/* Main Hero Content */}
        <div className="text-center max-w-5xl mx-auto relative z-10 flex-1 flex flex-col justify-center pt-2 sm:pt-4">          {/* Hero Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-6 sm:mb-8"
          >
            <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/80 dark:bg-gray-900/80 border border-green-200/50 dark:border-green-800/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
              <Command className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-green-600 dark:text-green-400" />              <span className="text-xs sm:text-xs font-medium text-gray-700 dark:text-gray-300">
                <span style={{ fontFamily: 'BenSen Handwriting, cursive' }} className="text-green-700 dark:text-green-400 font-bold">আপনার কণ্ঠস্বর, আপনার অধিকার</span> 
                <span className="mx-1 text-green-600 dark:text-green-400">•</span> 
                <span className="gradient-text">Your Voice, Your Right</span>
              </span>
            </div>
          </motion.div>          {/* Main Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 tracking-tight leading-tight text-center"
          ><span className="text-foreground block mb-1">
              <TextGenerateEffect 
                words="Submit Your "
                className="inline"
              />
              <span className="relative inline-block">
                <TextGenerateEffect 
                  words="Grievance"
                  className="inline font-extrabold"
                  highlightAfterComplete={true}
                  highlightClassName="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 bg-clip-text text-transparent gradient-text"
                  glowColor="green"
                />
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-green-600 to-teal-600 dark:from-green-400 dark:to-teal-400 rounded-full opacity-0 animate-[fadeIn_0.8s_ease-in-out_2.8s_forwards,pulse_2s_ease-in-out_3.5s_infinite]"></div>
              </span>
            </span>
            <span className="text-foreground block">
              <TextGenerateEffect 
                words="Make Your "
                className="inline"
              />
              <span className="relative inline-block">
                <TextGenerateEffect 
                  words="Voice"
                  className="inline font-extrabold"
                  highlightAfterComplete={true}
                  highlightClassName="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent gradient-text"
                  glowColor="blue"
                />
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 rounded-full opacity-0 animate-[fadeIn_0.8s_ease-in-out_2.8s_forwards,pulse_2s_ease-in-out_3.5s_infinite]"></div>
              </span>
              <TextGenerateEffect 
                words=" Heard"
                className="inline"
              />
            </span>
          </motion.h1>          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed text-center px-2 sm:px-0"
          >
            <span className="text-gray-700 dark:text-gray-200 font-medium">
              Empowering Bengali-speaking citizens to voice their concerns with{" "}
            </span>
            <br className="hidden md:block" />
            <span className="font-bold bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent">
              AI-powered categorization
            </span>
            <span className="text-gray-700 dark:text-gray-200 font-medium">, </span>
            <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              real-time tracking
            </span>
            <span className="text-gray-700 dark:text-gray-200 font-medium">, and </span>
            <span className="font-bold bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
              transparent resolution
            </span>
            <span className="text-gray-700 dark:text-gray-200 font-medium">.</span>
            <br className="hidden md:block" />            <span className="font-bold text-lg sm:text-xl md:text-2xl block mt-3 sm:mt-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
              Every complaint matters, every voice counts.
            </span>
          </motion.p>{/* CTA Button */}          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mb-4 sm:mb-6"          >            <Button
              size="lg"
              className="btn-modern btn-primary btn-glow min-h-[48px] touch-manipulation px-6 sm:px-8"
              onClick={handleSubmitComplaint}
            >
              <span className="relative z-10 flex items-center text-sm sm:text-base">
                Submit Your Complaint Now
                <ArrowRight className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
          </motion.div>{/* Bottom Text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 text-sm sm:text-base text-muted-foreground"
          >
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">Free</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium">Secure</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="font-medium">Transparent</span>
            </div>
          </motion.div></div>        {/* Complaint Type Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="relative z-10 w-full max-w-6xl mx-auto px-3 sm:px-4 mt-12 sm:mt-16"
        >
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">            {/* Text Complaints Card */}            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
              className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer relative"
            >
              {/* Dynamic border that adjusts to content */}
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-blue-200/50 dark:border-blue-800/50 group-hover:border-blue-300/70 dark:group-hover:border-blue-700/70 transition-all duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    <div className="absolute inset-0 bg-white/20 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    Text Complaints
                  </h3>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  Submit your civic issues in text format in Bengali or English. Our AI will automatically categorize and prioritize your complaint.
                </p>
                
                {/* Enhanced terminal-style example */}
                <div className="bg-gray-900 dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700 group-hover:border-blue-500/50 transition-all duration-300">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full mr-1.5 sm:mr-2"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-yellow-500 rounded-full mr-1.5 sm:mr-2"></div>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full mr-1.5 sm:mr-2"></div>
                    <span className="text-gray-400 text-xs ml-2 sm:ml-4 font-mono">complaint.txt</span>
                  </div>
                  <div className="bg-gray-800 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                    <p className="text-green-400 text-xs sm:text-sm font-mono mb-2 sm:mb-3"># Example Text Complaint</p>
                    <p className="text-white text-sm sm:text-base md:text-lg leading-relaxed font-medium px-1 sm:px-2 py-1" style={{ fontFamily: 'BenSen Handwriting, cursive', lineHeight: '1.8' }}>
                      রাস্তার আলো গত দুই সপ্তাহ ধরে কাজ করছে না। অনুগ্রহ করে এটি মেরামত করুন।
                    </p>
                    <div className="flex items-center mt-3 sm:mt-4 space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="text-blue-300 text-xs sm:text-sm font-mono bg-blue-900/20 px-2 sm:px-3 py-1 rounded-full border border-blue-500/30">
                        🔄 Processing & Categorizing...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>{/* Voice Complaints Card */}            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
              className="group bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 cursor-pointer relative"
            >
              {/* Dynamic border that adjusts to content */}
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-purple-200/50 dark:border-purple-800/50 group-hover:border-purple-300/70 dark:group-hover:border-purple-700/70 transition-all duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center mr-3 sm:mr-4 group-hover:scale-110 transition-transform duration-300">
                    <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    <div className="absolute inset-0 bg-white/20 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                    Voice Complaints
                  </h3>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                  Record your complaint directly in Bengali or English. Perfect for those who prefer speaking over typing.
                </p>
                
                {/* Enhanced audio visualizer */}
                <div className="bg-gray-900 dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700 group-hover:border-purple-500/50 transition-all duration-300">
                  <div className="flex items-center justify-center mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                      <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="text-purple-400 font-mono text-xs sm:text-sm">
                      <div>Recording...</div>
                      <div className="text-xs text-gray-400">Bengali/English</div>
                    </div>
                  </div>                  <div className="flex items-center justify-center space-x-1">
                    {mounted && audioBarHeights.map((bar) => (
                      <AudioBar key={bar.id} bar={bar} />
                    ))}
                  </div>
                  <div className="text-center mt-3 sm:mt-4">
                    <span className="text-purple-400 text-xs font-mono">Duration: {formatTime(recordingTime)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>
    </>
  );
};

export default memo(HeroSection);