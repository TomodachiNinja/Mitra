import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

export default function TrendChart({ data = [], interventions = [], className = "" }) {
  // Calculate trend
  const calculateTrend = () => {
    if (data.length < 2) return { direction: 'stable', percentage: 0 };
    
    const recent = data.slice(-7); // Last 7 days
    const older = data.slice(-14, -7); // Previous 7 days
    
    const recentAvg = recent.reduce((sum, item) => sum + item.overall_risk, 0) / recent.length;
    const olderAvg = older.length > 0 ? older.reduce((sum, item) => sum + item.overall_risk, 0) / older.length : recentAvg;
    
    const percentage = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    return {
      direction: percentage > 5 ? 'up' : percentage < -5 ? 'down' : 'stable',
      percentage: Math.abs(percentage).toFixed(1)
    };
  };

  const trend = calculateTrend();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="flex justify-between">
              <span>Risk Score:</span>
              <span className={`font-medium ${
                data.overall_risk > 6 ? 'text-red-600' : 
                data.overall_risk > 3 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {data.overall_risk}/10
              </span>
            </p>
            <p className="flex justify-between">
              <span>Sleep:</span>
              <span>{data.sleep_quality}/10</span>
            </p>
            <p className="flex justify-between">
              <span>Mood:</span>
              <span>{data.mood_score}/10</span>
            </p>
            <p className="flex justify-between">
              <span>Social:</span>
              <span>{data.social_activity}/10</span>
            </p>
            <p className="flex justify-between">
              <span>Stress:</span>
              <span>{data.stress_level}/10</span>
            </p>
          </div>
          {data.notes && (
            <p className="text-xs text-gray-600 mt-2 italic">{data.notes}</p>
          )}
        </div>
      );
    }
    return null;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Process data for chart
  const chartData = data.map(item => ({
    ...item,
    date: formatDate(item.date),
    fullDate: item.date
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>30-Day Trend</span>
          <div className="flex items-center gap-2">
            {trend.direction === 'up' && (
              <>
                <TrendingUp className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">+{trend.percentage}%</span>
              </>
            )}
            {trend.direction === 'down' && (
              <>
                <TrendingDown className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">-{trend.percentage}%</span>
              </>
            )}
            {trend.direction === 'stable' && (
              <span className="text-sm text-gray-600">Stable</span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              <YAxis 
                domain={[0, 10]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#666' }}
              />
              
              {/* Risk zones */}
              <ReferenceLine y={3} stroke="#22c55e" strokeDasharray="5 5" strokeOpacity={0.5} />
              <ReferenceLine y={6} stroke="#f59e0b" strokeDasharray="5 5" strokeOpacity={0.5} />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Line
                type="monotone"
                dataKey="overall_risk"
                stroke="url(#colorGradient)"
                strokeWidth={3}
                dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#667eea', strokeWidth: 2, fill: '#fff' }}
              />
              
              {/* Intervention markers */}
              {interventions.map((intervention, index) => (
                <ReferenceLine
                  key={index}
                  x={formatDate(intervention.date)}
                  stroke="#ef4444"
                  strokeWidth={2}
                />
              ))}
              
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#764ba2" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full opacity-50" />
            <span>Safe Zone (0-3)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full opacity-50" />
            <span>Moderate (4-6)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full opacity-50" />
            <span>High Risk (7-10)</span>
          </div>
          {interventions.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-red-500" />
              <span>Interventions</span>
            </div>
          )}
        </div>

        {/* Trend summary */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-2">
            {trend.direction === 'up' && <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />}
            <div className="text-sm">
              <p className="font-medium text-gray-900">
                {trend.direction === 'up' && 'Risk levels have increased'}
                {trend.direction === 'down' && 'Positive improvement trend'}
                {trend.direction === 'stable' && 'Risk levels are stable'}
              </p>
              <p className="text-gray-600 mt-1">
                {trend.direction === 'up' && 'Consider increased monitoring and potential intervention.'}
                {trend.direction === 'down' && 'Current support strategies appear to be working well.'}
                {trend.direction === 'stable' && 'Continue current monitoring and support approaches.'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}