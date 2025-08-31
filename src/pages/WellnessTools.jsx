import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Wind, 
  Brain, 
  Heart,
  Timer,
  Volume2,
  VolumeX
} from "lucide-react";

export default function WellnessTools() {
  const [activeExercise, setActiveExercise] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('inhale'); // inhale, hold, exhale
  const [breathingTimer, setBreathingTimer] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const exercises = [
    {
      id: 'breathing',
      title: '4-7-8 Breathing',
      description: 'A powerful technique to reduce anxiety and promote calm',
      duration: '4 minutes',
      icon: Wind,
      color: 'from-blue-500 to-cyan-500',
      instructions: [
        'Inhale through your nose for 4 counts',
        'Hold your breath for 7 counts',
        'Exhale through your mouth for 8 counts',
        'Repeat this cycle 4 times'
      ]
    },
    {
      id: 'grounding',
      title: '5-4-3-2-1 Grounding',
      description: 'Ground yourself in the present moment',
      duration: '5 minutes',
      icon: Brain,
      color: 'from-green-500 to-emerald-500',
      instructions: [
        'Name 5 things you can see',
        'Name 4 things you can touch',
        'Name 3 things you can hear',
        'Name 2 things you can smell',
        'Name 1 thing you can taste'
      ]
    },
    {
      id: 'meditation',
      title: 'Mindful Meditation',
      description: 'Focus on your breath and present moment awareness',
      duration: '10 minutes',
      icon: Heart,
      color: 'from-purple-500 to-pink-500',
      instructions: [
        'Sit comfortably with your back straight',
        'Close your eyes and focus on your breathing',
        'When thoughts arise, gently return focus to breath',
        'Continue for the full duration'
      ]
    }
  ];

  React.useEffect(() => {
    let interval = null;

    if (isActive && activeExercise === 'breathing') {
      interval = setInterval(() => {
        setBreathingTimer(timer => {
          if (breathingPhase === 'inhale' && timer >= 4) {
            setBreathingPhase('hold');
            return 0;
          } else if (breathingPhase === 'hold' && timer >= 7) {
            setBreathingPhase('exhale');
            return 0;
          } else if (breathingPhase === 'exhale' && timer >= 8) {
            setBreathingPhase('inhale');
            return 0;
          }
          return timer + 1;
        });
      }, 1000);
    } else if (isActive) {
      interval = setInterval(() => {
        setTimer(timer => timer + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, activeExercise, breathingPhase]);

  const startExercise = (exerciseId) => {
    setActiveExercise(exerciseId);
    setTimer(0);
    setBreathingTimer(0);
    setBreathingPhase('inhale');
    setIsActive(true);
  };

  const pauseExercise = () => {
    setIsActive(!isActive);
  };

  const stopExercise = () => {
    setActiveExercise(null);
    setIsActive(false);
    setTimer(0);
    setBreathingTimer(0);
    setBreathingPhase('inhale');
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getBreathingInstruction = () => {
    switch (breathingPhase) {
      case 'inhale':
        return `Breathe in... ${breathingTimer}/4`;
      case 'hold':
        return `Hold... ${breathingTimer}/7`;
      case 'exhale':
        return `Breathe out... ${breathingTimer}/8`;
      default:
        return 'Ready to begin';
    }
  };

  const getBreathingCircleScale = () => {
    if (breathingPhase === 'inhale') {
      return 1 + (breathingTimer / 4) * 0.5; // Grows from 1 to 1.5
    } else if (breathingPhase === 'exhale') {
      return 1.5 - (breathingTimer / 8) * 0.5; // Shrinks from 1.5 to 1
    }
    return 1.5; // Hold phase
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Wellness Tools
          </h1>
          <p className="text-gray-600">
            Practical exercises to help manage stress, anxiety, and improve your mental well-being
          </p>
        </div>

        {/* Active Exercise */}
        {activeExercise && (
          <Card className="mb-8 shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {exercises.find(ex => ex.id === activeExercise)?.title}
              </CardTitle>
              <div className="flex items-center justify-center gap-4 mt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {formatTime(timer)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              {activeExercise === 'breathing' && (
                <div className="space-y-8">
                  {/* Breathing Circle */}
                  <div className="flex justify-center">
                    <div 
                      className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 flex items-center justify-center transition-transform duration-1000 ease-in-out"
                      style={{ 
                        transform: `scale(${getBreathingCircleScale()})`,
                        boxShadow: '0 0 30px rgba(59, 130, 246, 0.5)'
                      }}
                    >
                      <Wind className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  
                  {/* Instructions */}
                  <div className="text-2xl font-semibold text-gray-700">
                    {getBreathingInstruction()}
                  </div>
                </div>
              )}

              {activeExercise === 'grounding' && (
                <div className="space-y-6">
                  <div className="text-xl text-gray-700">
                    Take your time with each step. Focus on the present moment.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {['See (5)', 'Touch (4)', 'Hear (3)', 'Smell (2)', 'Taste (1)'].map((step, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                        <div className="font-semibold text-green-800">{step}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeExercise === 'meditation' && (
                <div className="space-y-6">
                  <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center animate-pulse">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xl text-gray-700">
                    Focus on your breath. Let thoughts come and go without judgment.
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex justify-center gap-4 mt-8">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={pauseExercise}
                >
                  {isActive ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                  {isActive ? 'Pause' : 'Resume'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={stopExercise}
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Stop
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exercise Selection */}
        {!activeExercise && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {exercises.map((exercise) => (
              <Card key={exercise.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${exercise.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <exercise.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{exercise.title}</CardTitle>
                  <p className="text-gray-600">{exercise.description}</p>
                  <Badge variant="outline" className="w-fit mx-auto mt-2">
                    <Timer className="w-3 h-3 mr-1" />
                    {exercise.duration}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-6">
                    <h4 className="font-semibold text-gray-900">How it works:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {exercise.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                          {instruction}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button 
                    className={`w-full bg-gradient-to-r ${exercise.color} hover:opacity-90 transition-opacity`}
                    onClick={() => startExercise(exercise.id)}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Exercise
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tips Section */}
        {!activeExercise && (
          <Card className="mt-8 border-0 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-purple-600" />
                Wellness Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-purple-800 mb-2">When to use these tools:</h3>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• When feeling anxious or overwhelmed</li>
                    <li>• Before stressful events (exams, presentations)</li>
                    <li>• When having trouble sleeping</li>
                    <li>• During panic or anxiety attacks</li>
                    <li>• As part of your daily wellness routine</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-purple-800 mb-2">Tips for success:</h3>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Find a quiet, comfortable space</li>
                    <li>• Practice regularly for best results</li>
                    <li>• Don't judge yourself - it takes time</li>
                    <li>• Use headphones for guided exercises</li>
                    <li>• Start with shorter sessions if needed</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}