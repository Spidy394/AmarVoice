import { Github, Twitter, Command, Heart } from "lucide-react";
import { Button } from "./ui/button";

const Footer = () => {  return (    <footer className="w-full py-8 sm:py-12 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950">
      <div className="max-w-6xl mx-auto px-3 sm:px-4">
        <div className="relative backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 rounded-xl sm:rounded-2xl p-4 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
          {/* Enhanced glass effect overlay */}
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-blue-50/20 dark:from-gray-800/10 dark:to-blue-950/20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start gap-6 sm:gap-8">
            {/* Enhanced Brand Section */}
            <div className="flex-1 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Command className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <h3 className="font-bold text-base sm:text-lg bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent">
                  AmarVoice
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 max-w-sm leading-relaxed">
                Empowering Bengali-speaking citizens with <span className="font-semibold text-green-600 dark:text-green-400">transparent</span>,<br /> 
                <span className="font-semibold text-blue-600 dark:text-blue-400"> AI-powered</span> civic engagement solutions.
              </p>
              <div className="flex items-center space-x-2 pt-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 hover:scale-110 rounded-lg touch-manipulation"
                >
                  <Twitter className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 sm:h-8 sm:w-8 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 hover:scale-110 rounded-lg touch-manipulation"
                >
                  <Github className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>            {/* Enhanced Navigation Links */}
            <div className="flex flex-wrap gap-6 sm:gap-8 md:gap-12 w-full lg:w-auto">
              <div className="space-y-2 sm:space-y-3">
                <h4 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">Platform</h4>
                <ul className="space-y-1.5 sm:space-y-2">
                  <li>
                    <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-300 cursor-pointer text-xs sm:text-sm touch-manipulation">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="#about" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 cursor-pointer text-xs sm:text-sm touch-manipulation">
                      How It Works
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <h4 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">Resources</h4>
                <ul className="space-y-1.5 sm:space-y-2">
                  <li>
                    <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 cursor-pointer text-xs sm:text-sm touch-manipulation">
                      User Guide
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-300 cursor-pointer text-xs sm:text-sm touch-manipulation">
                      Public Ledger
                    </a>
                  </li>
                </ul>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <h4 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm">Legal</h4>
                <ul className="space-y-1.5 sm:space-y-2">
                  <li>
                    <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-300 cursor-pointer text-xs sm:text-sm touch-manipulation">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-300 cursor-pointer text-xs sm:text-sm touch-manipulation">
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>          {/* Enhanced Copyright Section */}
          <div className="relative z-10 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3">
              <p className="text-gray-600 dark:text-gray-300 text-center sm:text-left text-xs sm:text-sm">
                © {new Date().getFullYear()} <span className="font-semibold text-green-600 dark:text-green-400">BugLords Team</span>. All rights reserved.
              </p>
              <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                <span>Made with</span>
                <Heart className="w-3 h-3 text-red-500 animate-pulse" />
                <span>for Bengali citizens</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;