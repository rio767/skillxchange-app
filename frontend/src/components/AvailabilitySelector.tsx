import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AvailabilityOption {
  id: string;
  label: string;
  description?: string;
}

export interface AvailabilitySelectorProps {
  selectedAvailability: string[];
  onAvailabilityChange: (availability: string[]) => void;
  className?: string;
}

const defaultAvailabilityOptions: AvailabilityOption[] = [
  {
    id: 'weekday_mornings',
    label: 'Weekday Mornings',
    description: '6 AM - 12 PM, Monday to Friday'
  },
  {
    id: 'weekday_afternoons',
    label: 'Weekday Afternoons',
    description: '12 PM - 6 PM, Monday to Friday'
  },
  {
    id: 'weekday_evenings',
    label: 'Weekday Evenings',
    description: '6 PM - 10 PM, Monday to Friday'
  },
  {
    id: 'weekend_mornings',
    label: 'Weekend Mornings',
    description: '8 AM - 12 PM, Saturday and Sunday'
  },
  {
    id: 'weekend_afternoons',
    label: 'Weekend Afternoons',
    description: '12 PM - 6 PM, Saturday and Sunday'
  },
  {
    id: 'weekend_evenings',
    label: 'Weekend Evenings',
    description: '6 PM - 10 PM, Saturday and Sunday'
  },
  {
    id: 'flexible',
    label: 'Flexible Schedule',
    description: 'Available by appointment, varies weekly'
  }
];

const AvailabilitySelector: React.FC<AvailabilitySelectorProps> = ({
  selectedAvailability,
  onAvailabilityChange,
  className
}) => {
  const handleToggle = (optionId: string) => {
    const newSelection = selectedAvailability.includes(optionId)
      ? selectedAvailability.filter(id => id !== optionId)
      : [...selectedAvailability, optionId];
    
    onAvailabilityChange(newSelection);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">When are you available?</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {defaultAvailabilityOptions.map((option) => {
          const isSelected = selectedAvailability.includes(option.id);
          
          return (
            <Card
              key={option.id}
              className={cn(
                "p-4 cursor-pointer transition-all duration-200 hover:shadow-md border-2",
                isSelected 
                  ? "bg-blue-50 border-blue-300 shadow-sm" 
                  : "bg-white hover:bg-gray-50 border-gray-200"
              )}
              onClick={() => handleToggle(option.id)}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={isSelected}
                  onChange={() => handleToggle(option.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {option.label}
                  </div>
                  {option.description && (
                    <div className="text-sm text-gray-600 mt-1">
                      {option.description}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {selectedAvailability.length > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-green-800">
            <strong>Selected:</strong> {selectedAvailability.length} time slot{selectedAvailability.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
};

export { AvailabilitySelector };
