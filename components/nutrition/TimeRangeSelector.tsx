"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "lucide-react";
import type { TimeRange } from "@/types";

interface TimeRangeSelectorProps {
  selected: TimeRange;
  onSelect: (range: TimeRange, customDates?: { start: string; end: string }) => void;
  customDates?: { start: string; end: string };
}

export function TimeRangeSelector({ selected, onSelect, customDates }: TimeRangeSelectorProps) {
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customStart, setCustomStart] = useState(customDates?.start || "");
  const [customEnd, setCustomEnd] = useState(customDates?.end || "");
  
  const ranges: { value: TimeRange; label: string }[] = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: '3months', label: '3 Months' },
    { value: '6months', label: '6 Months' },
  ];
  
  const handleCustomApply = () => {
    if (!customStart || !customEnd) {
      alert("Please select both start and end dates");
      return;
    }
    
    if (customStart > customEnd) {
      alert("Start date must be before end date");
      return;
    }
    
    onSelect('custom', { start: customStart, end: customEnd });
    setIsCustomOpen(false);
  };
  
  return (
    <div className="flex flex-wrap gap-2">
      {ranges.map((range) => (
        <Button
          key={range.value}
          variant={selected === range.value ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(range.value)}
        >
          {range.label}
        </Button>
      ))}
      
      <Button
        variant={selected === 'custom' ? "default" : "outline"}
        size="sm"
        onClick={() => setIsCustomOpen(true)}
      >
        <Calendar className="mr-2 h-4 w-4" />
        Custom
      </Button>
      
      <Dialog open={isCustomOpen} onOpenChange={setIsCustomOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Custom Date Range</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <Button onClick={handleCustomApply} className="w-full">
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
