"use client";
import { useEffect, useState } from "react";
import ClientOnly from "./client-only";

export default function GTM() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Only run on client side after mount
    if (typeof window !== 'undefined') {
      // Initialize dataLayer if it doesn't exist
      window.dataLayer = window.dataLayer || [];
      
      const script = document.createElement("script");
      script.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src= 'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f); })(window,document,'script','dataLayer','GTM-WP2MWVB8');`;
      
      try {
        document.head.appendChild(script);
      } catch (error) {
        // Silently fail if script injection fails
      }
      
      return () => {
        try {
          if (document.head.contains(script)) {
            document.head.removeChild(script);
          }
        } catch (error) {
          // Silently fail during cleanup
        }
      };
    }
  }, [isMounted]);

  return <ClientOnly>{null}</ClientOnly>;
}
