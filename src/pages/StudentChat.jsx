
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { ChatMessage } from "@/api/entities";
import { Alert } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { generateChatResponse, detectCrisisKeywords } from "@/components/utils/aiHelpers";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

import ChatInterface from "../components/chat/ChatInterface";

export default function StudentChatPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChatData();
  }, []);

  const loadChatData = async () => {
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

      // Load existing chat messages
      const chatHistory = await ChatMessage.filter(
        { student_id: currentUser.id }, 
        '-created_date'
      );
      
      setMessages(chatHistory.reverse()); // Reverse to show chronologically

      // Add welcome message if no chat history
      if (chatHistory.length === 0) {
        const welcomeMessage = {
          message: generateWelcomeMessage(currentUser.age || 17),
          sender: 'ai_therapist',
          created_date: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
      }

    } catch (error) {
      console.error("Error loading chat:", error);
    }
    setIsLoading(false);
  };

  const generateWelcomeMessage = (age) => {
    const isGenZ = age <= 20;
    
    if (isGenZ) {
      return "Hey! I'm your AI therapist, and I'm genuinely here for you 24/7. This is a safe space where you can share anything on your mind - no judgment, just support. How are you feeling today?";
    } else {
      return "Hello! I'm here as your AI therapist and support system. This is a confidential space where you can share your thoughts and feelings freely. I'm here to listen and help however I can. How are you doing today?";
    }
  };

  const handleSendMessage = async (messageText) => {
    try {
      // Add user message immediately
      const userMessage = {
        message: messageText,
        sender: 'student',
        student_id: user.id,
        created_date: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMessage]);

      // Save user message to database
      await ChatMessage.create({
        student_id: user.id,
        message: messageText,
        sender: 'student',
        ...detectCrisisKeywords(messageText)
      });

      // Show typing indicator
      setIsTyping(true);

      // Generate AI response
      let aiResponse;
      try {
        // Try using the AI integration for more sophisticated responses
        const llmResponse = await InvokeLLM({
          prompt: `You are a compassionate AI therapist chatting with a ${user.age || 17}-year-old student. 
          Previous context: ${messages.slice(-3).map(m => `${m.sender}: ${m.message}`).join('\n')}
          
          Student just said: "${messageText}"
          
          Respond with empathy and age-appropriate language. If this message contains crisis keywords like suicide, self-harm, etc., prioritize safety and offer immediate support resources. Keep responses conversational and supportive, around 1-2 sentences.`,
          response_json_schema: {
            type: "object",
            properties: {
              response: { type: "string" },
              crisis_detected: { type: "boolean" },
              recommended_action: { type: "string" }
            }
          }
        });

        aiResponse = llmResponse.response;
      } catch (error) {
        // Fallback to local generation
        aiResponse = generateChatResponse(messageText, user.age, messages);
      }

      // Simulate realistic typing delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      const botMessage = {
        message: aiResponse,
        sender: 'ai_therapist',
        created_date: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);

      // Save AI response to database
      await ChatMessage.create({
        student_id: user.id,
        message: aiResponse,
        sender: 'ai_therapist'
      });

      // Check for crisis and create alert if needed
      const crisisCheck = detectCrisisKeywords(messageText);
      if (crisisCheck.isCrisis && user.parent_id) {
        await Alert.create({
          student_id: user.id,
          parent_id: user.parent_id,
          alert_type: 'crisis',
          severity: 'critical',
          title: 'Crisis Keywords Detected',
          message: 'Your child has used concerning language in their chat. Immediate attention may be needed.',
          recommendations: 'Approach with care and compassion. Consider professional support immediately.'
        });
      }

    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
    }
  };

  const handleMoodSelect = async (mood) => {
    try {
      // Create a mood tracking message
      const moodMessage = `I'm feeling ${mood.label.toLowerCase()} right now ${mood.emoji}`;
      await handleSendMessage(moodMessage);
    } catch (error) {
      console.error("Error tracking mood:", error);
    }
  };

  const handleEmergency = () => {
    navigate(createPageUrl("Crisis"));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Your AI Therapist
          </h1>
          <p className="text-gray-600">
            A safe, private space to share your thoughts and feelings
          </p>
        </div>

        {/* Chat Interface */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            onMoodSelect={handleMoodSelect}
            onEmergency={handleEmergency}
            isTyping={isTyping}
            className="h-[600px]"
          />
        </div>

        {/* Support Resources */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">🛡️</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Confidential</h3>
            <p className="text-sm text-gray-600">Your conversations are private and secure</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">⏰</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">24/7 Available</h3>
            <p className="text-sm text-gray-600">I'm here whenever you need support</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">💜</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">No Judgment</h3>
            <p className="text-sm text-gray-600">Share freely without fear of criticism</p>
          </div>
        </div>
      </div>
    </div>
  );
}
