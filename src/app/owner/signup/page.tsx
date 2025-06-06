'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Upload, Image as ImageIcon, Utensils, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import NextImage from 'next/image';

const CUISINE_TYPES = [
  'American', 'Mexican', 'BBQ', 'Asian', 'Italian', 'Burgers', 'Vegan', 'Desserts', 'Seafood', 'Other'
];

export default function OwnerSignupPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState<'form'|'loading'|'done'>('form');
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '',
    truckName: '', cuisine: '', about: '', terms: false
  });
  const [logoFile, setLogoFile] = useState<File|null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [uploading, setUploading] = useState(false);
  const logoInput = useRef<HTMLInputElement>(null);

  function handleFieldChange(
    e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>|{target:{name:string,value:any,type?:string,checked?:boolean}}
  ) {
    const { name, value, type, checked } = (e as any).target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? !!checked : value }));
    setErrors(err => ({ ...err, [name]: '' }));
  }
  function handleCuisineChange(cuisine: string) {
    setForm(f => ({ ...f, cuisine }));
    setErrors(err => ({ ...err, cuisine: '' }));
  }
  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors(e => ({ ...e, logo: 'Only image files allowed' })); return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setErrors(e => ({ ...e, logo: '' }));
  }

  function validateForm() {
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = 'Name required';
    if (!form.email.includes('@')) err.email = 'Email required';
    if (form.password.length < 6) err.password = 'Password 6+ chars';
    if (!form.confirmPassword) err.confirmPassword = 'Confirm your password';
    if (form.password !== form.confirmPassword) err.confirmPassword = 'Passwords do not match';
    if (!form.phone.match(/^[0-9+() -]{8,}$/)) err.phone = 'Valid phone required';
    if (!form.truckName.trim()) err.truckName = 'Truck name required';
    if (!form.cuisine) err.cuisine = 'Cuisine required';
    if (!form.about.trim() || form.about.length < 20) err.about = 'Tell us about your truck (20+ chars)';
    if (!form.terms) err.terms = 'You must agree to the Terms & Privacy Policy';
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  // --- MAIN SUBMIT HANDLER ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    setUploading(true);
    setStep('loading');
    let logoUrl = '';
    let newUser = null;
    try {
      // 1. Create Auth User
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      newUser = userCred.user;

      // 2. Upload Logo to Storage (optional)
      if (logoFile) {
        const logoPath = `trucks/${newUser.uid}/logo.${logoFile.name.split('.').pop()}`;
        const logoRef = ref(storage, logoPath);
        await uploadBytes(logoRef, logoFile);
        logoUrl = await getDownloadURL(logoRef);
      }

      await updateProfile(newUser, { displayName: form.truckName });

      // 3. Write Firestore User Profile FIRST (role: 'owner')
      const ownerData = {
        uid: newUser.uid,
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: 'owner',
        truckId: newUser.uid,
        truckName: form.truckName,
        cuisine: form.cuisine,
        about: form.about,
        logoUrl: logoUrl || '',
        createdAt: serverTimestamp(),
        status: 'active', // Always instantly active
      };
      const userDocRef = doc(db, 'users', newUser.uid);
      await setDoc(userDocRef, ownerData);

      // 4. Wait for user doc to be visible (up to 5 seconds)
      let confirmUserDoc = null;
      let attempts = 0;
      let maxAttempts = 20; // 20 x 250ms = 5s
      let roleSeen = false;
      while (attempts < maxAttempts) {
        confirmUserDoc = await getDoc(userDocRef);
        if (confirmUserDoc.exists() && confirmUserDoc.data().role === 'owner') {
          roleSeen = true;
          break;
        }
        await new Promise(res => setTimeout(res, 250));
        attempts++;
      }
      if (!roleSeen) {
        setErrors({ ...errors, general: "Account created, but still setting up. Please wait and log in again soon." });
        toast({
          title: "Just a moment...",
          description: "Your account is being finalized. Try logging in again in a few seconds.",
          variant: "default",
        });
        setStep('form');
        setUploading(false);
        return;
      }

      // 5. Create trucks doc. Retry up to 5 times if permission denied!
      const truckDocRef = doc(db, 'trucks', newUser.uid);
      let truckSuccess = false;
      let truckError = null;
      for (let i = 0; i < 5; i++) {
        try {
          await setDoc(truckDocRef, {
            ...ownerData,
            isOpen: false,
            isFeatured: false,
            menu: [],
            testimonials: [],
            ownerUid: newUser.uid,
          });
          truckSuccess = true;
          break;
        } catch (err: any) {
          // Only retry if permission-denied, else break immediately
          if (err.code === 'permission-denied') {
            await new Promise(res => setTimeout(res, 500));
            truckError = err;
          } else {
            truckError = err;
            break;
          }
        }
      }
      if (!truckSuccess) {
        setErrors({ ...errors, general: "Account created, but still setting up. Please wait and log in again soon." });
        toast({
          title: "Just a moment...",
          description: truckError?.message || "Could not finish signup. Please wait and try logging in again.",
          variant: "default",
        });
        setStep('form');
        setUploading(false);
        return;
      }

      setStep('done');
      toast({ title: 'Account Created!', description: 'Welcome to FoodieTruck! You can now set up your menu.' });
      setTimeout(() => router.replace('/owner/dashboard'), 2000);
    } catch (err: any) {
      setUploading(false);
      setStep('form');
      let msg = "Signup failed";
      if (err?.code === "permission-denied") {
        msg = "Permission denied. Please check your Firestore security rules for /users and /trucks collections. Make sure newly registered owners can write both their own user profile and create a matching truck with their uid.";
      } else if (err?.message) {
        msg = err.message;
      }
      toast({ title: 'Signup failed', description: msg, variant: 'destructive' });
      setErrors(errs => ({ ...errs, general: msg }));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-100">
      <div className="max-w-xl w-full mx-auto bg-white rounded-2xl shadow-2xl border px-6 py-10 animate-in fade-in">
        <div className="flex items-center gap-3 mb-6">
          <Utensils className="h-8 w-8 text-green-600" />
          <h2 className="text-3xl font-bold text-primary">Owner Sign Up</h2>
        </div>
        <p className="text-muted-foreground mb-6">Join the platform. Grow your business.<br/>Show us why your food truck is special.</p>
        {step === 'form' && (
          <form className="space-y-5" autoComplete="off" onSubmit={handleSubmit}>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" autoComplete="name" value={form.name} onChange={handleFieldChange} />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>
              <div className="flex-1">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" autoComplete="tel" value={form.phone} onChange={handleFieldChange} />
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleFieldChange} />
              {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleFieldChange} />
                {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
              </div>
              <div className="flex-1">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={handleFieldChange} />
                {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="truckName">Food Truck Name</Label>
              <Input id="truckName" name="truckName" value={form.truckName} onChange={handleFieldChange} />
              {errors.truckName && <p className="text-xs text-destructive mt-1">{errors.truckName}</p>}
            </div>
            <div>
              <Label htmlFor="cuisine">Cuisine Type</Label>
              <Select value={form.cuisine} onValueChange={handleCuisineChange}>
                <SelectTrigger><SelectValue placeholder="Select cuisine" /></SelectTrigger>
                <SelectContent>
                  {CUISINE_TYPES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.cuisine && <p className="text-xs text-destructive mt-1">{errors.cuisine}</p>}
            </div>
            <div>
              <Label htmlFor="about">About Your Truck</Label>
              <Textarea id="about" name="about" value={form.about} rows={3} onChange={handleFieldChange} placeholder="Tell us what makes your food truck amazing..." />
              {errors.about && <p className="text-xs text-destructive mt-1">{errors.about}</p>}
            </div>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <Label>Truck Logo <span className="text-xs text-muted-foreground">(optional)</span></Label>
                <div className="flex items-center gap-3 mt-1">
                  <Button type="button" variant="outline" onClick={() => logoInput.current?.click()} aria-label="Upload truck logo">
                    <ImageIcon className="mr-2 h-4 w-4" />
                    {logoFile ? "Change Logo" : "Upload Logo"}
                  </Button>
                  <input ref={logoInput} type="file" accept="image/*" className="hidden"
                    onChange={handleLogoChange} aria-label="Truck logo file input"/>
                  {logoPreview && <div className="relative w-12 h-12"><NextImage src={logoPreview} alt="Logo" fill className="rounded shadow border" /></div>}
                </div>
                {errors.logo && <p className="text-xs text-destructive mt-1">{errors.logo}</p>}
              </div>
            </div>
            {/* Terms & Conditions */}
            <div className="flex items-start gap-2 mt-2">
              <Checkbox
                id="terms"
                name="terms"
                checked={!!form.terms}
                onCheckedChange={checked =>
                  handleFieldChange({
                    target: {
                      name: "terms",
                      value: checked,
                      checked: checked,
                      type: "checkbox"
                    }
                  })
                }
              />
              <Label htmlFor="terms" className="text-sm text-muted-foreground leading-snug">
                I agree to the&nbsp;
                <a href="/terms" target="_blank" className="font-medium text-primary hover:underline">Terms of Service</a>
                &nbsp;and&nbsp;
                <a href="/privacy" target="_blank" className="font-medium text-primary hover:underline">Privacy Policy</a>.
              </Label>
            </div>
            {errors.terms && <p className="text-xs text-destructive mt-1">{errors.terms}</p>}
            {errors.general && <p className="text-xs text-destructive mt-3">{errors.general}</p>}
            <Button className="w-full mt-2 py-5 text-lg" size="lg" type="submit" disabled={uploading}>
              {uploading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Upload className="mr-2 h-5 w-5" />}
              Create Owner Account
            </Button>
          </form>
        )}
        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center min-h-[340px] animate-in fade-in">
            <Loader2 className="h-16 w-16 text-primary animate-spin mb-6" />
            <p className="text-xl mb-2">Setting up your account...</p>
            <p className="text-muted-foreground">This may take a few seconds if your uploads are large.</p>
          </div>
        )}
        {step === 'done' && (
          <div className="flex flex-col items-center justify-center min-h-[340px] animate-in fade-in">
            <CheckCircle className="h-20 w-20 text-green-500 mb-6" />
            <h3 className="text-2xl font-bold mb-2">Success!</h3>
            <p className="text-lg text-muted-foreground mb-4">Your owner account is ready.<br/>Redirecting to dashboard...</p>
          </div>
        )}
        <div className="mt-8 text-sm text-center text-muted-foreground">
          Already have an owner account? <a href="/login" className="text-blue-700 underline">Log in</a>
        </div>
      </div>
    </div>
  );
}
