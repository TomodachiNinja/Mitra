
import React, { useState, useEffect, useCallback } from "react";
import { User } from "@/api/entities";
import { MonitoringData } from "@/api/entities";
import { Alert } from "@/api/entities";
import { calculateRiskScore } from "@/components/utils/aiHelpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Eye,
  Calendar,
  BarChart3,
  Activity,
  Clock,
  Brain,
  Heart,
  Moon,
  Users,
  Smartphone,
  Zap
} from "lucide-react";

import RiskMeter from "../components/dashboard/RiskMeter";
import TrendChart from "../components/dashboard/TrendChart";
import RiskFactorChart from "../components/monitoring/RiskFactorChart";
import PatternAnalysis from "../components/monitoring/PatternAnalysis";
import RiskPrediction from "../components/monitoring/RiskPrediction";

export default function RiskMonitorPage() {
  const [user, setUser] = useState(null);
  const [monitoringData, setMonitoringData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [currentRisk, setCurrentRisk] = useState(0);
  const [riskFactors, setRiskFactors] = useState({});
  const [patterns, setPatterns] = useState({});
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");

  const analyzeRiskFactors = (data) => {
    if (data.length === 0) return {};

    const latest = data[0];
    const average = data.reduce((acc, item) => ({
      sleep_quality: acc.sleep_quality + item.sleep_quality,
      social_activity: acc.social_activity + item.social_activity,
      mood_score: acc.mood_score + item.mood_score,
      screen_time_hours: acc.screen_time_hours + item.screen_time_hours,
      stress_level: acc.stress_level + item.stress_level
    }), { sleep_quality: 0, social_activity: 0, mood_score: 0, screen_time_hours: 0, stress_level: 0 });

    Object.keys(average).forEach(key => {
      average[key] = average[key] / data.length;
    });

    return {
      sleep: {
        current: latest.sleep_quality,
        average: average.sleep_quality.toFixed(1),
        trend: latest.sleep_quality > average.sleep_quality ? 'improving' : 'declining',
        impact: 'high'
      },
      mood: {
        current: latest.mood_score,
        average: average.mood_score.toFixed(1),
        trend: latest.mood_score > average.mood_score ? 'improving' : 'declining',
        impact: 'high'
      },
      social: {
        current: latest.social_activity,
        average: average.social_activity.toFixed(1),
        trend: latest.social_activity > average.social_activity ? 'improving' : 'declining',
        impact: 'medium'
      },
      screenTime: {
        current: latest.screen_time_hours,
        average: average.screen_time_hours.toFixed(1),
        trend: latest.screen_time_hours < average.screen_time_hours ? 'improving' : 'declining',
        impact: 'medium'
      },
      stress: {
        current: latest.stress_level,
        average: average.stress_level.toFixed(1),
        trend: latest.stress_level < average.stress_level ? 'improving' : 'declining',
        impact: 'high'
      }
    };
  };

  const identifyConsistentFactors = (data) => {
    const factors = [];
    const recentData = data.slice(0, 7);
    
    const avgSleep = recentData.reduce((sum, item) => sum + item.sleep_quality, 0) / recentData.length;
    const avgMood = recentData.reduce((sum, item) => sum + item.mood_score, 0) / recentData.length;
    const avgSocial = recentData.reduce((sum, item) => sum + item.social_activity, 0) / recentData.length;
    const avgStress = recentData.reduce((sum, item) => sum + item.stress_level, 0) / recentData.length;

    if (avgSleep < 4) factors.push({ factor: 'Poor Sleep', severity: 'high' });
    if (avgMood < 4) factors.push({ factor: 'Low Mood', severity: 'high' });
    if (avgSocial < 4) factors.push({ factor: 'Social Isolation', severity: 'medium' });
    if (avgStress > 7) factors.push({ factor: 'High Stress', severity: 'high' });

    return factors;
  };

  const detectPatterns = (data) => {
    if (data.length < 7) return {};

    // Weekly patterns
    const weeklyData = {};
    data.forEach(item => {
      const day = new Date(item.date).getDay();
      if (!weeklyData[day]) weeklyData[day] = [];
      weeklyData[day].push(item.overall_risk);
    });

    const weeklyRisk = Object.keys(weeklyData).map(day => ({
      day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
      risk: weeklyData[day].reduce((a, b) => a + b, 0) / weeklyData[day].length
    }));

    // Risk progression
    const recent7 = data.slice(0, 7);
    const previous7 = data.slice(7, 14);
    
    const recentAvg = recent7.reduce((sum, item) => sum + item.overall_risk, 0) / recent7.length;
    const previousAvg = previous7.length > 0 ? previous7.reduce((sum, item) => sum + item.overall_risk, 0) / previous7.length : recentAvg;
    
    const progression = ((recentAvg - previousAvg) / previousAvg * 100).toFixed(1);

    return {
      weeklyRisk,
      progression: {
        change: progression,
        direction: progression > 0 ? 'increasing' : 'decreasing'
      },
      highRiskDays: weeklyRisk.filter(d => d.risk > 6).map(d => d.day),
      consistentFactors: identifyConsistentFactors(data)
    };
  };

  const loadRiskData = useCallback(async () => {
    try {
      const demoUser = localStorage.getItem('demoUser');
      let currentUser;
      
      if (demoUser) {
        currentUser = JSON.parse(demoUser);
      } else {
        currentUser = await User.me();
      }
      
      setUser(currentUser);

      // Load monitoring data based on time range
      const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const monitoringRecords = await MonitoringData.list('-date', days);
      setMonitoringData(monitoringRecords);

      // Load recent alerts
      const alertRecords = await Alert.filter({ parent_id: currentUser.id }, '-created_date', 20);
      setAlerts(alertRecords);

      // Calculate current risk and factors
      if (monitoringRecords.length > 0) {
        const latestData = monitoringRecords[0];
        const riskScore = calculateRiskScore(latestData);
        setCurrentRisk(riskScore.score);

        // Analyze risk factors
        const factors = analyzeRiskFactors(monitoringRecords);
        setRiskFactors(factors);

        // Detect patterns
        const patternAnalysis = detectPatterns(monitoringRecords);
        setPatterns(patternAnalysis);
      }

    } catch (error) {
      console.error("Error loading risk data:", error);
    }
    setIsLoading(false);
  }, [timeRange]); // Added timeRange as a dependency for useCallback

  useEffect(() => {
    loadRiskData();
  }, [loadRiskData]); // Added loadRiskData as a dependency for useEffect

  const getTimeRangeData = () => {
    const now = new Date();
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return monitoringData.filter(item => new Date(item.date) >= startDate);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading risk analysis...</p>
        </div>
      </div>
    );
  }

  const filteredData = getTimeRangeData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Risk Monitor
            </h1>
            <p className="text-gray-600 mt-1">
              Comprehensive mental health risk analysis and insights
            </p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex gap-2">
            {["7d", "30d", "90d"].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeRange(range)}
                className={timeRange === range ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
              </Button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardContent className="p-6 text-center">
              <Shield className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-700">{currentRisk.toFixed(1)}/10</div>
              <div className="text-sm text-red-600">Current Risk</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6 text-center">
              <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">{filteredData.length}</div>
              <div className="text-sm text-blue-600">Data Points</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-700">{alerts.filter(a => !a.is_read).length}</div>
              <div className="text-sm text-orange-600">Active Alerts</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6 text-center">
              <TrendingDown className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">
                {patterns.progression?.direction === 'decreasing' ? '↓' : '↑'}
                {Math.abs(patterns.progression?.change || 0)}%
              </div>
              <div className="text-sm text-green-600">Risk Change</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="factors" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Risk Factors
            </TabsTrigger>
            <TabsTrigger value="patterns" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Patterns
            </TabsTrigger>
            <TabsTrigger value="predictions" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Predictions
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Risk Meter */}
              <RiskMeter score={currentRisk} className="lg:col-span-1" />

              {/* Current Status */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Current Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(riskFactors).map(([key, factor]) => (
                      <div key={key} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize">
                            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          </span>
                          <Badge 
                            variant={factor.trend === 'improving' ? 'success' : 'destructive'}
                            className="text-xs"
                          >
                            {factor.trend === 'improving' ? '↑' : '↓'}
                          </Badge>
                        </div>
                        <div className="text-lg font-bold">{factor.current}/10</div>
                        <div className="text-xs text-gray-500">Avg: {factor.average}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trend Chart */}
            <TrendChart 
              data={filteredData}
              interventions={alerts.filter(a => a.alert_type === 'crisis').map(a => ({ date: a.created_date }))}
              className="w-full"
            />
          </TabsContent>

          {/* Risk Factors Tab */}
          <TabsContent value="factors" className="space-y-6">
            <RiskFactorChart 
              data={filteredData}
              factors={riskFactors}
              className="w-full"
            />

            {/* Factor Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>High Impact Factors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(riskFactors)
                      .filter(([_, factor]) => factor.impact === 'high')
                      .map(([key, factor]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            {key === 'sleep' && <Moon className="w-4 h-4 text-blue-600" />}
                            {key === 'mood' && <Heart className="w-4 h-4 text-pink-600" />}
                            {key === 'stress' && <Zap className="w-4 h-4 text-red-600" />}
                            <span className="font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1')}
                            </span>
                          </div>
                          <Badge variant={factor.current < 5 ? 'destructive' : 'default'}>
                            {factor.current}/10
                          </Badge>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Improvement Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {patterns.consistentFactors?.map((factor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <span className="font-medium">{factor.factor}</span>
                        <Badge 
                          variant={factor.severity === 'high' ? 'destructive' : 'warning'}
                          className="text-xs"
                        >
                          {factor.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-6">
            <PatternAnalysis 
              patterns={patterns}
              data={filteredData}
              className="w-full"
            />
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <RiskPrediction 
              data={filteredData}
              currentRisk={currentRisk}
              patterns={patterns}
              className="w-full"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
