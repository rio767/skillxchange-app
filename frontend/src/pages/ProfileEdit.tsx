import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserGuardContext } from 'app/auth';
import { SkillSelector, type SkillWithLevel } from 'components/SkillSelector';
import { AvailabilitySelector } from 'components/AvailabilitySelector';
import { PrivacyToggle } from 'components/PrivacyToggle';
import { User, MapPin, Save, ArrowLeft, Loader2 } from 'lucide-react';
import brain from 'brain';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  name: string;
  location?: string;
  profile_photo_url?: string;
  availability?: string;
  is_public: boolean;
  offered_skills: SkillWithLevel[];
  wanted_skills: SkillWithLevel[];
}

const ProfileEdit = () => {
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    profilePhotoUrl: '',
    availability: [] as string[],
    isPublic: true
  });
  
  const [offeredSkills, setOfferedSkills] = useState<SkillWithLevel[]>([]);
  const [wantedSkills, setWantedSkills] = useState<SkillWithLevel[]>([]);

  // Load current profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await brain.get_profile();
        const data = await response.json();
        
        if (data) {
          setProfile(data);
          setFormData({
            name: data.name || '',
            location: data.location || '',
            profilePhotoUrl: data.profile_photo_url || '',
            availability: data.availability ? JSON.parse(data.availability) : [],
            isPublic: data.is_public
          });
          setOfferedSkills(data.offered_skills || []);
          setWantedSkills(data.wanted_skills || []);
        } else {
          // No profile exists, redirect to setup
          navigate('/ProfileSetup');
          return;
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    try {
      // Update basic profile information
      const response = await brain.update_profile({
        name: formData.name,
        location: formData.location || null,
        profile_photo_url: formData.profilePhotoUrl || null,
        availability: formData.availability,
        is_public: formData.isPublic
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      toast.success('Profile updated successfully!');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddOfferedSkill = async (skill: SkillWithLevel) => {
    try {
      const response = await brain.add_offered_skill({
        skill_name: skill.skill_name,
        category: skill.category,
        description: skill.description || null,
        proficiency_level: skill.proficiency_level || 'Beginner'
      });
      
      if (response.ok) {
        setOfferedSkills(prev => [...prev, skill]);
        toast.success('Skill added successfully!');
      } else {
        throw new Error('Failed to add skill');
      }
    } catch (error) {
      console.error('Error adding offered skill:', error);
      toast.error('Failed to add skill. Please try again.');
    }
  };

  const handleRemoveOfferedSkill = async (skillId: string) => {
    try {
      const response = await brain.remove_offered_skill({ skill_id: skillId });
      
      if (response.ok) {
        setOfferedSkills(prev => prev.filter(s => s.id !== skillId));
        toast.success('Skill removed successfully!');
      } else {
        throw new Error('Failed to remove skill');
      }
    } catch (error) {
      console.error('Error removing offered skill:', error);
      toast.error('Failed to remove skill. Please try again.');
    }
  };

  const handleAddWantedSkill = async (skill: SkillWithLevel) => {
    try {
      const response = await brain.add_wanted_skill({
        skill_name: skill.skill_name,
        category: skill.category,
        description: skill.description || null,
        urgency_level: skill.urgency_level || 'Medium'
      });
      
      if (response.ok) {
        setWantedSkills(prev => [...prev, skill]);
        toast.success('Skill added successfully!');
      } else {
        throw new Error('Failed to add skill');
      }
    } catch (error) {
      console.error('Error adding wanted skill:', error);
      toast.error('Failed to add skill. Please try again.');
    }
  };

  const handleRemoveWantedSkill = async (skillId: string) => {
    try {
      const response = await brain.remove_wanted_skill({ skill_id: skillId });
      
      if (response.ok) {
        setWantedSkills(prev => prev.filter(s => s.id !== skillId));
        toast.success('Skill removed successfully!');
      } else {
        throw new Error('Failed to remove skill');
      }
    } catch (error) {
      console.error('Error removing wanted skill:', error);
      toast.error('Failed to remove skill. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/App')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
              <p className="text-gray-600">Update your information and skills</p>
            </div>
          </div>
          
          <Button
            onClick={handleSaveProfile}
            disabled={isSaving || !formData.name.trim()}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Basic Info
            </TabsTrigger>
            <TabsTrigger value="offered" className="flex items-center gap-2">
              <div className="w-4 h-4 bg-emerald-500 rounded-full" />
              Skills Offered
            </TabsTrigger>
            <TabsTrigger value="wanted" className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full" />
              Skills Wanted
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-white/50 shadow-xl rounded-2xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="bg-white/50 backdrop-blur-sm border-2 border-gray-200 rounded-xl"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="e.g., New York, NY or Remote"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="pl-10 bg-white/50 backdrop-blur-sm border-2 border-gray-200 rounded-xl"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Photo URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://example.com/your-photo.jpg"
                    value={formData.profilePhotoUrl}
                    onChange={(e) => handleInputChange('profilePhotoUrl', e.target.value)}
                    className="bg-white/50 backdrop-blur-sm border-2 border-gray-200 rounded-xl"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="offered" className="space-y-6">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-white/50 shadow-xl rounded-2xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Skills You Offer</h3>
              <SkillSelector
                type="offered"
                selectedSkills={offeredSkills}
                onSkillAdd={handleAddOfferedSkill}
                onSkillRemove={handleRemoveOfferedSkill}
              />
            </Card>
          </TabsContent>

          <TabsContent value="wanted" className="space-y-6">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-white/50 shadow-xl rounded-2xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Skills You Want to Learn</h3>
              <SkillSelector
                type="wanted"
                selectedSkills={wantedSkills}
                onSkillAdd={handleAddWantedSkill}
                onSkillRemove={handleRemoveWantedSkill}
              />
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card className="p-6 bg-white/80 backdrop-blur-sm border-2 border-white/50 shadow-xl rounded-2xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Availability & Privacy</h3>
              
              <div className="space-y-8">
                <AvailabilitySelector
                  selectedAvailability={formData.availability}
                  onAvailabilityChange={(availability) => setFormData(prev => ({ ...prev, availability }))}
                />
                
                <PrivacyToggle
                  isPublic={formData.isPublic}
                  onToggle={(isPublic) => setFormData(prev => ({ ...prev, isPublic }))}
                />
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfileEdit;
