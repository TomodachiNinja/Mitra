import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { MonitoringData } from "@/api/entities";
import { calculateRiskScore } from "@/components/utils/aiHelpers";
import AICoachingChat from "../components/coaching/AICoachingChat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AICoachingPage() {
  const [user, setUser] = useState(null);
  const [monitoringData, setMonitoringData] = useState([]);
  const [currentRisk, setCurrentRisk] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCoachingData();
  }, []);

  const loadCoachingData = async () => {
    try {
      const demoUser = localStorage.getItem('demoUser');
      let currentUser;
      
      if (demoUser) {
        currentUser = JSON.parse(demoUser);
      } else {
        currentUser = await User.me();
      }
      
      setUser(currentUser);

      const monitoringRecords = await MonitoringData.list('-date');
      setMonitoringData(monitoringRecords);

      if (monitoringRecords.length > 0) {
        const latestData = monitoringRecords[0];
        const riskScore = calculateRiskScore(latestData);
        setCurrentRisk(riskScore.score);
      }
    } catch (error) {
      console.error("Error loading coaching data:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading AI Coach...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              AI Parenting Coach
            </h1>
            <p className="text-gray-600 mt-1">
              Personalized guidance to help you support your child's mental health
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <AICoachingChat 
              childData={{ 
                ...user, 
                risk_level: currentRisk,
                age: user?.age || 17 // Pass age dynamically
              }}
              recentMonitoring={monitoringData.slice(0, 7)}
              className="h-[70vh] max-h-[800px]"
            />
          </div>
          
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Child's Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Risk</span>
                  <Badge variant={currentRisk > 7 ? 'destructive' : currentRisk > 4 ? 'warning' : 'success'}>
                    {currentRisk}/10
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Data Points (30 days)</span>
                  <span className="text-sm font-medium">{monitoringData.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Child's Age</span>
                  <span className="text-sm font-medium">{user?.age || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Coach Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>• Ask specific questions about your child's situation.</p>
                  <p>• Mention concerning behaviors you've noticed recently.</p>
                  <p>• Ask for conversation starters and effective approaches.</p>
                  <p>• Get guidance on when to seek professional help.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}