'use client';

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { 
  Code, 
  Key, 
  ExternalLink, 
  FileJson, 
  Database, 
  Workflow,
  BookOpen,
  Lock,
  Server,
  Cpu,
  Braces,
  Code2
} from 'lucide-react'

export default function ApiAccessPage() {
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold">Genie API</h1>
          <Badge className="bg-amber-500 hover:bg-amber-600">Coming Soon</Badge>
        </div>
        <p className="text-muted-foreground">
          Integrate Genie's powerful analysis engine into your own applications
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              REST API
            </CardTitle>
            <CardDescription>
              Simple integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Access Genie's powerful real estate analysis capabilities via a simple REST API. Integrate property analysis, market data, and deal scoring into your own applications or workflows.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys & Security
            </CardTitle>
            <CardDescription>
              Enterprise-grade security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Generate and manage API keys with granular permissions. Control rate limits, IP restrictions, and usage quotas to maintain security and performance across your integrations.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Comprehensive Documentation
            </CardTitle>
            <CardDescription>
              Developer-friendly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Extensive API documentation with code examples in multiple languages (JavaScript, Python, Ruby, etc.). Interactive API explorer to test endpoints and responses directly from your browser.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Bulk Analysis
            </CardTitle>
            <CardDescription>
              Process multiple properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Analyze multiple properties simultaneously with our bulk analysis endpoints. Process entire portfolios or market segments efficiently with a single API call.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              Webhooks
            </CardTitle>
            <CardDescription>
              Real-time notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Configure webhooks to notify your systems in real-time when analyses are completed, market conditions change, or new opportunities are identified in your target markets.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Enterprise Integration
            </CardTitle>
            <CardDescription>
              Seamless connectivity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Connect Genie's analysis engine to your enterprise systems including CRMs, property management software, and investment platforms with pre-built connectors and custom integration support.</p>
          </CardContent>
        </Card>
      </div>

      <Alert className="bg-blue-50 border-blue-100">
        <Cpu className="h-4 w-4" />
        <AlertTitle>Powered by GenieAI</AlertTitle>
        <AlertDescription>
          Access the same powerful AI analysis engine that powers the GenieOS platform through our API endpoints. Get property recommendations, deal analysis, and market intelligence programmatically.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>API Documentation Preview</CardTitle>
          <CardDescription>Sample endpoints and response formats</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="endpoints">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
              <TabsTrigger value="authentication">Authentication</TabsTrigger>
              <TabsTrigger value="examples">Code Examples</TabsTrigger>
              <TabsTrigger value="sdks">Client SDKs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="endpoints" className="space-y-4 py-4">
              <div className="space-y-4">
                <Card className="bg-muted/40">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500">GET</Badge>
                        <code className="text-sm font-mono">{'/api/v1/properties/{id}'}</code>
                      </div>
                      <Badge variant="outline">Fetch property details</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="py-3 border-t text-sm">
                    <p className="mb-2">Returns detailed information about a property, including location, features, and market data.</p>
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-1">Response Example:</p>
                      <pre className="bg-slate-950 text-slate-50 p-3 rounded-md text-xs overflow-auto">
{`{
  "id": "prop_123456",
  "address": "123 Main St, Anytown, USA",
  "propertyType": "single_family",
  "bedrooms": 3,
  "bathrooms": 2,
  "squareFeet": 1500,
  "yearBuilt": 1985,
  "lot_size": 0.25,
  "market": {
    "zip_code": "12345",
    "median_home_value": 325000,
    "price_trend": 0.05,
    "days_on_market_avg": 21
  }
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/40">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-500">POST</Badge>
                        <code className="text-sm font-mono">/api/v1/analysis</code>
                      </div>
                      <Badge variant="outline">Analyze property</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="py-3 border-t text-sm">
                    <p className="mb-2">Analyzes a property using the GenieAI engine to provide investment recommendations and deal scoring.</p>
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground mb-1">Request Example:</p>
                      <pre className="bg-slate-950 text-slate-50 p-3 rounded-md text-xs overflow-auto">
{`{
  "address": "123 Main St, Anytown, USA",
  "listingPrice": 350000,
  "propertyType": "single_family",
  "bedrooms": 3,
  "bathrooms": 2,
  "squareFeet": 1500,
  "yearBuilt": 1985,
  "investmentStrategy": "buy_and_hold"
}`}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/40">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-500">POST</Badge>
                        <code className="text-sm font-mono">/api/v1/offers/generate</code>
                      </div>
                      <Badge variant="outline">Generate offer</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="py-3 border-t text-sm">
                    <p className="mb-2">Creates a customized offer document based on property analysis and investment parameters.</p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/40">
                  <CardHeader className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-purple-500">GET</Badge>
                        <code className="text-sm font-mono">{'/api/v1/markets/{zip_code}'}</code>
                      </div>
                      <Badge variant="outline">Market data</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="py-3 border-t text-sm">
                    <p className="mb-2">Retrieves comprehensive market data for a specific ZIP code including trends, comps, and investment metrics.</p>
                  </CardContent>
                </Card>
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Endpoints
              </Button>
            </TabsContent>
            
            <TabsContent value="authentication" className="space-y-4 py-4">
              <div className="bg-muted p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">API Key Authentication</h3>
                <p className="text-sm mb-4">Authenticate requests by including your API key in the header of each request.</p>
                <div className="text-xs bg-slate-950 text-slate-50 p-3 rounded-md font-mono">
                  Authorization: Bearer YOUR_API_KEY
                </div>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Security Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 text-xs">1</span>
                    </div>
                    <p>Never expose your API key in client-side code. Always make API calls from your backend.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 text-xs">2</span>
                    </div>
                    <p>Implement IP restrictions to limit API access to specific servers or networks.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 text-xs">3</span>
                    </div>
                    <p>Rotate API keys regularly and revoke compromised keys immediately.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 text-xs">4</span>
                    </div>
                    <p>Set appropriate rate limits and monitor API usage for unusual patterns.</p>
                  </div>
                </CardContent>
              </Card>
              
              <div className="mt-4 bg-blue-50 p-4 rounded-md border border-blue-100">
                <div className="flex items-start gap-3">
                  <Key className="h-5 w-5 text-blue-700 mt-0.5" />
                  <div>
                    <h3 className="font-medium mb-1">API Key Management</h3>
                    <p className="text-sm text-muted-foreground">Generate, revoke, and manage multiple API keys with specific permissions through the API Dashboard. Each key can be scoped to specific endpoints and rate limits.</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="examples" className="space-y-4 py-4">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Braces className="h-4 w-4" />
                      JavaScript (Node.js)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-slate-950 text-slate-50 p-3 rounded-md text-xs overflow-auto">
{`const axios = require('axios');

async function analyzeProperty() {
  try {
    const response = await axios.post(
      'https://api.genieos.com/v1/analysis',
      {
        address: '123 Main St, Anytown, USA',
        listingPrice: 350000,
        propertyType: 'single_family',
        investmentStrategy: 'buy_and_hold'
      },
      {
        headers: {
          Authorization: \`Bearer \${process.env.GENIE_API_KEY}\`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error analyzing property:', error);
  }
}`}
                    </pre>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Code2 className="h-4 w-4" />
                      Python
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-slate-950 text-slate-50 p-3 rounded-md text-xs overflow-auto">
{`import requests
import os

def analyze_property():
    url = "https://api.genieos.com/v1/analysis"
    
    headers = {
        "Authorization": "Bearer " + os.environ.get('GENIE_API_KEY'),
        "Content-Type": "application/json"
    }
    
    data = {
        "address": "123 Main St, Anytown, USA",
        "listingPrice": 350000,
        "propertyType": "single_family",
        "investmentStrategy": "buy_and_hold"
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print("Error analyzing property: " + str(e))
        return None`}
                    </pre>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Webhooks Example
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3">Example of a webhook payload sent when an analysis is completed:</p>
                    <pre className="bg-slate-950 text-slate-50 p-3 rounded-md text-xs overflow-auto">
{`{
  "event": "analysis.completed",
  "created": "2023-07-15T14:22:33Z",
  "data": {
    "analysisId": "ana_12345",
    "propertyId": "prop_67890",
    "status": "completed",
    "results": {
      "recommendation": "buy",
      "dealScore": 87,
      "confidence": 0.92,
      "mao": 325000,
      "estimated_arv": 425000,
      "estimated_rehab": 45000,
      "cash_flow_monthly": 650,
      "cap_rate": 0.072
    }
  }
}`}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="sdks" className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">JavaScript SDK</CardTitle>
                    <CardDescription>For web and Node.js applications</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">Install the SDK using npm:</p>
                    <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs overflow-auto">
                      npm install genie-api-sdk
                    </pre>
                    <p className="text-sm mt-4 mb-2">Basic usage:</p>
                    <pre className="bg-slate-950 text-slate-50 p-3 rounded-md text-xs overflow-auto">
{`import { GenieAPI } from 'genie-api-sdk';

const genie = new GenieAPI('YOUR_API_KEY');

// Analyze a property
const analysis = await genie.properties.analyze({
  address: '123 Main St, Anytown, USA',
  listingPrice: 350000
});

console.log(analysis);`}
                    </pre>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Python SDK</CardTitle>
                    <CardDescription>For data analysis and backend systems</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">Install the SDK using pip:</p>
                    <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs overflow-auto">
                      pip install genie-api
                    </pre>
                    <p className="text-sm mt-4 mb-2">Basic usage:</p>
                    <pre className="bg-slate-950 text-slate-50 p-3 rounded-md text-xs overflow-auto">
{`from genie_api import GenieAPI

genie = GenieAPI(api_key=\'YOUR_API_KEY\')

# Analyze a property
analysis = genie.properties.analyze(
  address=\'123 Main St, Anytown, USA\',
  listing_price=350000
)

print(analysis)`}
                    </pre>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Mobile SDKs</CardTitle>
                    <CardDescription>For iOS and Android applications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">iOS (Swift)</h4>
                      <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs overflow-auto">
                        pod 'GenieAPI', '~> 1.0'
                      </pre>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">Android (Kotlin)</h4>
                      <pre className="bg-slate-950 text-slate-50 p-2 rounded-md text-xs overflow-auto">
                        implementation 'com.genieos:api-sdk:1.0.0'
                      </pre>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Coming Soon</CardTitle>
                    <CardDescription>Additional SDK support</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>Ruby SDK</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>Java SDK</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>Go SDK</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>PHP SDK</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>.NET SDK</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="pt-4 text-center">
        <h2 className="text-2xl font-bold mb-3">Build with Genie</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">Integrate powerful real estate analysis into your own applications with the Genie API. Join our developer program to get early access when we launch.</p>
        <Button size="lg">Join Developer Waitlist</Button>
      </div>
    </div>
  )
} 