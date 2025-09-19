import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, X, Tag } from 'lucide-react';
import { useContactTagsContext, ContactTag } from '@/contexts/ContactTagsContext';
import { cn } from '@/lib/utils';

interface ContactTagsProps {
  contactId: string;
  tags: ContactTag[];
  onTagsChange?: () => void;
  className?: string;
}

interface TagCreationFormProps {
  onTagCreated: (tag: ContactTag) => void;
  onClose: () => void;
}

const TagCreationForm: React.FC<TagCreationFormProps> = ({ onTagCreated, onClose }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [description, setDescription] = useState('');
  const { createTag } = useContactTagsContext();

  const predefinedColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
    '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newTag = await createTag({
      name: name.trim(),
      color,
      description: description.trim() || undefined
    });

    if (newTag) {
      onTagCreated(newTag);
      setName('');
      setColor('#3b82f6');
      setDescription('');
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="tagName">Tag Name</Label>
        <Input
          id="tagName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter tag name"
          required
        />
      </div>
      
      <div>
        <Label>Color</Label>
        <div className="flex items-center gap-2 mt-2">
          {predefinedColors.map((presetColor) => (
            <button
              key={presetColor}
              type="button"
              className={cn(
                "w-6 h-6 rounded-full border-2",
                color === presetColor ? "border-gray-900" : "border-gray-300"
              )}
              style={{ backgroundColor: presetColor }}
              onClick={() => setColor(presetColor)}
            />
          ))}
          <Input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-6 p-0 border-0"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="tagDescription">Description (Optional)</Label>
        <Input
          id="tagDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter tag description"
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm">Create Tag</Button>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export const ContactTags: React.FC<ContactTagsProps> = ({
  contactId,
  tags,
  onTagsChange,
  className
}) => {
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const { tags: allTags, assignTagToContact, removeTagFromContact, refetch } = useContactTagsContext();
  
  const availableTags = allTags.filter(tag => 
    !tags.some(contactTag => contactTag.id === tag.id)
  );

  const handleAssignTag = async (tagId: string) => {
    await assignTagToContact(contactId, tagId);
    onTagsChange?.();
  };

  const handleRemoveTag = async (tagId: string) => {
    await removeTagFromContact(contactId, tagId);
    onTagsChange?.();
  };

  const handleTagCreated = (newTag: ContactTag) => {
    refetch();
  };

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {tags.map((tag) => (
        <Badge
          key={tag.id}
          variant="secondary"
          className="flex items-center gap-1 pr-1"
          style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: tag.color }}
        >
          <span>{tag.name}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRemoveTag(tag.id)}
            className="h-4 w-4 p-0 hover:bg-red-100 ml-1"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-6 px-2">
            <Plus className="h-3 w-3 mr-1" />
            Tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-3">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Add Tags
            </h4>
            
            {availableTags.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground">Available Tags</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {availableTags.map((tag) => (
                    <Button
                      key={tag.id}
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleAssignTag(tag.id)}
                      style={{ borderColor: tag.color, color: tag.color }}
                    >
                      {tag.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-3 w-3 mr-1" />
                  Create New Tag
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Tag</DialogTitle>
                </DialogHeader>
                <TagCreationForm
                  onTagCreated={handleTagCreated}
                  onClose={() => setIsTagDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
