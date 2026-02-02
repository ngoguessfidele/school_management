'use client';

// ==========================================
// Rwanda Christian University Management System
// Advanced Search and Filter Component
// ==========================================

import { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FilterOption {
  value: string;
  label: string;
  group?: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: Record<string, any>) => void;
  searchFields?: {
    name: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'number';
    options?: FilterOption[];
    placeholder?: string;
  }[];
  initialFilters?: Record<string, any>;
  showAdvancedToggle?: boolean;
  className?: string;
}

export function AdvancedSearch({
  onSearch,
  searchFields = [],
  initialFilters = {},
  showAdvancedToggle = true,
  className = '',
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<Record<string, any>>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    onSearch(filters);
  }, [filters, onSearch]);

  const updateFilter = (key: string, value: any) => {
    const newFilters = { ...filters };
    if (value === '' || value === null || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setFilters(newFilters);

    // Update active filters
    const newActiveFilters = Object.keys(newFilters).filter(k => newFilters[k] !== '');
    setActiveFilters(newActiveFilters);
  };

  const clearFilter = (key: string) => {
    updateFilter(key, '');
  };

  const clearAllFilters = () => {
    setFilters({});
    setActiveFilters([]);
  };

  const getFilterValue = (key: string) => {
    return filters[key] || '';
  };

  const renderFilterInput = (field: AdvancedSearchProps['searchFields'][0]) => {
    const value = getFilterValue(field.name);

    switch (field.type) {
      case 'select':
        return (
          <Select
            value={value}
            onChange={(e) => updateFilter(field.name, e.target.value)}
            options={[
              { value: '', label: `All ${field.label}` },
              ...(field.options || [])
            ]}
            className="w-full"
          />
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => updateFilter(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="w-full"
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => updateFilter(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="w-full"
          />
        );

      default:
        return (
          <Input
            type="text"
            value={value}
            onChange={(e) => updateFilter(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="w-full"
          />
        );
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        {/* Basic Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Search..."
              value={getFilterValue('search') || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              className="w-full"
            />
          </div>

          {showAdvancedToggle && (
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Advanced Filters
              <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            </Button>
          )}
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {activeFilters.map((key) => {
              const field = searchFields.find(f => f.name === key);
              const value = filters[key];
              const label = field?.label || key;

              let displayValue = value;
              if (field?.type === 'select' && field.options) {
                const option = field.options.find(opt => opt.value === value);
                displayValue = option?.label || value;
              }

              return (
                <Badge key={key} variant="default" className="flex items-center gap-1">
                  {label}: {displayValue}
                  <button
                    onClick={() => clearFilter(key)}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs h-6 px-2"
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Advanced Filters */}
        {showAdvanced && searchFields.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            {searchFields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {field.label}
                </label>
                {renderFilterInput(field)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}