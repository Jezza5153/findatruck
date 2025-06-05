'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, Image as ImageIcon, FileText, Utensils, CheckCircle } from 'lucide-react';
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
    name: '', email: '', password: '', phone: '',
    truckName: '', cuisine: '', about: '',
  });
  const [logoFile, setLogoFile] = useState<File|null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [resumeFile, setResumeFile] = useState<File|null>(null);
  const [resumeName, setResumeName] = useState<string>('');
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [uploading, setUploading] = useState(false);
  const logoInput = useRef<HTMLInputElement>(null);
  const resumeInput = useRef<HTMLInputElement>(null);

  // --- FIELD CHANGE HANDLER ---
  function handleFieldChange(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setErrors(err => ({ ...err, [name]: '' }));
  }
  function handleCuisineChange(cuisine: string) {
    setForm(f => ({ ...f, cuisine }));
    setErrors(err => ({ ...err, cuisine: '' }));
  }

  // --- LOGO HANDLER ---
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
  // --- RESUME HANDLER ---
  function handleResumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setErrors(e => ({ ...e, resume: 'Only PDF files allowed' })); return;
    }
    setResumeFile(file);
    setResumeName(file.name);
    setErrors(e => ({ ...e, resume: '' }));
  }

  // --- VALIDATION ---
  function validateForm() {
    const err: Record<string, string> = {};
    if (!form.name.trim()) err.name = 'Name required';
    if (!form.email.includes('@')) err.email = 'Email required';
    if (form.password.length < 6) err.password = 'Password 6+ chars';
    if (!form.phone.match(/^[0-9+() -]{8,}$/)) err.phone = 'Valid phone required';
    if (!form.truckName.trim()) err.truckName = 'Truck name required';
    if (!form.cuisine) err.cuisine = 'Cuisine required';
    if (!form.about.trim() || form.about.length < 20) err.about = 'Tell us about your truck (20+ chars)';
    if (!logoFile) err.logo = 'Truck logo required';
    if (!resumeFile) err.resume = 'PDF resume required';
    setErrors(err);
    return Object.keys(err).length === 0;
  }

  // --- SIGNUP SUBMIT ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    setUploading(true);
    setStep('loading');
    let logoUrl = '', resumeUrl = '';
    let newUser = null;
    try {
      // 1. Create Auth User
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      newUser = userCred.user;

      // 2. Upload Logo + Resume to Storage
      const logoPath = `trucks/${newUser.uid}/logo.${logoFile?.name.split('.').pop()}`;
      const resumePath = `trucks/${newUser.uid}/resume.pdf`;

      await updateProfile(newUser, { displayName: form.truckName });

      // Logo Upload
      if (logoFile) {
        const logoRef = ref(storage, logoPath);
        await uploadBytes(logoRef, logoFile);
        logoUrl = await getDownloadURL(logoRef);
      }
      // Resume Upload
      if (resumeFile) {
        const resumeRef = ref(storage, resumePath);
        await uploadBytes(resumeRef, resumeFile);
        resumeUrl = await getDownloadURL(resumeRef);
      }

      // 3. Write Firestore Profile (users & trucks)
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
        logoUrl,
        resumeUrl,
        createdAt: serverTimestamp(),
        status: 'pending', // or 'active' after approval
      };
      await setDoc(doc(db, 'users', newUser.uid), ownerData);
      await setDoc(doc(db, 'trucks', newUser.uid), {
        ...ownerData,
        isOpen: false,
        isFeatured: false,
        menu: [],
        testimonials: [],
      });

      setStep('done');
      toast({ title: 'Account Created!', description: 'Welcome to FoodieTruck! You can now set up your menu.' });
      setTimeout(() => router.replace('/owner/dashboard'), 2000);
    } catch (err: any) {
      setUploading(false);
      setStep('form');
      toast({ title: 'Signup failed', description: err.message, variant: 'destructive' });
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
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleFieldChange} />
              {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
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
                <Label>Truck Logo</Label>
                <div className="flex items-center gap-3 mt-1">
                  <Button type="button" variant="outline" onClick={() => logoInput.current?.click()}>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    {logoFile ? "Change Logo" : "Upload Logo"}
                  </Button>
                  <input ref={logoInput} type="file" accept="image/*" className="hidden"
                    onChange={handleLogoChange} />
                  {logoPreview && <div className="relative w-12 h-12"><NextImage src={logoPreview} alt="Logo" fill className="rounded shadow border" /></div>}
                </div>
                {errors.logo && <p className="text-xs text-destructive mt-1">{errors.logo}</p>}
              </div>
              <div className="flex-1">
                <Label>Your Resume (PDF)</Label>
                <div className="flex items-center gap-3 mt-1">
                  <Button type="button" variant="outline" onClick={() => resumeInput.current?.click()}>
                    <FileText className="mr-2 h-4 w-4" />
                    {resumeFile ? "Change PDF" : "Upload PDF"}
                  </Button>
                  <input ref={resumeInput} type="file" accept="application/pdf" className="hidden"
                    onChange={handleResumeChange} />
                  {resumeName && <span className="text-xs ml-2">{resumeName}</span>}
                </div>
                {errors.resume && <p className="text-xs text-destructive mt-1">{errors.resume}</p>}
              </div>
            </div>
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
