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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Secondary FABs */}
      {isExpanded && (
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Quick Search FAB */}
          <MaterialRipple>
            <button
              onClick={() => {
                onSearchClick?.();
                setIsExpanded(false);
              }}
              className="w-12 h-12 bg-secondary text-secondary-foreground rounded-full material-elevation-2 hover:material-elevation-3 material-transition flex items-center justify-center group"
            >
              <Search className="w-5 h-5 transition-transform group-hover:scale-110" />
            </button>
          </MaterialRipple>

          {/* Favorites FAB */}
          <MaterialRipple>
            <button
              onClick={() => {
                // Navigate to favorites/recently watched
                window.location.href = '/recently';
                setIsExpanded(false);
              }}
              className="w-12 h-12 bg-red-500 text-white rounded-full material-elevation-2 hover:material-elevation-3 material-transition flex items-center justify-center group"
            >
              <Heart className="w-5 h-5 transition-transform group-hover:scale-110" />
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
                className="w-12 h-12 bg-green-500 text-white rounded-full material-elevation-2 hover:material-elevation-3 material-transition flex items-center justify-center group"
              >
                <ArrowUp className="w-5 h-5 transition-transform group-hover:scale-110" />
              </button>
            </MaterialRipple>
          )}
        </div>
      )}

      {/* Main FAB */}
      <MaterialRipple>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-14 h-14 bg-primary text-primary-foreground rounded-full material-elevation-3 hover:material-elevation-4 material-transition flex items-center justify-center group ${
            isExpanded ? 'rotate-45' : ''
          }`}
        >
          <Menu className="w-6 h-6 transition-all duration-300 group-hover:scale-110" />
        </button>
      </MaterialRipple>

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10 animate-in fade-in duration-300"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
}

// Simple scroll to top FAB
export function ScrollToTopFAB() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <MaterialFAB visible={visible} onClick={scrollToTop}>
      <ArrowUp className="w-6 h-6" />
    </MaterialFAB>
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
    <MaterialRipple>
      <button
        onClick={onClick}
        className={`fixed bottom-6 right-6 w-14 h-14 text-white rounded-full material-elevation-3 hover:material-elevation-4 material-transition flex items-center justify-center group z-50 ${getColors()} ${
          visible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
        }`}
      >
        {getIcon()}
      </button>
    </MaterialRipple>
  );
}