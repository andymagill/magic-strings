"use client";

import { useState, useEffect, useCallback } from "react";
import { RegexBuilder } from "@/components/regex-builder";
import { SavedRegexSidebar } from "@/components/saved-regex-sidebar";
import { WandIcon, SparklesIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import type { SavedRegex } from "@/types/regex";
import { loadSavedRegexes, addSavedRegex, removeSavedRegex } from "@/lib/storage";

/**
 * Home page component
 * Main entry point for the Magic Strings regex builder application
 */
export default function Page() {
  const [savedRegexes, setSavedRegexes] = useState<SavedRegex[]>([]);
  const [editingRegex, setEditingRegex] = useState<SavedRegex | null>(null);
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load saved patterns on mount (sorted by most recent first)
  useEffect(() => {
    const loaded = loadSavedRegexes();
    setSavedRegexes(loaded.sort((a, b) => b.createdAt - a.createdAt));
    setMounted(true);
  }, []);

  const handleSave = useCallback((saved: SavedRegex) => {
    setSavedRegexes((prev) => {
      const existing = prev.findIndex((r) => r.id === saved.id);
      let next: SavedRegex[];
      if (existing >= 0) {
        // Update existing and move to front (most recent)
        next = [saved, ...prev.filter((r) => r.id !== saved.id)];
      } else {
        next = [saved, ...prev];
      }
      addSavedRegex(saved);
      return next;
    });
    setEditingRegex(null);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setSavedRegexes((prev) => {
      const next = prev.filter((r) => r.id !== id);
      removeSavedRegex(id);
      return next;
    });
  }, []);

  const handleEdit = useCallback((regex: SavedRegex) => {
    setEditingRegex(regex);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingRegex(null);
  }, []);

  const handleNew = useCallback(() => {
    handleCancelEdit();
  }, [handleCancelEdit]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <WandIcon className="w-8 h-8 text-accent animate-wand-wave" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Skip Navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-foreground focus:rounded-lg focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Main Content */}
      <main className="relative flex-1 min-h-screen">
        {/* Header */}
        <header className="relative z-10 pt-8 pb-6 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              {/* Logo: Wand + Title Horizontal */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <WandIcon className="w-8 h-8 text-accent animate-wand-wave" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground tracking-tight">
                    Magic Strings
                  </h1>
                </div>
              </div>

              {/* Mobile Spellbook Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden border-accent/30 text-accent hover:bg-accent/10"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Spellbook
              </Button>
            </div>

            <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
              Conjure powerful regular expressions with a wave of your wand
            </p>
          </div>
        </header>

        {/* Content */}
        <div className="relative z-10 px-4 sm:px-0 pb-12 max-w-2xl mx-auto space-y-6">
          {/* Builder Card - Main Stage */}
          <section
            id="main-content"
            className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 shadow-2xl shadow-black/20"
            aria-label="Regex builder - Magic Stage"
          >
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative">
              <RegexBuilder
                onSave={handleSave}
                onDelete={handleDelete}
                editingRegex={editingRegex}
                onCancelEdit={handleCancelEdit}
              />
            </div>
          </section>

          {/* Footer decoration */}
          <footer className="text-center pt-6 space-y-3">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <SparklesIcon className="w-4 h-4" />
              <span className="text-xs font-serif italic">
                Every great regex starts with a little magic
              </span>
              <SparklesIcon className="w-4 h-4" />
            </div>
            <div className="text-xs text-muted-foreground/70">
              Made by{" "}
              <a
                href="https://magill.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent/80 underline transition-colors"
              >
                Andrew Magill
              </a>
            </div>
          </footer>
        </div>
      </main>

      {/* Sidebar - Spellbook */}
      <SavedRegexSidebar
        savedRegexes={savedRegexes}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onNew={handleNew}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />
    </div>
  );
}
