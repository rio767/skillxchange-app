import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SkillBadgeProps {
  skill: {
    id: string;
    skill_name: string;
    category?: string;
    proficiency_level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
    urgency_level?: 'Low' | 'Medium' | 'High' | 'Urgent';
  };
  variant?: 'offered' | 'wanted' | 'search';
  onRemove?: (skillId: string) => void;
  removable?: boolean;
  className?: string;
}

const SkillBadge: React.FC<SkillBadgeProps> = ({
  skill,
  variant = 'offered',
  onRemove,
  removable = false,
  className
}) => {
  const baseClasses = "relative group transition-all duration-300 hover:scale-105 hover:shadow-lg";
  
  const variantClasses = {
    offered: "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 text-emerald-800 hover:from-emerald-100 hover:to-green-100",
    wanted: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800 hover:from-blue-100 hover:to-indigo-100",
    search: "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 text-gray-700 hover:from-gray-100 hover:to-slate-100 cursor-pointer"
  };

  const proficiencyColors = {
    Beginner: "text-orange-600 bg-orange-100 border-orange-200",
    Intermediate: "text-blue-600 bg-blue-100 border-blue-200",
    Advanced: "text-purple-600 bg-purple-100 border-purple-200",
    Expert: "text-emerald-600 bg-emerald-100 border-emerald-200"
  };

  const urgencyColors = {
    Low: "text-green-600 bg-green-100 border-green-200",
    Medium: "text-yellow-600 bg-yellow-100 border-yellow-200",
    High: "text-orange-600 bg-orange-100 border-orange-200",
    Urgent: "text-red-600 bg-red-100 border-red-200"
  };

  return (
    <div className={cn(baseClasses, variantClasses[variant], className)}>
      <Badge 
        variant="outline" 
        className="border-2 rounded-xl px-4 py-2 font-medium backdrop-blur-sm"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{skill.skill_name}</span>
          
          {skill.category && (
            <span className="text-xs opacity-70">({skill.category})</span>
          )}
          
          {skill.proficiency_level && (
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full border font-medium",
              proficiencyColors[skill.proficiency_level]
            )}>
              {skill.proficiency_level}
            </span>
          )}
          
          {skill.urgency_level && (
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full border font-medium",
              urgencyColors[skill.urgency_level]
            )}>
              {skill.urgency_level}
            </span>
          )}
          
          {removable && onRemove && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(skill.id);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </Badge>
    </div>
  );
};

export { SkillBadge };
