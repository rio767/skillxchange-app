import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PrivacyToggleProps {
  isPublic: boolean;
  onToggle: (isPublic: boolean) => void;
  className?: string;
}

const PrivacyToggle: React.FC<PrivacyToggleProps> = ({
  isPublic,
  onToggle,
  className
}) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Profile Visibility</h3>
      </div>
      
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-2">
              {isPublic ? (
                <Eye className="h-5 w-5 text-green-600" />
              ) : (
                <EyeOff className="h-5 w-5 text-gray-600" />
              )}
              <div className="font-semibold text-gray-900">
                {isPublic ? 'Public Profile' : 'Private Profile'}
              </div>
            </div>
            
            <div className="text-sm text-gray-700 space-y-2">
              {isPublic ? (
                <>
                  <p>✅ Other users can find and view your profile</p>
                  <p>✅ You'll appear in skill searches</p>
                  <p>✅ Others can send you skill swap requests</p>
                  <p className="text-green-700 font-medium">Recommended for active skill swapping</p>
                </>
              ) : (
                <>
                  <p>🔒 Your profile is hidden from other users</p>
                  <p>🔒 You won't appear in skill searches</p>
                  <p>🔒 Others cannot send you skill swap requests</p>
                  <p className="text-orange-700 font-medium">You can still browse and contact others</p>
                </>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <Switch
              checked={isPublic}
              onCheckedChange={onToggle}
              className="data-[state=checked]:bg-green-600"
            />
            <div className="text-xs text-gray-600 mt-2 text-center">
              {isPublic ? 'Public' : 'Private'}
            </div>
          </div>
        </div>
      </Card>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 font-bold text-lg">💡</div>
          <div className="text-sm text-blue-800">
            <strong>Tip:</strong> You can change this setting anytime from your profile settings. 
            Start with a public profile to maximize your skill swap opportunities!
          </div>
        </div>
      </div>
    </div>
  );
};

export { PrivacyToggle };
