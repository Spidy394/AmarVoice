"use client";

import { motion } from "framer-motion";
import { Mic, Brain, Eye, BarChart3, Sparkles, Shield, Clock, Users } from "lucide-react";
import { useState, useEffect, useMemo, useCallback, memo } from "react";

const Features = () => {
  const [mounted, setMounted] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  // Memoized floating elements to prevent re-generation
  const floatingElements = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 15,
      size: Math.random() * 40 + 20,
      opacity: Math.random() * 0.3 + 0.1
    }));
  }, []);

  // Memoized voice processing bars to prevent re-generation
  const voiceProcessingBars = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      height: Math.random() * 50 + 30,
      animationDelay: i * 0.08,
      animationDuration: 1.2 + Math.random() * 0.8
    }));
  }, []);

  // Generate random positions only on client side
  useEffect(() => {
    setMounted(true);

    // Auto-rotate active feature
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 6);
    }, 4000);

    return () => clearInterval(interval);
  }, []);
  // Don't render anything that uses random values until mounted
  if (!mounted) {
    return (
      <section id="features" className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-emerald-950/30" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-full border border-emerald-200/20 dark:border-emerald-800/20 mb-6">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                Powered by AI Technology
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Revolutionary{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 dark:from-emerald-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Civic Platform
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 dark:from-emerald-400 dark:via-blue-400 dark:to-purple-400 rounded-full opacity-20"></div>
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Experience the future of civic engagement with our AI-powered platform designed for 
              Bengali-speaking communities. Transform how you interact with government services.
            </p>
          </div>
        </div>
      </section>
    );
  }
  const features = [
    {
      icon: Mic,
      title: "Voice Complaint Submission",
      description: "Submit your grievances in Bengali or English using voice recording. Our AI transcribes and processes your complaints automatically with 95%+ accuracy.",
      gradient: "from-blue-500 to-cyan-500",
      stats: "500+ voices processed daily",
      benefits: ["Multilingual Support", "Instant Transcription", "Voice Authentication"]
    },
    {
      icon: Brain,
      title: "AI-Powered Categorization",
      description: "Smart categorization system that automatically classifies complaints by department and priority level for faster resolution and better resource allocation.",
      gradient: "from-purple-500 to-pink-500",
      stats: "85% faster processing",
      benefits: ["Auto-Classification", "Priority Scoring", "Department Routing"]
    },
    {
      icon: Eye,
      title: "Real-time Status Tracking",
      description: "Track your complaint status in real-time with detailed progress updates, estimated resolution timelines, and instant notifications.",
      gradient: "from-emerald-500 to-teal-500",
      stats: "24/7 live updates",
      benefits: ["Live Tracking", "Push Notifications", "Timeline View"]
    },
    {
      icon: BarChart3,
      title: "Transparent Public Ledger",
      description: "Complete transparency with public ledger showing complaint statistics, resolution rates, and department performance metrics with blockchain security.",
      gradient: "from-orange-500 to-red-500",
      stats: "100% transparency",
      benefits: ["Public Dashboard", "Performance Metrics", "Blockchain Security"]
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "End-to-end encryption ensures your data remains private and secure. All communications are protected with military-grade security protocols.",
      gradient: "from-indigo-500 to-purple-500",
      stats: "256-bit encryption",
      benefits: ["End-to-End Encryption", "Data Privacy", "Secure Storage"]
    },
    {
      icon: Users,
      title: "Community Engagement",
      description: "Connect with your community, support similar issues, and collaborate on solutions. Build stronger civic participation together.",
      gradient: "from-rose-500 to-pink-500",
      stats: "10k+ active users",
      benefits: ["Community Forum", "Issue Voting", "Collaborative Solutions"]
    }
  ];  return (
    <section id="features" className="py-20 px-4 relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 dark:from-slate-950 dark:via-blue-950/30 dark:to-emerald-950/30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.04),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.04),transparent_50%)]" />
      
      {/* Enhanced Floating Elements */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden">
          {floatingElements.map((element) => (
            <motion.div
              key={element.id}
              className="absolute rounded-full blur-2xl"
              style={{
                left: `${element.left}%`,
                top: `${element.top}%`,
                width: `${element.size}px`,
                height: `${element.size}px`,
                background: `linear-gradient(135deg, rgba(59,130,246,${element.opacity}), rgba(16,185,129,${element.opacity}))`,
                animationDelay: `${element.animationDelay}s`,
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      )}
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-full border border-emerald-200/20 dark:border-emerald-800/20 mb-6">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Powered by AI Technology
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Revolutionary{" "}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 dark:from-emerald-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Civic Platform
              </span>
              <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 dark:from-emerald-400 dark:via-blue-400 dark:to-purple-400 rounded-full opacity-20"></div>
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed mb-8">
            Experience the future of civic engagement with our AI-powered platform designed for 
            Bengali-speaking communities. Transform how you interact with government services.
          </p>

          {/* Feature Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
            {[
              { number: "95%", label: "Accuracy Rate", icon: Brain },
              { number: "24/7", label: "Live Support", icon: Clock },
              { number: "10K+", label: "Active Users", icon: Users },
              { number: "500+", label: "Daily Submissions", icon: Mic }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-blue-500 mb-3">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Enhanced Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -8 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              onHoverStart={() => setActiveFeature(index)}
              className={`group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-2 rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl ${
                activeFeature === index 
                  ? 'border-emerald-300/50 dark:border-emerald-600/50 shadow-xl shadow-emerald-500/10' 
                  : 'border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/70 dark:hover:border-gray-600/70'
              }`}
            >
              {/* Gradient Background Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              
              {/* Icon */}
              <div className={`relative mb-4 p-3 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:scale-110 transition-all duration-300 w-fit`}>
                <feature.icon className="w-6 h-6 text-white" />
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-sm">
                {feature.description}
              </p>
              
              {/* Stats */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30 text-emerald-700 dark:text-emerald-300">
                  {feature.stats}
                </span>
              </div>
              
              {/* Benefits */}
              <div className="space-y-2">
                {feature.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 mr-2" />
                    {benefit}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Feature Demo Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 rounded-3xl p-8 border-2 border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Experience AI-Powered Voice Processing
              </h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Our advanced AI system processes voice complaints in real-time with industry-leading accuracy
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Voice Visualizer */}
              <div className="relative">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-center mb-6">
                    <motion.div 
                      className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Mic className="w-8 h-8 text-white" />
                    </motion.div>
                  </div>
                  
                  <div className="flex justify-center items-end space-x-1 h-16 mb-4">
                    {mounted && voiceProcessingBars.map((bar) => (
                      <motion.div
                        key={bar.id}
                        className="w-3 bg-gradient-to-t from-emerald-500 to-blue-500 rounded-full"
                        style={{
                          height: `${bar.height}px`,
                        }}
                        animate={{
                          height: [bar.height, bar.height * 1.5, bar.height],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: bar.animationDuration,
                          repeat: Infinity,
                          delay: bar.animationDelay,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      "আমার এলাকায় রাস্তার বাতি নষ্ট..."
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      Bengali → AI Processing → Auto-categorized
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Process Steps */}
              <div className="space-y-4">
                {[
                  { step: "01", title: "Voice Input", desc: "Speak in Bengali or English", color: "from-blue-500 to-cyan-500" },
                  { step: "02", title: "AI Processing", desc: "Real-time transcription & analysis", color: "from-purple-500 to-pink-500" },
                  { step: "03", title: "Auto-categorization", desc: "Smart department routing", color: "from-emerald-500 to-teal-500" },
                  { step: "04", title: "Instant Submission", desc: "Complaint logged & tracked", color: "from-orange-500 to-red-500" }
                ].map((process, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center space-x-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200/30 dark:border-gray-700/30"
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${process.color} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                      {process.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {process.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {process.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <div className="text-center mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="flex justify-center items-center space-x-8 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>95%+ Accuracy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Real-time Processing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Multi-language Support</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default memo(Features);
