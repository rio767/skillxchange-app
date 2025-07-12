import React, { useEffect, useState } from "react";
import { UserButton, useUser } from "@stackframe/react";
import { UserGuard, useUserGuardContext } from "app/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Activity, BookOpen, Target, Loader2, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import brain from "brain";
import { toast } from "sonner";

// Main dashboard component for authenticated users
function Dashboard() {
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await brain.get_profile();
        const data = await response.json();
        setProfile(data);
        
        // If no profile exists, redirect to setup
        if (!data) {
          navigate('/ProfileSetup');
          return;
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        // If there's an error (like API not available), show the dashboard anyway
        // but provide setup option
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Calculate stats from profile data
  const skillsOffered = profile?.offered_skills?.length || 0;
  const skillsWanted = profile?.wanted_skills?.length || 0;
  const pendingSwaps = 0; // Will be implemented in later tasks
  const completedSwaps = 0; // Will be implemented in later tasks

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with glassmorphic effect */}
      <header className="backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              SkillXchange
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:block">
              Welcome back, {profile?.name || user.displayName || user.primaryEmail || 'there'}!
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/ProfileEdit')}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Profile Settings
            </Button>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <section className="text-center space-y-4">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-600 bg-clip-text text-transparent">
            Your Skill Exchange Hub
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover new skills and share your expertise with a community of learners.
          </p>
        </section>

        {/* Profile Setup Prompt if no profile */}
        {!profile && (
          <section className="space-y-4">
            <Card className="backdrop-blur-sm bg-gradient-to-br from-yellow-50/80 to-orange-100/60 border-yellow-200/30 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-700">
                  <Plus className="h-5 w-5" />
                  <span>Complete Your Profile</span>
                </CardTitle>
                <CardDescription className="text-orange-600">
                  Set up your profile to start swapping skills with others in the community.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                  onClick={() => navigate('/ProfileSetup')}
                >
                  Set Up Profile Now
                </Button>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Overview Cards with glassmorphic design */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="backdrop-blur-sm bg-white/60 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Skills I Offer</CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{skillsOffered}</div>
              <p className="text-xs text-gray-500 mt-1">Ready to share</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/60 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Skills I Want</CardTitle>
              <BookOpen className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{skillsWanted}</div>
              <p className="text-xs text-gray-500 mt-1">Learning goals</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/60 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Swaps</CardTitle>
              <Activity className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{pendingSwaps}</div>
              <p className="text-xs text-gray-500 mt-1">Awaiting response</p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/60 border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed Swaps</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{completedSwaps}</div>
              <p className="text-xs text-gray-500 mt-1">Successful exchanges</p>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions */}
        <section className="space-y-4">
          <h3 className="text-2xl font-semibold text-gray-900">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="backdrop-blur-sm bg-gradient-to-br from-blue-50/80 to-blue-100/60 border-blue-200/30 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-700">
                  <Plus className="h-5 w-5" />
                  <span>Add Skills I Offer</span>
                </CardTitle>
                <CardDescription className="text-blue-600">
                  Share your expertise with the community and help others learn.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:scale-105 transition-transform"
                  onClick={() => navigate('/ProfileEdit')}
                >
                  Manage Skills
                </Button>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-gradient-to-br from-purple-50/80 to-purple-100/60 border-purple-200/30 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-700">
                  <Target className="h-5 w-5" />
                  <span>Add Skills I Want</span>
                </CardTitle>
                <CardDescription className="text-purple-600">
                  Discover new skills and connect with people who can teach you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white group-hover:scale-105 transition-transform"
                  onClick={() => navigate('/ProfileEdit')}
                >
                  Explore Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Browse Users */}
        <section className="space-y-4">
          <h3 className="text-2xl font-semibold text-gray-900">Discover Skills</h3>
          <Card className="backdrop-blur-sm bg-gradient-to-br from-green-50/80 to-emerald-100/60 border-green-200/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-700">
                <Users className="h-5 w-5" />
                <span>Browse Other Users</span>
              </CardTitle>
              <CardDescription className="text-green-600">
                Explore the community and find people with skills you're interested in learning.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => navigate('/browse')}
              >
                Browse Community
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Recent Activity Placeholder */}
        <section className="space-y-4">
          <h3 className="text-2xl font-semibold text-gray-900">Recent Activity</h3>
          <Card className="backdrop-blur-sm bg-white/60 border-white/20 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center py-8 space-y-4">
                <Activity className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="text-gray-500">No recent activity yet.</p>
                <p className="text-sm text-gray-400">
                  Your skill swaps and interactions will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <UserGuard>
      <Dashboard />
    </UserGuard>
  );
}
