import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useUserGuardContext } from 'app/auth';
import { SkillSelector, type SkillWithLevel } from 'components/SkillSelector';
import { AvailabilitySelector } from 'components/AvailabilitySelector';
import { PrivacyToggle } from 'components/PrivacyToggle';
import { User, MapPin, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import brain from 'brain';
import { toast } from 'sonner';

const ProfileSetup = () => {
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const totalSteps = 5;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const steps = [
    {
      title: 'Welcome!',
      subtitle: 'Let\'s set up your SkillXchange profile',
      icon: User
    },
    {
      title: 'Basic Information',
      subtitle: 'Tell us about yourself',
      icon: User
    },
    {
      title: 'Skills You Offer',
      subtitle: 'What skills can you teach or share?',
      icon: CheckCircle
    },
    {
      title: 'Skills You Want',
      subtitle: 'What would you like to learn?',
      icon: CheckCircle
    },
    {
      title: 'Availability & Privacy',
      subtitle: 'When are you available and how visible should your profile be?',
      icon: MapPin
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Create profile
      const profileResponse = await brain.create_profile({
        name: formData.name,
        location: formData.location || null,
        profile_photo_url: formData.profilePhotoUrl || null,
        availability: formData.availability,
        is_public: formData.isPublic
      });
      
      if (!profileResponse.ok) {
        throw new Error('Failed to create profile');
      }
      
      // Add offered skills
      for (const skill of offeredSkills) {
        try {
          await brain.add_offered_skill({
            skill_name: skill.skill_name,
            category: skill.category,
            description: skill.description || null,
            proficiency_level: skill.proficiency_level || 'Beginner'
          });
        } catch (error) {
          console.error('Error adding offered skill:', error);
        }
      }
      
      // Add wanted skills
      for (const skill of wantedSkills) {
        try {
          await brain.add_wanted_skill({
            skill_name: skill.skill_name,
            category: skill.category,
            description: skill.description || null,
            urgency_level: skill.urgency_level || 'Medium'
          });
        } catch (error) {
          console.error('Error adding wanted skill:', error);
        }
      }
      
      toast.success('Profile created successfully! Welcome to SkillXchange! 🎉');
      navigate('/App'); // Navigate to main app
      
    } catch (error) {
      console.error('Error creating profile:', error);
      toast.error('Failed to create profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return formData.name.trim().length > 0;
      case 3:
        return true; // Optional step
      case 4:
        return true; // Optional step
      case 5:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto flex items-center justify-center">
              <User className="h-12 w-12 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to SkillXchange!</h2>
              <p className="text-lg text-gray-600">
                Let's create your profile so you can start swapping skills with others.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                This will take about 3-5 minutes. You can always update your information later.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
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
                Location (Optional)
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo URL (Optional)
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
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">What skills do you offer?</h3>
              <p className="text-gray-600">
                Add skills you can teach or help others with. You can always add more later!
              </p>
            </div>
            <SkillSelector
              type="offered"
              selectedSkills={offeredSkills}
              onSkillAdd={(skill) => setOfferedSkills(prev => [...prev, skill])}
              onSkillRemove={(skillId) => setOfferedSkills(prev => prev.filter(s => s.id !== skillId))}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">What skills do you want to learn?</h3>
              <p className="text-gray-600">
                Add skills you'd like to learn from others. This helps us match you with the right people!
              </p>
            </div>
            <SkillSelector
              type="wanted"
              selectedSkills={wantedSkills}
              onSkillAdd={(skill) => setWantedSkills(prev => [...prev, skill])}
              onSkillRemove={(skillId) => setWantedSkills(prev => prev.filter(s => s.id !== skillId))}
            />
          </div>
        );

      case 5:
        return (
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
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {steps[currentStep - 1]?.title}
          </h1>
          <p className="text-gray-600 mb-6">
            {steps[currentStep - 1]?.subtitle}
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>

        {/* Main Content */}
        <Card className="p-8 bg-white/80 backdrop-blur-sm border-2 border-white/50 shadow-xl rounded-2xl">
          {renderStepContent()}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isSubmitting ? 'Creating Profile...' : 'Complete Setup'}
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
