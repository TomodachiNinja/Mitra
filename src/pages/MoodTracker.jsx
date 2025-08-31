
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { MonitoringData } from "@/api/entities";
import { calculateRiskScore } from "@/components/utils/aiHelpers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Moon, 
  Users, 
  Smartphone, 
  Zap,
  Save,
  Calendar,
  TrendingUp,
  Smile
} from "lucide-react";
import { format } from "date-fns";

const moodEmojis = [
  { emoji: "😢", label: "Very Sad", value: 1 },
  { emoji: "😔", label: "Sad", value: 2 },
  { emoji: "😕", label: "Unhappy", value: 3 },
  { emoji: "😐", label: "Neutral", value: 4 },
  { emoji: "🙂", label: "Okay", value: 5 },
  { emoji: "😊", label: "Happy", value: 6 },
  { emoji: "😄", label: "Very Happy", value: 7 },
  { emoji: "😁", label: "Excited", value: 8 },
  { emoji: "🤩", label: "Amazing", value: 9 },
  { emoji: "🥰", label: "Blissful", value: 10 }
];

export default function MoodTracker() {
  const [user, setUser] = useState(null);
  const [todayData, setTodayData] = useState({
    sleep_quality: 5,
    social_activity: 5,
    mood_score: 5,
    screen_time_hours: 6,
    stress_level: 5,
    notes: ""
  });
  const [recentEntries, setRecentEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadMoodData();
  }, []);

  const loadMoodData = async () => {
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

      // Load recent mood entries
      const entries = await MonitoringData.filter(
        { student_id: currentUser.id },
        '-date',
        10
      );
      setRecentEntries(entries);

      // Check if there's already an entry for today
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayEntry = entries.find(entry => entry.date === today);
      if (todayEntry) {
        setTodayData({
          sleep_quality: todayEntry.sleep_quality || 5,
          social_activity: todayEntry.social_activity || 5,
          mood_score: todayEntry.mood_score || 5,
          screen_time_hours: todayEntry.screen_time_hours || 6,
          stress_level: todayEntry.stress_level || 5,
          notes: todayEntry.notes || ""
        });
      }

    } catch (error) {
      console.error("Error loading mood data:", error);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const riskScore = calculateRiskScore(todayData);

      const entryData = {
        student_id: user.id,
        date: today,
        ...todayData,
        overall_risk: riskScore.score
      };

      // Check if entry exists for today
      const existingEntry = recentEntries.find(entry => entry.date === today);
      
      if (existingEntry) {
        await MonitoringData.update(existingEntry.id, entryData);
      } else {
        await MonitoringData.create(entryData);
      }

      // Reload data
      await loadMoodData();

      // Success feedback could be added here

    } catch (error) {
      console.error("Error saving mood data:", error);
    }
    setIsSaving(false);
  };

  const getMoodEmoji = (score) => {
    const mood = moodEmojis.find(m => m.value === Math.round(score));
    return mood ? mood.emoji : "😐";
  };

  const getScoreColor = (score, inverted = false) => {
    const effectiveScore = inverted ? (10 - score) : score;
    if (effectiveScore >= 7) return "text-green-600";
    if (effectiveScore >= 4) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading mood tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Daily Mood Check-in
          </h1>
          <p className="text-gray-600">
            Track how you're feeling to help us understand your mental health patterns
          </p>
        </div>

        {/* Today's Entry */}
        <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Today's Check-in - {format(new Date(), 'EEEE, MMMM d')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Sleep Quality */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-lg font-semibold">
                  <Moon className="w-5 h-5 text-blue-600" />
                  Sleep Quality
                </Label>
                <div className="px-4">
                  <Slider
                    value={[todayData.sleep_quality]}
                    onValueChange={([value]) => setTodayData(prev => ({ ...prev, sleep_quality: value }))}
                    max={10}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>Poor</span>
                    <span className={`font-semibold ${getScoreColor(todayData.sleep_quality)}`}>
                      {todayData.sleep_quality}/10
                    </span>
                    <span>Excellent</span>
                  </div>
                </div>
              </div>

              {/* Social Activity */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-lg font-semibold">
                  <Users className="w-5 h-5 text-green-600" />
                  Social Activity
                </Label>
                <div className="px-4">
                  <Slider
                    value={[todayData.social_activity]}
                    onValueChange={([value]) => setTodayData(prev => ({ ...prev, social_activity: value }))}
                    max={10}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>Isolated</span>
                    <span className={`font-semibold ${getScoreColor(todayData.social_activity)}`}>
                      {todayData.social_activity}/10
                    </span>
                    <span>Very Social</span>
                  </div>
                </div>
              </div>

              {/* Mood Score */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-lg font-semibold">
                  <Heart className="w-5 h-5 text-pink-600" />
                  Overall Mood
                </Label>
                <div className="px-4">
                  <Slider
                    value={[todayData.mood_score]}
                    onValueChange={([value]) => setTodayData(prev => ({ ...prev, mood_score: value }))}
                    max={10}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>Very Low</span>
                    <span className={`font-semibold ${getScoreColor(todayData.mood_score)} text-2xl`}>
                      {getMoodEmoji(todayData.mood_score)} {todayData.mood_score}/10
                    </span>
                    <span>Amazing</span>
                  </div>
                </div>
              </div>

              {/* Screen Time */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-lg font-semibold">
                  <Smartphone className="w-5 h-5 text-orange-600" />
                  Screen Time Today
                </Label>
                <div className="px-4">
                  <Slider
                    value={[todayData.screen_time_hours]}
                    onValueChange={([value]) => setTodayData(prev => ({ ...prev, screen_time_hours: value }))}
                    max={16}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>0 hours</span>
                    <span className={`font-semibold ${getScoreColor(todayData.screen_time_hours, true)}`}>
                      {todayData.screen_time_hours} hours
                    </span>
                    <span>16+ hours</span>
                  </div>
                </div>
              </div>

              {/* Stress Level */}
              <div className="space-y-3 md:col-span-2">
                <Label className="flex items-center gap-2 text-lg font-semibold">
                  <Zap className="w-5 h-5 text-red-600" />
                  Stress Level
                </Label>
                <div className="px-4">
                  <Slider
                    value={[todayData.stress_level]}
                    onValueChange={([value]) => setTodayData(prev => ({ ...prev, stress_level: value }))}
                    max={10}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>Very Calm</span>
                    <span className={`font-semibold ${getScoreColor(todayData.stress_level, true)}`}>
                      {todayData.stress_level}/10
                    </span>
                    <span>Extremely Stressed</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-3 md:col-span-2">
                <Label className="text-lg font-semibold">Additional Notes (Optional)</Label>
                <Textarea
                  value={todayData.notes}
                  onChange={(e) => setTodayData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="How are you feeling today? Any specific events or thoughts you'd like to note?"
                  className="min-h-[100px]"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 text-center">
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-3 text-lg"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Today's Entry
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Entries */}
        {recentEntries.length > 0 && (
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Recent Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEntries.slice(0, 7).map((entry, index) => (
                  <div key={entry.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-gray-600">
                        {format(new Date(entry.date), 'MMM d')}
                      </span>
                      <span className="text-2xl">{getMoodEmoji(entry.mood_score)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-xs">
                        Sleep: {entry.sleep_quality}/10
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Social: {entry.social_activity}/10
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Mood: {entry.mood_score}/10
                      </Badge>
                      <Badge 
                        className={`text-xs ${
                          entry.overall_risk > 6 ? 'bg-red-100 text-red-800' :
                          entry.overall_risk > 3 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}
                      >
                        Risk: {entry.overall_risk}/10
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
