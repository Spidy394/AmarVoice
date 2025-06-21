"use client";

import { motion } from "framer-motion";
import { ArrowRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-store";
import LoginModal from "./LoginModal";

const CallToAction = () => {
  const [backgroundElements, setBackgroundElements] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  // Handle submit complaint with authentication
  const handleSubmitComplaint = useCallback(() => {
    if (isAuthenticated) {
      // Redirect to home if already authenticated
      window.location.href = '/home';
    } else {
      setIsLoginModalOpen(true);
    }
  }, [isAuthenticated]);

  // Generate random positions only on client side
  useEffect(() => {
    setMounted(true);
    
    const elements = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 8,
      animationDuration: 6 + Math.random() * 4,
    }));
    setBackgroundElements(elements);
  }, []);  return (
    <section className="py-12 sm:py-16 px-3 sm:px-4 relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-green-950 dark:via-gray-900 dark:to-blue-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.08),transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.05),transparent_70%)]" />
      {/* Animated background elements */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden">
          {backgroundElements.map((element) => (
            <div
              key={element.id}
              className="absolute w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-green-400/5 to-blue-400/5 rounded-full blur-3xl float"
              style={{
                left: `${element.left}%`,
                top: `${element.top}%`,
                animationDelay: `${element.animationDelay}s`,
                animationDuration: `${element.animationDuration}s`,
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {" "}        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight px-2 sm:px-0">
            Ready to make your{" "}
            <span className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 dark:from-green-400 dark:via-emerald-400 dark:to-teal-400 bg-clip-text text-transparent gradient-text">
              voice heard
            </span>
            ?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
            Join{" "}
            <span className="font-bold text-green-600 dark:text-green-400">
              thousands of citizens
            </span>{" "}
            who have already submitted their grievances and experienced{" "}
            <span className="font-bold text-blue-600 dark:text-blue-400">
              transparent resolution
            </span>
            .
          </p>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mb-6 sm:mb-8"
          >            <Button
              size="lg"
              className="btn-modern btn-primary btn-glow min-h-[48px] touch-manipulation px-6 sm:px-8"
              onClick={handleSubmitComplaint}
            >
              <span className="relative z-10 flex items-center text-sm sm:text-base">
                Submit Your Complaint
                <ArrowRight className="ml-2 sm:ml-3 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Button>
          </motion.div>        </motion.div>
      </div>
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </section>
  );
};

export default CallToAction;
