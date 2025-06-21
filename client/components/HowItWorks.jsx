"use client";

import React, { memo, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Shield, MessageSquare, Brain, TrendingUp, CheckCircle, Clock, Users, Zap, ArrowRight, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

const HowItWorks = () => {
  const [floatingElements, setFloatingElements] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  // Generate random positions only on client side
  useEffect(() => {
    setMounted(true);
    
    const elements = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 12,
      animationDuration: 10 + Math.random() * 6,
      size: Math.random() * 60 + 30,
      opacity: Math.random() * 0.4 + 0.1
    }));
    setFloatingElements(elements);

    // Auto-rotate active step
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 4);
    }, 3000);

    return () => clearInterval(interval);
  }, []);
  const steps = [
    {
      number: "01",
      icon: Shield,
      title: "Secure Authentication",
      description: "Sign in securely using our advanced Civic Auth system with multi-factor authentication to verify your identity and protect your data.",
      gradient: "from-blue-500 to-cyan-500",
      details: ["Biometric Login", "2FA Protection", "Data Encryption"],
      time: "30 seconds",
      users: "100% Secure"
    },
    {
      number: "02",
      icon: MessageSquare,
      title: "Smart Complaint Submission",
      description: "Submit your complaint through multiple channels - voice recording in Bengali/English, text input, or even photo evidence with location data.",
      gradient: "from-purple-500 to-pink-500",
      details: ["Voice Recognition", "Multi-language", "Photo Upload"],
      time: "2 minutes",
      users: "95% Accuracy"
    },
    {
      number: "03",
      icon: Brain,
      title: "AI-Powered Processing",
      description: "Our advanced AI system automatically categorizes, prioritizes, and routes your complaint to the appropriate department for faster resolution.",
      gradient: "from-emerald-500 to-teal-500",
      details: ["Auto-categorization", "Priority Scoring", "Smart Routing"],
      time: "Instant",
      users: "85% Faster"
    },
    {
      number: "04",
      icon: TrendingUp,
      title: "Real-time Tracking",
      description: "Monitor your complaint's progress with live updates, estimated resolution times, and transparent communication throughout the process.",
      gradient: "from-orange-500 to-red-500",
      details: ["Live Updates", "Timeline View", "SMS Notifications"],
      time: "24/7 Monitoring",
      users: "Real-time"
    }
  ];  return (
    <section id="about" className="py-20 px-4 relative overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/30 dark:from-slate-950 dark:via-purple-950/30 dark:to-blue-950/30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(168,85,247,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_25%_25%,rgba(168,85,247,0.04),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_75%_75%,rgba(59,130,246,0.04),transparent_50%)]" />
      
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
                background: `linear-gradient(135deg, rgba(168,85,247,${element.opacity}), rgba(59,130,246,${element.opacity}))`,
                animationDelay: `${element.animationDelay}s`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 15, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: element.animationDuration,
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full border border-purple-200/20 dark:border-purple-800/20 mb-6">
            <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Simple 4-Step Process
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="text-black dark:text-white">How It</span>{" "}
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 dark:from-purple-400 dark:via-blue-400 dark:to-pink-400 bg-clip-text text-transparent">
              Works
            </span>
          </h2>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
            <span className="font-semibold text-purple-600 dark:text-purple-400">AmarVoice</span> transforms civic engagement with a streamlined process that makes submitting and tracking complaints effortless for all Bengali-speaking citizens.
          </p>
        </motion.div>        {/* Enhanced Steps Section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Active Step Display - Left Side */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="group relative overflow-hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-2 border-purple-300/50 dark:border-purple-600/50 rounded-3xl p-8 shadow-2xl shadow-purple-500/20"
            >
              {/* Background Gradient Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${steps[activeStep].gradient} opacity-5`} />
              
              <div className="flex items-start space-x-6 relative z-10">                {/* Step Icon */}
                <div className="flex-shrink-0">
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${steps[activeStep].gradient} flex items-center justify-center shadow-xl`}>
                    {React.createElement(steps[activeStep].icon, { className: "w-10 h-10 text-white" })}
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {steps[activeStep].title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    {steps[activeStep].description}
                  </p>
                  
                  {/* Step Details */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-700 dark:text-purple-300">
                      {steps[activeStep].time}
                    </span>
                    <span className="text-sm font-semibold px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300">
                      {steps[activeStep].users}
                    </span>
                  </div>
                  
                  {/* Features */}
                  <div className="space-y-2">
                    {steps[activeStep].details.map((detail, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mr-3" />
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Interactive Process Flow - Right Side */}
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Interactive Process Flow
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Click on any step to see detailed information
              </p>
            </div>
            
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => setActiveStep(index)}
                className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-500 cursor-pointer ${
                  activeStep === index 
                    ? 'bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border-2 border-purple-200 dark:border-purple-700 shadow-lg scale-105' 
                    : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white">
                    {step.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {step.time}
                  </p>
                </div>
                {activeStep === index && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  />
                )}
              </motion.div>
            ))}
            
            {/* Process Summary */}
            <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="bg-gradient-to-br from-white/90 to-gray-50/90 dark:from-gray-900/90 dark:to-gray-800/90 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex justify-center items-center space-x-6 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Automated</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span>Fast</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
