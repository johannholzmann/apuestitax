"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"



export default function SureBetCalculator() {
  const [cuota1, setCuota1] = useState<number>(2.75)
  const [monto1, setMonto1] = useState<number>(18000)
  const [cuota2, setCuota2] = useState<number>(1.86)

  const [results, setResults] = useState({
    isSureBet: false,
    sureBet: 0,
    sureBetShouldBet2: 0,
    totalInvestmentSureBet: 0,
    profitWinBet1: 0,
    winBet1ShouldBet2: 0,
    totalInvestmentWinBet1: 0,
    profitWinBet2: 0,
    winBet2ShouldBet2: 0,
    totalInvestmentWinBet2: 0,
  })

  useEffect(() => {
    const c1 = cuota1 || 0
    const m1 = monto1 || 0
    const c2 = cuota2 || 0

    if (c1 > 0 && c2 > 0 && m1 > 0) {
      const invQuote1 = 1 / c1
      const invQuote2 = 1 / c2
      const isSureBet = (invQuote1 + invQuote2) < 1

      const winBet1ShouldBet = m1 / (c2 - 1);
      const winBet2ShouldBet2 = m1 * (c1 - 1);

      const profitWinBet1 = m1 * (c1 - 1) - winBet1ShouldBet;

      const profitWinBet2 = winBet2ShouldBet2 * (c2 - 1) - m1;

      const sureBetShouldBet2 = m1 * (c1 / c2);

      const sureBet = m1 * (c1 - 1) - sureBetShouldBet2;

      setResults({
        isSureBet,
        sureBetShouldBet2: sureBetShouldBet2,
        sureBet,
        profitWinBet1: profitWinBet1,
        winBet1ShouldBet2: winBet1ShouldBet,
        profitWinBet2: profitWinBet2,
        winBet2ShouldBet2: winBet2ShouldBet2,
        totalInvestmentSureBet: m1 + sureBetShouldBet2,
        totalInvestmentWinBet1: m1 + winBet1ShouldBet,
        totalInvestmentWinBet2: m1 + winBet2ShouldBet2,
      })
    } else {
      setResults({
        isSureBet: false,
        sureBetShouldBet2: 0,
        sureBet: 0,
        profitWinBet1: 0,
        winBet1ShouldBet2: 0,
        profitWinBet2: 0,
        winBet2ShouldBet2: 0,
        totalInvestmentSureBet: 0,
        totalInvestmentWinBet1: 0,
        totalInvestmentWinBet2: 0,
      })
    }
  }, [cuota1, monto1, cuota2])

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Apuestita</h1>
          <p className="text-muted-foreground">Calcula si tus apuestitas generan ganancia asegurada</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Datos de las Apuestas</CardTitle>
            <CardDescription>Ingresa las cuotas y montos de tus dos apuestas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Apuesta 1 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Apuesta 1</h3>
                <div className="space-y-2">
                  <Label htmlFor="cuota1">Cuota 1</Label>
                  <Input
                    id="cuota1"
                    type="number"
                    step="0.01"
                    placeholder="Ej: 2.50"
                    value={cuota1}
                    onChange={(e) => setCuota1(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monto1">Monto 1</Label>
                  <Input
                    id="monto1"
                    type="number"
                    step="0.01"
                    placeholder="Ej: 100"
                    value={monto1}
                    onChange={(e) => setMonto1(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Apuesta 2 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Apuesta 2</h3>
                <div className="space-y-2">
                  <Label htmlFor="cuota2">Cuota 2</Label>
                  <Input
                    id="cuota2"
                    type="number"
                    step="0.01"
                    placeholder="Ej: 1.80"
                    value={cuota2}
                    onChange={(e) => setCuota2(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monto2">Monto 2</Label>
                  <Input
                    disabled
                    id="monto2"
                    type="number"
                    step="0.01"
                    placeholder="Ej: 150"
                    value={results.isSureBet ? results.sureBetShouldBet2.toFixed(2) : "0.00"}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
            <CardDescription>Análisis de tu combinación de apuestas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">Apuesta asegurada:</span>
              <Badge variant={results.isSureBet ? "success" : "destructive"}>
                {results.isSureBet ? "SÍ" : "NO"}
              </Badge>
            </div>
            {
              !results.isSureBet ? (
                <p className="text-sm text-muted-foreground">
                  Tus apuestas no garantizan una ganancia segura. Considera ajustar los montos o cuotas.
                </p>
              ) : (
                <div>
                  <div className="text-sm text-muted-foreground">Apostarás en cuota 1:</div>
                  <div className="font-bold text-blue-600">
                    ${monto1.toFixed(2)}
                  </div>
                </div>
              )
            }
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-blue-200 dark:border-blue-800">
                <CardHeader className="">
                  <CardTitle className="text-lg text-blue-700 dark:text-blue-300">Si sale Cuota 1</CardTitle>
                  <CardDescription>Maximiza ganancia si sale apuesta 1</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Debes apostar en Cuota 2:</div>
                    <div className="text-xl font-bold text-orange-600">
                      ${results.winBet1ShouldBet2 > 0 ? results.winBet1ShouldBet2.toFixed(2) : "0.00"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Ganancia obtenida:</div>
                    <div
                      className={`text-xl font-bold ${results.profitWinBet1 > 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      ${results.profitWinBet1.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Inversión total:</div>
                    <div className="text-sm font-bold text-foreground">
                      ${results.totalInvestmentWinBet1.toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 dark:border-green-800">
                <CardHeader className="">
                  <CardTitle className="text-lg text-green-700 dark:text-green-300">Si sale Cuota 2</CardTitle>
                  <CardDescription>Maximiza ganancia si sale apuesta 2</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Debes apostar en Cuota 2:</div>
                    <div className="text-xl font-bold text-blue-600">
                      ${results.winBet2ShouldBet2 > 0 ? results.winBet2ShouldBet2.toFixed(2) : "0.00"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Ganancia obtenida:</div>
                    <div
                      className={`text-xl font-bold ${results.profitWinBet2 > 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      ${results.profitWinBet2.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Inversión total:</div>
                    <div className="text-sm font-bold text-foreground">
                      ${results.totalInvestmentWinBet2.toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 dark:border-purple-800">
                <CardHeader className="">
                  <CardTitle className="text-lg text-purple-700 dark:text-purple-300">Sure Bet</CardTitle>
                  <CardDescription>Maximiza ganancia si sale apuesta segura</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">Debes apostar en Cuota 2:</div>
                  <div className="text-xl font-bold text-blue-600">
                    ${results.sureBetShouldBet2 > 0 ? results.sureBetShouldBet2.toFixed(2) : "0.00"}
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Ganancia obtenida:</div>
                    <div
                      className={`text-xl font-bold ${results.sureBet > 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      ${results.sureBet.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Inversión total:</div>
                    <div className="text-sm font-bold text-foreground">
                      ${results.totalInvestmentSureBet.toFixed(2)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

