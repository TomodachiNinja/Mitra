import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { InvokeLLM } from "@/api/integrations";
import { 
  Send, 
  Bot, 
  User as UserIcon, 
  MessageCircle,
  Lightbulb,
  Heart,
  Brain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const suggestedQuestions = [
  "How should I approach my child about their recent mood changes?",
  "What are the warning signs I should watch for?", 
  "How can I create a safe space for my child to open up?",
  "My child seems withdrawn lately, what should I do?",
  "How do I talk about mental health without making them defensive?",
  "What professional resources should I consider?"
];

export default function AICoachingChat({ 
  childData = {}, 
  recentMonitoring = [], 
  className = "" 
}) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage = {
      id: Date.now(),
      message: `Hello! I'm your AI parenting coach specialized in teen mental health. I'm here to help you support your child through their challenges. 

Based on your child's current risk level of ${childData.risk_level || 'N/A'}/10, I can provide personalized guidance on communication strategies, warning signs to watch for, and when to seek professional help.

How can I support you today?`,
      sender: 'ai_coach',
      timestamp: new Date().toISOString(),
      type: 'welcome'
    };
    setMessages([welcomeMessage]);
  }, [childData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const generateContextualPrompt = (userMessage) => {
    const riskLevel = childData.risk_level || 0;
    const childAge = childData.age || 17;
    
    const recentTrends = recentMonitoring.length > 0 ? 
      recentMonitoring.slice(0, 3).map(data => 
        `Date: ${data.date}, Mood: ${data.mood_score}/10, Sleep: ${data.sleep_quality}/10, Social: ${data.social_activity}/10, Stress: ${data.stress_level}/10`
      ).join('\n') : 'No recent data available';

    return `You are an expert AI parenting coach specializing in adolescent mental health. You're helping a parent whose child (age ${childAge}) has a current mental health risk score of ${riskLevel}/10.

Recent monitoring data:
${recentTrends}

Parent's question: "${userMessage}"

Provide compassionate, evidence-based guidance that is:
1. Culturally sensitive for Indian families
2. Age-appropriate for a ${childAge}-year-old
3. Specific to their current risk level (${riskLevel}/10)
4. Practical and actionable
5. Warm but professional

If the risk level is above 7, emphasize immediate professional support. If 4-7, focus on monitoring and gentle intervention. If below 4, focus on maintaining positive patterns.

Keep responses concise (2-3 paragraphs) and include specific conversation starters or actions they can take.`;
  };

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      message: messageText,
      sender: 'parent',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setShowSuggestions(false);
    setIsTyping(true);

    try {
      const response = await InvokeLLM({
        prompt: generateContextualPrompt(messageText),
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string" },
            urgency_level: { type: "string", enum: ["low", "medium", "high"] },
            suggested_actions: { 
              type: "array", 
              items: { type: "string" } 
            },
            conversation_starters: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      const aiMessage = {
        id: Date.now() + 1,
        message: response.response,
        sender: 'ai_coach',
        timestamp: new Date().toISOString(),
        metadata: {
          urgency: response.urgency_level,
          actions: response.suggested_actions || [],
          starters: response.conversation_starters || []
        }
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      
      const fallbackMessage = {
        id: Date.now() + 1,
        message: "I apologize, but I'm having trouble connecting right now. Please try again in a moment. If this is urgent, consider reaching out to a mental health professional or calling a crisis helpline.",
        sender: 'ai_coach',
        timestamp: new Date().toISOString(),
        type: 'error'
      };

      setMessages(prev => [...prev, fallbackMessage]);
    }

    setIsTyping(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  return (
    <Card className={`${className} flex flex-col h-full max-h-[600px]`}>
      <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">AI Parenting Coach</h3>
            <p className="text-sm text-gray-500">Specialized in teen mental health</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.sender === 'parent' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[85%] ${message.sender === 'parent' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'parent' 
                      ? 'bg-blue-500' 
                      : 'bg-purple-500'
                  }`}>
                    {message.sender === 'parent' ? (
                      <UserIcon className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>

                  {/* Message bubble */}
                  <div className={`rounded-2xl px-4 py-3 ${
                    message.sender === 'parent'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
                    
                    {/* Metadata for AI responses */}
                    {message.metadata && (
                      <div className="mt-3 space-y-2">
                        {message.metadata.urgency && (
                          <Badge className={`text-xs ${getUrgencyColor(message.metadata.urgency)}`}>
                            {message.metadata.urgency} priority
                          </Badge>
                        )}
                        
                        {message.metadata.actions && message.metadata.actions.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium opacity-80 mb-1">Suggested Actions:</p>
                            <ul className="text-xs opacity-75 space-y-1">
                              {message.metadata.actions.map((action, idx) => (
                                <li key={idx} className="flex items-start gap-1">
                                  <span>•</span>
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {message.metadata.starters && message.metadata.starters.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium opacity-80 mb-1">Conversation Starters:</p>
                            <ul className="text-xs opacity-75 space-y-1">
                              {message.metadata.starters.map((starter, idx) => (
                                <li key={idx} className="italic">"{starter}"</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <p className={`text-xs mt-2 opacity-70 ${
                      message.sender === 'parent' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
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

        {/* Suggested questions */}
        {showSuggestions && messages.length <= 1 && (
          <div className="border-t bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-700 mb-3">Common questions parents ask:</p>
            <div className="grid grid-cols-1 gap-2">
              {suggestedQuestions.slice(0, 3).map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(question)}
                  className="text-left p-2 text-sm bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors duration-200"
                  disabled={isTyping}
                >
                  <Lightbulb className="w-3 h-3 inline mr-2 text-blue-500" />
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="border-t p-4 bg-white rounded-b-lg">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about supporting your child's mental health..."
                className="resize-none"
                disabled={isTyping}
              />
            </div>
            
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick tips */}
          <div className="mt-2 text-xs text-gray-500">
            <Heart className="w-3 h-3 inline mr-1" />
            I provide evidence-based guidance tailored to your child's current risk level and age.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}