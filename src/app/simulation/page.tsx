import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { 
  AlarmClock,
  Gauge,
  Activity,
  TrendingUp,
  Lightbulb,
  Sparkles,
  Calculator,
  Coins,
  BarChart,
  LineChart,
  Wallet,
  PiggyBank,
  Home,
  Building,
  Settings,
  PlayCircle,
  ArrowRight
} from 'lucide-react'

export default function SimulationPlaygroundPage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Deal Simulation Playground</h1>
          <Badge className="bg-amber-500 hover:bg-amber-600">Coming Soon</Badge>
        </div>
        <p className="text-muted-foreground">
          Test different scenarios and strategies to optimize your investment returns
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1 md:col-span-2">
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <PlayCircle className="h-6 w-6" />
                Supercharge Your Investment Strategy
              </h2>
              <p className="max-w-3xl opacity-90">
                The Deal Simulation Playground allows you to test different investment scenarios, 
                market conditions, and financing options before committing to a real deal. 
                Run advanced "what-if" analyses and see how changes impact your returns over time.
              </p>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-md">
                    <Calculator className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Dynamic Scenario Testing</h3>
                    <p className="text-sm text-muted-foreground">
                      Adjust variables and instantly see how they affect your investment outcomes
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-md">
                    <Gauge className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Market Condition Simulations</h3>
                    <p className="text-sm text-muted-foreground">
                      Test how your deals perform in different market conditions and future projections
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 p-2 rounded-md">
                    <Lightbulb className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">AI Strategy Recommendations</h3>
                    <p className="text-sm text-muted-foreground">
                      Get personalized suggestions to optimize your investment strategy based on simulations
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Simulation Parameters
            </CardTitle>
            <CardDescription>
              Customize your investment variables
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Property Value</h3>
                <div className="flex gap-3 items-center">
                  <Input value="$250,000" className="w-32" readOnly />
                  <Slider defaultValue={[25]} max={100} step={1} className="flex-1" />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Repair Costs</h3>
                <div className="flex gap-3 items-center">
                  <Input value="$35,000" className="w-32" readOnly />
                  <Slider defaultValue={[35]} max={100} step={1} className="flex-1" />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Interest Rate</h3>
                <div className="flex gap-3 items-center">
                  <Input value="6.5%" className="w-32" readOnly />
                  <Slider defaultValue={[65]} max={150} step={1} className="flex-1" />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Holding Period</h3>
                <div className="flex gap-3 items-center">
                  <Input value="6 months" className="w-32" readOnly />
                  <Slider defaultValue={[6]} max={36} step={1} className="flex-1" />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Market Appreciation</h3>
                <div className="flex gap-3 items-center">
                  <Input value="3.2%" className="w-32" readOnly />
                  <Slider defaultValue={[32]} max={100} step={1} className="flex-1" />
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Alert className="bg-purple-50 border-purple-100">
                <Sparkles className="h-4 w-4 text-purple-500" />
                <AlertTitle className="text-sm">Advanced Parameters</AlertTitle>
                <AlertDescription className="text-xs">
                  Coming soon: Financing options, tax scenarios, inflation adjustments, and more!
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Simulation Results
            </CardTitle>
            <CardDescription>
              See how your strategy performs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-100 rounded-md p-3">
                <h3 className="text-xs text-muted-foreground">Total Profit</h3>
                <p className="text-xl font-semibold text-green-600">$48,750</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>19.5% ROI</span>
                </div>
              </div>
              
              <div className="bg-slate-100 rounded-md p-3">
                <h3 className="text-xs text-muted-foreground">Cash on Cash Return</h3>
                <p className="text-xl font-semibold">32.6%</p>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>Excellent</span>
                </div>
              </div>
              
              <div className="bg-slate-100 rounded-md p-3">
                <h3 className="text-xs text-muted-foreground">After Repair Value</h3>
                <p className="text-xl font-semibold">$315,000</p>
                <div className="flex items-center gap-1 text-xs text-blue-600">
                  <Home className="h-3 w-3" />
                  <span>+$65K</span>
                </div>
              </div>
              
              <div className="bg-slate-100 rounded-md p-3">
                <h3 className="text-xs text-muted-foreground">Total Costs</h3>
                <p className="text-xl font-semibold">$266,250</p>
                <div className="flex items-center gap-1 text-xs">
                  <Wallet className="h-3 w-3" />
                  <span>All Inclusive</span>
                </div>
              </div>
            </div>
            
            <div className="h-40 bg-slate-100 rounded-md p-3 flex items-center justify-center">
              <p className="text-center text-muted-foreground italic">Interactive profit projection chart<br />
              <span className="text-xs">Visualize your returns over the investment period</span></p>
            </div>
            
            <div className="pt-2 border-t">
              <h3 className="text-sm font-medium mb-3">Genie AI Insights</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5" />
                  <p className="text-sm">Increasing your repair budget by 15% could boost ARV by 22%, improving your ROI</p>
                </div>
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5" />
                  <p className="text-sm">Holding for 2 additional months could capture 5% more market appreciation</p>
                </div>
                <div className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5" />
                  <p className="text-sm">This deal performs best with a cash offer strategy based on current parameters</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlarmClock className="h-4 w-4" />
              Time-Based Simulations
            </CardTitle>
            <CardDescription>Test different holding periods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-100 rounded-md p-3 space-y-3">
              <h3 className="text-sm font-medium">Return by Holding Period</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>3 Months</span>
                    <span className="font-medium">$32,500</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>6 Months</span>
                    <span className="font-medium">$48,750</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>12 Months</span>
                    <span className="font-medium">$54,200</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-3 border rounded-md">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Optimal Exit Timing</h3>
                <Badge className="text-xs bg-green-100 text-green-800 hover:bg-green-100">7 Months</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Based on projected market conditions and holding costs, the optimal time to sell 
                this property is in 7 months to maximize your return on investment.
              </p>
            </div>
            
            <Alert>
              <AlertTitle className="text-sm">Market Trend Analysis</AlertTitle>
              <AlertDescription className="text-xs">
                Our AI predicts a 4.2% market appreciation in this zip code over the next 12 months, 
                with strongest growth in Q2 2023.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Financing Scenarios
            </CardTitle>
            <CardDescription>Compare funding options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-md border border-blue-100">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-medium">Cash Purchase</h4>
                    <span className="text-xs font-medium text-green-600">22.5% ROI</span>
                  </div>
                  <p className="text-xs text-muted-foreground">No financing costs, maximum flexibility</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-2 rounded-md border">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-medium">Conventional Loan</h4>
                    <span className="text-xs font-medium text-green-600">19.5% ROI</span>
                  </div>
                  <p className="text-xs text-muted-foreground">20% down, 6.5% interest rate</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-2 rounded-md border">
                <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-medium">Hard Money Loan</h4>
                    <span className="text-xs font-medium text-amber-600">16.8% ROI</span>
                  </div>
                  <p className="text-xs text-muted-foreground">10% down, 12% interest rate</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-2 rounded-md border">
                <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-medium">Private Money</h4>
                    <span className="text-xs font-medium text-green-600">18.2% ROI</span>
                  </div>
                  <p className="text-xs text-muted-foreground">15% down, 9% interest rate</p>
                </div>
              </div>
            </div>
            
            <div className="pt-3 space-y-2 border-t">
              <h3 className="text-sm font-medium">Financing Recommendation</h3>
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-purple-600 mt-0.5" />
                <p className="text-sm">
                  Based on your available capital and this property's metrics, 
                  a conventional loan offers the best balance of ROI and capital preservation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Risk Assessment
            </CardTitle>
            <CardDescription>Evaluate potential risks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b">
                <span className="text-sm font-medium">Risk Factors</span>
                <span className="text-sm font-medium">Impact</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>Repair cost overruns</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-4 bg-red-500 rounded-sm"></div>
                  <div className="w-2 h-4 bg-red-500 rounded-sm"></div>
                  <div className="w-2 h-4 bg-red-500 rounded-sm"></div>
                  <div className="w-2 h-4 bg-gray-200 rounded-sm"></div>
                  <div className="w-2 h-4 bg-gray-200 rounded-sm"></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span>Extended holding period</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-4 bg-amber-500 rounded-sm"></div>
                  <div className="w-2 h-4 bg-amber-500 rounded-sm"></div>
                  <div className="w-2 h-4 bg-gray-200 rounded-sm"></div>
                  <div className="w-2 h-4 bg-gray-200 rounded-sm"></div>
                  <div className="w-2 h-4 bg-gray-200 rounded-sm"></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Market decline</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-4 bg-green-500 rounded-sm"></div>
                  <div className="w-2 h-4 bg-gray-200 rounded-sm"></div>
                  <div className="w-2 h-4 bg-gray-200 rounded-sm"></div>
                  <div className="w-2 h-4 bg-gray-200 rounded-sm"></div>
                  <div className="w-2 h-4 bg-gray-200 rounded-sm"></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>Interest rate increase</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-4 bg-red-500 rounded-sm"></div>
                  <div className="w-2 h-4 bg-red-500 rounded-sm"></div>
                  <div className="w-2 h-4 bg-red-500 rounded-sm"></div>
                  <div className="w-2 h-4 bg-red-500 rounded-sm"></div>
                  <div className="w-2 h-4 bg-gray-200 rounded-sm"></div>
                </div>
              </div>
            </div>
            
            <div className="pt-3 border-t">
              <h3 className="text-sm font-medium mb-2">Stress Test Results</h3>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>15% Higher Repair Costs</span>
                    <span className="font-medium text-amber-600">13.8% ROI</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>2% Market Decline</span>
                    <span className="font-medium text-amber-600">14.2% ROI</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>2% Higher Interest Rate</span>
                    <span className="font-medium text-amber-600">15.3% ROI</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '77%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Combined Negative Scenario</span>
                    <span className="font-medium text-red-600">6.5% ROI</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: '33%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="col-span-1 md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Advanced Strategy Simulator</CardTitle>
            <CardDescription>
              Compare different investment strategies and exit scenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="flipvhold">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="flipvhold">Flip vs. Hold</TabsTrigger>
                <TabsTrigger value="rental">Rental Analysis</TabsTrigger>
                <TabsTrigger value="scaling">Portfolio Scaling</TabsTrigger>
              </TabsList>
              
              <TabsContent value="flipvhold" className="space-y-4">
                <div className="bg-slate-100 rounded-lg p-4 h-64 flex items-center justify-center">
                  <p className="text-center text-muted-foreground italic">
                    Flip vs. Hold Analysis tool preview<br />
                    <span className="text-sm">Compare immediate flip returns with long-term rental income and appreciation</span>
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="rental" className="space-y-4">
                <div className="bg-slate-100 rounded-lg p-4 h-64 flex items-center justify-center">
                  <p className="text-center text-muted-foreground italic">
                    Rental property analysis tool preview<br />
                    <span className="text-sm">Calculate cash flow, cap rates, and long-term ROI for rental properties</span>
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="scaling" className="space-y-4">
                <div className="bg-slate-100 rounded-lg p-4 h-64 flex items-center justify-center">
                  <p className="text-center text-muted-foreground italic">
                    Portfolio scaling simulator preview<br />
                    <span className="text-sm">Project how reinvesting profits can grow your portfolio over time</span>
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-6">
            <Button size="lg" className="gap-2">
              <PlayCircle className="h-4 w-4" />
              Join Simulation Playground Waitlist
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 