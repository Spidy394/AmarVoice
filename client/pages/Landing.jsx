'use client';

import React, { lazy, Suspense, useEffect } from 'react'
import { useAuth } from '@/lib/auth-store'
import { useRouter } from 'next/navigation'
import Navbar from '../components/Navbar'
import HeroSection from '@/components/Hero'

// Lazy load non-critical components
const Footer = lazy(() => import('@/components/Footer'))
const Features = lazy(() => import('@/components/Features'))
const HowItWorks = lazy(() => import('@/components/HowItWorks'))
const CallToAction = lazy(() => import('@/components/CallToAction'))

// Loading component for suspense fallbacks
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-8">
    <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
)

const Landing = () => {
  const { checkAuth, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Check authentication status when landing page loads
    checkAuth().then((authenticated) => {
      if (authenticated) {
        router.push('/home')
      }
    })
  }, [checkAuth, router])

  // Show landing page content if not authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <Suspense fallback={<LoadingSpinner />}>
        <Features />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <HowItWorks />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <CallToAction />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <Footer />
      </Suspense>
    </div>
  )
}

export default Landing