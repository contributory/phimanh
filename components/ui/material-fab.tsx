'use client';

import React, { useState, useEffect } from 'react';
import { MaterialFAB, MaterialRipple } from './material-animations';
import { Search, ArrowUp, Menu, Heart } from 'lucide-react';

interface MaterialFABGroupProps {
  onSearchClick?: () => void;
  onMenuClick?: () => void;
  onScrollTop?: () => void;
}

export default function MaterialFABGroup({
  onSearchClick,
  onMenuClick,
  onScrollTop,
}: MaterialFABGroupProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    onScrollTop?.();
  };

  return (
    <div className="fixed bottom-8 right-8 z-[1000] flex flex-col items-end gap-4">
      {/* Secondary FABs */}
      {isExpanded && (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Quick Search FAB */}
          <MaterialRipple>
            <button
              onClick={() => {
                onSearchClick?.();
                setIsExpanded(false);
              }}
              className="w-14 h-14 bg-zinc-900/80 backdrop-blur-xl text-white rounded-2xl border border-white/10 shadow-2xl flex items-center justify-center group hover:border-blue-500/50 transition-all"
            >
              <Search className="w-6 h-6 transition-transform group-hover:scale-110" />
            </button>
          </MaterialRipple>

          {/* Favorites FAB */}
          <MaterialRipple>
            <button
              onClick={() => {
                window.location.href = '/recently';
                setIsExpanded(false);
              }}
              className="w-14 h-14 bg-zinc-900/80 backdrop-blur-xl text-white rounded-2xl border border-white/10 shadow-2xl flex items-center justify-center group hover:border-red-500/50 transition-all"
            >
              <Heart className="w-6 h-6 transition-transform group-hover:scale-110" />
            </button>
          </MaterialRipple>

          {/* Scroll to top FAB */}
          {showScrollTop && (
            <MaterialRipple>
              <button
                onClick={() => {
                  scrollToTop();
                  setIsExpanded(false);
                }}
                className="w-14 h-14 bg-zinc-900/80 backdrop-blur-xl text-white rounded-2xl border border-white/10 shadow-2xl flex items-center justify-center group hover:border-green-500/50 transition-all"
              >
                <ArrowUp className="w-6 h-6 transition-transform group-hover:scale-110" />
              </button>
            </MaterialRipple>
          )}
        </div>
      )}

      {/* Main FAB */}
      <MaterialRipple>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-16 h-16 bg-red-600 text-white rounded-2xl border border-white/10 shadow-[0_8px_32px_rgba(239,68,68,0.3)] flex items-center justify-center group transition-all duration-500 ${
            isExpanded ? 'rotate-45' : ''
          }`}
        >
          <Menu className="w-8 h-8 transition-all duration-300 group-hover:scale-110" />
        </button>
      </MaterialRipple>

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm -z-10 animate-in fade-in duration-500"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}

// Simple scroll to top FAB with progress indicator
export function ScrollToTopFAB() {
  const [visible, setVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollY / height) * 100;
      
      setScrollProgress(progress);
      setVisible(scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="fixed bottom-8 right-8 z-[1000] pointer-events-none">
      <div className={`relative transition-all duration-500 transform ${visible ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10'}`}>
        <button
          onClick={scrollToTop}
          className="relative w-16 h-16 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center group pointer-events-auto hover:border-red-500/50 transition-colors shadow-2xl"
          aria-label="Back to top"
        >
          {/* Progress Circle Backdrop */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-white/5"
            />
            {/* Active Progress Circle */}
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={175.9}
              strokeDashoffset={175.9 - (175.9 * scrollProgress) / 100}
              strokeLinecap="round"
              className="text-red-500 transition-all duration-200"
            />
          </svg>
          
          <ArrowUp className="w-6 h-6 text-white group-hover:-translate-y-1 transition-transform duration-300 relative z-10" />
          
          <div className="absolute inset-0 bg-red-500/0 group-hover:bg-red-500/5 rounded-2xl transition-colors" />
        </button>
      </div>
    </div>
  );
}

// Quick action FABs for different contexts
export function QuickActionFAB({
  type,
  onClick,
  visible = true,
}: {
  type: 'search' | 'menu' | 'heart' | 'up';
  onClick?: () => void;
  visible?: boolean;
}) {
  const getIcon = () => {
    switch (type) {
      case 'search':
        return <Search className="w-6 h-6" />;
      case 'menu':
        return <Menu className="w-6 h-6" />;
      case 'heart':
        return <Heart className="w-6 h-6" />;
      case 'up':
        return <ArrowUp className="w-6 h-6" />;
      default:
        return <Menu className="w-6 h-6" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'search':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'menu':
        return 'bg-primary hover:bg-primary/90';
      case 'heart':
        return 'bg-red-500 hover:bg-red-600';
      case 'up':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-primary hover:bg-primary/90';
    }
  };

  return (
    <MaterialRipple className="fixed bottom-8 right-8 z-[1000]">
      <button
        onClick={onClick}
        className={`w-16 h-16 text-white rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl material-transition flex items-center justify-center group ${getColors()} ${
          visible ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-10'
        } transition-all duration-500`}
      >
        <span className="relative z-10 transition-transform duration-300 group-hover:scale-110">
          {getIcon()}
        </span>
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
      </button>
    </MaterialRipple>
  );
}