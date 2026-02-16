'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, RegisterFormValues } from '@/lib/validation';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const RegisterForm = () => {
  const router = useRouter();

  // 1. Setup Form dengan React Hook Form + Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
  });

  // 2. Setup Mutasi ke API (TanStack Query)
  const mutation = useMutation({
    mutationFn: async (data: RegisterFormValues) => {
      // POST ke endpoint register sesuai dokumen
      return await axiosInstance.post('/auth/register', data);
    },
    onSuccess: () => {
      alert('Registration Successful! Please Login.');
      router.push('/login'); // Arahkan ke login page
    },
    onError: (error: any) => {
      // Tampilkan error dari backend jika ada
      alert(error.response?.data?.message || 'Registration error occurred');
    },
  });

  // 3. Handle Submit
  const onSubmit = (data: RegisterFormValues) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5 w-full'>
      {/* Username Field */}
      <div className='space-y-2'>
        <Label
          htmlFor='username'
          className='text-body-sm font-medium text-neutral-300'
        >
          Username
        </Label>
        <Input
          id='username'
          type='text'
          placeholder='Enter your username'
          {...register('username')}
          className='w-full bg-transparent border border-neutral-700 text-white placeholder:text-neutral-500 focus:border-primary-200 focus:ring-1 focus:ring-primary-200 transition-colors h-11 px-4 rounded-md'
        />
        {errors.username && (
          <p className='text-accent-red text-xs'>{errors.username.message}</p>
        )}
      </div>

      {/* Name Field */}
      <div className='space-y-2'>
        <Label
          htmlFor='name'
          className='text-body-sm font-medium text-neutral-300'
        >
          Name
        </Label>
        <Input
          id='name'
          type='text'
          placeholder='Enter your name'
          {...register('name')}
          className='w-full bg-transparent border border-neutral-700 text-white placeholder:text-neutral-500 focus:border-primary-200 focus:ring-1 focus:ring-primary-200 transition-colors h-11 px-4 rounded-md'
        />
        {errors.name && (
          <p className='text-accent-red text-xs'>{errors.name.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div className='space-y-2'>
        <Label
          htmlFor='email'
          className='text-body-sm font-medium text-neutral-300'
        >
          Email
        </Label>
        <Input
          id='email'
          type='email'
          placeholder='Enter your email'
          {...register('email')}
          className='w-full bg-transparent border border-neutral-700 text-white placeholder:text-neutral-500 focus:border-primary-200 focus:ring-1 focus:ring-primary-200 transition-colors h-11 px-4 rounded-md'
        />
        {errors.email && (
          <p className='text-accent-red text-xs'>{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className='space-y-2'>
        <Label
          htmlFor='password'
          className='text-body-sm font-medium text-neutral-300'
        >
          Password
        </Label>
        <Input
          id='password'
          type='password'
          placeholder='Enter your password'
          {...register('password')}
          className='w-full bg-transparent border border-neutral-700 text-white placeholder:text-neutral-500 focus:border-primary-200 focus:ring-1 focus:ring-primary-200 transition-colors h-11 px-4 rounded-md'
        />
        {errors.password && (
          <p className='text-accent-red text-xs'>{errors.password.message}</p>
        )}
      </div>

      {/* Register Button */}
      <Button
        type='submit'
        className='w-full h-12 bg-linear-to-r from-primary-300 to-primary-200 hover:from-primary-200 hover:to-primary-300 text-white font-semibold text-sm transition-all duration-300 shadow-lg shadow-primary-200/20 rounded-md mt-6'
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Loading...' : 'Register'}
      </Button>
    </form>
  );
};
