import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Calendar, Brain, AlertTriangle, CheckCircle, Target } from 'lucide-react';

export default function RiskPrediction({ data = [], currentRisk = 0, patterns = {}, className = "" }) {
  // Generate prediction data for next 7 days
  const generatePredictions = () => {
    const predictions = [];
    const today = new Date();
    
    // Simple trend-based prediction
    const recentTrend = patterns.progression?.change || 0;
    const volatility = calculateVolatility(data.slice(0, 7));
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Base prediction on current risk and trend
      let predictedRisk = currentRisk + (recentTrend / 100 * currentRisk * i / 7);
      
      // Add some volatility based on historical patterns
      const randomFactor = (Math.random() - 0.5) * volatility * 0.5;
      predictedRisk += randomFactor;
      
      // Ensure within bounds
      predictedRisk = Math.max(0, Math.min(10, predictedRisk));
      
      predictions.push({
        date: date.toLocaleDateString(),
        predicted: Number(predictedRisk.toFixed(1)),
        confidence: calculateConfidence(i, volatility),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
      });
    }
    
    return predictions;
  };

  const calculateVolatility = (recentData) => {
    if (recentData.length < 2) return 1;
    
    const risks = recentData.map(d => d.overall_risk);
    const mean = risks.reduce((a, b) => a + b) / risks.length;
    const variance = risks.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / risks.length;
    return Math.sqrt(variance);
  };

  const calculateConfidence = (daysAhead, volatility) => {
    // Confidence decreases with distance and increases with stability
    const baseConfidence = 90;
    const distancePenalty = daysAhead * 5;
    const volatilityPenalty = volatility * 10;
    
    return Math.max(50, baseConfidence - distancePenalty - volatilityPenalty);
  };

  const predictions = generatePredictions();
  
  // Combine historical and prediction data for chart
  const chartData = [
    ...data.slice(-7).map(d => ({
      date: new Date(d.date).toLocaleDateString(),
      actual: d.overall_risk,
      predicted: null,
      type: 'historical'
    })),
    ...predictions.map(p => ({
      date: p.date,
      actual: null,
      predicted: p.predicted,
      type: 'prediction'
    }))
  ];

  // Risk scenarios
  const scenarios = [
    {
      name: 'Best Case',
      description: 'With proper intervention and support',
      risk: Math.max(1, currentRisk - 2),
      probability: 25,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      name: 'Most Likely',
      description: 'Following current trends',
      risk: predictions[6]?.predicted || currentRisk,
      probability: 50,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      name: 'Worst Case',
      description: 'Without intervention',
      risk: Math.min(10, currentRisk + 2),
      probability: 25,
      color: 'text-red-600',
      bg: 'bg-red-50'
    }
  ];

  // Intervention recommendations
  const recommendations = [
    {
      priority: 'high',
      action: 'Schedule professional consultation',
      impact: 'High',
      timeline: 'Within 1 week',
      condition: currentRisk > 7
    },
    {
      priority: 'medium',
      action: 'Increase daily check-ins',
      impact: 'Medium',
      timeline: 'Starting immediately',
      condition: currentRisk > 5
    },
    {
      priority: 'low',
      action: 'Implement stress reduction activities',
      impact: 'Medium',
      timeline: 'This week',
      condition: currentRisk > 3
    },
    {
      priority: 'maintenance',
      action: 'Continue current monitoring',
      impact: 'Low',
      timeline: 'Ongoing',
      condition: currentRisk <= 3
    }
  ].filter(rec => rec.condition);

  return (
    <div className={`${className} space-y-6`}>
      {/* Prediction Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            7-Day Risk Prediction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 10]} />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value?.toFixed(1)}/10`, 
                    name === 'actual' ? 'Historical Risk' : 'Predicted Risk'
                  ]}
                />
                
                {/* Risk zone references */}
                <ReferenceLine y={3} stroke="#22c55e" strokeDasharray="5 5" strokeOpacity={0.5} />
                <ReferenceLine y={6} stroke="#f59e0b" strokeDasharray="5 5" strokeOpacity={0.5} />
                
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 4 }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  strokeDasharray="8 8"
                  dot={{ fill: '#06b6d4', r: 4 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-purple-500 rounded" />
              <span>Historical Data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 bg-cyan-500 rounded border-dashed" />
              <span>Predicted Risk</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Scenarios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              7-Day Risk Scenarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scenarios.map((scenario, index) => (
                <div key={index} className={`p-4 rounded-lg ${scenario.bg}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold ${scenario.color}`}>{scenario.name}</h4>
                    <Badge variant="outline" className={scenario.color}>
                      {scenario.probability}% chance
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{scenario.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold">{scenario.risk.toFixed(1)}/10</span>
                    <Badge 
                      variant={scenario.risk > 6 ? 'destructive' : scenario.risk > 3 ? 'warning' : 'success'}
                    >
                      {scenario.risk > 6 ? 'High Risk' : scenario.risk > 3 ? 'Medium Risk' : 'Low Risk'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {rec.priority === 'high' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      {rec.priority === 'medium' && <Calendar className="w-4 h-4 text-orange-500" />}
                      {rec.priority === 'low' && <CheckCircle className="w-4 h-4 text-blue-500" />}
                      {rec.priority === 'maintenance' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      <Badge 
                        variant={
                          rec.priority === 'high' ? 'destructive' :
                          rec.priority === 'medium' ? 'warning' : 'default'
                        }
                        className="text-xs"
                      >
                        {rec.priority}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {rec.impact} impact
                    </Badge>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">{rec.action}</h4>
                  <p className="text-sm text-gray-600">{rec.timeline}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prediction Confidence */}
      <Card>
        <CardHeader>
          <CardTitle>Prediction Confidence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {predictions.map((pred, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">{pred.dayName}</div>
                <div className="text-lg font-bold text-gray-900">{pred.predicted}</div>
                <div className="text-xs text-gray-500">{pred.confidence.toFixed(0)}%</div>
                <div 
                  className="h-2 bg-gradient-to-r from-red-200 to-green-200 rounded mt-2"
                  style={{
                    background: `linear-gradient(to right, 
                      ${pred.confidence > 80 ? '#10b981' : 
                        pred.confidence > 60 ? '#f59e0b' : '#ef4444'} 0%, 
                      transparent 100%)`
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Predictions are based on current trends and historical patterns. 
              Early intervention can significantly improve outcomes and change these projections.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}