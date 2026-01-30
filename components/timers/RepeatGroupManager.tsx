"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Repeat, Trash2, Check } from "lucide-react";
import type { StepFormData } from "./TimerStepInput";

export interface GroupFormData {
  id: string;
  name?: string;
  repeatCount: number;
  stepIds: string[];
}

interface RepeatGroupManagerProps {
  steps: StepFormData[];
  groups: GroupFormData[];
  onGroupCreate: (stepIds: string[], repeatCount: number, name?: string) => void;
  onGroupUpdate: (groupId: string, field: keyof GroupFormData, value: any) => void;
  onGroupDelete: (groupId: string) => void;
}

export function RepeatGroupManager({
  steps,
  groups,
  onGroupCreate,
  onGroupUpdate,
  onGroupDelete,
}: RepeatGroupManagerProps) {
  const [selectedStepIds, setSelectedStepIds] = useState<string[]>([]);
  const [newGroupRepeatCount, setNewGroupRepeatCount] = useState(2);
  const [newGroupName, setNewGroupName] = useState("");
  const [showGroupForm, setShowGroupForm] = useState(false);
  
  const handleStepToggle = (stepId: string) => {
    if (selectedStepIds.includes(stepId)) {
      setSelectedStepIds(selectedStepIds.filter(id => id !== stepId));
    } else {
      setSelectedStepIds([...selectedStepIds, stepId]);
    }
  };
  
  const handleCreateGroup = () => {
    if (selectedStepIds.length < 2) return;
    
    onGroupCreate(selectedStepIds, newGroupRepeatCount, newGroupName.trim() || undefined);
    
    // Reset form
    setSelectedStepIds([]);
    setNewGroupRepeatCount(2);
    setNewGroupName("");
    setShowGroupForm(false);
  };
  
  const getStepLabel = (stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    return step?.label || "Unknown Step";
  };
  
  const isStepInGroup = (stepId: string) => {
    return groups.some(group => group.stepIds.includes(stepId));
  };
  
  const canCreateGroup = selectedStepIds.length >= 2 && 
    selectedStepIds.every(id => !isStepInGroup(id));
  
  return (
    <div className="space-y-4">
      {/* Existing Groups */}
      {groups.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Repeat Groups</h4>
          {groups.map((group) => (
            <Card key={group.id} className="border-l-4" style={{ borderLeftColor: "#6366f1" }}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Repeat className="h-4 w-4" />
                    {group.name || "Unnamed Group"}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onGroupDelete(group.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`group-${group.id}-repeat`} className="text-xs whitespace-nowrap">
                    Repeat Count:
                  </Label>
                  <Input
                    id={`group-${group.id}-repeat`}
                    type="number"
                    min="1"
                    max="99"
                    value={group.repeatCount}
                    onChange={(e) => 
                      onGroupUpdate(group.id, "repeatCount", parseInt(e.target.value) || 1)
                    }
                    className="w-20"
                  />
                  <span className="text-xs text-muted-foreground">times</span>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Steps in Group:</Label>
                  <div className="flex flex-wrap gap-1">
                    {group.stepIds.map((stepId) => (
                      <Badge key={stepId} variant="secondary">
                        {getStepLabel(stepId)}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Create New Group */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Create Repeat Group</h4>
          {!showGroupForm && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowGroupForm(true)}
            >
              <Repeat className="h-4 w-4 mr-2" />
              New Group
            </Button>
          )}
        </div>
        
        {showGroupForm && (
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Select Steps (min 2, ungrouped only)</Label>
                <div className="space-y-1 max-h-48 overflow-y-auto border rounded-md p-2">
                  {steps.map((step, index) => {
                    const inGroup = isStepInGroup(step.id);
                    const isSelected = selectedStepIds.includes(step.id);
                    
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => !inGroup && handleStepToggle(step.id)}
                        disabled={inGroup}
                        className={`w-full flex items-center gap-2 p-2 rounded text-left text-sm transition-colors ${
                          inGroup
                            ? "opacity-50 cursor-not-allowed"
                            : isSelected
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`}
                      >
                        <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                          isSelected ? "bg-primary-foreground border-primary-foreground" : "border-muted-foreground"
                        }`}>
                          {isSelected && <Check className="h-3 w-3 text-primary" />}
                        </div>
                        <span>
                          Step {index + 1}: {step.label}
                        </span>
                        {inGroup && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            In Group
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="new-group-name" className="text-xs">
                    Group Name (optional)
                  </Label>
                  <Input
                    id="new-group-name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g., Warmup Cycle"
                    maxLength={50}
                  />
                </div>
                
                <div>
                  <Label htmlFor="new-group-repeat" className="text-xs">
                    Repeat Count
                  </Label>
                  <Input
                    id="new-group-repeat"
                    type="number"
                    min="1"
                    max="99"
                    value={newGroupRepeatCount}
                    onChange={(e) => setNewGroupRepeatCount(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleCreateGroup}
                  disabled={!canCreateGroup}
                  className="flex-1"
                >
                  Create Group
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowGroupForm(false);
                    setSelectedStepIds([]);
                    setNewGroupName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
