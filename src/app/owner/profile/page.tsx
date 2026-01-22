'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { IconSettings, IconSave, IconLoader2, IconTruck, IconMapPin, IconPhone, IconGlobe, IconCamera, IconImage as IconImageIcon, IconUpload } from '@/components/ui/branded-icons';
import { motion } from 'framer-motion';

interface TruckProfile {
  id: string;
  name: string;
  cuisine: string;
  description?: string;
  address?: string;
  phone?: string;
  ctaPhoneNumber?: string;
  facebookHandle?: string;
  instagramHandle?: string;
  tiktokHandle?: string;
  websiteUrl?: string;
  imageUrl?: string;
  logoUrl?: string;
}

export default function OwnerProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<TruckProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/owner/login');
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const truckId = (session?.user as any)?.truckId;
        if (truckId) {
          const res = await fetch(`/api/trucks/${truckId}`);
          const data = await res.json();
          if (data.success) {
            setProfile(data.data);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, session]);

  const handleImageUpload = async (file: File, type: 'logo' | 'cover') => {
    const setUploading = type === 'logo' ? setUploadingLogo : setUploadingCover;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success && data.url) {
        if (type === 'logo') {
          setProfile(prev => prev ? { ...prev, logoUrl: data.url } : null);
        } else {
          setProfile(prev => prev ? { ...prev, imageUrl: data.url } : null);
        }
        toast({ title: `${type === 'logo' ? 'Logo' : 'Cover image'} uploaded!` });
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Could not upload image',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/trucks/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      if (res.ok) {
        toast({ title: '✅ Profile saved!' });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save profile',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="container mx-auto max-w-2xl space-y-6">
          <Skeleton className="h-12 w-64 bg-slate-800" />
          <Skeleton className="h-96 bg-slate-800 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <IconSettings className="w-8 h-8 text-slate-400" />
            Truck Profile
          </h1>
          <p className="text-slate-400 mt-1">Edit your truck's information and images</p>
        </motion.div>

        {/* Images Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-6"
        >
          <Card className="bg-slate-900 border-slate-800 overflow-hidden">
            {/* Cover Image */}
            <div
              className="relative h-48 bg-slate-800 cursor-pointer group"
              onClick={() => coverInputRef.current?.click()}
            >
              {profile?.imageUrl ? (
                <img
                  src={profile.imageUrl}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                  <IconImageIcon className="w-12 h-12 mb-2" />
                  <span>Add cover image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                {uploadingCover ? (
                  <IconLoader2 className="w-8 h-8 animate-spin text-white" />
                ) : (
                  <div className="text-white text-center">
                    <IconCamera className="w-8 h-8 mx-auto mb-1" />
                    <span className="text-sm">Change cover</span>
                  </div>
                )}
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, 'cover');
                }}
              />
            </div>

            {/* Logo */}
            <div className="relative px-6 pb-6">
              <div
                className="absolute -top-12 left-6 w-24 h-24 rounded-xl overflow-hidden border-4 border-slate-900 bg-slate-800 cursor-pointer group shadow-xl"
                onClick={() => logoInputRef.current?.click()}
              >
                {profile?.logoUrl ? (
                  <img
                    src={profile.logoUrl}
                    alt="Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                    <IconTruck className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  {uploadingLogo ? (
                    <IconLoader2 className="w-6 h-6 animate-spin text-white" />
                  ) : (
                    <IconCamera className="w-6 h-6 text-white" />
                  )}
                </div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, 'logo');
                  }}
                />
              </div>
              <div className="pt-16">
                <p className="text-sm text-slate-400">
                  <IconCamera className="w-4 h-4 inline mr-1" />
                  Click images above to upload logo and cover photo
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <IconTruck className="w-4 h-4" />
                  Truck Name
                </Label>
                <Input
                  value={profile?.name || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="bg-slate-800 border-slate-700 text-white focus:border-orange-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Cuisine Type</Label>
                <Input
                  placeholder="e.g., Mexican, Thai, BBQ"
                  value={profile?.cuisine || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, cuisine: e.target.value } : null)}
                  className="bg-slate-800 border-slate-700 text-white focus:border-orange-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Description</Label>
                <Textarea
                  placeholder="Tell customers about your truck..."
                  value={profile?.description || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="bg-slate-800 border-slate-700 text-white min-h-[100px] focus:border-orange-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <IconMapPin className="w-4 h-4" />
                  Default Address
                </Label>
                <Input
                  placeholder="Your usual location"
                  value={profile?.address || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, address: e.target.value } : null)}
                  className="bg-slate-800 border-slate-700 text-white focus:border-orange-500"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <IconPhone className="w-4 h-4" />
                    Phone
                  </Label>
                  <Input
                    placeholder="+1 234 567 890"
                    value={profile?.phone || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, phone: e.target.value } : null)}
                    className="bg-slate-800 border-slate-700 text-white focus:border-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300 flex items-center gap-2">
                    <IconPhone className="w-4 h-4 text-green-400" />
                    CTA Phone (Prominent)
                  </Label>
                  <Input
                    placeholder="+1 234 567 890"
                    value={profile?.ctaPhoneNumber || ''}
                    onChange={(e) => setProfile(prev => prev ? { ...prev, ctaPhoneNumber: e.target.value } : null)}
                    className="bg-slate-800 border-slate-700 text-white focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 flex items-center gap-2">
                  <IconGlobe className="w-4 h-4" />
                  Website
                </Label>
                <Input
                  placeholder="https://..."
                  value={profile?.websiteUrl || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, websiteUrl: e.target.value } : null)}
                  className="bg-slate-800 border-slate-700 text-white focus:border-orange-500"
                />
              </div>

              {/* Social Media Handles */}
              <div className="border-t border-slate-700 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-slate-200 mb-4">Social Media</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                      Facebook
                    </Label>
                    <Input
                      placeholder="yourpage"
                      value={profile?.facebookHandle || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, facebookHandle: e.target.value } : null)}
                      className="bg-slate-800 border-slate-700 text-white focus:border-orange-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                      Instagram
                    </Label>
                    <Input
                      placeholder="yourhandle"
                      value={profile?.instagramHandle || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, instagramHandle: e.target.value } : null)}
                      className="bg-slate-800 border-slate-700 text-white focus:border-orange-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>
                      TikTok
                    </Label>
                    <Input
                      placeholder="yourhandle"
                      value={profile?.tiktokHandle || ''}
                      onChange={(e) => setProfile(prev => prev ? { ...prev, tiktokHandle: e.target.value } : null)}
                      className="bg-slate-800 border-slate-700 text-white focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-white font-semibold"
              >
                {saving ? (
                  <><IconLoader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                ) : (
                  <><IconSave className="w-4 h-4 mr-2" />Save Changes</>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
