
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { MonitoringData } from "@/api/entities";
import { Alert } from "@/api/entities";
import { calculateRiskScore, generateParentCoaching } from "@/components/utils/aiHelpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  Shield, 
  Heart, 
  MessageCircle,
  AlertTriangle,
  Phone,
  CheckCircle,
  Clock,
  Brain, // Still used for coaching icon if we add a link/button
  BarChart3
} from "lucide-react";

import RiskMeter from "../components/dashboard/RiskMeter";
import TrendChart from "../components/dashboard/TrendChart";
// REMOVED: import AICoachingChat from "../components/coaching/AICoachingChat"; // AICoachingChat is now on its own page

export default function ParentDashboard() {
  const [user, setUser] = useState(null);
  const [monitoringData, setMonitoringData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [currentRisk, setCurrentRisk] = useState(0);
  const [coaching, setCoaching] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get user data (demo or real)
      const demoUser = localStorage.getItem('demoUser');
      let currentUser;
      
      if (demoUser) {
        currentUser = JSON.parse(demoUser);
      } else {
        currentUser = await User.me();
      }
      
      setUser(currentUser);

      // Load monitoring data
      const monitoringRecords = await MonitoringData.list('-date');
      setMonitoringData(monitoringRecords);

      // Load alerts
      const alertRecords = await Alert.filter({ parent_id: currentUser.id }, '-created_date');
      setAlerts(alertRecords);

      // Calculate current risk
      if (monitoringRecords.length > 0) {
        const latestData = monitoringRecords[0];
        const riskScore = calculateRiskScore(latestData);
        setCurrentRisk(riskScore.score);

        // Generate AI coaching
        const coachingData = generateParentCoaching(
          riskScore.severity,
          monitoringRecords.slice(0, 7), // Last 7 days
          17 // Child age - could be dynamic
        );
        setCoaching(coachingData);
      }

    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
    setIsLoading(false);
  };

  const markAlertAsRead = async (alertId) => {
    try {
      await Alert.update(alertId, { is_read: true });
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, is_read: true } : alert
      ));
    } catch (error) {
      console.error("Error updating alert:", error);
    }
  };

  const getMetricCards = () => {
    if (monitoringData.length === 0) return [];

    const latest = monitoringData[0];
    const previous = monitoringData[1];

    const metrics = [
      {
        title: "Sleep Quality",
        value: `${latest.sleep_quality}/10`,
        trend: previous ? latest.sleep_quality - previous.sleep_quality : 0,
        icon: Clock,
        color: latest.sleep_quality > 6 ? "text-green-600" : latest.sleep_quality > 3 ? "text-yellow-600" : "text-red-600"
      },
      {
        title: "Social Activity", 
        value: `${latest.social_activity}/10`,
        trend: previous ? latest.social_activity - previous.social_activity : 0,
        icon: Heart,
        color: latest.social_activity > 6 ? "text-green-600" : latest.social_activity > 3 ? "text-yellow-600" : "text-red-600"
      },
      {
        title: "Mood Score",
        value: `${latest.mood_score}/10`,
        trend: previous ? latest.mood_score - previous.mood_score : 0,
        icon: MessageCircle,
        color: latest.mood_score > 6 ? "text-green-600" : latest.mood_score > 3 ? "text-yellow-600" : "text-red-600"
      },
      {
        title: "Screen Time",
        value: `${latest.screen_time_hours}h`,
        trend: previous ? (previous.screen_time_hours - latest.screen_time_hours) : 0, // Inverted - less is better
        icon: Shield,
        color: latest.screen_time_hours < 6 ? "text-green-600" : latest.screen_time_hours < 10 ? "text-yellow-600" : "text-red-600"
      }
    ];

    return metrics;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const metrics = getMetricCards();
  const unreadAlerts = alerts.filter(alert => !alert.is_read);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.full_name || 'Parent'}
            </h1>
            <p className="text-gray-600 mt-1">
              Here's your child's mental health overview
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="relative">
              <Bell className="w-4 h-4 mr-2" />
              Alerts
              {unreadAlerts.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {unreadAlerts.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Alert Banner */}
        {unreadAlerts.length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800 mb-1">
                    {unreadAlerts.length} New Alert{unreadAlerts.length > 1 ? 's' : ''}
                  </h3>
                  <p className="text-red-700 text-sm">
                    {unreadAlerts[0].title} - {unreadAlerts[0].message}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                  onClick={() => markAlertAsRead(unreadAlerts[0].id)}
                >
                  Mark as Read
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* TabsList changed from 3 to 2 columns, 'coaching' tab removed */}
          <TabsList className="grid w-full grid-cols-2"> 
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            {/* REMOVED: AI Coach TabTrigger */}
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alerts
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Risk Meter */}
              <div className="lg:col-span-1">
                <RiskMeter score={currentRisk} className="h-full" />
              </div>

              {/* Metrics Cards */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-2 gap-4 h-full">
                  {metrics.map((metric, index) => (
                    <Card key={index} className="flex flex-col justify-center">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                          <metric.icon className={`w-8 h-8 ${metric.color}`} />
                          <div className="flex items-center gap-1 text-sm">
                            {metric.trend > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : metric.trend < 0 ? (
                              <TrendingDown className="w-4 h-4 text-red-500" />
                            ) : null}
                            {metric.trend !== 0 && (
                              <span className={metric.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                                {Math.abs(metric.trend).toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                        <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
                        <p className={`text-2xl font-bold ${metric.color}`}>{metric.value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Trend Chart */}
            <TrendChart 
              data={monitoringData}
              interventions={[]} // Could add intervention data here
              className="w-full"
            />

            {/* AI Coaching Section (Recommendations and Conversation Starters - still present on dashboard) */}
            {coaching && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recommendations */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-purple-600" />
                      AI Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {coaching.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <p className="text-sm text-gray-700">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Conversation Starters */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                      Conversation Starters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {coaching.conversationStarters.map((starter, index) => (
                        <div key={index} className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-800 italic">"{starter}"</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* REMOVED: AI Coaching Tab content as it's now a dedicated page */}
          {/* <TabsContent value="coaching" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <AICoachingChat 
                  childData={{ 
                    ...user, 
                    risk_level: currentRisk,
                    age: 17 // This could be dynamic
                  }}
                  recentMonitoring={monitoringData.slice(0, 7)}
                  className="h-[600px]"
                />
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Current Risk</span>
                      <Badge variant={currentRisk > 7 ? 'destructive' : currentRisk > 4 ? 'warning' : 'success'}>
                        {currentRisk}/10
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Data Points</span>
                      <span className="text-sm font-medium">{monitoringData.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Alerts</span>
                      <Badge variant={unreadAlerts.length > 0 ? 'destructive' : 'outline'}>
                        {unreadAlerts.length}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Coach Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>• Ask specific questions about your child's situation</p>
                      <p>• Mention concerning behaviors you've noticed</p>
                      <p>• Ask for conversation starters and approaches</p>
                      <p>• Get guidance on when to seek professional help</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent> */}

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6">
            {alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <Card 
                    key={alert.id} 
                    className={`${
                      alert.is_read ? 'bg-gray-50 border-gray-200' : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                            <Badge 
                              variant={
                                alert.severity === 'critical' ? 'destructive' :
                                alert.severity === 'high' ? 'destructive' :
                                alert.severity === 'medium' ? 'warning' : 'default'
                              }
                            >
                              {alert.severity}
                            </Badge>
                            {!alert.is_read && <Badge variant="outline">New</Badge>}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{alert.message}</p>
                          {alert.recommendations && (
                            <p className="text-sm text-purple-700 italic">{alert.recommendations}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(alert.created_date).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {!alert.is_read && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => markAlertAsRead(alert.id)}
                            >
                              Mark Read
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Alerts</h3>
                  <p className="text-gray-600">Everything looks good! No alerts at this time.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
