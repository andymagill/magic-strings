"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SelectTrigger, Select } from "@/components/ui/select"
import { WandIcon, SparklesIcon, HandIcon } from "@/components/icons"
import { X, Plus, Copy, Check, Trash2 } from "lucide-react"
import type { RegexCriterion, RegexFlags, SavedRegex } from "@/types/regex"
import { buildRegex, testRegexSafe, generateId } from "@/lib/regex-utils"
import { CRITERION_TYPES, QUANTIFIERS } from "@/lib/constants"

interface RegexBuilderProps {
  onSave: (saved: SavedRegex) => void
  onDelete: (id: string) => void
  editingRegex: SavedRegex | null
  onCancelEdit: () => void
}

/**
 * RegexBuilder component - Main interface for creating regex patterns
 * Auto-saves patterns as users build them, removing the need for manual save actions
 */
export function RegexBuilder({ onSave, onDelete, editingRegex, onCancelEdit }: RegexBuilderProps) {
  const [criteria, setCriteria] = useState<RegexCriterion[]>([])
  const [flags, setFlags] = useState<RegexFlags>({
    global: false,
    caseInsensitive: false,
    multiline: false,
    dotAll: false,
  })
  const [copied, setCopied] = useState(false)
  const [testString, setTestString] = useState("")
  const [testResult, setTestResult] = useState<null | { matches: boolean; matchedParts: string[] }>(null)
  const [testError, setTestError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentIdRef = useRef<string>(editingRegex?.id || generateId())

  const regex = buildRegex(criteria, flags)

  // Load editing regex when provided
  useEffect(() => {
    if (editingRegex) {
      setCriteria(editingRegex.criteria)
      setFlags(editingRegex.flags)
      currentIdRef.current = editingRegex.id
    }
  }, [editingRegex])

  // Auto-save logic: triggers on criteria/flags changes with debouncing and validity check
  useEffect(() => {
    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // If criteria is empty, delete the saved regex if we're editing one
    if (criteria.length === 0) {
      if (editingRegex) {
        onDelete(editingRegex.id)
        onCancelEdit()
      }
      setSaveError(null)
      return
    }

    // Check if regex is valid for saving
    const isValidRegex = regex !== "//" && !testError

    // Set up auto-save timeout (3 seconds inactivity)
    saveTimeoutRef.current = setTimeout(() => {
      if (isValidRegex && criteria.length > 0) {
        const saved: SavedRegex = {
          id: currentIdRef.current,
          criteria,
          flags,
          regex,
          createdAt: editingRegex?.createdAt || Date.now(),
        }
        onSave(saved)
        setSaveError(null)
      }
    }, 3000)

    // If regex becomes valid immediately, trigger save without waiting
    if (isValidRegex && criteria.length > 0 && regex !== "//") {
      // Shorter timeout for valid changes
      const quickSaveTimeout = setTimeout(() => {
        const saved: SavedRegex = {
          id: currentIdRef.current,
          criteria,
          flags,
          regex,
          createdAt: editingRegex?.createdAt || Date.now(),
        }
        onSave(saved)
        setSaveError(null)
      }, 500)

      return () => {
        clearTimeout(quickSaveTimeout)
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
      }
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [criteria, flags, regex, testError, onSave, onDelete, editingRegex, onCancelEdit])

  const addCriterion = useCallback(() => {
    setCriteria((prev) => [
      ...prev,
      { id: generateId(), type: "contains", value: "", quantifier: "one" },
    ])
  }, [])

  const removeCriterion = useCallback((id: string) => {
    setCriteria((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const updateCriterion = useCallback(
    (id: string, field: keyof RegexCriterion, value: string) => {
      setCriteria((prev) =>
        prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
      )
    },
    []
  )

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(regex)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [regex])

  const handleReset = useCallback(() => {
    // If editing, delete the regex from storage
    if (editingRegex) {
      onDelete(editingRegex.id)
    }
    setCriteria([])
    setFlags({ global: false, caseInsensitive: false, multiline: false, dotAll: false })
    setTestString("")
    setTestResult(null)
    setTestError(null)
    setSaveError(null)
    currentIdRef.current = generateId()
    if (editingRegex) onCancelEdit()
  }, [editingRegex, onCancelEdit, onDelete])

  const handleTest = useCallback(() => {
    setTestError(null)
    if (!regex || regex === "//") {
      setTestResult(null)
      return
    }
    const result = testRegexSafe(regex, testString)
    if (result.error) {
      setTestError(result.error)
      setTestResult(null)
    } else {
      setTestResult({ matches: result.matches, matchedParts: result.matchedParts })
    }
  }, [regex, testString])

  const needsValue = (type: string) =>
    !["digit", "word_char", "whitespace", "any_char", "letter_upper", "letter_lower"].includes(type)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <WandIcon className="w-6 h-6 text-accent animate-wand-wave" />
          </div>
          <h2 className="text-xl font-serif font-bold text-foreground">
            Craft Your Spell
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-serif">Delete this spell?</AlertDialogTitle>
                <AlertDialogDescription>
                  {editingRegex
                    ? "This enchantment will be permanently removed from your Spellbook. This action cannot be undone."
                    : "This will clear all criteria, flags, and inputs. You can start creating a new spell."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Spell</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset} className="bg-destructive text-destructive-foreground hover:bg-destructive/80">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Criteria List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <HandIcon className="w-4 h-4 text-accent" />
            Incantation Criteria
          </span>
          <Badge variant="outline" className="text-accent border-accent/30 text-xs">
            {criteria.length} {criteria.length === 1 ? "rule" : "rules"}
          </Badge>
        </div>

        {criteria.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/50 p-8 text-center">
            <HandIcon className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No criteria yet. Add your first rule to begin the incantation.
            </p>
          </div>
        )}

        <div className="space-y-2">
          {criteria.map((c, index) => (
            <div
              key={c.id}
              className="group flex items-start gap-2 rounded-lg border border-border/50 bg-secondary/30 p-3 transition-colors hover:border-accent/20 hover:bg-secondary/50"
            >
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-mono shrink-0 mt-1">
                {index + 1}
              </span>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                {/* Type */}
                <Select
                  value={c.type}
                  onValueChange={(val) => updateCriterion(c.id, "type", val)}
                >
                  <SelectTrigger className="bg-card border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {CRITERION_TYPES.map((ct) => (
                      <SelectItem key={ct.value} value={ct.value}>
                        {ct.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Value */}
                {needsValue(c.type) ? (
                  <Input
                    value={c.value}
                    onChange={(e) => updateCriterion(c.id, "value", e.target.value)}
                    placeholder={
                      c.type === "or"
                        ? "word1, word2, ..."
                        : c.type === "custom_class"
                          ? "a-z0-9"
                          : "value..."
                    }
                    className="bg-card border-border text-foreground placeholder:text-muted-foreground/40"
                  />
                ) : (
                  <div className="flex items-center px-3 rounded-md bg-card border border-border text-muted-foreground text-sm">
                    Auto-detected
                  </div>
                )}

                {/* Quantifier */}
                {!["starts_with", "ends_with", "exact"].includes(c.type) && (
                  <Select
                    value={c.quantifier}
                    onValueChange={(val) => updateCriterion(c.id, "quantifier", val)}
                  >
                    <SelectTrigger className="bg-card border-border text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {QUANTIFIERS.map((q) => (
                        <SelectItem key={q.value} value={q.value}>
                          {q.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeCriterion(c.id)}
                className="shrink-0 text-muted-foreground hover:text-destructive h-8 w-8 mt-0.5"
              >
                <X className="w-4 h-4" />
                <span className="sr-only">Remove criterion</span>
              </Button>
            </div>
          ))}
        </div>

        <Button
          onClick={addCriterion}
          className="w-full bg-yellow-400 text-black hover:bg-white disabled:bg-slate-300 disabled:text-slate-800 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Criterion
        </Button>
      </div>

      {/* Flags */}
      <div className="space-y-3">
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <WandIcon className="w-4 h-4 text-accent" />
          Regex Flags
        </span>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "global" as const, label: "Global", desc: "Match all" },
            { key: "caseInsensitive" as const, label: "Case Insensitive", desc: "Ignore case" },
            { key: "multiline" as const, label: "Multiline", desc: "^ $ per line" },
            { key: "dotAll" as const, label: "Dot All", desc: ". matches \\n" },
          ].map((flag) => (
            <div
              key={flag.key}
              className="flex items-center justify-between rounded-lg border border-border/50 bg-secondary/30 px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{flag.label}</p>
                <p className="text-xs text-muted-foreground">{flag.desc}</p>
              </div>
              <Switch
                checked={flags[flag.key]}
                onCheckedChange={(checked) =>
                  setFlags((prev) => ({ ...prev, [flag.key]: checked }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Generated Regex Output */}
      <div className="space-y-3">
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <SparklesIcon className="w-4 h-4 text-accent" />
          The Magic String
        </span>
        <div className="relative group">
          <div className="absolute -inset-[1px] rounded-xl bg-gradient-to-r from-accent/20 via-foreground/10 to-accent/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center gap-2 rounded-xl border border-accent/20 bg-card p-4">
            <code className="flex-1 text-lg font-mono text-accent break-all min-h-[1.75rem]">
              {regex || (
                <span className="text-muted-foreground/40 text-sm">
                  Your regex will appear here...
                </span>
              )}
            </code>
            {regex && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="shrink-0 text-muted-foreground hover:text-accent"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                <span className="sr-only">Copy regex</span>
              </Button>
            )}
          </div>
        </div>
        {saveError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <p className="font-medium">Error saving pattern</p>
            <p className="text-xs mt-1">{saveError}</p>
          </div>
        )}
      </div>

      {/* Test Area */}
      <div className="space-y-3">
        <span className="text-sm font-medium text-muted-foreground">Test Your Spell</span>
        <div className="flex gap-2">
          <Input
            value={testString}
            onChange={(e) => {
              setTestString(e.target.value)
              setTestResult(null)
              setTestError(null)
            }}
            placeholder="Enter test string..."
            className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground/40"
          />
          <Button
            onClick={handleTest}
            disabled={!regex || regex === "//"}
            className="bg-yellow-400 text-black hover:bg-white disabled:bg-slate-300 disabled:text-slate-800 disabled:cursor-not-allowed shrink-0"
          >
            <WandIcon className="w-4 h-4 mr-1" />
            Test
          </Button>
        </div>
        {testError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            <p className="font-medium">Error testing pattern:</p>
            <p className="text-xs mt-1">{testError}</p>
          </div>
        )}
        {testResult && !testError && (
          <div
            className={`rounded-lg border p-3 text-sm ${
              testResult.matches
                ? "border-green-500/30 bg-green-500/5 text-green-400"
                : "border-destructive/30 bg-destructive/5 text-destructive"
            }`}
          >
            {testResult.matches ? (
              <div>
                <p className="font-medium flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4" />
                  Bravo, match found!
                </p>
                {testResult.matchedParts.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {testResult.matchedParts.map((m, i) => (
                      <Badge key={i} className="bg-green-500/20 text-green-300 border-green-500/30">
                        {`"${m}"`}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="font-medium">No match. Adjust criteria.</p>
            )}
          </div>
        )}
      </div>

    </div>
  )
}