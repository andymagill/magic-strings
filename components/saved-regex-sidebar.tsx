"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SparklesIcon, TopHatIcon } from "@/components/icons"
import { Pencil, Trash2, Copy, Check } from "lucide-react"
import type { SavedRegex } from "@/types/regex"

interface SavedRegexSidebarProps {
  savedRegexes: SavedRegex[]
  onEdit: (regex: SavedRegex) => void
  onDelete: (id: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SavedRegexSidebar({
  savedRegexes,
  onEdit,
  onDelete,
  open,
  onOpenChange,
}: SavedRegexSidebarProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleCopy = (regex: string, id: string) => {
    navigator.clipboard.writeText(regex)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const confirmDelete = (id: string) => {
    onDelete(id)
    setDeleteId(null)
  }

  return (
    <>
      {/* Desktop Sidebar - Sticky */}
      <aside className="hidden lg:block sticky top-0 h-screen w-80 xl:w-96 border-l border-border/30 bg-card/40 backdrop-blur-sm overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <TopHatIcon className="w-6 h-6 text-accent" />
            <h2 className="font-serif font-bold text-xl text-foreground">Spellbook</h2>
            <Badge variant="outline" className="text-accent border-accent/30 text-xs ml-auto">
              {savedRegexes.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {savedRegexes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/30 p-8 text-center">
                <SparklesIcon className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground/50">
                  No saved spells yet. Create your first enchantment to begin.
                </p>
              </div>
            ) : (
              savedRegexes.map((saved) => (
                <div
                  key={saved.id}
                  className="group/item rounded-xl border border-border/30 bg-card/60 p-4 transition-all hover:border-accent/20 hover:bg-card/80 hover:shadow-lg hover:shadow-accent/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <SparklesIcon className="w-4 h-4 text-accent shrink-0" />
                        <h3 className="font-medium text-foreground truncate">{saved.name}</h3>
                      </div>
                      <code className="block text-sm font-mono text-accent/80 bg-secondary/50 rounded-lg px-3 py-2 break-all">
                        {saved.regex}
                      </code>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {saved.criteria.slice(0, 3).map((c) => (
                          <Badge
                            key={c.id}
                            variant="outline"
                            className="text-xs text-muted-foreground border-border/50"
                          >
                            {c.type.replace(/_/g, " ")}
                          </Badge>
                        ))}
                        {saved.criteria.length > 3 && (
                          <Badge variant="outline" className="text-xs text-muted-foreground border-border/50">
                            +{saved.criteria.length - 3}
                          </Badge>
                        )}
                        {(saved.flags.global ||
                          saved.flags.caseInsensitive ||
                          saved.flags.multiline ||
                          saved.flags.dotAll) && (
                          <Badge className="text-xs bg-accent/10 text-accent border-accent/20">
                            {saved.flags.global && "g"}
                            {saved.flags.caseInsensitive && "i"}
                            {saved.flags.multiline && "m"}
                            {saved.flags.dotAll && "s"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground/40 mt-2">
                        {new Date(saved.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(saved.regex, saved.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-accent"
                      >
                        {copiedId === saved.id ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span className="sr-only">Copy regex</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(saved)}
                        className="h-8 w-8 text-muted-foreground hover:text-accent"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(saved.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Sheet */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              <TopHatIcon className="w-6 h-6 text-accent" />
              <span className="font-serif">Spellbook</span>
              <Badge variant="outline" className="text-accent border-accent/30 text-xs ml-auto">
                {savedRegexes.length}
              </Badge>
            </SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-3">
            {savedRegexes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/30 p-8 text-center">
                <SparklesIcon className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground/50">
                  No saved spells yet. Create your first enchantment to begin.
                </p>
              </div>
            ) : (
              savedRegexes.map((saved) => (
                <div
                  key={saved.id}
                  className="rounded-xl border border-border/30 bg-card/60 p-4 transition-all hover:border-accent/20"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <SparklesIcon className="w-4 h-4 text-accent shrink-0" />
                      <h3 className="font-medium text-foreground truncate">{saved.name}</h3>
                    </div>
                    <code className="block text-sm font-mono text-accent/80 bg-secondary/50 rounded-lg px-3 py-2 break-all">
                      {saved.regex}
                    </code>
                    <div className="flex flex-wrap gap-1">
                      {saved.criteria.slice(0, 3).map((c) => (
                        <Badge
                          key={c.id}
                          variant="outline"
                          className="text-xs text-muted-foreground border-border/50"
                        >
                          {c.type.replace(/_/g, " ")}
                        </Badge>
                      ))}
                      {saved.criteria.length > 3 && (
                        <Badge variant="outline" className="text-xs text-muted-foreground border-border/50">
                          +{saved.criteria.length - 3}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(saved.regex, saved.id)}
                        className="flex-1 text-muted-foreground hover:text-accent"
                      >
                        {copiedId === saved.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 mr-1 text-green-400" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(saved)}
                        className="flex-1 text-muted-foreground hover:text-accent"
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteId(saved.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-serif">Break this spell?</AlertDialogTitle>
            <AlertDialogDescription>
              This enchantment will be permanently removed from your Spellbook. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Spell</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && confirmDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
