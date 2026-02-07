"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { WandIcon, SparklesIcon, TopHatIcon } from "@/components/icons"
import { ChevronDown, Pencil, Trash2, Copy, Check } from "lucide-react"
import type { SavedRegex } from "@/components/regex-builder"

interface SavedRegexTrayProps {
  savedRegexes: SavedRegex[]
  onEdit: (regex: SavedRegex) => void
  onDelete: (id: string) => void
}

export function SavedRegexTray({ savedRegexes, onEdit, onDelete }: SavedRegexTrayProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (regex: string, id: string) => {
    navigator.clipboard.writeText(regex)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl border border-border/50 bg-card/80 px-4 py-3 text-left transition-colors hover:bg-secondary/50 hover:border-accent/20 group"
        >
          <div className="flex items-center gap-3">
            <TopHatIcon className="w-5 h-5 text-accent" />
            <span className="font-serif font-semibold text-foreground">
              Spell Book
            </span>
            <Badge variant="outline" className="text-accent border-accent/30 text-xs">
              {savedRegexes.length}
            </Badge>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-2 space-y-2">
        {savedRegexes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/30 p-6 text-center">
            <WandIcon className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground/50">
              No saved spells yet. Create and save your first enchantment above.
            </p>
          </div>
        ) : (
          savedRegexes.map((saved) => (
            <div
              key={saved.id}
              className="group/item rounded-xl border border-border/30 bg-card/60 p-4 transition-all hover:border-accent/20 hover:bg-card/80"
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
                    {saved.criteria.map((c) => (
                      <Badge
                        key={c.id}
                        variant="outline"
                        className="text-xs text-muted-foreground border-border/50"
                      >
                        {c.type.replace(/_/g, " ")}
                        {c.value ? `: ${c.value}` : ""}
                      </Badge>
                    ))}
                    {saved.flags.global && (
                      <Badge className="text-xs bg-accent/10 text-accent border-accent/20">g</Badge>
                    )}
                    {saved.flags.caseInsensitive && (
                      <Badge className="text-xs bg-accent/10 text-accent border-accent/20">i</Badge>
                    )}
                    {saved.flags.multiline && (
                      <Badge className="text-xs bg-accent/10 text-accent border-accent/20">m</Badge>
                    )}
                    {saved.flags.dotAll && (
                      <Badge className="text-xs bg-accent/10 text-accent border-accent/20">s</Badge>
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
                    onClick={() => onDelete(saved.id)}
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
      </CollapsibleContent>
    </Collapsible>
  )
}
