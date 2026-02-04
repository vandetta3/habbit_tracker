"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/instant";
import type { WeeklyImage, ImageAngle } from "@/types";

const IMAGE_ANGLES: { value: ImageAngle; label: string; emoji: string }[] = [
  { value: 'front', label: 'Front', emoji: '👤' },
  { value: 'back', label: 'Back', emoji: '🔙' },
  { value: 'left', label: 'Left Side', emoji: '◀️' },
  { value: 'right', label: 'Right Side', emoji: '▶️' },
];

export default function ImageAnalyticsPage() {
  const { user } = db.useAuth();
  const [selectedAngle, setSelectedAngle] = useState<ImageAngle>('front');
  
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
  
  // Filter images by selected angle and sort by week
  const angleImages = images
    .filter(img => img.angle === selectedAngle)
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.weekNumber - b.weekNumber;
    });
  
  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="flex items-center gap-4">
        <Link href="/nutrition/analytics">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Analytics
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Image Analytics</h1>
          <p className="text-muted-foreground">Compare progress across weeks</p>
        </div>
      </div>
      
      {/* Angle Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select View Angle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {IMAGE_ANGLES.map((angle) => {
              const angleCount = images.filter(img => img.angle === angle.value).length;
              return (
                <Button
                  key={angle.value}
                  variant={selectedAngle === angle.value ? "default" : "outline"}
                  onClick={() => setSelectedAngle(angle.value)}
                  className="h-auto flex-col py-4"
                >
                  <span className="text-2xl mb-1">{angle.emoji}</span>
                  <span className="font-semibold">{angle.label}</span>
                  <span className="text-xs opacity-70 mt-1">
                    {angleCount} {angleCount === 1 ? 'image' : 'images'}
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              Loading images...
            </div>
          </CardContent>
        </Card>
      ) : angleImages.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-4 text-6xl">📸</div>
              <h3 className="mb-2 text-lg font-semibold">
                No {IMAGE_ANGLES.find(a => a.value === selectedAngle)?.label} images yet
              </h3>
              <p className="mb-4 text-sm text-muted-foreground max-w-sm">
                Upload {selectedAngle} angle images from the Progress Images page to see comparisons
              </p>
              <Link href="/nutrition/images">
                <Button>Go to Progress Images</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Progress Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>
                {IMAGE_ANGLES.find(a => a.value === selectedAngle)?.emoji}{" "}
                {IMAGE_ANGLES.find(a => a.value === selectedAngle)?.label} Progress Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {angleImages.map((image, index) => (
                  <div key={image.id} className="space-y-2">
                    <div className="text-sm font-medium text-center">
                      Week {image.weekNumber}, {image.year}
                    </div>
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden border-2 border-primary/20">
                      <Image
                        src={image.imageData}
                        alt={`Week ${image.weekNumber}`}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">
                        #{index + 1}
                      </div>
                    </div>
                    {image.caption && (
                      <p className="text-xs text-muted-foreground italic text-center">
                        {image.caption}
                      </p>
                    )}
                    <p className="text-xs text-center text-muted-foreground">
                      {new Date(image.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Before & After Comparison */}
          {angleImages.length >= 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Before & After Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* First Image */}
                  <div className="space-y-3">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-green-600">BEFORE</h3>
                      <p className="text-sm text-muted-foreground">
                        Week {angleImages[0].weekNumber}, {angleImages[0].year}
                      </p>
                    </div>
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden border-4 border-green-500">
                      <Image
                        src={angleImages[0].imageData}
                        alt="Before"
                        fill
                        className="object-cover"
                      />
                    </div>
                    {angleImages[0].caption && (
                      <p className="text-sm text-center italic text-muted-foreground">
                        {angleImages[0].caption}
                      </p>
                    )}
                  </div>
                  
                  {/* Latest Image */}
                  <div className="space-y-3">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-blue-600">AFTER</h3>
                      <p className="text-sm text-muted-foreground">
                        Week {angleImages[angleImages.length - 1].weekNumber},{" "}
                        {angleImages[angleImages.length - 1].year}
                      </p>
                    </div>
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden border-4 border-blue-500">
                      <Image
                        src={angleImages[angleImages.length - 1].imageData}
                        alt="After"
                        fill
                        className="object-cover"
                      />
                    </div>
                    {angleImages[angleImages.length - 1].caption && (
                      <p className="text-sm text-center italic text-muted-foreground">
                        {angleImages[angleImages.length - 1].caption}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-muted rounded-lg text-center">
                  <p className="text-sm font-medium">
                    Progress Duration: {angleImages.length} weeks
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Keep uploading weekly images to track your transformation!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Recent Progress (Last 4 weeks) */}
          {angleImages.length >= 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Progress (Last 4 Weeks)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  {angleImages.slice(-4).map((image, index) => (
                    <div key={image.id} className="space-y-2">
                      <div className="text-sm font-medium text-center">
                        Week {image.weekNumber}
                      </div>
                      <div className="relative aspect-[3/4] rounded-lg overflow-hidden border">
                        <Image
                          src={image.imageData}
                          alt={`Week ${image.weekNumber}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
