"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, Trash2, Camera, X } from "lucide-react";
import { db } from "@/lib/instant";
import { useToast } from "@/components/ui/toast";
import { getISOWeekNumber, compressImage } from "@/lib/nutrition";
import type { WeeklyImage, ImageAngle } from "@/types";

const IMAGE_ANGLES: { value: ImageAngle; label: string; emoji: string }[] = [
  { value: 'front', label: 'Front', emoji: '👤' },
  { value: 'back', label: 'Back', emoji: '🔙' },
  { value: 'left', label: 'Left Side', emoji: '◀️' },
  { value: 'right', label: 'Right Side', emoji: '▶️' },
];

export default function ProgressImagesPage() {
  const { user } = db.useAuth();
  const { addToast } = useToast();
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string>("");
  const [selectedAngle, setSelectedAngle] = useState<ImageAngle>('front');
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Get current week info
  const today = new Date();
  const currentWeek = getISOWeekNumber(today);
  const currentYear = today.getFullYear();
  
  // Query weekly images
  const { data, isLoading } = db.useQuery({
    weeklyImages: {
      $: {
        where: {
          user: user?.id || "",
        },
      },
    },
  });
  
  const images = (data?.weeklyImages || []) as unknown as WeeklyImage[];
  const sortedImages = [...images].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    if (a.weekNumber !== b.weekNumber) return b.weekNumber - a.weekNumber;
    return a.angle.localeCompare(b.angle);
  });
  
  // Check which angles are missing for current week
  const currentWeekImages = images.filter(
    img => img.weekNumber === currentWeek && img.year === currentYear
  );
  const currentWeekAngles = new Set(currentWeekImages.map(img => img.angle));
  const missingAngles = IMAGE_ANGLES.filter(a => !currentWeekAngles.has(a.value));
  const hasAllAngles = missingAngles.length === 0;
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (warn if > 500KB)
    if (file.size > 500 * 1024) {
      addToast("Image is over 500KB. It will be compressed automatically.", "info");
    }
    
    // Check if image file
    if (!file.type.startsWith('image/')) {
      addToast("Please select an image file", "error");
      return;
    }
    
    setUploadFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleUpload = async () => {
    if (!uploadFile || !uploadPreview) {
      addToast("Please select an image", "error");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Compress image
      const compressed = await compressImage(uploadPreview, 800, 0.7);
      
      // Check if image already exists for this angle in current week
      const angleExists = currentWeekImages.some(img => img.angle === selectedAngle);
      if (angleExists) {
        addToast(`${selectedAngle} angle image already exists for this week`, "error");
        setIsUploading(false);
        return;
      }
      
      const now = Date.now();
      
      await db.transact([
        db.tx.weeklyImages[crypto.randomUUID()]
          .update({
            imageData: compressed,
            angle: selectedAngle,
            weekNumber: currentWeek,
            year: currentYear,
            caption: caption.trim() || "",
            date: today.toISOString().split('T')[0],
            createdAt: now,
          })
          .link({ user: user!.id }),
      ]);
      
      addToast(`${selectedAngle} angle uploaded successfully!`, "success");
      setIsUploadOpen(false);
      setUploadFile(null);
      setUploadPreview("");
      setSelectedAngle('front');
      setCaption("");
    } catch (error) {
      console.error("Error uploading image:", error);
      addToast("Failed to upload image. Please try again.", "error");
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDelete = async (imageId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image? This action cannot be undone."
    );
    
    if (!confirmed) return;
    
    try {
      await db.transact([db.tx.weeklyImages[imageId].delete()]);
      addToast("Image deleted successfully", "info");
    } catch (error) {
      console.error("Error deleting image:", error);
      addToast("Failed to delete image. Please try again.", "error");
    }
  };
  
  
  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center gap-4">
        <Link href="/nutrition">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Progress Images</h1>
          <p className="text-muted-foreground">Weekly photo gallery</p>
        </div>
        {!hasAllAngles && (
          <Button onClick={() => setIsUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload ({4 - currentWeekAngles.size}/4)
          </Button>
        )}
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p>💡 Tip: Visit Analytics to compare images across weeks</p>
      </div>
      
      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              Loading images...
            </div>
          </CardContent>
        </Card>
      ) : images.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-4 text-6xl">📸</div>
              <h3 className="mb-2 text-lg font-semibold">No progress images yet</h3>
              <p className="mb-4 text-sm text-muted-foreground max-w-sm">
                Upload one image per week to track your visual progress over time
              </p>
              <Button onClick={() => setIsUploadOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload First Image
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(
            sortedImages.reduce((acc, img) => {
              const key = `${img.year}-W${img.weekNumber}`;
              if (!acc[key]) acc[key] = [];
              acc[key].push(img);
              return acc;
            }, {} as Record<string, WeeklyImage[]>)
          ).map(([weekKey, weekImages]) => {
            const [year, week] = weekKey.split('-W');
            return (
              <Card key={weekKey}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Week {week}, {year}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {weekImages.length} of 4 angles uploaded
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
                    {IMAGE_ANGLES.map((angleConfig) => {
                      const image = weekImages.find(img => img.angle === angleConfig.value);
                      return (
                        <div key={angleConfig.value} className="space-y-2">
                          <div className="text-xs sm:text-sm font-medium text-center truncate">
                            <span className="text-base">{angleConfig.emoji}</span>
                            <span className="ml-1">{angleConfig.label}</span>
                          </div>
                          {image ? (
                            <div className="relative">
                              <div
                                className="relative aspect-[3/4] cursor-pointer rounded-lg overflow-hidden border hover:border-primary transition-colors"
                                onClick={() => setSelectedImage(image.imageData)}
                              >
                                <Image
                                  src={image.imageData}
                                  alt={`${angleConfig.label} view`}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-7 w-7 sm:h-8 sm:w-8"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(image.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                              {image.caption && (
                                <p className="mt-1 text-xs text-muted-foreground italic line-clamp-2">
                                  {image.caption}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="aspect-[3/4] rounded-lg border-2 border-dashed bg-muted flex items-center justify-center">
                              <div className="text-center text-muted-foreground p-2">
                                <Camera className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1" />
                                <p className="text-xs">Not uploaded</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Upload Dialog */}
      {isUploadOpen && (
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader className="sticky top-0 bg-background z-10 pb-4">
              <DialogTitle>Upload Progress Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Angle</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {IMAGE_ANGLES.filter(a => !currentWeekAngles.has(a.value)).map((angle) => (
                    <Button
                      key={angle.value}
                      type="button"
                      variant={selectedAngle === angle.value ? "default" : "outline"}
                      onClick={() => setSelectedAngle(angle.value)}
                      className="justify-start h-auto py-3"
                    >
                      <span className="mr-2 text-lg">{angle.emoji}</span>
                      <span className="text-sm">{angle.label}</span>
                    </Button>
                  ))}
                </div>
                {missingAngles.length === 0 && (
                  <p className="text-xs text-amber-600">
                    All angles uploaded for this week
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image-upload">Select Image</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Week {currentWeek}, {currentYear} - {IMAGE_ANGLES.find(a => a.value === selectedAngle)?.label}
                </p>
              </div>
              
              {uploadPreview && (
                <div className="relative aspect-[3/4] w-full max-w-sm mx-auto overflow-hidden rounded-lg border">
                  <Image
                    src={uploadPreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="caption">Caption (optional)</Label>
                <Textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a note about your progress..."
                  rows={2}
                  className="resize-none"
                />
              </div>
              
              <Button
                onClick={handleUpload}
                disabled={!uploadFile || isUploading}
                className="w-full sticky bottom-0 bg-primary"
              >
                {isUploading ? "Uploading..." : "Upload Image"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Image Preview Dialog */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] p-2 sm:p-6">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
              <Image
                src={selectedImage}
                alt="Full size preview"
                fill
                className="object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
      
    </div>
  );
}
