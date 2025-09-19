
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { CreateTemplateData } from '@/hooks/useChecklistTemplates';
import { TodoSection, TodoItem } from '@/types/shipmentTodo';

interface TemplateFormProps {
  initialData?: CreateTemplateData;
  onSubmit: (data: CreateTemplateData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export const TemplateForm: React.FC<TemplateFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<CreateTemplateData>({
    name: '',
    description: '',
    template_data: [],
    is_default: false
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addSection = () => {
    const newSection: TodoSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      items: []
    };
    setFormData(prev => ({
      ...prev,
      template_data: [...prev.template_data, newSection]
    }));
  };

  const updateSection = (sectionIndex: number, updates: Partial<TodoSection>) => {
    setFormData(prev => ({
      ...prev,
      template_data: prev.template_data.map((section, index) => 
        index === sectionIndex ? { ...section, ...updates } : section
      )
    }));
  };

  const removeSection = (sectionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      template_data: prev.template_data.filter((_, index) => index !== sectionIndex)
    }));
  };

  const addTask = (sectionIndex: number) => {
    const newTask: TodoItem = {
      id: `task-${Date.now()}`,
      label: 'New Task',
      completed: false,
      priority: 'medium'
    };
    
    setFormData(prev => ({
      ...prev,
      template_data: prev.template_data.map((section, index) => 
        index === sectionIndex 
          ? { ...section, items: [...section.items, newTask] }
          : section
      )
    }));
  };

  const updateTask = (sectionIndex: number, taskIndex: number, updates: Partial<TodoItem>) => {
    setFormData(prev => ({
      ...prev,
      template_data: prev.template_data.map((section, sIndex) => 
        sIndex === sectionIndex 
          ? {
              ...section,
              items: section.items.map((task, tIndex) => 
                tIndex === taskIndex ? { ...task, ...updates } : task
              )
            }
          : section
      )
    }));
  };

  const removeTask = (sectionIndex: number, taskIndex: number) => {
    setFormData(prev => ({
      ...prev,
      template_data: prev.template_data.map((section, sIndex) => 
        sIndex === sectionIndex 
          ? { ...section, items: section.items.filter((_, tIndex) => tIndex !== taskIndex) }
          : section
      )
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter template name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter template description"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_default"
          checked={formData.is_default}
          onCheckedChange={(checked) => 
            setFormData(prev => ({ ...prev, is_default: checked as boolean }))
          }
        />
        <Label htmlFor="is_default">Set as default template</Label>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Checklist Sections</h3>
          <Button type="button" onClick={addSection} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </div>

        {formData.template_data.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No sections yet. Click "Add Section" to get started.
            </CardContent>
          </Card>
        ) : (
          <Accordion type="multiple" defaultValue={formData.template_data.map((_, i) => i.toString())}>
            {formData.template_data.map((section, sectionIndex) => (
              <AccordionItem key={section.id} value={sectionIndex.toString()}>
                <Card>
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center justify-between w-full mr-4">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{section.title}</span>
                        <Badge variant="outline">
                          {section.items.length} tasks
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSection(sectionIndex);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Section Title</Label>
                        <Input
                          value={section.title}
                          onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
                          placeholder="Enter section title"
                        />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Tasks</Label>
                          <Button 
                            type="button" 
                            onClick={() => addTask(sectionIndex)} 
                            variant="outline"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Task
                          </Button>
                        </div>

                        {section.items.map((task, taskIndex) => (
                          <Card key={task.id} className="p-3">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <Label>Task {taskIndex + 1}</Label>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => removeTask(sectionIndex, taskIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div>
                                <Label>Task Description</Label>
                                <Textarea
                                  value={task.label}
                                  onChange={(e) => updateTask(sectionIndex, taskIndex, { label: e.target.value })}
                                  placeholder="Enter task description"
                                  rows={2}
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label>Priority</Label>
                                  <Select
                                    value={task.priority}
                                    onValueChange={(value) => 
                                      updateTask(sectionIndex, taskIndex, { priority: value as 'high' | 'medium' | 'low' })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="high">High</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="flex items-end">
                                  <Badge variant={getPriorityColor(task.priority || 'medium')}>
                                    {task.priority || 'medium'} priority
                                  </Badge>
                                </div>
                              </div>

                              {task.notes && (
                                <div>
                                  <Label>Notes</Label>
                                  <Textarea
                                    value={task.notes}
                                    onChange={(e) => updateTask(sectionIndex, taskIndex, { notes: e.target.value })}
                                    placeholder="Add notes for this task"
                                    rows={2}
                                  />
                                </div>
                              )}
                            </div>
                          </Card>
                        ))}

                        {section.items.length === 0 && (
                          <div className="text-center text-muted-foreground py-4 border-2 border-dashed rounded-lg">
                            No tasks in this section. Click "Add Task" to add one.
                          </div>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      <div className="flex items-center gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Template'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
