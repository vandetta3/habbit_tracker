"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Volume2, ChevronDown, ChevronUp } from "lucide-react";
import type { SoundProfile, MergedSoundSettings } from "@/types";

interface SoundSettingsPanelProps {
  settings: MergedSoundSettings;
  isCustom: boolean;
  onChange: (field: keyof MergedSoundSettings, value: any) => void;
  onTest?: () => void;
}

export function SoundSettingsPanel({
  settings,
  isCustom,
  onChange,
  onTest,
}: SoundSettingsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const soundProfiles: { value: SoundProfile; label: string; description: string }[] = [
    { value: "OFF", label: "Off", description: "No sounds" },
    { value: "BEEP", label: "Beeps Only", description: "Simple beep alerts" },
    { value: "BEEP+VOICE", label: "Beeps + Voice", description: "Beeps with spoken labels" },
  ];
  
  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            <CardTitle className="text-base">Sound Settings</CardTitle>
            {!isCustom && (
              <Badge variant="secondary" className="text-xs">
                Using Global Defaults
              </Badge>
            )}
            {isCustom && (
              <Badge variant="default" className="text-xs">
                Custom
              </Badge>
            )}
          </div>
          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Sound Profile */}
          <div className="space-y-2">
            <Label className="text-sm">Sound Profile</Label>
            <div className="grid grid-cols-1 gap-2">
              {soundProfiles.map((profile) => (
                <button
                  key={profile.value}
                  type="button"
                  onClick={() => onChange("soundProfile", profile.value)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    settings.soundProfile === profile.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="font-medium text-sm">{profile.label}</div>
                  <div className="text-xs text-muted-foreground">{profile.description}</div>
                </button>
              ))}
            </div>
          </div>
          
          {settings.soundProfile !== "OFF" && (
            <>
              {/* Warning Countdown */}
              <div className="space-y-2">
                <Label htmlFor="warning-countdown" className="text-sm">
                  Warning Countdown
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="warning-countdown"
                    type="number"
                    min="0"
                    max="30"
                    value={settings.warningCountdown}
                    onChange={(e) => onChange("warningCountdown", parseInt(e.target.value) || 0)}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">
                    seconds (0 = off)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Beep during the last N seconds of each step
                </p>
              </div>
              
              {/* Sound Toggles */}
              <div className="space-y-3">
                <Label className="text-sm">Sound Events</Label>
                
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.startSound}
                      onChange={(e) => onChange("startSound", e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm">Play sound when step starts</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.endSound}
                      onChange={(e) => onChange("endSound", e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm">Play sound when step ends</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.stepChangeSound}
                      onChange={(e) => onChange("stepChangeSound", e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm">Play sound on step change</span>
                  </label>
                </div>
              </div>
              
              {/* Volume */}
              <div className="space-y-2">
                <Label htmlFor="volume" className="text-sm">
                  Volume: {settings.volume}%
                </Label>
                <div className="flex items-center gap-3">
                  <input
                    id="volume"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={settings.volume}
                    onChange={(e) => onChange("volume", parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onTest}
                  >
                    Test
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
}
