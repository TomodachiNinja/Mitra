
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { createPageUrl } from "@/utils";
import {
  Heart,
  Shield,
  MessageCircle,
  BarChart3,
  Phone,
  ArrowRight,
  Users,
  Clock,
  IndianRupee,
  CheckCircle,
  Star,
  Play,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [countdown, setCountdown] = useState({ minutes: 59, seconds: 59 });
  const [hoveredStat, setHoveredStat] = useState(null);
  const [visibleSection, setVisibleSection] = useState('hero');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }
        if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        }
        // Resetting to approximately 60 minutes
        return { minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    document.querySelectorAll('[data-section]').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await User.login();
    } catch (error) {
      console.error("Login error:", error);
    }
    setIsLoading(false);
  };

  const handleDemoLogin = async (userType) => {
    setIsLoading(true);
    try {
      // Create demo user data and store it
      const demoUser = {
        id: userType === 'parent' ? 'demo-parent-001' : 'demo-student-001',
        email: userType === 'parent' ? 'parent@demo.com' : 'student@demo.com',
        full_name: userType === 'parent' ? 'Demo Parent' : 'Demo Student',
        user_type: userType,
        age: userType === 'parent' ? 45 : 17,
        phone: '+91 98765 43210',
        emergency_contact: userType === 'parent' ? 'spouse@email.com' : 'parent@demo.com',
        risk_level: userType === 'parent' ? 6.2 : 4.8,
        last_active: new Date().toISOString()
      };

      // Store demo user data
      localStorage.setItem('demoUser', JSON.stringify(demoUser));

      // Navigate to appropriate dashboard
      if (userType === 'parent') {
        window.location.href = createPageUrl("ParentDashboard");
      } else {
        window.location.href = createPageUrl("StudentChat");
      }
    } catch (error) {
      console.error("Demo login error:", error);
    }
    setIsLoading(false);
  };

  const stats = [
    {
      number: "13,089",
      label: "student suicides in 2022",
      icon: Users,
      color: "text-red-500",
      bg: "bg-red-50"
    },
    {
      number: "1 hour", // Changed from "28 sec" to "1 hour"
      label: "one student lost",
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-50"
    },
    {
      number: "6 weeks",
      label: "earlier detection",
      icon: Shield,
      color: "text-green-500",
      bg: "bg-green-50"
    },
    {
      number: "₹99",
      label: "vs ₹2000 therapy",
      icon: IndianRupee,
      color: "text-purple-500",
      bg: "bg-purple-50"
    }
  ];

  const features = [
    {
      title: "AI-Powered Risk Detection",
      description: "Early warning system that detects depression 6 weeks before parents typically notice",
      icon: Shield,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "24/7 Student Support",
      description: "Age-appropriate AI therapist available anytime with crisis intervention protocols",
      icon: MessageCircle,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Parent Dashboard",
      description: "Real-time monitoring with actionable insights and coaching guidance",
      icon: BarChart3,
      color: "from-green-500 to-emerald-500"
    }
  ];

  const testimonials = [
    {
      text: "MITRA detected my daughter's depression 2 months before I noticed. The AI coaching helped me approach her correctly. She's doing so much better now.",
      author: "Priya M., Mother from Mumbai",
      rating: 5,
      improvement: "Risk reduced from 8.2 to 2.1"
    },
    {
      text: "The chat therapist understood my anxiety better than any adult. It helped me through my darkest moments when I couldn't talk to anyone else.",
      author: "Arjun K., 17 years old",
      rating: 5,
      improvement: "Mood improved 85%"
    },
    {
      text: "As a working parent, having real-time alerts about my son's mental health gave me peace of mind. The early intervention saved us.",
      author: "Rajesh S., Father from Delhi",
      rating: 5,
      improvement: "Crisis averted in time"
    }
  ];

  return (
    <div
      className="min-h-screen overflow-hidden"
      style={{
        background: `radial-gradient(circle at ${cursorPos.x}px ${cursorPos.y}px, #667eea 0%, #764ba2 100%)`
      }}
    >
      {/* Custom Cursor */}
      <div
        className="fixed top-0 left-0 w-6 h-6 bg-white/30 rounded-full pointer-events-none z-50 mix-blend-difference transition-transform duration-75"
        style={{
          transform: `translate(${cursorPos.x - 12}px, ${cursorPos.y - 12}px)`
        }}
      />

      {/* Hero Section */}
      <section
        id="hero"
        data-section
        className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      >
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                transform: `translate(${(cursorPos.x - window.innerWidth/2) * 0.01}px, ${(cursorPos.y - window.innerHeight/2) * 0.01}px)`
              }}
            />
          ))}
        </div>

        <div className="text-center text-white z-10 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1
              className="text-6xl md:text-8xl font-black mb-6 tracking-tight"
              onMouseEnter={() => setHoveredStat('hero')}
              style={{
                transform: hoveredStat === 'hero' ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.3s ease'
              }}
            >
              MITRA
            </h1>
            <p className="text-xl md:text-2xl font-light mb-8 opacity-90">
              Saving student lives through AI-powered mental health detection
            </p>
          </div>

          {/* Crisis Counter */}
          <div className="mb-12 p-6 bg-black/20 backdrop-blur-sm rounded-2xl border border-white/20">
            <p className="text-lg mb-2">A student is lost in India in under:</p>
            <div
              className="text-4xl md:text-6xl font-mono font-bold text-red-300"
              style={{
                transform: `scale(${1 + Math.sin(Date.now() * 0.01) * 0.1})`,
                filter: countdown.minutes < 1 ? 'blur(1px)' : 'none'
              }}
            >
              {String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
            </div>
            <p className="text-sm opacity-75 mt-2">~1 student suicide every hour (NCRB 2022 data)</p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              className="bg-white text-purple-600 hover:bg-gray-100 hover:shadow-[0_0_20px_theme(colors.purple.300)] px-8 py-4 text-lg font-semibold rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 opacity-100"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In with Google <ArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-purple-600 hover:shadow-[0_0_20px_#fff] px-8 py-4 text-lg rounded-xl transition-all duration-300 opacity-100"
            >
              <Play className="mr-2 w-5 h-5" /> Watch Demo
            </Button>
          </div>

          {/* Demo Access */}
          <div className="mb-16 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <p className="text-lg mb-4 text-white font-semibold">Try MITRA Demo (no signup required)</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                className="border-white text-white bg-white/10 hover:bg-white/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.6)] hover:border-white font-medium"
                onClick={() => handleDemoLogin('parent')}
                disabled={isLoading}
              >
                <Shield className="w-4 h-4 mr-2 text-white" />
                <span className="text-white">Parent Dashboard Demo</span>
              </Button>
              <Button
                variant="outline"
                className="border-white text-white bg-white/10 hover:bg-white/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,255,255,0.6)] hover:border-white font-medium"
                onClick={() => handleDemoLogin('student')}
                disabled={isLoading}
              >
                <MessageCircle className="w-4 h-4 mr-2 text-white" />
                <span className="text-white">Student Chat Demo</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section
        id="stats"
        data-section
        className="py-20 px-4 bg-white/10 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white text-center mb-16">
            The Crisis We're Solving
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="bg-white/95 backdrop-blur-sm hover:bg-white transition-all duration-500 transform hover:scale-105 hover:shadow-2xl cursor-pointer"
                onMouseEnter={() => setHoveredStat(index)}
                onMouseLeave={() => setHoveredStat(null)}
                style={{
                  transform: hoveredStat === index ? 'rotateY(10deg) rotateX(5deg)' : 'none',
                  transformStyle: 'preserve-3d'
                }}
              >
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 ${stat.bg} ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <div
                    className={`text-3xl font-bold mb-2 ${stat.color}`}
                    style={{
                      textShadow: hoveredStat === index ? '0 0 10px currentColor' : 'none'
                    }}
                  >
                    {stat.number}
                  </div>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        data-section
        className="py-20 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white text-center mb-4">
            How MITRA Works
          </h2>
          <p className="text-xl text-white/80 text-center mb-16">
            Advanced AI technology meets compassionate human care
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all duration-500 cursor-pointer group overflow-hidden"
                style={{
                  transform: `translateY(${Math.sin((cursorPos.x + index * 100) * 0.01) * 5}px)`
                }}
              >
                <CardContent className="p-8 text-white">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-white/80 leading-relaxed">{feature.description}</p>
                  <ChevronRight className="w-5 h-5 mt-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonials"
        data-section
        className="py-20 px-4 bg-white/5 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white text-center mb-4">
            Lives Changed
          </h2>
          <p className="text-xl text-white/80 text-center mb-16">
            Real families, real results
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="bg-white backdrop-blur-sm hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
                style={{
                  transform: `rotate(${(cursorPos.x - window.innerWidth/2) * 0.001}deg)`
                }}
              >
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 italic mb-6 leading-relaxed">
                    "{testimonial.text}"
                  </blockquote>
                  <div className="border-t pt-4">
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <Badge variant="outline" className="mt-2 text-green-600 border-green-200">
                      {testimonial.improvement}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="cta"
        data-section
        className="py-20 px-4"
      >
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Start Saving Lives Today
          </h2>
          <p className="text-xl mb-12 opacity-90">
            Join thousands of families who trust MITRA to protect their children's mental health
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="font-bold mb-1">Early Detection</h3>
              <p className="text-sm opacity-80">6 weeks before symptoms show</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="font-bold mb-1">24/7 Support</h3>
              <p className="text-sm opacity-80">Always available when needed</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <h3 className="font-bold mb-1">Affordable Care</h3>
              <p className="text-sm opacity-80">₹99/month vs ₹2000 therapy</p>
            </div>
          </div>

          <Button
            className="bg-white text-purple-600 hover:bg-gray-100 px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-110"
            onClick={handleLogin}
            disabled={isLoading}
            style={{
              boxShadow: `0 20px 40px rgba(255,255,255,0.2)`
            }}
          >
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mr-3" />
                Getting Started...
              </>
            ) : (
              <>
                Get Started Free <Heart className="ml-3 w-6 h-6" />
              </>
            )}
          </Button>

          <p className="text-sm opacity-75 mt-6">
            7-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Crisis Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a href={createPageUrl("Crisis")}>
          <Button
            className="bg-red-500 hover:bg-red-600 text-white shadow-2xl animate-bounce rounded-full w-16 h-16 flex items-center justify-center"
            style={{
              background: 'linear-gradient(45deg, #ff4444, #cc0000)',
              boxShadow: '0 0 30px rgba(255, 68, 68, 0.5)'
            }}
          >
            <Phone className="w-6 h-6" />
          </Button>
        </a>
      </div>
    </div>
  );
}
