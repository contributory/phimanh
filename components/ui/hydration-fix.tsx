"use client";

import { useEffect } from "react";

export default function HydrationFix() {
  useEffect(() => {
    // Comprehensive list of browser extension attributes
    const EXTENSION_ATTRIBUTES = [
      'bis_skin_checked',
      '__codelineno',
      '__codelineno_highlight',
      'data-adblock',
      'data-adblockkey',
      'cz-shortcut-listen',
      'data-gramm_editor',
      'data-new-gr-c-s-check-loaded',
      'data-gr-ext-installed',
      'data-darkreader-inline-bgcolor',
      'data-darkreader-inline-color',
      'data-darkreader-inline-border',
      'data-bitwarden-watching',
      'data-lastpass-watched',
      'data-testid',
      'grammarly-extension',
      'data-ms-editor'
    ];

    // Fast cleanup function
    const cleanupExtensionAttributes = () => {
      try {
        // Batch remove all extension attributes
        EXTENSION_ATTRIBUTES.forEach(attr => {
          const elements = document.querySelectorAll(`[${attr}]`);
          for (let i = 0; i < elements.length; i++) {
            elements[i].removeAttribute(attr);
          }
        });

        // Ensure body shows content
        if (!document.body.classList.contains('hydrated')) {
          document.body.classList.add('hydrated');
        }
      } catch (error) {
        console.debug('Extension cleanup failed:', error);
        // Force show content even if cleanup fails
        document.body.classList.add('fallback-show');
      }
    };

    // Prevent extensions from interfering during hydration
    const preventExtensionInterference = () => {
      // Intercept setAttribute calls during hydration
      const originalSetAttribute = Element.prototype.setAttribute;
      Element.prototype.setAttribute = function(name: string, value: string) {
        if (!EXTENSION_ATTRIBUTES.includes(name)) {
          return originalSetAttribute.call(this, name, value);
        }
        // Silently ignore extension attributes
      };

      // Restore after hydration completes
      setTimeout(() => {
        Element.prototype.setAttribute = originalSetAttribute;
      }, 1000);
    };

    // Run immediately to prevent hydration mismatch
    cleanupExtensionAttributes();
    preventExtensionInterference();

    // Aggressive cleanup during initial hydration
    const rapidCleanup = [10, 25, 50, 100, 200].map(delay =>
      setTimeout(cleanupExtensionAttributes, delay)
    );

    // Periodic maintenance cleanup
    const maintenanceInterval = setInterval(cleanupExtensionAttributes, 5000);

    // Cleanup on unmount
    return () => {
      rapidCleanup.forEach(clearTimeout);
      clearInterval(maintenanceInterval);
    };
  }, []);

  return null;
}