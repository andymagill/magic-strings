"use client"

import { SelectTrigger } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
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
import { MagicInput } from "@/components/magic-input"
import { MagicSelectTrigger, Select } from "@/components/magic-select"
import { MagicButton } from "@/components/magic-button"
import { WandIcon, SparklesIcon, MagicHandIcon } from "@/components/magic-icons"
import { X, Plus, Copy, Check, RotateCcw } from "lucide-react"
import type { RegexCriterion, RegexFlags, SavedRegex } from "@/types/regex"
import { buildRegex, testRegexSafe, generateId } from "@/lib/regex-utils"
import { CRITERION_TYPES, QUANTIFIERS } from "@/lib/constants"

interface RegexBuilderProps {
  onSave: (saved: SavedRegex) => void
  editingRegex: SavedRegex | null
  onCancelEdit: () => void
}

/**
 * RegexBuilder component - Main interface for creating regex patterns
 * Allows users to build regex patterns visually using criteria and flags,
 * test them, and save to their collection
 */
export function RegexBuilder({ onSave, editingRegex, onCancelEdit }: RegexBuilderProps) {
  const [criteria, setCriteria] = useState<RegexCriterion[]>([])
  const [flags, setFlags] = useState<RegexFlags>({
    global: false,
    caseInsensitive: false,
    multiline: false,
    dotAll: false,
  })
  const [name, setName] = useState("")
  const [copied, setCopied] = useState(false)
  const [testString, setTestString] = useState("")
  const [testResult, setTestResult] = useState<null | { matches: boolean; matchedParts: string[] }>(null)
  const [testError, setTestError] = useState<string | null>(null)

  // Load editing regex when provided
  useEffect(() => {
    if (editingRegex) {
      setCriteria(editingRegex.criteria)
      setFlags(editingRegex.flags)
      setName(editingRegex.name)
    }
  }, [editingRegex])

  const regex = buildRegex(criteria, flags)

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

  const handleSave = useCallback(() => {
    if (!name.trim() || criteria.length === 0) return
    const saved: SavedRegex = {
      id: editingRegex?.id || generateId(),
      name: name.trim(),
      criteria,
      flags,
      regex,
      createdAt: editingRegex?.createdAt || Date.now(),
    }
    onSave(saved)
    if (!editingRegex) {
      setCriteria([])
      setFlags({ global: false, caseInsensitive: false, multiline: false, dotAll: false })
      setName("")
    }
  }, [name, criteria, flags, regex, onSave, editingRegex])

  const handleReset = useCallback(() => {
    setCriteria([])
    setFlags({ global: false, caseInsensitive: false, multiline: false, dotAll: false })
    setName("")
    setTestString("")
    setTestResult(null)
    setTestError(null)
    if (editingRegex) onCancelEdit()
  }, [editingRegex, onCancelEdit])

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
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent animate-float-sparkle" />
          </div>
          <h2 className="text-xl font-serif font-bold text-foreground">
            {editingRegex ? "Edit Enchantment" : "Craft Your Spell"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {editingRegex && (
            <Button variant="ghost" size="sm" onClick={onCancelEdit} className="text-muted-foreground">
              Cancel
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground magic-sparkle">
                <RotateCcw className="w-4 h-4" />
                <span className="sr-only">Reset</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-serif">Clear the magic stage?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all criteria, flags, and inputs. Your saved spells in the Spellbook will not be affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Working</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset} className="bg-accent text-accent-foreground hover:bg-accent/80">
                  Clear Stage
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Spell Name */}
      <div className="space-y-2">
        <label htmlFor="spell-name" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <SparklesIcon className="w-4 h-4 text-accent" />
          Spell Name
        </label>
        <MagicInput
          id="spell-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name your enchantment..."
          className="bg-secondary/50 border-border focus-visible:ring-accent text-foreground placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Criteria List */}
      <div className="space-y-3 magic-spotlight-container">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <MagicHandIcon className="w-4 h-4 text-accent" />
            Incantation Criteria
          </span>
          <Badge variant="outline" className="text-accent border-accent/30 text-xs">
            {criteria.length} {criteria.length === 1 ? "rule" : "rules"}
          </Badge>
        </div>

        {criteria.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/50 p-8 text-center">
            <MagicHandIcon className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground/60">
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

              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 magic-spotlight-container">
                {/* Type */}
                <Select
                  value={c.type}
                  onValueChange={(val) => updateCriterion(c.id, "type", val)}
                >
                  <MagicSelectTrigger className="bg-card border-border text-foreground">
                    <SelectValue />
                  </MagicSelectTrigger>
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
                  <MagicInput
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
                    <MagicSelectTrigger className="bg-card border-border text-foreground">
                      <SelectValue />
                    </MagicSelectTrigger>
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

        <MagicButton
          variant="outline"
          onClick={addCriterion}
          className="w-full border-dashed border-border/50 text-muted-foreground hover:text-accent hover:border-accent/30 bg-transparent"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Criterion
        </MagicButton>
      </div>

      {/* Flags */}
      <div className="space-y-3">
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <WandIcon className="w-4 h-4 text-accent" />
          Enchantment Flags
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
                className="shrink-0 text-muted-foreground hover:text-accent magic-sparkle"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                <span className="sr-only">Copy regex</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Test Area */}
      <div className="space-y-3">
        <span className="text-sm font-medium text-muted-foreground">Test Your Spell</span>
        <div className="flex gap-2">
          <MagicInput
            value={testString}
            onChange={(e) => {
              setTestString(e.target.value)
              setTestResult(null)
              setTestError(null)
            }}
            placeholder="Enter test string..."
            className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground/40"
          />
          <MagicButton
            onClick={handleTest}
            disabled={!regex || regex === "//"}
            className="bg-accent text-accent-foreground hover:bg-accent/80 shrink-0"
          >
            <WandIcon className="w-4 h-4 mr-1" />
            Test
          </MagicButton>
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
                  Match found!
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
              <p className="font-medium">No match. Adjust your enchantment.</p>
            )}
          </div>
        )}
      </div>

      {/* Save Button */}
      <MagicButton
        onClick={handleSave}
        disabled={!name.trim() || criteria.length === 0}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/80 font-semibold text-base py-5"
      >
        <WandIcon className="w-5 h-5 mr-2" />
        {editingRegex ? "Update Enchantment" : "Seal the Spell"}
      </MagicButton>
    </div>
  )
}
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <WandIcon className="w-6 h-6 text-accent animate-wand-wave" />
            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent animate-float-sparkle" />
          </div>
          <h2 className="text-xl font-serif font-bold text-foreground">
            {editingRegex ? "Edit Enchantment" : "Craft Your Spell"}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {editingRegex && (
            <Button variant="ghost" size="sm" onClick={onCancelEdit} className="text-muted-foreground">
              Cancel
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground magic-sparkle">
                <RotateCcw className="w-4 h-4" />
                <span className="sr-only">Reset</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-serif">Clear the magic stage?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all criteria, flags, and inputs. Your saved spells in the Spellbook will not be affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Working</AlertDialogCancel>
                <AlertDialogAction onClick={handleReset} className="bg-accent text-accent-foreground hover:bg-accent/80">
                  Clear Stage
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Spell Name */}
      <div className="space-y-2">
        <label htmlFor="spell-name" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <SparklesIcon className="w-4 h-4 text-accent" />
          Spell Name
        </label>
        <MagicInput
          id="spell-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name your enchantment..."
          className="bg-secondary/50 border-border focus-visible:ring-accent text-foreground placeholder:text-muted-foreground/50"
        />
      </div>

      {/* Criteria List */}
      <div className="space-y-3 magic-spotlight-container">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <MagicHandIcon className="w-4 h-4 text-accent" />
            Incantation Criteria
          </span>
          <Badge variant="outline" className="text-accent border-accent/30 text-xs">
            {criteria.length} {criteria.length === 1 ? "rule" : "rules"}
          </Badge>
        </div>

        {criteria.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/50 p-8 text-center">
            <MagicHandIcon className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground/60">
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

              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2 magic-spotlight-container">
                {/* Type */}
                <Select
                  value={c.type}
                  onValueChange={(val) => updateCriterion(c.id, "type", val)}
                >
                  <MagicSelectTrigger className="bg-card border-border text-foreground">
                    <SelectValue />
                  </MagicSelectTrigger>
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
                  <MagicInput
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
                    <MagicSelectTrigger className="bg-card border-border text-foreground">
                      <SelectValue />
                    </MagicSelectTrigger>
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

        <MagicButton
          variant="outline"
          onClick={addCriterion}
          className="w-full border-dashed border-border/50 text-muted-foreground hover:text-accent hover:border-accent/30 bg-transparent"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Criterion
        </MagicButton>
      </div>

      {/* Flags */}
      <div className="space-y-3">
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <WandIcon className="w-4 h-4 text-accent" />
          Enchantment Flags
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
                className="shrink-0 text-muted-foreground hover:text-accent magic-sparkle"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                <span className="sr-only">Copy regex</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Test Area */}
      <div className="space-y-3">
        <span className="text-sm font-medium text-muted-foreground">Test Your Spell</span>
        <div className="flex gap-2">
          <MagicInput
            value={testString}
            onChange={(e) => {
              setTestString(e.target.value)
              setTestResult(null)
            }}
            placeholder="Enter test string..."
            className="bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground/40"
          />
          <MagicButton
            onClick={handleTest}
            disabled={!regex || regex === "//"}
            className="bg-accent text-accent-foreground hover:bg-accent/80 shrink-0"
          >
            <WandIcon className="w-4 h-4 mr-1" />
            Test
          </MagicButton>
        </div>
        {testResult && (
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
                  Match found!
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
              <p className="font-medium">No match. Adjust your enchantment.</p>
            )}
          </div>
        )}
      </div>

      {/* Save Button */}
      <MagicButton
        onClick={handleSave}
        disabled={!name.trim() || criteria.length === 0}
        className="w-full bg-accent text-accent-foreground hover:bg-accent/80 font-semibold text-base py-5"
      >
        <WandIcon className="w-5 h-5 mr-2" />
        {editingRegex ? "Update Enchantment" : "Seal the Spell"}
      </MagicButton>
    </div>
  )
}
