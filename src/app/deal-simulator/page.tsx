'use client';

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { InfoIcon, Calculator, TrendingUp, BarChart, LineChart, PieChart, SlidersHorizontal, Lightbulb } from 'lucide-react'

export default function DealSimulatorPage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Deal Simulator</h1>
          <Badge className="bg-amber-500 hover:bg-amber-600">Coming Soon</Badge>
        </div>
        <p className="text-muted-foreground">
          Test different deal scenarios, financing options, and renovation budgets to see how they impact your returns
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" />
              Parameter Playground
            </CardTitle>
            <CardDescription>
              Adjust any variable in your deal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Change purchase prices, repair costs, holding periods, financing terms, and more to see instant changes to your bottom line.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Multiple Exit Strategies
            </CardTitle>
            <CardDescription>
              Compare different exit scenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Compare fix-and-flip vs. BRRRR vs. long-term rental outcomes side-by-side with detailed profit breakdowns for each strategy.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Advanced Calculators
            </CardTitle>
            <CardDescription>
              Deep financial analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Access specialized calculators for cash-on-cash return, internal rate of return (IRR), capital expenditures planning, and tax implications.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              AI Recommendations
            </CardTitle>
            <CardDescription>
              Get strategic guidance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Receive AI-powered suggestions to optimize your deal structure, financing, and exit strategy based on your investment goals.</p>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Real-Time Simulation</AlertTitle>
        <AlertDescription>
          All calculations update instantly as you adjust parameters, helping you visualize the impact of each change on your investment outcomes.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Simulator Preview</CardTitle>
          <CardDescription>How the Deal Simulator will look in Deal Genie</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="parameters">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="parameters">Deal Parameters</TabsTrigger>
              <TabsTrigger value="scenarios">Exit Scenarios</TabsTrigger>
              <TabsTrigger value="analytics">Return Analysis</TabsTrigger>
            </TabsList>
            <TabsContent value="parameters" className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Purchase Price</p>
                      <p className="text-sm font-medium">$250,000</p>
                    </div>
                    <Slider disabled defaultValue={[65]} max={100} step={1} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Repair Budget</p>
                      <p className="text-sm font-medium">$35,000</p>
                    </div>
                    <Slider disabled defaultValue={[35]} max={100} step={1} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">After Repair Value (ARV)</p>
                      <p className="text-sm font-medium">$350,000</p>
                    </div>
                    <Slider disabled defaultValue={[75]} max={100} step={1} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Holding Period (months)</p>
                      <p className="text-sm font-medium">6</p>
                    </div>
                    <Slider disabled defaultValue={[50]} max={100} step={1} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Loan to Value (LTV)</p>
                      <p className="text-sm font-medium">75%</p>
                    </div>
                    <Slider disabled defaultValue={[75]} max={100} step={1} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Interest Rate</p>
                      <p className="text-sm font-medium">6.5%</p>
                    </div>
                    <Slider disabled defaultValue={[65]} max={100} step={1} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Closing Costs</p>
                      <p className="text-sm font-medium">$7,500</p>
                    </div>
                    <Slider disabled defaultValue={[60]} max={100} step={1} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">Monthly Rental Income</p>
                      <p className="text-sm font-medium">$2,200</p>
                    </div>
                    <Slider disabled defaultValue={[70]} max={100} step={1} />
                  </div>
                </div>
              </div>
              <div className="h-60 bg-muted/50 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Interactive parameter controls with real-time updates</p>
              </div>
            </TabsContent>
            
            <TabsContent value="scenarios" className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-primary">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Fix & Flip</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Purchase + Repairs</span>
                        <span className="text-sm font-medium">$285,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Sale Price</span>
                        <span className="text-sm font-medium">$350,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Holding Costs</span>
                        <span className="text-sm font-medium">$12,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Selling Costs</span>
                        <span className="text-sm font-medium">$21,000</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-medium">Net Profit</span>
                        <span className="font-medium text-green-600">$32,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">ROI</span>
                        <span className="text-sm font-medium">41.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Timeline</span>
                        <span className="text-sm font-medium">6 months</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button disabled variant="outline" size="sm" className="w-full">View Details</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">BRRRR Strategy</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Purchase + Repairs</span>
                        <span className="text-sm font-medium">$285,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Refinance Amount</span>
                        <span className="text-sm font-medium">$262,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Cash Left In</span>
                        <span className="text-sm font-medium">$22,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Monthly Cash Flow</span>
                        <span className="text-sm font-medium">$350</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-medium">Annual CoC ROI</span>
                        <span className="font-medium text-green-600">18.6%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Cap Rate</span>
                        <span className="text-sm font-medium">7.1%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">5-Year Equity</span>
                        <span className="text-sm font-medium">$93,200</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button disabled variant="outline" size="sm" className="w-full">View Details</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Long-Term Rental</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Purchase + Repairs</span>
                        <span className="text-sm font-medium">$285,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Down Payment</span>
                        <span className="text-sm font-medium">$57,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Monthly Income</span>
                        <span className="text-sm font-medium">$2,200</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Monthly Expenses</span>
                        <span className="text-sm font-medium">$1,600</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-medium">Monthly Cash Flow</span>
                        <span className="font-medium text-green-600">$600</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Cash-on-Cash ROI</span>
                        <span className="text-sm font-medium">12.6%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Annual Appreciation</span>
                        <span className="text-sm font-medium">3.5%</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button disabled variant="outline" size="sm" className="w-full">View Details</Button>
                  </CardFooter>
                </Card>
              </div>
              <div className="h-40 bg-muted/50 rounded-md flex items-center justify-center">
                <p className="text-muted-foreground">Interactive comparison chart of investment returns over time</p>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4 py-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="rounded-md border p-4 space-y-4">
                    <h3 className="font-medium">Key Metrics</h3>
                    <div className="grid grid-cols-2 gap-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Cash on Cash ROI</p>
                        <p className="font-medium">12.6%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Cap Rate</p>
                        <p className="font-medium">7.1%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Internal Rate of Return</p>
                        <p className="font-medium">16.8%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Gross Rent Multiplier</p>
                        <p className="font-medium">10.8</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Debt Service Ratio</p>
                        <p className="font-medium">1.38</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Return on Equity</p>
                        <p className="font-medium">19.2%</p>
                      </div>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Breakeven Occupancy</p>
                        <p className="font-medium">72.7%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Breakeven Ratio</p>
                        <p className="font-medium">0.73</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="rounded-md border p-4 h-full flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <PieChart className="h-16 w-16 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Investment returns breakdown visualization</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-md border p-4 h-40 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <BarChart className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Cash flow projections by year</p>
                  </div>
                </div>
                <div className="rounded-md border p-4 h-40 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <LineChart className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Equity growth over time</p>
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-md">
                <h3 className="font-medium mb-3">AI Recommendations</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-md border border-green-100">
                    <p className="text-sm font-medium text-green-800">This deal performs best as a long-term rental</p>
                    <p className="text-xs text-green-700 mt-1">Based on your cash flow goals and the appreciation potential in this zip code, holding this property as a rental will maximize your 5-year returns.</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-md border border-blue-100">
                    <p className="text-sm font-medium text-blue-800">Consider a 15-year mortgage instead</p>
                    <p className="text-xs text-blue-700 mt-1">While your monthly payment would increase by $320, you would build equity 62% faster and save $98,000 in interest over the loan term.</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-md border border-amber-100">
                    <p className="text-sm font-medium text-amber-800">Budget concerns with repair estimates</p>
                    <p className="text-xs text-amber-700 mt-1">Based on local contractor data, your repair budget might be 15% lower than average costs for similar scope renovations in this area.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="pt-4 text-center">
        <h2 className="text-2xl font-bold mb-3">Ready to simulate your next deal?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">The Deal Simulator is coming soon to Deal Genie. Be among the first to access this powerful tool for optimizing your investment strategy.</p>
        <Button size="lg">Join the Waitlist</Button>
      </div>
    </div>
  )
} 