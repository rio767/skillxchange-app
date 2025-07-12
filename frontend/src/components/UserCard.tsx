import React from 'react';
import { MapPin, Calendar, Star, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkillBadge } from 'components/SkillBadge';

interface UserCardProps {
  user: {
    id: string;
    name: string;
    location?: string;
    profile_photo_url?: string;
    top_offered_skills: Array<{
      skill_name: string;
      category?: string;
      proficiency_level: string;
    }>;
    top_wanted_skills: Array<{
      skill_name: string;
      category?: string;
      urgency_level: string;
    }>;
    availability?: string[];
    member_since?: string;
  };
  viewMode: 'grid' | 'list';
  onClick: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, viewMode, onClick }) => {
  const formatMemberSince = (dateString?: string) => {
    if (!dateString) return 'New member';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 30) {
        return `${diffDays} days ago`;
      } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months} month${months > 1 ? 's' : ''} ago`;
      } else {
        const years = Math.floor(diffDays / 365);
        return `${years} year${years > 1 ? 's' : ''} ago`;
      }
    } catch {
      return 'New member';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getProficiencyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'expert':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'advanced':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'intermediate':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'beginner':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  if (viewMode === 'list') {
    return (
      <Card 
        className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
        onClick={onClick}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              {/* Avatar */}
              <Avatar className="h-16 w-16 ring-2 ring-white shadow-lg">
                <AvatarImage src={user.profile_photo_url} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {user.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      {user.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {user.location}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Joined {formatMemberSince(user.member_since)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills Section */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Offered Skills */}
                  {user.top_offered_skills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500" />
                        Can Teach
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {user.top_offered_skills.slice(0, 3).map((skill, index) => (
                          <SkillBadge
                            key={index}
                            skillName={skill.skill_name}
                            level={skill.proficiency_level}
                            type="offered"
                            size="sm"
                          />
                        ))}
                        {user.top_offered_skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{user.top_offered_skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Wanted Skills */}
                  {user.top_wanted_skills.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                        <ArrowRight className="h-3 w-3 text-blue-500" />
                        Wants to Learn
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {user.top_wanted_skills.slice(0, 3).map((skill, index) => (
                          <SkillBadge
                            key={index}
                            skillName={skill.skill_name}
                            level={skill.urgency_level}
                            type="wanted"
                            size="sm"
                          />
                        ))}
                        {user.top_wanted_skills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{user.top_wanted_skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
            >
              View Profile
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card 
      className="border-0 shadow-lg bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-[1.02]"
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Avatar className="h-14 w-14 ring-2 ring-white shadow-lg">
            <AvatarImage src={user.profile_photo_url} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
              {user.name}
            </h3>
            {user.location && (
              <div className="flex items-center gap-1 text-sm text-slate-500 mt-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{user.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Offered Skills */}
        {user.top_offered_skills.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-500" />
              Can Teach
            </h4>
            <div className="flex flex-wrap gap-1">
              {user.top_offered_skills.slice(0, 2).map((skill, index) => (
                <SkillBadge
                  key={index}
                  skillName={skill.skill_name}
                  level={skill.proficiency_level}
                  type="offered"
                  size="sm"
                />
              ))}
              {user.top_offered_skills.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{user.top_offered_skills.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Wanted Skills */}
        {user.top_wanted_skills.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
              <ArrowRight className="h-3 w-3 text-blue-500" />
              Wants to Learn
            </h4>
            <div className="flex flex-wrap gap-1">
              {user.top_wanted_skills.slice(0, 2).map((skill, index) => (
                <SkillBadge
                  key={index}
                  skillName={skill.skill_name}
                  level={skill.urgency_level}
                  type="wanted"
                  size="sm"
                />
              ))}
              {user.top_wanted_skills.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{user.top_wanted_skills.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Joined {formatMemberSince(user.member_since)}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-xs rounded-lg"
          >
            View Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
