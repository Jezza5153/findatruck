
'use client';

import { useState } from "react";
import type { FoodTruck } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Star, Clock, Utensils, Globe, Instagram, Facebook } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from "@/lib/utils";

interface FoodTruckCardProps {
  truck: FoodTruck;
}

export function FoodTruckCard({ truck }: FoodTruckCardProps) {
  const placeholderImage = `https://placehold.co/400x200.png?text=${encodeURIComponent(truck.name || 'Food Truck')}`;
  const mainImage =
    truck.imageUrl ||
    (Array.isArray(truck.imageGallery) && truck.imageGallery.length > 0
      ? truck.imageGallery[0]
      : placeholderImage);

  // Always an array, never undefined
  const gallery = Array.isArray(truck.imageGallery) && truck.imageGallery.length > 1
    ? truck.imageGallery.slice(1, 4)
    : [];
  const tags = Array.isArray(truck.tags) ? truck.tags.slice(0, 2) : [];

  const isOpen = !!truck.isOpen;
  const isFeatured = !!truck.isFeatured;
  const isFavorite = !!truck.isFavorite;

  const [imgSrc, setImgSrc] = useState(mainImage);

  return (
    <Card
      className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col h-full bg-card group"
      role="region"
      aria-labelledby={`truck-title-${truck.id}`}
    >
      <Link
        href={`/trucks/${truck.id}`}
        aria-label={`View details for ${truck.name}`}
        className="block relative w-full h-48 bg-muted focus:outline-none focus-visible:ring-2"
        tabIndex={0}
      >
        <div className="relative w-full h-full"> {/* Single child for Link */}
          <Image
            src={imgSrc}
            alt={truck.name || 'Food truck image'}
            fill
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 640px) 100vw, 400px"
            data-ai-hint={`${truck.imagePath || truck.cuisine || 'food'} truck photo`}
            onError={() => setImgSrc(placeholderImage)}
            unoptimized={imgSrc.startsWith("http") ? false : true}
            priority
          />
          {/* Feature + Favorite: Small, stylish pill overlays */}
          <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
            {isFeatured && (
              <span className="inline-flex items-center bg-yellow-400/80 text-black px-2 py-0.5 text-xs font-semibold rounded-full shadow-sm ring-1 ring-yellow-500/40">
                <Star className="w-4 h-4 mr-1 -ml-1" /> Featured
              </span>
            )}
            {isFavorite && (
              <span className="inline-flex items-center bg-pink-500/90 text-white px-2 py-0.5 text-xs font-semibold rounded-full shadow-sm ring-1 ring-pink-500/40">
                ♥ Favorite
              </span>
            )}
          </div>
          {/* Tiny gallery chips: More subtle, right side, under top bar */}
          {gallery.length > 0 && (
            <div className="absolute top-3 right-3 flex gap-1 z-10">
              {gallery.map((img, idx) => (
                <div key={img || idx} className="w-8 h-8 rounded overflow-hidden border border-white shadow ring-1 ring-black/10">
                  <Image
                    src={img}
                    alt={`Gallery image ${idx + 2}`}
                    fill
                    className="object-cover"
                    sizes="32px"
                    onError={e => (e.currentTarget.src = placeholderImage)}
                    unoptimized={img.startsWith("http") ? false : true}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </Link>
      <CardHeader className="pb-1 pt-4 px-5">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg md:text-2xl font-bold truncate flex-1" id={`truck-title-${truck.id}`}>
            <Link href={`/trucks/${truck.id}`} className="hover:text-primary transition-colors">
              <span>{truck.name || "Unnamed Truck"}</span> {/* Ensures single child for Link */}
            </Link>
          </CardTitle>
          {tags.length > 0 && (
            <div className="flex gap-1">{tags.map(tag => <Badge variant="secondary" key={tag}>{tag}</Badge>)}</div>
          )}
        </div>
        <CardDescription className="text-sm text-primary flex items-center pt-1">
          <Utensils className="w-4 h-4 mr-1.5 inline-block" /> {truck.cuisine || "Various"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow px-5 pb-0 pt-1 space-y-1.5 text-sm">
        <p className="text-muted-foreground mb-2 line-clamp-3 min-h-[3.25rem]">{truck.description || "No description available."}</p>
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
          {(typeof truck.rating === 'number' && truck.rating > 0) && (
            <span className="flex items-center text-muted-foreground">
              <Star className="w-4 h-4 mr-1.5 text-yellow-400 fill-yellow-400" />
              {truck.rating.toFixed(1)}
              <span className="ml-1 text-xs">
                {truck.numberOfRatings ? `(${truck.numberOfRatings} review${truck.numberOfRatings > 1 ? 's' : ''})` : ''}
              </span>
            </span>
          )}
          {truck.address && (
            <span className="flex items-center text-muted-foreground">
              <MapPin className="w-4 h-4 mr-1.5 text-secondary" />
              {truck.distance ? `${truck.distance} away` : truck.address}
            </span>
          )}
          {truck.operatingHoursSummary && (
            <span className="flex items-center text-muted-foreground">
              <Clock className="w-4 h-4 mr-1.5 text-secondary" />
              {truck.operatingHoursSummary}
            </span>
          )}
        </div>
        {isOpen !== undefined && (
          <Badge
            variant={isOpen ? "default" : "destructive"}
            className={`mt-2 ${isOpen
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            aria-label={isOpen ? "Open Now" : "Closed"}
          >
            {isOpen
              ? "Open Now"
              : (truck.operatingHoursSummary ? "Closed" : "Closed Today")
            }
          </Badge>
        )}
        {(truck.websiteUrl || truck.socialMediaLinks) && (
          <div className="flex gap-2 mt-3">
            {truck.websiteUrl && (
              <a href={truck.websiteUrl} target="_blank" rel="noopener noreferrer" aria-label="Website">
                <Globe className="w-5 h-5 text-blue-500 hover:text-blue-700 transition-colors" />
              </a>
            )}
            {truck.socialMediaLinks?.instagram && (
              <a href={truck.socialMediaLinks.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram className="w-5 h-5 text-pink-500 hover:text-pink-700 transition-colors" />
              </a>
            )}
            {truck.socialMediaLinks?.facebook && (
              <a href={truck.socialMediaLinks.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <Facebook className="w-5 h-5 text-blue-700 hover:text-blue-900 transition-colors" />
              </a>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-4 px-5 pb-5">
        <Link
          href={`/trucks/${truck.id}`}
          className={cn(buttonVariants(), "w-full bg-primary hover:bg-primary/90")}
          aria-label={`View details and menu for ${truck.name}`}
        >
          <span>View Details & Menu</span> {/* Ensures single child for Link styled as button */}
        </Link>
      </CardFooter>
    </Card>
  );
}
