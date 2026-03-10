"use client";

import React, { useEffect, useState } from "react";
import type { Particle } from "@/lib/particle-utils";
import { generateFireworkParticles } from "@/lib/particle-utils";

/**
 * Global particle effects overlay component
 * Captures all click events on the page and generates subtle firework particles
 * at the click location. Automatically cleans up after animation completes.
 */
export function ParticleEffects({ children }: { children: React.ReactNode }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Capture click events globally and generate particles
  useEffect(() => {
    // List of interactive HTML tags and ARIA roles
    const INTERACTIVE_TAGS = new Set(["BUTTON", "INPUT", "SELECT", "TEXTAREA", "A"]);
    const INTERACTIVE_ROLES = new Set([
      "button",
      "menuitem",
      "tab",
      "switch",
      "link",
      "combobox",
      "listbox",
      "option",
    ]);

    /**
     * Check if a single element is interactive
     */
    const isInteractiveElement = (el: Element): boolean => {
      if (INTERACTIVE_TAGS.has(el.tagName)) return true;
      const role = el.getAttribute("role");
      if (role && INTERACTIVE_ROLES.has(role)) return true;
      if (el.getAttribute("data-select-trigger") === "true") return true;
      return false;
    };

    /**
     * Check if clicked element or any ancestor is clickable (up to 6 levels)
     */
    const isClickableElement = (el: HTMLElement | null): boolean => {
      let node: Element | null = el;
      for (let depth = 0; node && depth < 6; depth++) {
        if (isInteractiveElement(node)) return true;
        node = node.parentElement;
      }
      return false;
    };

    const handleClick = (e: MouseEvent) => {
      // Only trigger on user clicks (not programmatic clicks)
      if (!e.isTrusted) return;

      const target = e.target as HTMLElement;
      if (isClickableElement(target)) {
        const newParticles = generateFireworkParticles(e.clientX, e.clientY);
        setParticles((prev) => [...prev, ...newParticles]);
      }
    };

    // Listen for custom particle trigger events (from SelectTrigger and other components)
    const handleCustomParticleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { x, y } = customEvent.detail;
      const newParticles = generateFireworkParticles(x, y);
      setParticles((prev) => [...prev, ...newParticles]);
    };

    // Use capture phase on click to catch all interactions
    window.addEventListener("click", handleClick, true);
    window.addEventListener("triggerParticles", handleCustomParticleTrigger);
    return () => {
      window.removeEventListener("click", handleClick, true);
      window.removeEventListener("triggerParticles", handleCustomParticleTrigger);
    };
  }, []);

  // Clean up particles after animation completes
  useEffect(() => {
    if (particles.length === 0) return;

    const maxDuration = Math.max(...particles.map((p) => p.duration + p.delay));
    const timer = setTimeout(() => {
      setParticles([]);
    }, maxDuration);

    return () => clearTimeout(timer);
  }, [particles]);

  return (
    <>
      {children}

      {/* Particle overlay container */}
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden z-50"
        role="presentation"
        aria-hidden="true"
      >
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute h-1.5 w-1.5 rounded-full animate-firework-burst ${
              particle.color === "primary"
                ? "bg-accent"
                : particle.color === "secondary"
                  ? "bg-white"
                  : "bg-accent/60"
            }`}
            style={
              {
                left: `${particle.x}px`,
                top: `${particle.y}px`,
                "--tx": `${particle.tx}px`,
                "--ty": `${particle.ty}px`,
                animationDuration: `${particle.duration}ms`,
                animationDelay: `${particle.delay}ms`,
                boxShadow:
                  particle.color === "primary"
                    ? "0 0 8px hsl(45, 100%, 60%)"
                    : particle.color === "secondary"
                      ? "0 0 6px rgba(255, 255, 255, 0.8)"
                      : "0 0 4px hsl(45, 100%, 60%, 0.5)",
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </>
  );
}
