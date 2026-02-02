'use client';

// ==========================================
// Rwanda Christian University Management System
// Customizable Dashboard Component
// ==========================================

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Settings, X, Plus, GripVertical, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRoleAccess } from '@/lib/role-access';

interface DashboardWidget {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  roles: string[];
  defaultVisible: boolean;
  category: string;
  description?: string;
}

interface CustomizableDashboardProps {
  availableWidgets: DashboardWidget[];
  defaultLayout?: string[];
  onLayoutChange?: (layout: string[]) => void;
  className?: string;
}

export function CustomizableDashboard({
  availableWidgets,
  defaultLayout = [],
  onLayoutChange,
  className = '',
}: CustomizableDashboardProps) {
  const { data: session } = useSession();
  const { userRole } = useRoleAccess();
  const [showSettings, setShowSettings] = useState(false);
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(defaultLayout);
  const [isEditMode, setIsEditMode] = useState(false);

  // Load user preferences from localStorage
  useEffect(() => {
    const savedLayout = localStorage.getItem(`dashboard-layout-${userRole}`);
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout);
        setVisibleWidgets(parsed);
      } catch (error) {
        console.error('Failed to parse saved dashboard layout:', error);
        setVisibleWidgets(defaultLayout);
      }
    } else {
      setVisibleWidgets(defaultLayout);
    }
  }, [userRole, defaultLayout]);

  // Save preferences to localStorage
  const saveLayout = (layout: string[]) => {
    localStorage.setItem(`dashboard-layout-${userRole}`, JSON.stringify(layout));
    onLayoutChange?.(layout);
  };

  // Filter widgets based on user role
  const userWidgets = availableWidgets.filter(widget =>
    widget.roles.includes(userRole || 'student')
  );

  const visibleWidgetComponents = userWidgets.filter(widget =>
    visibleWidgets.includes(widget.id)
  );

  const hiddenWidgets = userWidgets.filter(widget =>
    !visibleWidgets.includes(widget.id)
  );

  const toggleWidgetVisibility = (widgetId: string) => {
    const newVisible = visibleWidgets.includes(widgetId)
      ? visibleWidgets.filter(id => id !== widgetId)
      : [...visibleWidgets, widgetId];

    setVisibleWidgets(newVisible);
    saveLayout(newVisible);
  };

  const moveWidget = (fromIndex: number, toIndex: number) => {
    const newVisible = [...visibleWidgets];
    const [moved] = newVisible.splice(fromIndex, 1);
    newVisible.splice(toIndex, 0, moved);

    setVisibleWidgets(newVisible);
    saveLayout(newVisible);
  };

  const resetToDefault = () => {
    setVisibleWidgets(defaultLayout);
    saveLayout(defaultLayout);
  };

  return (
    <div className={className}>
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name}! Here's your overview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetToDefault}
              className="text-xs"
            >
              Reset to Default
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditMode(!isEditMode)}
            className="flex items-center gap-2"
          >
            {isEditMode ? <Eye className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
            {isEditMode ? 'Done' : 'Customize'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Widgets
          </Button>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleWidgetComponents.map((widget, index) => {
          const WidgetComponent = widget.component;

          return (
            <Card key={widget.id} className="relative group">
              {isEditMode && (
                <div className="absolute -top-2 -right-2 z-10 flex items-center gap-1">
                  <button
                    onClick={() => toggleWidgetVisibility(widget.id)}
                    className="p-1 bg-background border rounded-full shadow-sm hover:bg-muted"
                    title="Hide widget"
                  >
                    <EyeOff className="h-3 w-3" />
                  </button>
                  <div className="p-1 bg-background border rounded-full shadow-sm cursor-move">
                    <GripVertical className="h-3 w-3" />
                  </div>
                </div>
              )}

              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{widget.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <WidgetComponent />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {visibleWidgetComponents.length === 0 && (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Settings className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">No widgets visible</h3>
              <p className="text-muted-foreground">
                Customize your dashboard by adding widgets that are relevant to you.
              </p>
            </div>
            <Button onClick={() => setShowSettings(true)}>
              Add Widgets
            </Button>
          </div>
        </Card>
      )}

      {/* Widget Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Customize Dashboard"
        description="Choose which widgets to display on your dashboard"
      >
        <div className="space-y-6">
          {/* Group widgets by category */}
          {Array.from(new Set(userWidgets.map(w => w.category))).map(category => {
            const categoryWidgets = userWidgets.filter(w => w.category === category);

            return (
              <div key={category} className="space-y-3">
                <h4 className="font-semibold text-foreground capitalize">{category}</h4>
                <div className="space-y-2">
                  {categoryWidgets.map(widget => {
                    const isVisible = visibleWidgets.includes(widget.id);

                    return (
                      <div
                        key={widget.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{widget.title}</span>
                            {isVisible && <Badge variant="default" className="text-xs">Visible</Badge>}
                          </div>
                          {widget.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {widget.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant={isVisible ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => toggleWidgetVisibility(widget.id)}
                        >
                          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Example widget components
export function StatsWidget({ title, value, change, icon: Icon }: {
  title: string;
  value: string;
  change?: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-4">
      {Icon && (
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      )}
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{title}</p>
        {change && (
          <p className="text-xs text-green-600">{change}</p>
        )}
      </div>
    </div>
  );
}

export function RecentActivityWidget({ activities }: { activities: Array<{ title: string; time: string }> }) {
  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className="text-sm">{activity.title}</span>
          <span className="text-xs text-muted-foreground">{activity.time}</span>
        </div>
      ))}
    </div>
  );
}