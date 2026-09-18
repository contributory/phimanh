"use client";

import { useEffect, useRef } from "react";

const OWNER_KEY = "6ff533fb-b303-11f1-ac11-040140774501";

export default function RemarkboxComments() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const threadFragment = window.location.hash;
    const iframe = document.createElement("iframe");
    iframe.id = "remarkbox-iframe";
    iframe.scrolling = "no";
    iframe.src =
      "https://my.remarkbox.com/embed" +
      "?rb_owner_key=" + OWNER_KEY +
      "&thread_title=" + encodeURI(document.title) +
      "&thread_uri=" + encodeURIComponent(window.location.href) +
      "&mode=light" + threadFragment;
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("tabindex", "0");
    iframe.setAttribute("title", "Bình luận Remarkbox");
    iframe.style.width = "100%";
    iframe.style.minHeight = "600px";
    iframe.style.border = "none";
    container.appendChild(iframe);

    const initializeResizer = () => {
      const resize = (window as typeof window & {
        iFrameResize?: (options: Record<string, unknown>, target: HTMLIFrameElement) => void;
      }).iFrameResize;

      resize?.(
        {
          checkOrigin: ["https://my.remarkbox.com"],
          inPageLinks: true,
          initCallback: (element: HTMLIFrameElement & {
            iFrameResizer?: { moveToAnchor: (fragment: string) => void };
          }) => element.iFrameResizer?.moveToAnchor(threadFragment),
        },
        iframe
      );
    };

    let script = document.querySelector<HTMLScriptElement>(
      'script[data-remarkbox-resizer="true"]'
    );

    if (script) {
      if ((window as typeof window & { iFrameResize?: unknown }).iFrameResize) {
        initializeResizer();
      } else {
        script.addEventListener("load", initializeResizer, { once: true });
      }
    } else {
      script = document.createElement("script");
      script.src = "https://my.remarkbox.com/static/js/iframe-resizer/iframeResizer.min.js";
      script.async = true;
      script.dataset.remarkboxResizer = "true";
      script.addEventListener("load", initializeResizer, { once: true });
      document.body.appendChild(script);
    }

    return () => {
      script?.removeEventListener("load", initializeResizer);
      iframe.remove();
    };
  }, []);

  return (
    <section className="bg-card rounded-xl p-4 border border-border" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="mb-4 text-lg font-bold text-foreground">
        Bình luận
      </h2>
      <div id="remarkbox-div" ref={containerRef}>
        <noscript>
          <iframe
            src="https://my.remarkbox.com/embed?nojs=true&mode=light"
            style={{ height: 600, width: "100%", border: "none" }}
            tabIndex={0}
            title="Bình luận Remarkbox"
          />
        </noscript>
      </div>
    </section>
  );
}
