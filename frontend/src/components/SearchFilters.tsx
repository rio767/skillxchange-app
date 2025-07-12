import React, { useState } from 'react';
import { MapPin, Star, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface SearchFiltersProps {
  skillFilter: string;
  locationFilter: string;
  onFilterChange: (filters: { skill?: string; location?: string }) => void;
  popularSkills: Array<{
    skill_name: string;
    category?: string;
    total_usage: number;
  }>;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  skillFilter,
  locationFilter,
  onFilterChange,
  popularSkills
}) => {
  const [localSkillFilter, setLocalSkillFilter] = useState(skillFilter);
  const [localLocationFilter, setLocalLocationFilter] = useState(locationFilter);

  const handleApplyFilters = () => {
    onFilterChange({
      skill: localSkillFilter,
      location: localLocationFilter
    });
  };

  const handleClearFilters = () => {
    setLocalSkillFilter('');
    setLocalLocationFilter('');
    onFilterChange({ skill: '', location: '' });
  };

  const handlePopularSkillClick = (skillName: string) => {
    setLocalSkillFilter(skillName);
    onFilterChange({
      skill: skillName,
      location: localLocationFilter
    });
  };

  const hasActiveFilters = skillFilter || locationFilter;

  return (
    <div className="space-y-6">
      {/* Skill Filter */}
      <div className="space-y-2">
        <Label htmlFor="skill-filter" className="text-sm font-medium text-slate-700">
          Filter by Skill
        </Label>
        <div className="relative">
          <Star className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <Input
            id="skill-filter"
            placeholder="e.g., JavaScript, Design, Marketing"
            value={localSkillFilter}
            onChange={(e) => setLocalSkillFilter(e.target.value)}
            className="pl-10 rounded-xl border-slate-200 focus:border-blue-300"
          />
        </div>
      </div>

      {/* Location Filter */}
      <div className="space-y-2">
        <Label htmlFor="location-filter" className="text-sm font-medium text-slate-700">
          Filter by Location
        </Label>
        <div className="relative">
          <MapPin className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
          <Input
            id="location-filter"
            placeholder="e.g., New York, Remote, London"
            value={localLocationFilter}
            onChange={(e) => setLocalLocationFilter(e.target.value)}
            className="pl-10 rounded-xl border-slate-200 focus:border-blue-300"
          />
        </div>
      </div>

      {/* Filter Actions */}
      <div className="flex gap-2">
        <Button
          onClick={handleApplyFilters}
          size="sm"
          className="flex-1 rounded-xl"
          disabled={localSkillFilter === skillFilter && localLocationFilter === locationFilter}
        >
          Apply Filters
        </Button>
        {hasActiveFilters && (
          <Button
            onClick={handleClearFilters}
            size="sm"
            variant="outline"
            className="rounded-xl"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Active Filters</Label>
            <div className="flex flex-wrap gap-2">
              {skillFilter && (
                <Badge
                  variant="default"
                  className="rounded-lg px-3 py-1 cursor-pointer hover:bg-red-500 hover:text-white transition-colors"
                  onClick={() => {
                    setLocalSkillFilter('');
                    onFilterChange({ skill: '', location: locationFilter });
                  }}
                  title="Click to remove filter"
                >
                  Skill: {skillFilter}
                  <span className="ml-2 opacity-70">×</span>
                </Badge>
              )}
              {locationFilter && (
                <Badge
                  variant="default"
                  className="rounded-lg px-3 py-1 cursor-pointer hover:bg-red-500 hover:text-white transition-colors"
                  onClick={() => {
                    setLocalLocationFilter('');
                    onFilterChange({ skill: skillFilter, location: '' });
                  }}
                  title="Click to remove filter"
                >
                  Location: {locationFilter}
                  <span className="ml-2 opacity-70">×</span>
                </Badge>
              )}
            </div>
          </div>
        </>
      )}

      {/* Quick Skill Filters */}
      {popularSkills.length > 0 && (
        <>
          <Separator />
          <div className="space-y-3">
            <Label className="text-sm font-medium text-slate-700">
              Quick Skill Filters
            </Label>
            <div className="grid grid-cols-1 gap-2">
              {popularSkills.slice(0, 6).map((skill) => (
                <Button
                  key={skill.skill_name}
                  variant={skillFilter === skill.skill_name ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePopularSkillClick(skill.skill_name)}
                  className="justify-between rounded-xl text-left h-auto py-2 px-3"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{skill.skill_name}</span>
                    {skill.category && (
                      <span className="text-xs opacity-60">{skill.category}</span>
                    )}
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {skill.total_usage}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
