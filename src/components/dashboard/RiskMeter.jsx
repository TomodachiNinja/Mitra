import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, CheckCircle } from "lucide-react";

export default function RiskMeter({ score = 0, className = "" }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = (value) => {
    if (value <= 3) return { color: '#22c55e', bg: 'bg-green-100', text: 'text-green-800', zone: 'Safe' };
    if (value <= 6) return { color: '#f59e0b', bg: 'bg-yellow-100', text: 'text-yellow-800', zone: 'Moderate' };
    return { color: '#ef4444', bg: 'bg-red-100', text: 'text-red-800', zone: 'High Risk' };
  };

  const { color, bg, text, zone } = getColor(animatedScore);
  const angle = (animatedScore / 10) * 180 - 90; // Convert to degrees for semicircle

  const getIcon = () => {
    if (animatedScore <= 3) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (animatedScore <= 6) return <Shield className="w-5 h-5 text-yellow-600" />;
    return <AlertTriangle className="w-5 h-5 text-red-600" />;
  };

  return (
    <Card className={`${className} overflow-hidden`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>Risk Level</span>
          <Badge className={`${bg} ${text} border-0`}>
            {getIcon()}
            {zone}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-8">
        <div className="relative flex flex-col items-center">
          {/* Semicircular gauge background */}
          <div className="relative w-48 h-24 mb-6">
            <svg 
              width="192" 
              height="96" 
              viewBox="0 0 192 96" 
              className="absolute inset-0"
            >
              {/* Background arc */}
              <path
                d="M 16 80 A 80 80 0 0 1 176 80"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
                strokeLinecap="round"
              />
              
              {/* Color zones */}
              {/* Green zone (7-10) */}
              <path
                d="M 16 80 A 80 80 0 0 1 69.28 21.44"
                fill="none"
                stroke="#22c55e"
                strokeWidth="12"
                strokeLinecap="round"
                opacity="0.3"
              />
              
              {/* Yellow zone (4-6) */}
              <path
                d="M 69.28 21.44 A 80 80 0 0 1 122.72 21.44"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="12"
                strokeLinecap="round"
                opacity="0.3"
              />
              
              {/* Red zone (0-3) */}
              <path
                d="M 122.72 21.44 A 80 80 0 0 1 176 80"
                fill="none"
                stroke="#ef4444"
                strokeWidth="12"
                strokeLinecap="round"
                opacity="0.3"
              />
              
              {/* Active arc showing current score */}
              <path
                d={`M 16 80 A 80 80 0 0 1 ${96 + 80 * Math.cos((angle + 90) * Math.PI / 180)} ${80 + 80 * Math.sin((angle + 90) * Math.PI / 180)}`}
                fill="none"
                stroke={color}
                strokeWidth="12"
                strokeLinecap="round"
                style={{
                  transition: 'all 1s ease-in-out',
                  filter: 'drop-shadow(0 0 8px rgba(0,0,0,0.2))'
                }}
              />
              
              {/* Needle */}
              <g transform={`translate(96, 80) rotate(${angle})`}>
                <line
                  x1="0"
                  y1="0"
                  x2="-70"
                  y2="0"
                  stroke={color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  style={{
                    transition: 'all 1s ease-in-out',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}
                />
                <circle
                  cx="0"
                  cy="0"
                  r="6"
                  fill={color}
                  style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                  }}
                />
              </g>
            </svg>
          </div>

          {/* Score display */}
          <div className="text-center">
            <div 
              className="text-4xl font-bold mb-2"
              style={{ 
                color,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.5s ease'
              }}
            >
              {animatedScore.toFixed(1)}
            </div>
            <div className="text-gray-500 text-sm font-medium">
              out of 10
            </div>
          </div>

          {/* Scale labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 px-4">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        {/* Risk interpretation */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start gap-3">
            {getIcon()}
            <div>
              <p className="font-medium text-gray-900 mb-1">
                {zone} Level
              </p>
              <p className="text-sm text-gray-600">
                {animatedScore <= 3 && "Mental health indicators are positive. Continue monitoring."}
                {animatedScore > 3 && animatedScore <= 6 && "Some concerning patterns detected. Consider gentle check-ins."}
                {animatedScore > 6 && "Immediate attention recommended. Professional support may be beneficial."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}