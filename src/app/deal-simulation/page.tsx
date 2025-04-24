import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { InfoIcon, BarChart4, TrendingUp, Calculator, GitCompareArrows, Sliders, ZapIcon, Clock } from 'lucide-react'

export default function DealSimulationPage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Deal Simulation Playground</h1>
          <Badge className="bg-amber-500 hover:bg-amber-600">Coming Soon</Badge>
        </div>
        <p className="text-muted-foreground">
          Test different deal scenarios and strategies in a risk-free environment before committing to real investments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCompareArrows className="h-5 w-5" />
              What-If Analysis
            </CardTitle>
            <CardDescription>
              Test multiple variables simultaneously
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Adjust renovation budgets, financing terms, exit strategies, and market conditions to see how each variable impacts your bottom line.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Market Scenario Testing
            </CardTitle>
            <CardDescription>
              Prepare for market shifts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Simulate different market conditions including appreciation rates, vacancy rates, interest rate changes, and economic downturns.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5" />
              Strategy Optimizer
            </CardTitle>
            <CardDescription>
              Find your ideal approach
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Compare buy-and-hold, fix-and-flip, BRRRR, or creative financing strategies on the same property to identify the optimal investment approach.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ZapIcon className="h-5 w-5" />
              AI-Powered Recommendations
            </CardTitle>
            <CardDescription>
              Let Genie guide your strategy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Get AI-generated suggestions to optimize your deals based on your investment goals, risk tolerance, and market conditions.</p>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Save Your Simulations</AlertTitle>
        <AlertDescription>
          All simulations can be saved to your account and compared against actual performance once the deal is complete.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Preview: Deal Simulation Interface</CardTitle>
          <CardDescription>Here's a sneak peek at what you'll be able to do</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="inputs">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="inputs">Deal Inputs</TabsTrigger>
              <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
              <TabsTrigger value="results">Comparison</TabsTrigger>
            </TabsList>
            <TabsContent value="inputs" className="space-y-4 py-4">
              <div className="border rounded-md p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground mb-2">Fully customizable inputs for:</p>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Purchase price and closing costs</li>
                  <li>Financing terms and loan structures</li>
                  <li>Renovation scope and budget</li>
                  <li>Holding costs and timeline</li>
                  <li>Exit strategy parameters</li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="scenarios" className="space-y-4 py-4">
              <div className="border rounded-md p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground mb-2">Create multiple scenarios:</p>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Base case (most likely outcome)</li>
                  <li>Conservative case (worst-case scenario)</li>
                  <li>Optimistic case (best-case scenario)</li>
                  <li>Custom scenarios with specific variables</li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="results" className="space-y-4 py-4">
              <div className="border rounded-md p-4 bg-muted/30">
                <p className="text-sm text-muted-foreground mb-2">Compare results across all scenarios:</p>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  <li>Side-by-side financial metrics</li>
                  <li>Visual charts and graphs</li>
                  <li>Risk assessment visualization</li>
                  <li>Sensitivity analysis</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button disabled className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Launching Q2 2023
          </Button>
        </CardFooter>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Benefits of Deal Simulation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Mitigation</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Test assumptions and identify potential pitfalls before committing real capital to a deal.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Strategic Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Develop contingency plans and optimize your approach based on different market conditions.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Investor Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Present multiple scenarios to partners or lenders with detailed projections and risk assessments.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Learning Tool</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Perfect for new investors to understand how different variables impact investment outcomes.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 