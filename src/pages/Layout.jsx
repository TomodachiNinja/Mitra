
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { 
  Heart, 
  Shield, 
  MessageCircle, 
  BarChart3, 
  Home, 
  LogOut, 
  Phone,
  Menu,
  X 
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // Check for demo user first
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        setUser(JSON.parse(demoUser));
        setIsLoading(false);
        return;
      }

      // Otherwise try real user
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    try {
      // Clear demo user if exists
      localStorage.removeItem('demoUser');
      // Try real logout
      await User.logout();
    } catch (error) {
      // Ignore errors
    }
    setUser(null);
    window.location.href = createPageUrl("Landing");
  };

  // Crisis button - always visible
  const CrisisButton = () => (
    <div className="fixed bottom-6 right-6 z-50">
      <Link to={createPageUrl("Crisis")}>
        <Button 
          className="bg-red-500 hover:bg-red-600 text-white shadow-2xl animate-pulse rounded-full w-14 h-14 flex items-center justify-center"
        >
          <Phone className="w-6 h-6" />
        </Button>
      </Link>
    </div>
  );

  // If not logged in and not on public pages
  const publicPages = ["Landing", "Crisis"];
  if (!isLoading && !user && !publicPages.includes(currentPageName)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md">
          <Heart className="w-16 h-16 text-[#667eea] mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Welcome to MITRA</h2>
          <p className="text-gray-600 mb-6">Please log in to access your mental health support.</p>
          <Button 
            className="bg-[#667eea] hover:bg-[#5a6fd8] w-full"
            onClick={async () => {
              try {
                await User.login();
              } catch (error) {
                console.error("Login error:", error);
              }
            }}
          >
            Sign In with Google
          </Button>
        </div>
        <CrisisButton />
      </div>
    );
  }

  // Public pages layout
  if (publicPages.includes(currentPageName)) {
    return (
      <div className="min-h-screen">
        {children}
        <CrisisButton />
      </div>
    );
  }

  // Authenticated user layout
  const navigationItems = user?.user_type === 'parent' ? [
    {
      title: "Dashboard",
      url: createPageUrl("ParentDashboard"),
      icon: BarChart3,
    },
    {
      title: "Risk Monitor",
      url: createPageUrl("RiskMonitor"), 
      icon: Shield,
    },
    {
      title: "AI Coaching",
      url: createPageUrl("AICoaching"),
      icon: MessageCircle,
    }
  ] : [
    {
      title: "Chat Therapist",
      url: createPageUrl("StudentChat"),
      icon: MessageCircle,
    },
    {
      title: "Mood Tracker",
      url: createPageUrl("MoodTracker"),
      icon: Heart,
    },
    {
      title: "Wellness Tools",
      url: createPageUrl("WellnessTools"),
      icon: Shield,
    }
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-purple-50">
        <Sidebar className="border-r border-purple-200 bg-white/80 backdrop-blur-sm">
          <SidebarHeader className="border-b border-purple-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
                  MITRA
                </h2>
                <p className="text-xs text-gray-500">
                  {user?.user_type === 'parent' ? 'Parent Portal' : 'Student Support'}
                </p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-purple-600 uppercase tracking-wider px-2 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === item.url ? 'bg-purple-50 text-purple-700 shadow-sm' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {user?.user_type === 'parent' && (
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-medium text-purple-600 uppercase tracking-wider px-2 py-2">
                  Quick Status
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-4 py-2 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Current Risk</span>
                      <Badge variant={user?.risk_level > 7 ? 'destructive' : user?.risk_level > 4 ? 'warning' : 'success'}>
                        {user?.risk_level || 0}/10
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Monitoring
                      </Badge>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-purple-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.user_type === 'parent' ? 'Parent Account' : 'Student Account'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover:bg-purple-100 hover:text-purple-700"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          {/* Mobile header */}
          <header className="bg-white border-b border-purple-200 px-6 py-4 md:hidden">
            <div className="flex items-center justify-between">
              <SidebarTrigger className="hover:bg-purple-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
                MITRA
              </h1>
              <div className="w-8"></div>
            </div>
          </header>

          {/* Main content */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>

        <CrisisButton />
      </div>
    </SidebarProvider>
  );
}
