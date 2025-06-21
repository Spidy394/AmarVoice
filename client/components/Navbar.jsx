"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { Command, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import LoginModal from "./LoginModal";
import { useAuth } from "@/lib/auth-store";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  // Memoized scroll handler to prevent unnecessary re-renders
  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 50);
  }, []);

  // Memoized click outside handler
  const handleClickOutside = useCallback((event) => {
    if (isMobileMenuOpen && !event.target.closest('nav')) {
      setIsMobileMenuOpen(false);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("click", handleClickOutside);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [handleScroll, handleClickOutside]);

  // Memoized scroll to section function
  const scrollToSection = useCallback((sectionId) => {
    if (sectionId === 'submit') {
      const ctaSection = document.querySelector('.button-gradient');
      if (ctaSection) {
        const yOffset = -100;
        const y = ctaSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, []);

  const handleAuthAction = () => {
    if (isAuthenticated) {
      // Redirect to home if already authenticated
      window.location.href = '/home';
    } else {
      setIsLoginModalOpen(true);
    }
  };

  // Memoized navigation items
  const navItems = [
    { name: "Features", href: "#features", onClick: () => scrollToSection('features') },
    { name: "How It Works", href: "#about", onClick: () => scrollToSection('about') },
  ];return (    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
        isScrolled 
          ? "py-2" 
          : "py-3"
      }`}
    >      <div className={`mx-auto transition-all duration-500 ease-in-out ${
        isScrolled 
          ? "max-w-5xl px-3 sm:px-4 lg:px-6" 
          : "max-w-6xl px-3 sm:px-4 lg:px-6"
      }`}>        <nav className={`flex items-center justify-between transition-all duration-500 ease-in-out rounded-full ${
          isScrolled 
            ? "h-12 sm:h-14 bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl border-2 border-gray-200/30 dark:border-gray-700/30 shadow-xl shadow-black/5 dark:shadow-black/30 px-4 sm:px-5 lg:px-7" 
            : "h-14 sm:h-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl border-2 border-gray-200/50 dark:border-gray-700/50 shadow-2xl shadow-black/10 dark:shadow-black/50 px-4 sm:px-6 lg:px-8"
        }`}>          {/* Logo */}          <div className="flex items-center gap-2 sm:gap-2.5">            <div className={`relative transition-all duration-300 ${
              isScrolled ? "w-8 h-8 sm:w-9 sm:h-9" : "w-10 h-10 sm:w-11 sm:h-11"
            }`}>
              <img 
                src="/logo.png" 
                alt="AmarVoice Logo" 
                className={`transition-all duration-300 object-contain rounded-lg ${
                  isScrolled ? "w-8 h-8 sm:w-9 sm:h-9" : "w-10 h-10 sm:w-11 sm:h-11"
                }`}
              />
            </div>
            <span className={`font-bold bg-gradient-to-r from-green-600 to-blue-600 dark:from-green-400 dark:to-blue-400 bg-clip-text text-transparent transition-all duration-300 ${
              isScrolled ? "text-lg sm:text-xl" : "text-xl sm:text-2xl"
            }`}>
              AmarVoice
            </span>
          </div>          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6 xl:gap-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  if (item.onClick) {
                    item.onClick();
                  }
                }}                className={`relative transition-all duration-300 cursor-pointer text-black dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:scale-105 animated-underline font-medium ${
                  isScrolled ? "text-sm" : "text-base"
                }`}
              >
                {item.name}
              </a>
            ))}
            <div className="flex items-center gap-2 lg:gap-3">
              <ThemeToggle />              <Button 
                size={isScrolled ? "sm" : "default"}
                className="btn-modern btn-primary hidden sm:inline-flex"
                onClick={handleAuthAction}
              >
                <span className="relative z-10">
                  {isAuthenticated ? `Hi, ${user?.name?.split(' ')[0] || 'User'}` : 'Sign In'}
                </span>
              </Button>
            </div>
          </div>          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-9 h-9 sm:w-10 sm:h-10 p-0 touch-manipulation"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </Button>
          </div>
        </nav>        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-2 sm:mt-3 p-3 sm:p-4 bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl border border-gray-200/30 dark:border-gray-700/30 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/30 mx-2 sm:mx-0">
            <div className="flex flex-col gap-2 sm:gap-3">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.onClick) {
                      item.onClick();
                    }
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-black dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors duration-300 cursor-pointer text-sm font-medium py-2.5 sm:py-2 px-3 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 touch-manipulation"
                >
                  {item.name}
                </a>
              ))}              <div className="pt-2 sm:pt-3 border-t border-border/50 dark:border-white/10">
                <Button 
                  className="w-full btn-modern btn-primary min-h-[44px] touch-manipulation"
                  onClick={handleAuthAction}
                >
                  {isAuthenticated ? `Hi, ${user?.name?.split(' ')[0] || 'User'}` : 'Sign In'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </header>
  );
};

export default memo(Navbar);