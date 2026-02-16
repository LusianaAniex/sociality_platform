'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setCredentials } from '@/store/authSlice';
import { axiosInstance } from '@/lib/axios';
import AuthGuard from '@/features/auth/components/AuthGuard';

// Schema Validation
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  username: z
    .string()
    .min(2, { message: 'Username must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  phoneNumber: z.string().optional(),
  bio: z.string().max(160, { message: 'Bio must not exceed 160 characters.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditProfilePage() {
  const router = useRouter();

  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);

  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // 1. Define your form.
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      phoneNumber: '',
      bio: '',
    },
  });

  // 2. Load user data into form
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || user.fullName || '',
        username: user.username || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        bio: user.bio || '',
      });
      setAvatarPreview(
        user.avatar || user.avatarUrl || user.profilePicture || null
      );
    } else {
      // If no user is loaded (e.g. reload on this page), we might need to fetch or redirect
      // For now, let's assume auth persistance works or they will be redirected by middleware
    }
  }, [user, form]);

  // 3. Define a submit handler.
  async function onSubmit(values: FormValues) {
    if (!user || !token) return;

    setIsLoading(true);
    try {
      // Prepare payload
      // Note: If avatar upload is implemented, it usually requires FormData or a separate upload call first.
      // For this implementation, we will send the text fields.
      // If we had a file upload, we'd handle it here.

      const payload = {
        ...values,
        // avatar: avatarUrl // If we uploaded an image
      };

      // API Call
      // Assuming PATCH /users/me or /users/{id}
      // Adjust endpoint based on actual backend
      // Assuming PATCH /users/{username} since GET uses username
      // Use the current username from the stored user object, not the form value (which might be changing)
      // Attempt PATCH /me (resolves to /api/me)

      const response = await axiosInstance.patch('/me', payload);

      // Update Redux State
      // We merge the new values into the existing user object
      const updatedUser = { ...user, ...values };

      dispatch(
        setCredentials({
          user: updatedUser,
          token: token,
        })
      );

      toast.success('Profile updated', {
        description: 'Your profile has been updated successfully.',
      });

      // Redirect back to profile
      router.push(`/users/${values.username}`);
    } catch (error: any) {
      console.error('Update error full object:', error);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      }
      toast.error('Error', {
        description:
          error.response?.data?.message ||
          'Failed to update profile. Check console for details.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Handle file input for avatar (Simulated/Placeholder)
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a fake local URL for preview
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      // In a real app, you would upload this file to a server/storage here
      // or append it to FormData in onSubmit
      toast.info('Photo selected', {
        description: 'This is a preview. Actual upload integration differs.',
      });
    }
  };

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !user) {
    return (
      <div className='p-10 text-center text-white'>Loading user data...</div>
    );
  }

  return (
    <AuthGuard>
      <div className='min-h-screen bg-black text-white p-6 md:p-12 pb-24'>
        <div className='max-w-4xl mx-auto'>
          {/* Header */}
          <div className='flex items-center gap-4 mb-8'>
            <Button
              variant='ghost'
              size='icon'
              onClick={() => router.back()}
              className='text-white hover:bg-neutral-800'
            >
              <ArrowLeft className='w-6 h-6' />
            </Button>
            <h1 className='text-2xl font-bold'>Edit Profile</h1>
          </div>

          <div className='flex flex-col md:flex-row gap-12'>
            {/* Left Column: Avatar */}
            <div className='flex flex-col items-center gap-4 md:w-1/3'>
              <Avatar className='w-40 h-40 border-4 border-neutral-900'>
                <AvatarImage
                  src={avatarPreview || 'https://github.com/shadcn.png'}
                  className='object-cover'
                />
                <AvatarFallback className='bg-neutral-800 text-4xl'>
                  {user.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className='relative'>
                <input
                  type='file'
                  id='avatar-upload'
                  className='hidden'
                  accept='image/*'
                  onChange={handleAvatarChange}
                />
                <Button
                  variant='outline'
                  className='bg-transparent border-neutral-700 text-white hover:bg-neutral-800'
                  onClick={() =>
                    document.getElementById('avatar-upload')?.click()
                  }
                >
                  Change Photo
                </Button>
              </div>
            </div>

            {/* Right Column: Form */}
            <div className='flex-1 max-w-xl'>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='space-y-6'
                >
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-neutral-300'>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Your Name'
                            {...field}
                            className='bg-neutral-900 border-none text-white focus-visible:ring-1 focus-visible:ring-primary-500 h-12'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='username'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-neutral-300'>
                          Username
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='username'
                            {...field}
                            className='bg-neutral-900 border-none text-white focus-visible:ring-1 focus-visible:ring-primary-500 h-12'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-neutral-300'>
                          Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='email@example.com'
                            {...field}
                            className='bg-neutral-900 border-none text-white focus-visible:ring-1 focus-visible:ring-primary-500 h-12'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='phoneNumber'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-neutral-300'>
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder='08123456789'
                            {...field}
                            className='bg-neutral-900 border-none text-white focus-visible:ring-1 focus-visible:ring-primary-500 h-12'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='bio'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className='text-neutral-300'>Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Tell us about yourself'
                            {...field}
                            className='bg-neutral-900 border-none text-white focus-visible:ring-1 focus-visible:ring-primary-500 min-h-[120px] resize-none'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='pt-4'>
                    <Button
                      type='submit'
                      disabled={isLoading}
                      className='w-full h-12 rounded-lg bg-primary-200 text-base-white font-semibold transition-all duration-300 hover:shadow-[0_0_20px_rgba(135,126,255,0.7)] hover:bg-primary-300'
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Updating...
                        </>
                      ) : (
                        'Update Profile'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
