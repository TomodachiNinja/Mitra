import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Send, 
  Phone, 
  Smile,
  MessageCircle,
  Bot,
  User as UserIcon,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const moods = [
  { emoji: "😊", label: "Happy", value: 8 },
  { emoji: "😐", label: "Neutral", value: 5 },
  { emoji: "😔", label: "Sad", value: 2 },
  { emoji: "😰", label: "Anxious", value: 1 },
  { emoji: "😡", label: "Angry", value: 3 }
];

export default function ChatInterface({ 
  messages = [], 
  onSendMessage, 
  onMoodSelect,
  onEmergency,
  isTyping = false,
  className = ""
}) {
  const [inputMessage, setInputMessage] = useState("");
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = () => {
    if (inputMessage.trim() && onSendMessage) {
      onSendMessage(inputMessage.trim());
      setInputMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleMoodClick = (mood) => {
    setSelectedMood(mood);
    if (onMoodSelect) {
      onMoodSelect(mood);
    }
    setShowMoodSelector(false);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const detectCrisisMessage = (message) => {
    const crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'want to die', 
      'self harm', 'hurt myself', 'no point', 'give up'
    ];
    return crisisKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  };

  return (
    <Card className={`${className} flex flex-col h-full max-h-[600px]`}>
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">AI Therapist</h3>
              <p className="text-sm text-gray-500">Always here to listen</p>
            </div>
          </div>
          
          {/* Emergency button */}
          <Button
            variant="destructive"
            size="sm"
            onClick={onEmergency}
            className="bg-red-500 hover:bg-red-600 animate-pulse"
          >
            <Phone className="w-4 h-4 mr-1" />
            Emergency
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.sender === 'student' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[80%] ${message.sender === 'student' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'student' 
                      ? 'bg-blue-500' 
                      : 'bg-purple-500'
                  }`}>
                    {message.sender === 'student' ? (
                      <UserIcon className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message bubble */}
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.sender === 'student'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.message}</p>
                    
                    {/* Crisis warning */}
                    {message.crisis_flag && (
                      <div className="mt-2 flex items-center gap-1 text-red-200">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="text-xs">Crisis detected</span>
                      </div>
                    )}
                    
                    <p className={`text-xs mt-1 opacity-70 ${
                      message.sender === 'student' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.created_date || Date.now())}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-2 max-w-[80%]">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Mood selector */}
        <AnimatePresence>
          {showMoodSelector && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t bg-gray-50 p-4"
            >
              <p className="text-sm font-medium text-gray-700 mb-3">How are you feeling right now?</p>
              <div className="flex gap-2 justify-center">
                {moods.map((mood, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="flex flex-col items-center p-3 h-auto hover:bg-purple-50"
                    onClick={() => handleMoodClick(mood)}
                  >
                    <span className="text-2xl mb-1">{mood.emoji}</span>
                    <span className="text-xs">{mood.label}</span>
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input area */}
        <div className="border-t p-4 bg-white rounded-b-lg">
          <div className="flex gap-2 items-end">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowMoodSelector(!showMoodSelector)}
              className="flex-shrink-0"
            >
              <Smile className="w-4 h-4" />
            </Button>
            
            <div className="flex-1">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="resize-none"
              />
            </div>
            
            <Button
              onClick={handleSend}
              disabled={!inputMessage.trim()}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Current mood display */}
          {selectedMood && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-gray-500">Current mood:</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <span>{selectedMood.emoji}</span>
                <span className="text-xs">{selectedMood.label}</span>
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}