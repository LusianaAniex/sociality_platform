'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ImagePlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';

export const CreatePostForm = () => {
  const router = useRouter();

  // State for our form
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create a temporary URL to preview the image before uploading
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return alert('Please select an image first!');

    setIsLoading(true);

    try {
      // 1. Prepare data as FormData (required for files)
      const formData = new FormData();
      formData.append('image', imageFile); // Make sure "image" matches your backend's expected field name
      formData.append('caption', caption);

      // 2. Send to your real backend
      await axiosInstance.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // 3. Redirect back to feed after success
      router.push('/');
      router.refresh(); // Tell Next.js to fetch the latest data

      toast.success('Success Post', {
        className: 'bg-green-600 text-white border-none', // Custom green styling
        description: 'Your post has been created successfully.',
      });
    } catch (error) {
      console.error('Failed to create post:', error);
      toast.error('Failed to Post', {
        className: 'bg-red-600 text-white border-none', // Custom red styling
        description: 'Something went wrong while posting!',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='border-0 shadow-none md:border md:shadow-sm'>
      <CardHeader>
        <CardTitle className='text-xl'>Create new post</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
          {/* IMAGE UPLOAD AREA */}
          <div className='flex flex-col items-center justify-center w-full'>
            <label
              htmlFor='image-upload'
              className='flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-neutral-700 rounded-lg cursor-pointer bg-neutral-900 hover:bg-neutral-800 transition-colors relative overflow-hidden'
            >
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  alt='Preview'
                  fill
                  className='object-cover'
                />
              ) : (
                <div className='flex flex-col items-center justify-center pt-5 pb-6 text-gray-500'>
                  <ImagePlus className='w-10 h-10 mb-3' />
                  <p className='mb-2 text-sm font-semibold'>
                    Click to upload image
                  </p>
                  <p className='text-xs'>SVG, PNG, JPG or GIF (MAX. 5MB)</p>
                </div>
              )}
              <input
                id='image-upload'
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleImageChange}
              />
            </label>
          </div>

          {/* CAPTION AREA */}
          <Textarea
            placeholder='Write a caption...'
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className='resize-none min-h-[100px]'
            maxLength={2200}
          />

          {/* SUBMIT BUTTON */}
          <Button
            type='submit'
            disabled={!imageFile || isLoading}
            className='w-full bg-primary-300 text-white border border-neutral-800 rounded-full h-9 shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:shadow-[0_0_50px_rgba(139,92,246,0.9)] transition-all duration-300'
          >
            {isLoading ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Posting...
              </>
            ) : (
              'Share'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
