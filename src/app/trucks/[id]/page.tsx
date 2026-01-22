'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MapPin, Star, Clock, Phone, Globe, ArrowLeft,
  Utensils, Heart, Share2, Navigation, Gift, Tag,
  MessageSquare, Info, CheckCircle, Loader2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  isSpecial?: boolean;
  availability?: string;
}

interface Special {
  id: string;
  title: string;
  description?: string;
  discountPercent?: number;
  startTime?: string;
  endTime?: string;
  isActive: boolean;
}

interface Review {
  id: string;
  userId: string;
  userName?: string;
  rating: number;
  text?: string;
  ownerReply?: string;
  createdAt: string;
}

interface TruckData {
  id: string;
  name: string;
  cuisine: string;
  description?: string;
  imageUrl?: string;
  rating?: number;
  numberOfRatings?: number;
  isOpen?: boolean;
  address?: string;
  phone?: string;
  ctaPhoneNumber?: string;
  facebookHandle?: string;
  instagramHandle?: string;
  tiktokHandle?: string;
  websiteUrl?: string;
  tags?: string[];
  features?: string[];
  menuItems?: MenuItem[];
  menuCategories?: { id: string; name: string }[];
  specials?: Special[];
  reviews?: Review[];
  lat?: number;
  lng?: number;
}

export default function TruckDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const truckId = params.id as string;

  const [truck, setTruck] = useState<TruckData | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [specials, setSpecials] = useState<Special[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('menu');

  // Check-in state
  const [checkInStatus, setCheckInStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [checkInMessage, setCheckInMessage] = useState('');
  const [checkInResult, setCheckInResult] = useState<{ stampsEarned?: number; rewardUnlocked?: boolean } | null>(null);

  useEffect(() => {
    async function fetchTruck() {
      try {
        const res = await fetch(`/api/trucks/${truckId}`);
        const data = await res.json();
        if (data.success) {
          setTruck(data.data);
          setMenuItems(data.data.menuItems || []);
          setSpecials(data.data.specials || []);
          setReviews(data.data.reviews || []);
        }
      } catch (error) {
        console.error('Error fetching truck:', error);
      } finally {
        setLoading(false);
      }
    }

    if (truckId) {
      fetchTruck();
      checkFavoriteStatus();
    }
  }, [truckId]);

  const checkFavoriteStatus = async () => {
    if (!session?.user) return;
    try {
      const res = await fetch(`/api/user/favorites/${truckId}`);
      if (res.ok) {
        const data = await res.json();
        setIsFavorite(data.isFavorite);
      }
    } catch {
      // Ignore
    }
  };

  const toggleFavorite = async () => {
    if (!session?.user) {
      router.push('/login?redirect=' + encodeURIComponent(`/trucks/${truckId}`));
      return;
    }

    try {
      if (isFavorite) {
        await fetch(`/api/user/favorites/${truckId}`, { method: 'DELETE' });
      } else {
        await fetch('/api/user/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ truckId }),
        });
      }
      setIsFavorite(!isFavorite);
    } catch {
      // Handle error
    }
  };

  const handleCheckIn = useCallback(async () => {
    if (!session?.user) {
      router.push('/login?redirect=' + encodeURIComponent(`/trucks/${truckId}`));
      return;
    }

    setCheckInStatus('checking');
    setCheckInMessage('Getting your location...');

    if (!navigator.geolocation) {
      setCheckInStatus('error');
      setCheckInMessage('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCheckInMessage('Verifying location...');

        try {
          const res = await fetch('/api/check-in', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              truckId,
              lat: latitude,
              lng: longitude,
            }),
          });

          const data = await res.json();

          if (res.ok) {
            setCheckInStatus('success');
            setCheckInMessage('Checked in successfully!');
            setCheckInResult(data.loyalty);
          } else {
            setCheckInStatus('error');
            setCheckInMessage(data.error || 'Check-in failed');
          }
        } catch {
          setCheckInStatus('error');
          setCheckInMessage('Failed to check in. Please try again.');
        }
      },
      () => {
        setCheckInStatus('error');
        setCheckInMessage('Unable to get your location');
      }
    );
  }, [session, truckId, router]);

  const openDirections = () => {
    if (truck?.lat && truck?.lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${truck.lat},${truck.lng}`, '_blank');
    } else if (truck?.address) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(truck.address)}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="container mx-auto max-w-4xl">
          <Skeleton className="h-64 w-full bg-slate-700 rounded-xl mb-6" />
          <Skeleton className="h-8 w-64 bg-slate-700 mb-4" />
          <Skeleton className="h-4 w-full bg-slate-700 mb-2" />
          <Skeleton className="h-4 w-3/4 bg-slate-700" />
        </div>
      </div>
    );
  }

  if (!truck) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <Card className="bg-slate-800/50 border-slate-700/50 p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Truck not found</h2>
          <Link href="/map">
            <Button>Back to Map</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const activeSpecials = specials.filter(s => s.isActive);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
      {/* Hero Header */}
      <div className="relative h-64 sm:h-80 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
        {truck.imageUrl && (
          <img
            src={truck.imageUrl}
            alt={truck.name}
            className="w-full h-full object-cover opacity-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />

        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Link href="/map">
            <Button variant="ghost" className="bg-slate-900/50 backdrop-blur-sm hover:bg-slate-900/70 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
        </div>

        {/* Status badges */}
        <div className="absolute top-4 right-4 flex gap-2">
          {truck.isOpen !== undefined && (
            <Badge className={truck.isOpen ? 'bg-green-500' : 'bg-slate-600'}>
              {truck.isOpen ? 'Open Now' : 'Closed'}
            </Badge>
          )}
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 -mt-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Main Info Card */}
          <Card className="bg-slate-800/90 backdrop-blur-sm border-slate-700/50 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{truck.name}</h1>
                  <p className="text-slate-400 text-lg">{truck.cuisine}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleFavorite}
                    className={cn(
                      "border-slate-600",
                      isFavorite ? 'bg-pink-500/20 border-pink-500 text-pink-400' : 'text-slate-400 hover:text-white'
                    )}
                  >
                    <Heart className={cn("w-5 h-5", isFavorite && 'fill-current')} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={openDirections}
                    className="border-slate-600 text-slate-400 hover:text-white"
                  >
                    <Navigation className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-slate-600 text-slate-400 hover:text-white"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Rating */}
              {truck.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1 text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-lg">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="font-bold">{truck.rating}</span>
                  </div>
                  {truck.numberOfRatings && (
                    <span className="text-slate-400 text-sm">({truck.numberOfRatings} reviews)</span>
                  )}
                </div>
              )}

              {/* Check-in Button */}
              {truck.isOpen && (
                <div className="mb-4">
                  <AnimatePresence mode="wait">
                    {checkInStatus === 'idle' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Button
                          onClick={handleCheckIn}
                          className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400"
                        >
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Check In & Earn Stamp
                        </Button>
                      </motion.div>
                    )}
                    {checkInStatus === 'checking' && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-slate-300"
                      >
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {checkInMessage}
                      </motion.div>
                    )}
                    {checkInStatus === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-xl bg-green-500/10 border border-green-500/30"
                      >
                        <div className="flex items-center gap-2 text-green-400 font-semibold mb-1">
                          <CheckCircle className="w-5 h-5" />
                          {checkInMessage}
                        </div>
                        {checkInResult && (
                          <p className="text-sm text-slate-300">
                            +{checkInResult.stampsEarned} stamp earned!
                            {checkInResult.rewardUnlocked && (
                              <span className="text-yellow-400 font-semibold ml-2">🎉 Reward unlocked!</span>
                            )}
                          </p>
                        )}
                      </motion.div>
                    )}
                    {checkInStatus === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 text-red-400">
                          <X className="w-5 h-5" />
                          {checkInMessage}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setCheckInStatus('idle')}
                          className="text-slate-400 hover:text-white"
                        >
                          Try Again
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Tags */}
              {truck.tags && truck.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {truck.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-slate-700 text-slate-300">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="bg-slate-800/80 border border-slate-700/50 p-1 w-full grid grid-cols-4">
              <TabsTrigger value="menu" className="data-[state=active]:bg-slate-700">
                <Utensils className="w-4 h-4 mr-2" />
                Menu
              </TabsTrigger>
              <TabsTrigger value="specials" className="data-[state=active]:bg-slate-700 relative">
                <Tag className="w-4 h-4 mr-2" />
                Specials
                {activeSpecials.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[10px] flex items-center justify-center">
                    {activeSpecials.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-slate-700">
                <MessageSquare className="w-4 h-4 mr-2" />
                Reviews
              </TabsTrigger>
              <TabsTrigger value="about" className="data-[state=active]:bg-slate-700">
                <Info className="w-4 h-4 mr-2" />
                About
              </TabsTrigger>
            </TabsList>

            {/* Menu Tab */}
            <TabsContent value="menu">
              <Card className="bg-slate-800/90 backdrop-blur-sm border-slate-700/50">
                <CardContent className="p-6">
                  {menuItems.length > 0 ? (
                    <div className="space-y-4">
                      {menuItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-4 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                        >
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{item.name}</h4>
                              {item.isSpecial && (
                                <Badge className="bg-orange-500 text-white text-xs">Special</Badge>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-sm text-slate-400 line-clamp-1">{item.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">${item.price.toFixed(2)}</p>
                            {item.availability === 'sold_out' && (
                              <span className="text-xs text-red-400">Sold Out</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Menu coming soon</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Specials Tab */}
            <TabsContent value="specials">
              <Card className="bg-slate-800/90 backdrop-blur-sm border-slate-700/50">
                <CardContent className="p-6">
                  {activeSpecials.length > 0 ? (
                    <div className="space-y-4">
                      {activeSpecials.map((special) => (
                        <div
                          key={special.id}
                          className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/20"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold flex items-center gap-2">
                                {special.title}
                                {special.discountPercent && (
                                  <Badge className="bg-green-500 text-white">
                                    {special.discountPercent}% OFF
                                  </Badge>
                                )}
                              </h4>
                              {special.description && (
                                <p className="text-sm text-slate-400 mt-1">{special.description}</p>
                              )}
                            </div>
                            <Gift className="w-6 h-6 text-orange-400" />
                          </div>
                          {(special.startTime || special.endTime) && (
                            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {special.endTime && `Ends ${formatDistanceToNow(new Date(special.endTime), { addSuffix: true })}`}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No active specials right now</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <Card className="bg-slate-800/90 backdrop-blur-sm border-slate-700/50">
                <CardContent className="p-6">
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="p-4 rounded-lg bg-slate-700/30">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm">
                                {review.userName?.[0]?.toUpperCase() || '?'}
                              </div>
                              <span className="font-medium">{review.userName || 'Customer'}</span>
                            </div>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, idx) => (
                                <Star
                                  key={idx}
                                  className={cn(
                                    "w-4 h-4",
                                    idx < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-600"
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                          {review.text && <p className="text-slate-300 text-sm">{review.text}</p>}
                          {review.ownerReply && (
                            <div className="mt-3 ml-4 pl-3 border-l-2 border-primary/50">
                              <p className="text-sm text-slate-400">
                                <span className="text-primary font-medium">Owner reply:</span> {review.ownerReply}
                              </p>
                            </div>
                          )}
                          <p className="text-xs text-slate-500 mt-2">
                            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No reviews yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about">
              <Card className="bg-slate-800/90 backdrop-blur-sm border-slate-700/50">
                <CardContent className="p-6 space-y-6">
                  {truck.description && (
                    <div>
                      <h3 className="font-semibold mb-2">About</h3>
                      <p className="text-slate-300">{truck.description}</p>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4 text-sm">
                    {truck.address && (
                      <button
                        onClick={openDirections}
                        className="flex items-center gap-3 text-slate-300 hover:text-white text-left"
                      >
                        <MapPin className="w-5 h-5 text-blue-400" />
                        <span>{truck.address}</span>
                      </button>
                    )}
                    {truck.phone && (
                      <a href={`tel:${truck.phone}`} className="flex items-center gap-3 text-slate-300 hover:text-white">
                        <Phone className="w-5 h-5 text-green-400" />
                        <span>{truck.phone}</span>
                      </a>
                    )}
                    {truck.websiteUrl && (
                      <a href={truck.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-300 hover:text-white">
                        <Globe className="w-5 h-5 text-purple-400" />
                        <span>Visit Website</span>
                      </a>
                    )}
                  </div>

                  {/* CTA Phone - Prominent */}
                  {truck.ctaPhoneNumber && (
                    <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
                      <p className="text-sm text-slate-400 mb-1">Call us now</p>
                      <a href={`tel:${truck.ctaPhoneNumber}`} className="flex items-center gap-3 text-xl font-bold text-green-400 hover:text-green-300">
                        <Phone className="w-6 h-6" />
                        <span>{truck.ctaPhoneNumber}</span>
                      </a>
                    </div>
                  )}

                  {/* Social Media Links */}
                  {(truck.facebookHandle || truck.instagramHandle || truck.tiktokHandle) && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-3">Follow Us</h3>
                      <div className="flex gap-3">
                        {truck.facebookHandle && (
                          <a
                            href={`https://facebook.com/${truck.facebookHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-xl bg-slate-700/50 hover:bg-blue-600/20 transition-colors group"
                            aria-label="Facebook"
                          >
                            <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                          </a>
                        )}
                        {truck.instagramHandle && (
                          <a
                            href={`https://instagram.com/${truck.instagramHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-xl bg-slate-700/50 hover:bg-pink-600/20 transition-colors group"
                            aria-label="Instagram"
                          >
                            <svg className="w-6 h-6 text-slate-400 group-hover:text-pink-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                          </a>
                        )}
                        {truck.tiktokHandle && (
                          <a
                            href={`https://tiktok.com/@${truck.tiktokHandle}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 transition-colors group"
                            aria-label="TikTok"
                          >
                            <svg className="w-6 h-6 text-slate-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {truck.features && truck.features.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Features</h3>
                      <div className="flex flex-wrap gap-2">
                        {truck.features.map((feature) => (
                          <Badge key={feature} variant="secondary" className="bg-slate-700 text-slate-300">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
