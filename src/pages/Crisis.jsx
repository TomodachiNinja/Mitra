import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Phone, 
  MessageCircle, 
  Heart, 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Users,
  Shield,
  Headphones
} from "lucide-react";

export default function CrisisPage() {
  const [selectedHelpline, setSelectedHelpline] = useState(null);

  const emergencyContacts = [
    {
      name: "National Suicide Prevention Helpline",
      number: "1075",
      description: "24/7 toll-free crisis helpline",
      type: "call",
      availability: "24/7",
      languages: "Hindi, English, Regional languages",
      icon: Phone,
      color: "bg-red-500"
    },
    {
      name: "Vandrevala Foundation",
      number: "+91 9999 666 555",
      description: "Mental health crisis support",
      type: "call",
      availability: "24/7",
      languages: "Hindi, English",
      icon: Headphones,
      color: "bg-blue-500"
    },
    {
      name: "AASRA Mumbai",
      number: "+91 22 2754 6669",
      description: "Emotional support helpline",
      type: "call", 
      availability: "24/7",
      languages: "Hindi, English, Marathi",
      icon: Heart,
      color: "bg-green-500"
    },
    {
      name: "Sneha Chennai",
      number: "+91 44 2464 0050",
      description: "Suicide prevention center",
      type: "call",
      availability: "24/7", 
      languages: "English, Tamil, Telugu, Hindi",
      icon: Shield,
      color: "bg-purple-500"
    },
    {
      name: "iCall Mumbai", 
      number: "+91 022-25521111",
      description: "Psycho-social helpline",
      type: "call",
      availability: "Mon-Sat: 8AM-10PM",
      languages: "Hindi, English, Marathi",
      icon: Users,
      color: "bg-orange-500"
    }
  ];

  const selfCareSteps = [
    {
      title: "Take Deep Breaths",
      description: "Breathe in for 4 counts, hold for 4, breathe out for 6",
      icon: "🫁"
    },
    {
      title: "Ground Yourself",
      description: "Name 5 things you see, 4 things you hear, 3 things you feel",
      icon: "🌱"
    },
    {
      title: "Reach Out",
      description: "Call someone you trust or use the helplines below",
      icon: "🤝"
    },
    {
      title: "Stay Safe",
      description: "Remove anything that could cause harm, go to a safe space",
      icon: "🛡️"
    }
  ];

  const handleCall = (number) => {
    window.open(`tel:${number}`, '_self');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link 
              to={createPageUrl("Landing")} 
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold text-red-600">Crisis Support</h1>
              <p className="text-sm text-gray-600">You're not alone. Help is available.</p>
            </div>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Emergency Notice */}
        <Card className="border-red-200 bg-red-50 mb-8">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">
              If you're in immediate danger
            </h2>
            <p className="text-red-700 mb-4">
              Call emergency services right now
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg"
                onClick={() => handleCall('112')}
              >
                <Phone className="w-5 h-5 mr-2" />
                Emergency: 112
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-lg"
                onClick={() => handleCall('100')}
              >
                <Shield className="w-5 h-5 mr-2" />
                Police: 100
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Immediate Self-Care */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-purple-600" />
              Right Now: Take Care of Yourself
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selfCareSteps.map((step, index) => (
                <div key={index} className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl mb-2">{step.icon}</div>
                  <h3 className="font-semibold text-purple-800 mb-1">{step.title}</h3>
                  <p className="text-sm text-purple-700">{step.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Crisis Helplines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Headphones className="w-6 h-6 text-blue-600" />
              Crisis Helplines - Free & Confidential
            </CardTitle>
            <p className="text-gray-600">
              Trained counselors are available to listen and help
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {emergencyContacts.map((contact, index) => (
                <Card 
                  key={index}
                  className={`border-2 hover:shadow-lg transition-all cursor-pointer ${
                    selectedHelpline === index ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedHelpline(selectedHelpline === index ? null : index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`${contact.color} rounded-lg p-3 flex items-center justify-center`}>
                        <contact.icon className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{contact.name}</h3>
                        <p className="text-gray-600 mb-2">{contact.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {contact.availability}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {contact.languages}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button 
                            className={`${contact.color} hover:opacity-90 text-white flex-1`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCall(contact.number);
                            }}
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            Call {contact.number}
                          </Button>
                          
                          {contact.number.includes('+91') && (
                            <Button 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`https://wa.me/${contact.number.replace(/[^0-9]/g, '')}`, '_blank');
                              }}
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              WhatsApp
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedHelpline === index && (
                      <div className="mt-4 pt-4 border-t bg-white rounded-lg p-4">
                        <h4 className="font-semibold mb-2">What to expect when you call:</h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• A trained counselor will listen without judgment</li>
                          <li>• Your call is completely confidential</li>
                          <li>• They will help you work through your feelings</li>
                          <li>• They can connect you with local resources</li>
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Return to MITRA */}
        <Card className="mt-8 border-purple-200 bg-purple-50">
          <CardContent className="p-6 text-center">
            <Heart className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-purple-800 mb-2">
              You deserve support and care
            </h3>
            <p className="text-purple-700 mb-4">
              After you're feeling safer, consider using MITRA for ongoing mental health support
            </p>
            <Link to={createPageUrl("Login")}>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                Access MITRA Support
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}