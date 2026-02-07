"use client"

import { useState, useEffect, useCallback } from "react"
import { SpotlightBackground } from "@/components/spotlight-background"
import { RegexBuilder, type SavedRegex } from "@/components/regex-builder"
import { SavedRegexSidebar } from "@/components/saved-regex-sidebar"
import { WandIcon, SparklesIcon } from "@/components/magic-icons"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

const STORAGE_KEY = "magic-strings-saved"

function loadSaved(): SavedRegex[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persistSaved(regexes: SavedRegex[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(regexes))
}

export default function Page() {
  const [savedRegexes, setSavedRegexes] = useState<SavedRegex[]>([])
  const [editingRegex, setEditingRegex] = useState<SavedRegex | null>(null)
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSavedRegexes(loadSaved())
    setMounted(true)
  }, [])

  const handleSave = useCallback(
    (saved: SavedRegex) => {
      setSavedRegexes((prev) => {
        const existing = prev.findIndex((r) => r.id === saved.id)
        let next: SavedRegex[]
        if (existing >= 0) {
          next = [...prev]
          next[existing] = saved
        } else {
          next = [saved, ...prev]
        }
        persistSaved(next)
        return next
      })
      setEditingRegex(null)
    },
    []
  )

  const handleDelete = useCallback((id: string) => {
    setSavedRegexes((prev) => {
      const next = prev.filter((r) => r.id !== id)
      persistSaved(next)
      return next
    })
  }, [])

  const handleEdit = useCallback((regex: SavedRegex) => {
    setEditingRegex(regex)
    setSidebarOpen(false)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingRegex(null)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <WandIcon className="w-8 h-8 text-accent animate-wand-wave" />
      </div>
    )
  }

  return (
    <>
      <SpotlightBackground />

      <div className="flex min-h-screen">
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
                    <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent/40 animate-float-sparkle" />
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

              {/* Decorative spotlight line */}
              <div className="mt-6 w-48 h-px bg-gradient-to-r from-accent/40 via-accent/20 to-transparent" />
            </div>
          </header>

          {/* Content */}
          <div className="relative z-10 px-4 pb-12 max-w-2xl mx-auto space-y-6">
            {/* Builder Card - Main Stage */}
            <section
              className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 shadow-2xl shadow-black/20"
              aria-label="Regex builder - Magic Stage"
            >
              {/* Spotlight glow on card */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />
              <div className="relative">
                <RegexBuilder
                  onSave={handleSave}
                  editingRegex={editingRegex}
                  onCancelEdit={handleCancelEdit}
                />
              </div>
            </section>

            {/* Footer decoration */}
            <footer className="text-center pt-6">
              <div className="flex items-center justify-center gap-2 text-muted-foreground/30">
                <SparklesIcon className="w-4 h-4" />
                <span className="text-xs font-serif italic">Every great regex starts with a little magic</span>
                <SparklesIcon className="w-4 h-4" />
              </div>
            </footer>
          </div>
        </main>

        {/* Sidebar - Spellbook */}
        <SavedRegexSidebar
          savedRegexes={savedRegexes}
          onEdit={handleEdit}
          onDelete={handleDelete}
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
        />
      </div>
    </>
  )
}
