// Risk Score Calculation
export const calculateRiskScore = (data) => {
  const weights = {
    sleep_quality: 0.25,
    social_activity: 0.20,
    mood_score: 0.25,
    screen_time: 0.15,
    stress_level: 0.15
  };

  // Convert screen time to score (inverse - more screen time = lower score)
  const screenTimeScore = Math.max(0, 10 - (data.screen_time_hours / 2));

  // Invert stress level (high stress = low score)
  const stressScore = 10 - (data.stress_level || 0);

  const rawScore = 
    (data.sleep_quality || 0) * weights.sleep_quality +
    (data.social_activity || 0) * weights.social_activity +
    (data.mood_score || 0) * weights.mood_score +
    screenTimeScore * weights.screen_time +
    stressScore * weights.stress_level;

  // Invert final score so higher risk = higher number
  const riskScore = Math.max(0, Math.min(10, 10 - rawScore));

  return {
    score: Number(riskScore.toFixed(1)),
    severity: getSeverityLevel(riskScore)
  };
};

export const getSeverityLevel = (score) => {
  if (score <= 3) return 'low';
  if (score <= 6) return 'moderate';
  return 'high';
};

// Crisis Detection
export const detectCrisisKeywords = (message) => {
  const crisisKeywords = [
    'suicide', 'kill myself', 'end it all', 'want to die', 'better off dead',
    'self harm', 'hurt myself', 'cut myself', 'harm myself',
    'no point living', 'give up on life', 'end the pain', 'cant go on',
    'worthless', 'hopeless', 'no one cares', 'better without me'
  ];

  const messageLower = message.toLowerCase();
  const detectedKeywords = crisisKeywords.filter(keyword => 
    messageLower.includes(keyword)
  );

  return {
    isCrisis: detectedKeywords.length > 0,
    keywords: detectedKeywords,
    severity: detectedKeywords.length > 2 ? 'high' : detectedKeywords.length > 0 ? 'medium' : 'low'
  };
};

// AI Chat Response Generation
export const generateChatResponse = (message, userAge = 17, previousMessages = []) => {
  const isGenZ = userAge <= 20;
  const crisisDetection = detectCrisisKeywords(message);

  if (crisisDetection.isCrisis) {
    return generateCrisisResponse(isGenZ);
  }

  // Analyze sentiment and context
  const sentiment = analyzeSentiment(message);
  const topics = extractTopics(message);

  if (sentiment === 'negative') {
    return generateSupportiveResponse(topics, isGenZ);
  } else if (sentiment === 'neutral') {
    return generateEngagingResponse(topics, isGenZ);
  } else {
    return generatePositiveResponse(topics, isGenZ);
  }
};

const generateCrisisResponse = (isGenZ) => {
  const responses = isGenZ ? [
    "I'm really worried about you right now, and I want you to know that you matter so much. These feelings are temporary, even though they feel overwhelming. Can we talk about getting you some immediate support?",
    "Hey, I hear you're in a really dark place right now. That takes courage to share. You're not alone in this - there are people who want to help. Let's get you connected with someone right now.",
    "What you're feeling is valid, but I'm concerned about your safety. You deserve support and care. Can we reach out to someone together? You don't have to handle this alone."
  ] : [
    "I'm very concerned about what you're sharing with me. These thoughts and feelings are serious, and I want to help you get proper support right away.",
    "Thank you for trusting me with these difficult thoughts. This isn't something you should face alone. Let's connect you with professional help immediately.",
    "I can hear how much pain you're in right now. These feelings are a sign that you need and deserve professional support. Let's get you help right away."
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};

const generateSupportiveResponse = (topics, isGenZ) => {
  if (topics.includes('school') || topics.includes('study') || topics.includes('exam')) {
    return isGenZ ? 
      "School stress hits different, I get it. That pressure can feel overwhelming. Want to talk about what's making it hardest right now? Sometimes breaking it down helps." :
      "Academic pressure can be really overwhelming. It sounds like you're dealing with a lot. Can you tell me more about what's making school feel so stressful?";
  }

  if (topics.includes('friend') || topics.includes('social')) {
    return isGenZ ?
      "Friend drama and social stuff can be so draining. It's rough when the people who should support you aren't there. You want to talk about what's going on?" :
      "Social relationships can be really challenging, especially when you're already feeling overwhelmed. It sounds like you're dealing with some difficult situations with friends.";
  }

  if (topics.includes('family') || topics.includes('parent')) {
    return isGenZ ?
      "Family stuff is complicated, especially when it feels like they don't understand what you're going through. That disconnect can be really lonely." :
      "Family relationships can be challenging, particularly when you feel misunderstood. It can be isolating when those closest to you don't seem to understand your experience.";
  }

  return isGenZ ?
    "That sounds really tough, and your feelings are completely valid. You don't have to carry this alone. What's been the hardest part?" :
    "It sounds like you're going through a difficult time. Your feelings are important and valid. Would you like to talk more about what's been most challenging?";
};

const generateEngagingResponse = (topics, isGenZ) => {
  const responses = isGenZ ? [
    "I hear you. Sometimes it helps just to talk through what's on your mind. What's been taking up most of your headspace lately?",
    "Thanks for sharing that with me. It sounds like there's a lot going on. Want to dig deeper into any of it?",
    "I'm listening. Sometimes just getting thoughts out can help clarify things. What feels most important to talk about right now?"
  ] : [
    "Thank you for sharing that with me. It sounds like you have a lot on your mind. What would be most helpful to explore together?",
    "I appreciate you opening up. Sometimes talking through our thoughts can help us process things better. What's been on your mind most lately?",
    "It sounds like you're processing quite a bit. I'm here to listen and support you. What feels most pressing to discuss?"
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};

const generatePositiveResponse = (topics, isGenZ) => {
  const responses = isGenZ ? [
    "That's awesome to hear! It's great when things are going well. What's been helping you feel good lately?",
    "Love that energy! It's so important to appreciate the good moments. What's been the highlight recently?",
    "That's really great! Those positive moments matter a lot. Want to tell me more about what's been going well?"
  ] : [
    "It's wonderful to hear that you're feeling positive. These moments are so important. What's been contributing to your good mood?",
    "That's really encouraging to hear. It's great when we can recognize and appreciate positive experiences. What's been going particularly well?",
    "I'm glad you're feeling good. Positive experiences are worth celebrating. What has been most meaningful to you lately?"
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};

const analyzeSentiment = (message) => {
  const positiveWords = ['good', 'great', 'happy', 'excited', 'love', 'awesome', 'amazing', 'better'];
  const negativeWords = ['sad', 'depressed', 'anxious', 'worried', 'scared', 'angry', 'frustrated', 'tired', 'stressed', 'overwhelmed'];

  const messageLower = message.toLowerCase();
  const positiveCount = positiveWords.filter(word => messageLower.includes(word)).length;
  const negativeCount = negativeWords.filter(word => messageLower.includes(word)).length;

  if (negativeCount > positiveCount) return 'negative';
  if (positiveCount > negativeCount) return 'positive';
  return 'neutral';
};

const extractTopics = (message) => {
  const topicMap = {
    'school': ['school', 'class', 'teacher', 'homework', 'exam', 'test', 'study', 'grade'],
    'friend': ['friend', 'friends', 'social', 'peer', 'classmate'],
    'family': ['family', 'parent', 'mom', 'dad', 'mother', 'father', 'sibling', 'brother', 'sister'],
    'health': ['sleep', 'tired', 'energy', 'sick', 'pain', 'health'],
    'emotion': ['feel', 'feeling', 'emotion', 'mood', 'angry', 'sad', 'happy', 'anxious']
  };

  const messageLower = message.toLowerCase();
  const detectedTopics = [];

  Object.entries(topicMap).forEach(([topic, keywords]) => {
    if (keywords.some(keyword => messageLower.includes(keyword))) {
      detectedTopics.push(topic);
    }
  });

  return detectedTopics;
};

// Parent Coaching System
export const generateParentCoaching = (riskLevel, recentPatterns, childAge) => {
  const coaching = {
    riskLevel,
    recommendations: [],
    conversationStarters: [],
    warningSigns: [],
    culturalTips: []
  };

  if (riskLevel === 'high') {
    coaching.recommendations = [
      "Consider professional counseling or therapy immediately",
      "Increase daily check-ins without being intrusive",
      "Create safe spaces for open conversation",
      "Monitor for immediate safety concerns",
      "Consider involving school counselor or trusted adult"
    ];

    coaching.conversationStarters = [
      "I've noticed you seem stressed lately. Want to talk about it over chai?",
      "How can I better support you right now?",
      "I'm here for you, no judgment. What's on your mind?",
      "Let's take a walk together. Sometimes moving helps with thinking."
    ];

    coaching.culturalTips = [
      "Avoid directly confronting about mental health - use indirect approaches",
      "Consider involving respected family elders if appropriate",
      "Focus on family support rather than individual therapy initially",
      "Use food and shared activities as conversation starters"
    ];

  } else if (riskLevel === 'moderate') {
    coaching.recommendations = [
      "Increase quality time together",
      "Pay attention to sleep and eating patterns",
      "Encourage social connections with friends",
      "Consider stress-reduction activities",
      "Monitor academic pressure levels"
    ];

    coaching.conversationStarters = [
      "What's been the best part of your day lately?",
      "How are things going with your friends?",
      "Any subjects at school feeling particularly challenging?",
      "Want to do something fun together this weekend?"
    ];

  } else {
    coaching.recommendations = [
      "Continue current supportive approaches",
      "Maintain regular family connection",
      "Celebrate positive achievements",
      "Keep communication channels open",
      "Monitor for any changes"
    ];

    coaching.conversationStarters = [
      "I'm proud of how well you're doing. What's helping you feel good?",
      "Tell me about something you're excited about",
      "How can we keep supporting you?"
    ];
  }

  // Add age-specific guidance
  if (childAge >= 16) {
    coaching.culturalTips.push(
      "Respect their growing independence while staying connected",
      "Discuss future goals and aspirations",
      "Address academic and career pressures appropriately"
    );
  } else {
    coaching.culturalTips.push(
      "Maintain closer supervision while building trust",
      "Focus on school balance and extracurricular activities",
      "Address friendship and social development"
    );
  }

  return coaching;
};