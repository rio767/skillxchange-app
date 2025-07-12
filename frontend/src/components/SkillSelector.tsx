import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import brain from 'brain';
import { SkillBadge } from 'components/SkillBadge';

export interface Skill {
  id: string;
  skill_name: string;
  category?: string;
  description?: string;
}

export interface SkillWithLevel extends Skill {
  proficiency_level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  urgency_level?: 'Low' | 'Medium' | 'High' | 'Urgent';
}

export interface SkillSelectorProps {
  type: 'offered' | 'wanted';
  selectedSkills: SkillWithLevel[];
  onSkillAdd: (skill: SkillWithLevel) => void;
  onSkillRemove: (skillId: string) => void;
  className?: string;
}

const SkillSelector: React.FC<SkillSelectorProps> = ({
  type,
  selectedSkills,
  onSkillAdd,
  onSkillRemove,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Skill[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const proficiencyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
  const urgencyLevels = ['Low', 'Medium', 'High', 'Urgent'];
  const levels = type === 'offered' ? proficiencyLevels : urgencyLevels;
  const levelKey = type === 'offered' ? 'proficiency_level' : 'urgency_level';

  const skillCategories = [
    'Programming', 'Design', 'Marketing', 'Writing', 'Business',
    'Music', 'Language', 'Cooking', 'Fitness', 'Photography',
    'Teaching', 'Finance', 'Other'
  ];

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      debounceRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const response = await brain.search_skills({ q: searchQuery, limit: 10 });
          const data = await response.json();
          setSearchResults(data.skills || []);
          setShowResults(true);
        } catch (error) {
          console.error('Error searching skills:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowAddForm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSkillSelect = (skill: Skill) => {
    if (!selectedLevel) {
      alert(`Please select a ${type === 'offered' ? 'proficiency' : 'urgency'} level first`);
      return;
    }

    const skillWithLevel: SkillWithLevel = {
      ...skill,
      [levelKey]: selectedLevel
    };

    onSkillAdd(skillWithLevel);
    setSearchQuery('');
    setSelectedLevel('');
    setShowResults(false);
  };

  const handleAddNewSkill = () => {
    if (!newSkillName.trim() || !selectedLevel) {
      alert('Please fill in skill name and select a level');
      return;
    }

    const newSkill: SkillWithLevel = {
      id: `temp-${Date.now()}`, // Temporary ID, will be replaced by backend
      skill_name: newSkillName.trim(),
      category: newSkillCategory || 'Other',
      [levelKey]: selectedLevel
    };

    onSkillAdd(newSkill);
    setNewSkillName('');
    setNewSkillCategory('');
    setSelectedLevel('');
    setShowAddForm(false);
  };

  const isSkillSelected = (skillId: string) => {
    return selectedSkills.some(s => s.id === skillId);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Level Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          {type === 'offered' ? 'Proficiency Level' : 'Urgency Level'}
        </label>
        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`Select ${type === 'offered' ? 'proficiency' : 'urgency'} level`} />
          </SelectTrigger>
          <SelectContent>
            {levels.map(level => (
              <SelectItem key={level} value={level}>{level}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search Input */}
      <div className="relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search for skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/50 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-blue-300 transition-all"
            onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          />
        </div>

        {/* Search Results */}
        {showResults && (searchResults.length > 0 || isSearching) && (
          <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-xl shadow-lg">
            <div className="p-2">
              {isSearching ? (
                <div className="text-center py-4 text-gray-500">Searching...</div>
              ) : (
                <>
                  {searchResults.map(skill => (
                    <div
                      key={skill.id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors",
                        isSkillSelected(skill.id) 
                          ? "bg-gray-100 opacity-50 cursor-not-allowed" 
                          : "hover:bg-blue-50"
                      )}
                      onClick={() => !isSkillSelected(skill.id) && handleSkillSelect(skill)}
                    >
                      <div>
                        <div className="font-medium text-gray-900">{skill.skill_name}</div>
                        {skill.category && (
                          <div className="text-xs text-gray-500">{skill.category}</div>
                        )}
                      </div>
                      {isSkillSelected(skill.id) && (
                        <Badge variant="secondary" className="text-xs">Added</Badge>
                      )}
                    </div>
                  ))}
                  
                  {/* Add new skill option */}
                  <div className="border-t pt-2 mt-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => {
                        setNewSkillName(searchQuery);
                        setShowAddForm(true);
                        setShowResults(false);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add "{searchQuery}" as new skill
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Add New Skill Form */}
      {showAddForm && (
        <Card className="p-4 bg-blue-50/50 backdrop-blur-sm border-2 border-blue-200 rounded-xl">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Add New Skill</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Skill Name</label>
                <Input
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="Enter skill name"
                  className="mt-1"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <Select value={newSkillCategory} onValueChange={setNewSkillCategory}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {skillCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button onClick={handleAddNewSkill} className="w-full">
              Add Skill
            </Button>
          </div>
        </Card>
      )}

      {/* Selected Skills */}
      {selectedSkills.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {type === 'offered' ? 'Skills You Offer' : 'Skills You Want'} ({selectedSkills.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedSkills.map(skill => (
              <SkillBadge
                key={skill.id}
                skill={skill}
                variant={type}
                removable
                onRemove={onSkillRemove}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { SkillSelector };
