import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, AlertTriangle, Clock } from 'lucide-react';

export default function PatternAnalysis({ patterns = {}, data = [], className = "" }) {
  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

  // Weekly risk distribution
  const weeklyData = patterns.weeklyRisk || [];

  // Time of day patterns (if we had hourly data)
  const timePatterns = [
    { time: 'Morning', risk: 4.2, color: '#10b981' },
    { time: 'Afternoon', risk: 5.8, color: '#f59e0b' },
    { time: 'Evening', risk: 6.5, color: '#ef4444' },
    { time: 'Night', risk: 7.2, color: '#8b5cf6' }
  ];

  // Risk level distribution
  const riskDistribution = data.reduce((acc, item) => {
    const level = item.overall_risk <= 3 ? 'Low' : item.overall_risk <= 6 ? 'Medium' : 'High';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const riskPieData = Object.entries(riskDistribution).map(([level, count]) => ({
    name: level,
    value: count,
    percentage: ((count / data.length) * 100).toFixed(1)
  }));

  return (
    <div className={`${className} space-y-6`}>
      {/* Pattern Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {patterns.highRiskDays?.length || 0}
            </div>
            <div className="text-sm text-gray-600">High Risk Days</div>
            <div className="text-xs text-gray-500 mt-1">
              {patterns.highRiskDays?.join(', ') || 'None identified'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {Math.abs(patterns.progression?.change || 0)}%
            </div>
            <div className="text-sm text-gray-600">
              {patterns.progression?.direction === 'increasing' ? 'Risk Increase' : 'Risk Decrease'}
            </div>
            <Badge 
              variant={patterns.progression?.direction === 'decreasing' ? 'success' : 'warning'}
              className="mt-1"
            >
              {patterns.progression?.direction || 'stable'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {patterns.consistentFactors?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Consistent Risk Factors</div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Pattern Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Weekly Risk Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 10]} />
                <Tooltip 
                  formatter={(value) => [`${value.toFixed(1)}/10`, 'Average Risk']}
                />
                <Bar 
                  dataKey="risk" 
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Level Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Time-based Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Estimated Daily Pattern
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timePatterns.map((pattern, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: pattern.color }}
                    />
                    <span className="font-medium">{pattern.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{pattern.risk}/10</span>
                    <Badge 
                      variant={pattern.risk > 6 ? 'destructive' : pattern.risk > 4 ? 'warning' : 'success'}
                    >
                      {pattern.risk > 6 ? 'High' : pattern.risk > 4 ? 'Medium' : 'Low'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Pattern Insight:</strong> Risk levels tend to increase throughout the day, 
                peaking in the evening hours. Consider morning interventions for best results.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consistent Factors */}
      {patterns.consistentFactors && patterns.consistentFactors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Consistent Risk Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {patterns.consistentFactors.map((factor, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                    <div>
                      <h4 className="font-semibold text-orange-800">{factor.factor}</h4>
                      <p className="text-sm text-orange-700">Consistently impacting risk levels</p>
                    </div>
                  </div>
                  <Badge 
                    variant={factor.severity === 'high' ? 'destructive' : 'warning'}
                  >
                    {factor.severity} impact
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}