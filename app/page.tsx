"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, Copy } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Strategy = {
  id: string
  title: string
  description: string
  stake2: number
  profitIfBet1Wins: number
  profitIfBet2Wins: number
  totalInvestment: number
  accentClassName: string
}

type PlatformMode = "bet365" | "betano" | "bet warrior" | "otra"

const PLATFORM_OPTIONS: { label: string; value: PlatformMode }[] = [
  { label: "bet365", value: "bet365" },
  { label: "betano", value: "betano" },
  { label: "bet warrior", value: "bet warrior" },
  { label: "Otra", value: "otra" },
]

const DEFAULT_VALUES = {
  cuota1: "2.75",
  monto1: "10000",
  cuota2: "1.86",
  plataforma1: "bet365",
  plataforma2: "betano",
}

const moneyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const decimalFormatter = new Intl.NumberFormat("es-AR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function parsePositiveNumber(value: string) {
  const normalizedValue = value.replace(",", ".")
  const parsedValue = Number(normalizedValue)

  return Number.isFinite(parsedValue) ? parsedValue : 0
}

function toInputValue(value: string | null, fallback: string) {
  if (!value) {
    return fallback
  }

  return value.trim() || fallback
}

function parsePlatformValue(
  modeValue: string | null,
  customValue: string | null,
  defaultMode: PlatformMode
) {
  const mode = modeValue?.trim().toLowerCase()
  const custom = customValue?.trim() || ""

  if (!mode) {
    return {
      mode: defaultMode,
      custom: "",
    }
  }

  if (PLATFORM_OPTIONS.some((option) => option.value === mode)) {
    return {
      mode: mode as PlatformMode,
      custom,
    }
  }

  return {
    mode: "otra" as PlatformMode,
    custom: custom || modeValue?.trim() || "",
  }
}

function getPlatformLabel(mode: PlatformMode, custom: string) {
  return mode === "otra" ? custom || "Otra" : mode
}

function formatMoney(value: number) {
  if (!Number.isFinite(value)) {
    return moneyFormatter.format(0)
  }

  return moneyFormatter.format(value)
}

function formatOdds(value: number) {
  if (!Number.isFinite(value)) {
    return decimalFormatter.format(0)
  }

  return decimalFormatter.format(value)
}

function getProfitClassName(value: number) {
  if (value > 0) {
    return "text-emerald-700"
  }

  if (value < 0) {
    return "text-red-700"
  }

  return "text-slate-800"
}

function buildStrategy(
  id: string,
  title: string,
  description: string,
  stake1: number,
  odds1: number,
  odds2: number,
  stake2: number,
  accentClassName: string
): Strategy {
  const safeStake2 = Number.isFinite(stake2) && stake2 > 0 ? stake2 : 0
  const profitIfBet1Wins = stake1 * (odds1 - 1) - safeStake2
  const profitIfBet2Wins = safeStake2 * (odds2 - 1) - stake1

  return {
    id,
    title,
    description,
    stake2: safeStake2,
    profitIfBet1Wins,
    profitIfBet2Wins,
    totalInvestment: stake1 + safeStake2,
    accentClassName,
  }
}

export default function SureBetCalculator() {
  const [cuota1, setCuota1] = useState(DEFAULT_VALUES.cuota1)
  const [monto1, setMonto1] = useState(DEFAULT_VALUES.monto1)
  const [cuota2, setCuota2] = useState(DEFAULT_VALUES.cuota2)
  const [plataforma1Mode, setPlataforma1Mode] = useState<PlatformMode>(
    DEFAULT_VALUES.plataforma1 as PlatformMode
  )
  const [plataforma1Custom, setPlataforma1Custom] = useState("")
  const [plataforma2Mode, setPlataforma2Mode] = useState<PlatformMode>(
    DEFAULT_VALUES.plataforma2 as PlatformMode
  )
  const [plataforma2Custom, setPlataforma2Custom] = useState("")
  const [hasHydratedUrl, setHasHydratedUrl] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    setCuota1(toInputValue(params.get("cuota1"), DEFAULT_VALUES.cuota1))
    setMonto1(toInputValue(params.get("monto1"), DEFAULT_VALUES.monto1))
    setCuota2(toInputValue(params.get("cuota2"), DEFAULT_VALUES.cuota2))

    const platform1 = parsePlatformValue(
      params.get("plataforma1"),
      params.get("plataforma1Custom"),
      DEFAULT_VALUES.plataforma1 as PlatformMode
    )
    const platform2 = parsePlatformValue(
      params.get("plataforma2"),
      params.get("plataforma2Custom"),
      DEFAULT_VALUES.plataforma2 as PlatformMode
    )

    setPlataforma1Mode(platform1.mode)
    setPlataforma1Custom(platform1.custom)
    setPlataforma2Mode(platform2.mode)
    setPlataforma2Custom(platform2.custom)
    setHasHydratedUrl(true)
  }, [])

  const calculated = useMemo(() => {
    const odds1 = parsePositiveNumber(cuota1)
    const stake1 = parsePositiveNumber(monto1)
    const odds2 = parsePositiveNumber(cuota2)
    const isValid = odds1 > 1 && odds2 > 1 && stake1 > 0
    const isSureBet = isValid && 1 / odds1 + 1 / odds2 < 1

    if (!isValid) {
      return {
        odds1,
        stake1,
        odds2,
        isValid,
        isSureBet,
        balancedMinimumProfit: 0,
        strategies: [] as Strategy[],
      }
    }

    const strategies = [
      buildStrategy(
        "favor-bet-1",
        "Favorece cuota 1",
        "Cubre cuota 2 y deja más ganancia si sale cuota 1.",
        stake1,
        odds1,
        odds2,
        stake1 / (odds2 - 1),
        "border-l-sky-500"
      ),
      buildStrategy(
        "favor-bet-2",
        "Favorece cuota 2",
        "Cubre cuota 1 y deja más ganancia si sale cuota 2.",
        stake1,
        odds1,
        odds2,
        stake1 * (odds1 - 1),
        "border-l-emerald-500"
      ),
      buildStrategy(
        "balanced",
        "Ganancia mínima asegurada",
        "Iguala el retorno para que ambos resultados paguen parejo.",
        stake1,
        odds1,
        odds2,
        (stake1 * odds1) / odds2,
        "border-l-amber-500"
      ),
    ]

    return {
      odds1,
      stake1,
      odds2,
      isValid,
      isSureBet,
      balancedMinimumProfit: strategies[2].profitIfBet1Wins,
      strategies,
    }
  }, [cuota1, monto1, cuota2])

  const platform1Label = getPlatformLabel(plataforma1Mode, plataforma1Custom)
  const platform2Label = getPlatformLabel(plataforma2Mode, plataforma2Custom)

  const shareUrl = useMemo(() => {
    const params = new URLSearchParams({
      cuota1: cuota1.trim() || DEFAULT_VALUES.cuota1,
      monto1: monto1.trim() || DEFAULT_VALUES.monto1,
      cuota2: cuota2.trim() || DEFAULT_VALUES.cuota2,
      plataforma1: plataforma1Mode,
      plataforma2: plataforma2Mode,
    })

    if (plataforma1Mode === "otra" && plataforma1Custom.trim()) {
      params.set("plataforma1Custom", plataforma1Custom.trim())
    }

    if (plataforma2Mode === "otra" && plataforma2Custom.trim()) {
      params.set("plataforma2Custom", plataforma2Custom.trim())
    }

    if (typeof window === "undefined") {
      return `/?${params.toString()}`
    }

    return `${window.location.origin}${window.location.pathname}?${params.toString()}`
  }, [cuota1, monto1, cuota2, plataforma1Mode, plataforma1Custom, plataforma2Mode, plataforma2Custom])

  useEffect(() => {
    if (!hasHydratedUrl) {
      return
    }

    const nextUrl = new URL(shareUrl)
    window.history.replaceState(null, "", `${nextUrl.pathname}${nextUrl.search}`)
  }, [hasHydratedUrl, shareUrl])

  async function copyShareUrl() {
    let didCopy = false

    try {
      await navigator.clipboard.writeText(shareUrl)
      didCopy = true
    } catch {
      const textarea = document.createElement("textarea")
      textarea.value = shareUrl
      textarea.setAttribute("readonly", "")
      textarea.style.position = "fixed"
      textarea.style.left = "-9999px"
      document.body.appendChild(textarea)
      textarea.select()
      didCopy = document.execCommand("copy")
      document.body.removeChild(textarea)
    }

    if (didCopy) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f7f2] px-3 py-4 text-slate-950 sm:px-5 sm:py-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-slate-500">
              ApuestitaX
            </p>
            <h1 className="text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
              Apuesta asegurada
            </h1>
          </div>
          <button
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-slate-50"
            type="button"
            onClick={copyShareUrl}
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            <span>{copied ? "Copiado" : "Copiar link"}</span>
          </button>
        </header>

        <Card className="rounded-lg border-slate-200 bg-white py-3 shadow-sm">
          <CardContent className="px-3 sm:px-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="monto1">Monto 1</Label>
                <Input
                  id="monto1"
                  inputMode="decimal"
                  min="0"
                  step="100"
                  type="number"
                  value={monto1}
                  onChange={(event) => setMonto1(event.target.value)}
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <BetBlock
                  cuota={cuota1}
                  customPlatform={plataforma1Custom}
                  platformMode={plataforma1Mode}
                  platformTitle="Plataforma 1"
                  quoteId="cuota1"
                  quoteLabel="Cuota 1"
                  onCustomPlatformChange={setPlataforma1Custom}
                  onPlatformModeChange={setPlataforma1Mode}
                  onQuoteChange={setCuota1}
                />
                <BetBlock
                  cuota={cuota2}
                  customPlatform={plataforma2Custom}
                  platformMode={plataforma2Mode}
                  platformTitle="Plataforma 2"
                  quoteId="cuota2"
                  quoteLabel="Cuota 2"
                  onCustomPlatformChange={setPlataforma2Custom}
                  onPlatformModeChange={setPlataforma2Mode}
                  onQuoteChange={setCuota2}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-3 lg:grid-cols-[0.95fr_2.05fr]">
          <Card className="rounded-lg border-slate-200 bg-white py-3 shadow-sm">
            <CardHeader className="px-3 pb-2 sm:px-4">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base font-semibold">Resumen</CardTitle>
                <Badge variant={calculated.isSureBet ? "success" : "destructive"}>
                  {calculated.isSureBet ? "Sí" : "No"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 px-3 sm:px-4">
              <div className="grid grid-cols-2 gap-2">
                <Metric
                  label={platform1Label}
                  labelClassName="font-semibold text-slate-700"
                  value={formatOdds(calculated.odds1)}
                />
                <Metric
                  label={platform2Label}
                  labelClassName="font-semibold text-slate-700"
                  value={formatOdds(calculated.odds2)}
                />
                <Metric label="Monto 1" value={formatMoney(calculated.stake1)} />
                <Metric
                  label="Mínima"
                  value={formatMoney(calculated.balancedMinimumProfit)}
                  valueClassName={getProfitClassName(calculated.balancedMinimumProfit)}
                />
              </div>
              <p className="text-sm leading-snug text-slate-600">
                {calculated.isValid
                  ? calculated.isSureBet
                    ? "Estas cuotas forman una sure bet."
                    : "Estas cuotas no forman una sure bet, pero podés comparar los escenarios."
                  : "Ingresá cuotas mayores a 1 y un monto positivo."}
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-3 md:grid-cols-3">
            {(calculated.isValid ? calculated.strategies : getEmptyStrategies()).map(
              (strategy) => (
                <StrategyCard
                  key={strategy.id}
                  odds1={calculated.odds1}
                  odds2={calculated.odds2}
                  platform1Label={platform1Label}
                  platform2Label={platform2Label}
                  stake1={calculated.stake1}
                  strategy={strategy}
                />
              )
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

function BetBlock({
  cuota,
  customPlatform,
  platformMode,
  platformTitle,
  quoteId,
  quoteLabel,
  onCustomPlatformChange,
  onPlatformModeChange,
  onQuoteChange,
}: {
  cuota: string
  customPlatform: string
  platformMode: PlatformMode
  platformTitle: string
  quoteId: string
  quoteLabel: string
  onCustomPlatformChange: (value: string) => void
  onPlatformModeChange: (value: PlatformMode) => void
  onQuoteChange: (value: string) => void
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="space-y-2">
        <div className="space-y-1.5">
          <Label htmlFor={quoteId}>{quoteLabel}</Label>
          <Input
            id={quoteId}
            inputMode="decimal"
            min="1.01"
            step="0.01"
            type="number"
            value={cuota}
            onChange={(event) => onQuoteChange(event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`${quoteId}-platform`}>{platformTitle}</Label>
          <select
            id={`${quoteId}-platform`}
            className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/30"
            value={platformMode}
            onChange={(event) => onPlatformModeChange(event.target.value as PlatformMode)}
          >
            {PLATFORM_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {platformMode === "otra" ? (
          <div className="space-y-1.5">
            <Label htmlFor={`${quoteId}-custom`}>Nombre personalizado</Label>
            <Input
              id={`${quoteId}-custom`}
              placeholder="Escribí la plataforma"
              value={customPlatform}
              onChange={(event) => onCustomPlatformChange(event.target.value)}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  valueClassName = "text-slate-950",
  labelClassName = "font-medium",
}: {
  label: string
  value: string
  valueClassName?: string
  labelClassName?: string
}) {
  return (
    <div className="min-w-0 rounded-md bg-slate-100 px-2 py-1.5">
      <p
        className={`text-[0.64rem] uppercase tracking-wide text-slate-500 ${labelClassName}`}
      >
        {label}
      </p>
      <p className={`text-sm font-semibold leading-tight ${valueClassName}`}>{value}</p>
    </div>
  )
}

function StrategyCard({
  odds1,
  odds2,
  platform1Label,
  platform2Label,
  stake1,
  strategy,
}: {
  odds1: number
  odds2: number
  platform1Label: string
  platform2Label: string
  stake1: number
  strategy: Strategy
}) {
  return (
    <Card className={`rounded-lg border-l-4 bg-white py-3 shadow-sm ${strategy.accentClassName}`}>
      <CardHeader className="px-3 pb-2 sm:px-4">
        <CardTitle className="text-base font-semibold leading-tight">{strategy.title}</CardTitle>
        <p className="text-xs leading-snug text-slate-500">{strategy.description}</p>
      </CardHeader>
      <CardContent className="space-y-2 px-3 sm:px-4">
        <div className="flex flex-wrap gap-1.5 text-[0.7rem] font-medium text-slate-500">
          <span className="rounded-full bg-slate-100 px-2 py-1">
            <strong className="font-semibold text-slate-700">{platform1Label}</strong>{" "}
            {formatOdds(odds1)}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-1">
            <strong className="font-semibold text-slate-700">{platform2Label}</strong>{" "}
            {formatOdds(odds2)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StrategyMetric label="Apuesta C2" value={formatMoney(strategy.stake2)} isStrong />
          <StrategyMetric
            label="Gana C1"
            value={formatMoney(strategy.profitIfBet1Wins)}
            valueClassName={getProfitClassName(strategy.profitIfBet1Wins)}
          />
          <StrategyMetric
            label="Gana C2"
            value={formatMoney(strategy.profitIfBet2Wins)}
            valueClassName={getProfitClassName(strategy.profitIfBet2Wins)}
          />
          <StrategyMetric label="Inversión" value={formatMoney(strategy.totalInvestment)} />
        </div>
      </CardContent>
    </Card>
  )
}

function StrategyMetric({
  label,
  value,
  valueClassName = "text-slate-950",
  isStrong = false,
}: {
  label: string
  value: string
  valueClassName?: string
  isStrong?: boolean
}) {
  return (
    <div className="min-w-0 rounded-md bg-slate-100 px-2 py-1.5">
      <p className="text-[0.64rem] font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p
        className={`break-words ${
          isStrong ? "text-sm sm:text-base" : "text-[0.82rem] sm:text-sm"
        } font-semibold leading-tight ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  )
}

function getEmptyStrategies(): Strategy[] {
  return [
    {
      id: "favor-bet-1-empty",
      title: "Favorece cuota 1",
      description: "Esperando datos válidos.",
      stake2: 0,
      profitIfBet1Wins: 0,
      profitIfBet2Wins: 0,
      totalInvestment: 0,
      accentClassName: "border-l-sky-500",
    },
    {
      id: "favor-bet-2-empty",
      title: "Favorece cuota 2",
      description: "Esperando datos válidos.",
      stake2: 0,
      profitIfBet1Wins: 0,
      profitIfBet2Wins: 0,
      totalInvestment: 0,
      accentClassName: "border-l-emerald-500",
    },
    {
      id: "balanced-empty",
      title: "Ganancia mínima asegurada",
      description: "Esperando datos válidos.",
      stake2: 0,
      profitIfBet1Wins: 0,
      profitIfBet2Wins: 0,
      totalInvestment: 0,
      accentClassName: "border-l-amber-500",
    },
  ]
}
