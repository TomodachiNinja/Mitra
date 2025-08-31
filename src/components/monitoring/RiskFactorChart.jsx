import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function RiskFactorChart({ data = [], factors = {}, className = "" }) {
  // Prepare radar chart data
  const radarData = [
    { subject: 'Sleep Quality', current: factors.sleep?.current || 0, average: factors.sleep?.average || 0, fullMark: 10 },
    { subject: 'Mood', current: factors.mood?.current || 0, average: factors.mood?.average || 0, fullMark: 10 },
    { subject: 'Social Activity', current: factors.social?.current || 0, average: factors.social?.average || 0, fullMark: 10 },
    { subject: 'Stress (Inverted)', current: 10 - (factors.stress?.current || 0), average: 10 - (factors.stress?.average || 0), fullMark: 10 },
    { subject: 'Screen Time (Inverted)', current: Math.max(0, 10 - (factors.screenTime?.current || 0) / 2), average: Math.max(0, 10 - (factors.screenTime?.average || 0) / 2), fullMark: 10 }
  ];

  // Prepare trend data for individual factors
  const trendData = data.slice(-14).map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    sleep: item.sleep_quality,
    mood: item.mood_score,
    social: item.social_activity,
    stress: 10 - item.stress_level, // Inverted for better visualization
    screenTime: Math.max(0, 10 - item.screen_time_hours / 2) // Inverted and scaled
  }));

  return (
    <div className={`${className} space-y-6`}>
      {/* Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Factor Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 10]} 
                  tick={{ fontSize: 10 }}
                  tickCount={6}
                />
                <Radar
                  name="Current"
                  dataKey="current"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Radar
                  name="Average"
                  dataKey="average"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
              <span>Current Values</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-cyan-500" />
              <span>Average Values</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Factor Trends */}
      <Card>
        <CardHeader>
          <CardTitle>14-Day Factor Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line type="monotone" dataKey="sleep" stroke="#3b82f6" name="Sleep Quality" strokeWidth={2} />
                <Line type="monotone" dataKey="mood" stroke="#ec4899" name="Mood" strokeWidth={2} />
                <Line type="monotone" dataKey="social" stroke="#10b981" name="Social Activity" strokeWidth={2} />
                <Line type="monotone" dataKey="stress" stroke="#ef4444" name="Stress (Low=Good)" strokeWidth={2} />
                <Line type="monotone" dataKey="screenTime" stroke="#f59e0b" name="Screen Time (Low=Good)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}