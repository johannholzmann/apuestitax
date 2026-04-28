"use client"

import Image from "next/image"
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

function getPlatformTheme(mode: PlatformMode) {
  switch (mode) {
    case "bet365":
      return {
        pillClassName: "bg-[#20493b] text-white shadow-sm shadow-[#20493b]/15",
        labelClassName: "text-white",
        oddsClassName: "text-white/80",
      }
    case "betano":
      return {
        pillClassName: "bg-[#fe3c00] text-white shadow-sm shadow-[#fe3c00]/15",
        labelClassName: "text-white",
        oddsClassName: "text-white/80",
      }
    case "bet warrior":
      return {
        pillClassName: "bg-[#ff3900] text-white shadow-sm shadow-[#ff3900]/15",
        labelClassName: "text-white",
        oddsClassName: "text-white/80",
      }
    default:
      return {
        pillClassName: "bg-slate-100 text-slate-900",
        labelClassName: "text-slate-700",
        oddsClassName: "text-slate-500",
      }
  }
}

function PlatformMark({
  mode,
  className = "h-4 w-auto",
}: {
  mode: PlatformMode
  className?: string
}) {
  switch (mode) {
    case "bet365":
      return (
        <svg
          aria-hidden="true"
          className={className}
          fill="none"
          viewBox="0 0 95 21"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g fill="none">
            <path
              fill="#FFE418"
              d="M52.304 16.387c1.753 0 2.669-.592 2.669-1.83 0-1.212-.944-1.883-2.775-1.883-.679 0-1.49.054-2.379.189l0-4.088c.73.083 1.413.108 2.092.108 1.884 0 2.824-.565 2.824-1.853 0-1.263-.86-1.853-2.638-1.853-1.153 0-2.615.324-4.418.89l0-4.264c1.6-.567 3.532-.834 5.806-.834 4.945 0 7.795 2.178 7.795 5.597 0 2.098-1.332 3.63-3.662 4.143 2.59.54 3.922 2.02 3.922 4.28 0 3.547-2.899 5.616-8.445 5.616-1.86 0-3.686-.266-5.57-.723l0-4.387c1.86.565 3.427.889 4.79.889l-.011.003Zm20.635-8.421c3.897 0 6.486 2.447 6.486 6.052 0 3.876-2.956 6.566-7.61 6.566-5.493 0-9.025-3.525-9.025-9.308 0-6.59 3.743-10.303 10.49-10.303 1.446 0 2.989.166 4.58.515l0 4.28c-1.461-.458-2.874-.674-4.368-.674-2.98 0-4.369 1.238-4.442 4.038 1.105-.856 2.306-1.155 3.898-1.155l-.01-.011Zm.549 5.92c0-1.562-.863-2.559-2.118-2.559-1.255 0-2.093.969-2.093 2.56 0 1.558.838 2.527 2.093 2.527 1.281 0 2.118-.969 2.118-2.528Zm7.873-12.432 12.737 0 0 4.467-6.78 0 0 2.825c.544-.028.918-.054 1.04-.054 4.205 0 6.487 2.185 6.487 5.866 0 3.797-2.777 6.057-8.185 6.057-1.883 0-3.743-.291-5.627-.773l0-4.254c1.438.407 2.696.598 3.768.598 2.192 0 3.345-.756 3.345-2.152 0-1.555-1.202-2.336-3.662-2.336-1.047 0-2.068.188-3.14.457l0-10.701.017 0Z"
            />
            <path
              fill="#FFF"
              d="m0 0 6.455 0 0 7.929c.918-1.29 2.176-1.893 3.881-1.893 3.753 0 5.879 2.688 5.879 7.463 0 4.556-2.152 7.273-5.72 7.273-2.178 0-3.648-.823-4.486-2.58l0 2.387-6.009 0 0-20.579Zm6.27 13.36c0 2.088.447 3.103 1.601 3.103 1.129 0 1.627-1.014 1.627-3.102 0-2.077-.473-3.099-1.627-3.099-1.154 0-1.601 1.022-1.601 3.1l0-.002Zm26.446 1.321-8.945 0c.157 1.54 1.312 2.269 3.49 2.269 1.52 0 3.095-.297 4.615-.891l0 3.59c-1.494.62-3.54.972-5.927.972-5.51 0-8.475-2.7-8.475-7.45 0-4.642 2.915-7.421 7.77-7.421 5.384 0 7.479 2.563 7.479 8.016l0 .916-.007 0Zm-5.614-2.725 0-.432c0-1.593-.577-2.51-1.68-2.51-1.128 0-1.704.917-1.704 2.538l0 .403 3.384 0 0 .001Zm18.368-5.83 0 4.13-3.01 0 0 3.374c0 1.728.266 2.538 1.557 2.538.35 0 .82-.058 1.373-.191l0 4.046c-1.397.432-2.793.59-4.271.59-1.819 0-3.216-.598-4.036-1.62-1.055-1.354-1.08-3.05-1.08-5.318l0-3.423-2.306 0 0-4.128 2.297 0 0-3.128 6.466-2.079 0 5.21 3.01 0Z"
            />
          </g>
        </svg>
      )
    case "betano":
      return (
        <svg
          aria-hidden="true"
          className={className}
          fill="none"
          viewBox="0 0 480 144"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#betano-a)">
            <path
              d="M160.306 42.612c-26.796 0-46.166 22.168-46.166 46.284 0 20.82 14.555 33.104 33.821 33.104 19.267 0 31.237-11.92 35-26.6-5.178 3.7-14.069 7.876-24.106 7.876-8.582 0-18.873-3.652-19.878-14.944 21.554-2.792 39.12-9.66 48.675-16.86.148-1.2.305-2.944.305-5.192 0-12.132-7.633-23.668-27.647-23.668h-.004Zm3.163 30.556h-23.487c2.111-10.784 9.784-18.724 17.313-18.724 5.117 0 7.525 2.696 7.525 9.288 0 2.996-.45 6.14-1.351 9.436Zm273.458-30.556c-27.55 0-47.113 21.268-47.113 48.532 0 19.92 15.656 30.856 35.074 30.856C452.435 122 472 100.732 472 73.468c0-19.924-15.653-30.856-35.073-30.856Zm-11.138 67.252c-6.321 0-9.783-5.092-9.783-14.68 0-19.024 7.672-40.444 20.02-40.444 6.325 0 9.787 5.092 9.787 14.68 0 19.024-7.833 40.444-20.024 40.444Zm-37.041-47.932c0 2.396-.237 5.072-.808 7.94l-9.876 50.628h-24.552l8.715-44.64c.45-2.244.63-4.192.63-5.992 0-7.04-3.758-10.184-10.535-10.184-2.709 0-6.07.868-8.22 1.796l-11.513 59.016h-24.54l14.913-76.392h24.54l-2.709 13.78c3.984-6.34 12.855-15.28 24.404-15.28 10.684 0 19.559 6.44 19.559 19.324l-.008.004Zm-78.524 4.976c0-13.78-12.067-24.296-28.958-24.296-21.019 0-31.992 13.76-35.228 26.6 6.588-4.78 15.978-7.876 24.106-7.876 7.577 0 15.09 2.456 15.09 10.036 0 .748 0 1.648-.149 2.844-19.363.776-47.267 11.084-47.267 32.356 0 8.836 6.423 15.428 16.359 15.428 9.937 0 19.162-6.74 24.585-15.28l-2.685 13.78h24.536l8.956-45.956c.45-2.696.659-5.244.659-7.64l-.004.004Zm-30.755 36.22c-3.01 1.348-6.877 2.244-9.739 2.244-6.175 0-9.205-3.38-9.205-7.876 0-9.488 11.295-15.504 22.208-11.072l-3.264 16.7v.004Zm-55.174.148c3.268 0 6.448-.924 10.58-4.024-3.787 12.852-14.387 22.748-25.75 22.748-13.948 0-18.354-11.672-15.448-26.6l7.388-37.808h-10.029l2.633-13.48h10.057l2.766-14.396 25.272-3.536-3.534 17.932h21.04c-1.576 7.84-6.48 13.48-16.53 13.48h-7.142l-7.228 37.012c-1.117 5.672 1.954 8.676 5.921 8.676l.004-.004ZM110.237 82.54c0 20.52-27.756 37.964-74.1 37.964H8L27.226 22h61.775c17.413 0 26.739 3.576 26.739 14.384 0 12.944-20.778 27.204-53.47 33.088L80.1 39.94l-27.248-.068L40.99 76.236l18.787-2.628-23.884 39.568L92.2 66.608c10.974 0 18.033 6.34 18.033 15.932h.004Z"
              fill="#FAF5F0"
            />
          </g>
          <defs>
            <clipPath id="betano-a">
              <path fill="#fff" d="M8 22h464v100H8z" />
            </clipPath>
          </defs>
        </svg>
      )
    case "bet warrior":
      return (
        <svg
          aria-hidden="true"
          className={className}
          viewBox="0 0 147 23"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M51.21 9.884c.695.489 1.518 1.4 1.545 2.936 0 1.142-.309 2.12-.927 2.773-.618.735-1.778 1.224-2.937 1.224h-4.406c-.696 0-1.237-.49-1.237-1.224V6.294c0-.652.54-1.223 1.237-1.223h4.019c.928 0 1.855.408 2.396 1.06.619.653.868 1.5.773 2.366-.077.49-.232.979-.463 1.387zm-3.788 2.283l.077-2.202c1.7-.653 2.145-1.073 2.164-1.549a1.2 1.2 0 0 0-.231-.816c-.173-.23-.541-.408-1.005-.408H45.18v7.667h3.556c.618 0 1.16-.163 1.546-.57.309-.327.403-.728.386-1.306-.077-1.06-.773-1.468-1.236-1.631-.541.326-1.16.57-1.933.815h-.077zm83.447 2.747c2.082 0 3.77-1.75 3.77-3.91s-1.688-3.91-3.77-3.91-3.77 1.75-3.77 3.91 1.688 3.91 3.77 3.91zm0 2.156c-3.23 0-5.85-2.716-5.85-6.066 0-3.35 2.62-6.066 5.85-6.066 3.23 0 5.85 2.716 5.85 6.066 0 3.35-2.62 6.066-5.85 6.066zm-21.995-8.237c0 .978-.283 1.917-.773 2.447-.49.53-.928.816-1.546.978l3.092 4.569h-2.55l-3.015-4.486.85-1.795h.154c.619 0 1.005-.164 1.314-.408.31-.244.464-.735.464-1.223 0-.572-.154-.98-.464-1.224-.309-.245-.773-.408-1.468-.408h-2.01v9.625h-2.087c-.001-6.793-.001-10.382 0-10.767.002-.58.464-.978 1.005-.978h3.092c1.16 0 2.164.325 2.86.978.695.57 1.082 1.55 1.082 2.692zm12.368 8.058V5.146h2.164V16.89h-2.164zM63.268 5.146h8.503l.541 2.12h-3.633v9.625h-2.087V7.267h-3.324V5.146zm-9.16 10.692V6.131c0-.57.444-.983 1.005-.979h6.725v2.121h-5.72v2.692h4.019v2.12h-4.02v2.693h5.72v2.12h-6.724c-.542 0-1.005-.488-1.005-1.06zM92.525 5.723c.178-.41.54-.652.928-.652.386 0 .726.255.927.734L99.56 16.9h-2.32l-1.237-2.692c-.54-.163-1.254-.154-1.855-.025-.6.13-1.469.433-2.164.84-1.237.653-2.474 1.795-2.474 1.795h-2.087l5.102-11.094zm2.396 6.2L93.453 8.66l-1.933 4.08a10.634 10.634 0 0 1 2.161-.708 6.652 6.652 0 0 1 1.24-.108zm-8.657-6.852h2.241l-3.014 11.012c-.148.535-.619.816-1.16.816-.464 0-.968-.327-1.16-.816-.19-.49-2.164-5.547-2.164-5.547l-2.164 5.547c-.191.49-.696.816-1.16.816-.54 0-1.012-.281-1.16-.816L73.51 5.07h2.242l2.164 8.075 1.933-5.465h2.319l1.932 5.465 2.165-8.075zm32.852 3.762c0 .978-.283 1.917-.773 2.447-.49.53-.927.816-1.546.978l3.092 4.569h-2.55l-3.015-4.486.85-1.795h.155c.618 0 1.005-.164 1.314-.408.309-.244.463-.735.463-1.223 0-.572-.154-.98-.463-1.224-.31-.245-.773-.408-1.469-.408h-2.01v9.625h-2.087c-.001-6.793-.001-10.382 0-10.767.002-.58.464-.978 1.005-.978h3.092c1.16 0 2.164.325 2.86.978.696.57 1.082 1.55 1.082 2.692zm27.11 0c0 .978-.282 1.917-.772 2.447-.49.53-.928.816-1.546.978L147 16.827h-2.55l-3.016-4.486.85-1.795h.155c.619 0 1.005-.164 1.314-.408.31-.244.464-.735.464-1.223 0-.572-.154-.98-.464-1.224-.309-.245-.773-.408-1.468-.408h-2.01v9.625h-2.087c-.001-6.793-.001-10.382 0-10.767.002-.58.464-.978 1.005-.978h3.092c1.16 0 2.164.325 2.86.978.695.57 1.082 1.55 1.082 2.692zM13.362 15.156l2.893-1.632V.014h6.196l-.013 15.056 2.896-1.546L25.32.001s1.015.014 2.213.014c1.43 0 3.066 1.332 3.066 3.476 0 2.49.008 11.406.008 11.407 0 .535-.315.846-.674 1.094l-12.102 6.895c-.798.383-1.577-.257-1.572-1.154.004-.577-.003-3.03-.003-3.03l-7.482 4.163c-.723.355-1.59-.169-1.59-1.1L7.18 2.08A2.08 2.08 0 0 1 9.259 0h4.114l-.012 15.156zm-8.848 4.79L0 14.033V6.507c0-1.314.93-2.492 2.285-2.492h2.228v15.931z"
            fill="#FAF5F0"
          />
        </svg>
      )
    default:
      return (
        <span
          className={`inline-flex size-4 items-center justify-center rounded-[4px] bg-slate-200 text-[0.55rem] font-semibold uppercase leading-none text-slate-600 ${className}`}
        >
          OT
        </span>
      )
  }
}

function PlatformBadge({
  mode,
  custom,
  odds,
  compact = false,
}: {
  mode: PlatformMode
  custom: string
  odds: number
  compact?: boolean
}) {
  const theme = getPlatformTheme(mode)
  const label = getPlatformLabel(mode, custom)

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2 py-1 text-[0.72rem] font-medium leading-none ${theme.pillClassName} ${
        compact ? "whitespace-nowrap" : ""
      }`}
    >
      <PlatformMark className="h-3.5 w-auto shrink-0" mode={mode} />
      <span className={`max-w-full truncate font-semibold ${theme.labelClassName}`}>{label}</span>
      <span className={`shrink-0 ${theme.oddsClassName}`}>{formatOdds(odds)}</span>
    </span>
  )
}

function PlatformStat({
  mode,
  custom,
  odds,
}: {
  mode: PlatformMode
  custom: string
  odds: number
}) {
  const theme = getPlatformTheme(mode)
  const label = getPlatformLabel(mode, custom)

  return (
    <div className="min-w-0 rounded-md bg-slate-100 px-2 py-1.5">
      <div className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[0.64rem] font-medium ${theme.pillClassName}`}>
        <PlatformMark className="h-3 w-auto shrink-0" mode={mode} />
        <span className={`truncate font-semibold ${theme.labelClassName}`}>{label}</span>
      </div>
      <p className="mt-1 text-sm font-semibold leading-tight text-slate-950">{formatOdds(odds)}</p>
    </div>
  )
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
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <Image
                alt="ApuestitaX"
                className="h-full w-full object-cover"
                height={44}
                quality={100}
                priority
                src="/icon.png"
                width={44}
              />
            </div>
            <div>
              <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-slate-500">
                ApuestitaX
              </p>
              <h1 className="text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">
                Apuesta asegurada
              </h1>
            </div>
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
                <PlatformStat mode={plataforma1Mode} custom={plataforma1Custom} odds={calculated.odds1} />
                <PlatformStat mode={plataforma2Mode} custom={plataforma2Custom} odds={calculated.odds2} />
                <Metric label="Monto 1" value={formatMoney(calculated.stake1)} />
                <Metric
                  label="Estado"
                  value={calculated.isSureBet ? "Asegurada" : "Normal"}
                  valueClassName={calculated.isSureBet ? "text-emerald-700" : "text-slate-800"}
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
            {(calculated.isValid ? calculated.strategies : getEmptyStrategies()).map((strategy) => (
              <StrategyCard
                key={strategy.id}
                odds1={calculated.odds1}
                odds2={calculated.odds2}
                platform1Mode={plataforma1Mode}
                platform1Label={platform1Label}
                platform1Custom={plataforma1Custom}
                platform2Mode={plataforma2Mode}
                platform2Label={platform2Label}
                platform2Custom={plataforma2Custom}
                strategy={strategy}
              />
            ))}
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
      <p className={`text-[0.64rem] uppercase tracking-wide text-slate-500 ${labelClassName}`}>
        {label}
      </p>
      <p className={`text-sm font-semibold leading-tight ${valueClassName}`}>{value}</p>
    </div>
  )
}

function StrategyCard({
  odds1,
  odds2,
  platform1Mode,
  platform1Label,
  platform1Custom,
  platform2Mode,
  platform2Label,
  platform2Custom,
  strategy,
}: {
  odds1: number
  odds2: number
  platform1Mode: PlatformMode
  platform1Label: string
  platform1Custom: string
  platform2Mode: PlatformMode
  platform2Label: string
  platform2Custom: string
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
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
            <strong className="font-semibold text-slate-700">{platform1Label}</strong>
            <span className="text-slate-500">{formatOdds(odds1)}</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1">
            <strong className="font-semibold text-slate-700">{platform2Label}</strong>
            <span className="text-slate-500">{formatOdds(odds2)}</span>
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
