'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginFormValues } from '@/lib/validation';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';

export const LoginForm = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      // Clear any old/stale tokens before login attempt
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      const response = await axiosInstance.post('/auth/login', data);
      return response.data;
    },
    onSuccess: (responseData) => {
      // Extract token and user from nested structure
      const { token, user } = responseData.data;

      dispatch(
        setCredentials({
          user,
          token,
        })
      );

      router.push('/');
    },
    onError: (error: any) => {
      console.error('Login error:', error);

      if (error.response?.status === 403) {
        alert('Access denied. Please check your credentials and try again.');
      } else if (error.response?.status === 401) {
        alert('Invalid email or password.');
      } else {
        alert(error.response?.data?.message || 'Email atau password salah');
      }
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 w-full'>
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
          className='w-full bg-transparent border border-neutral-700 text-white placeholder:text-neutral-500 focus:border-primary-200 focus:ring-1 focus:ring-primary-200 transition-colors h-12 px-4 rounded-md'
        />
        {errors.email && (
          <p className='text-accent-red text-body-xs'>{errors.email.message}</p>
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
        <div className='relative'>
          <Input
            id='password'
            type={showPassword ? 'text' : 'password'}
            placeholder='Enter your password'
            {...register('password')}
            className='w-full bg-transparent border border-neutral-700 text-white placeholder:text-neutral-500 focus:border-primary-200 focus:ring-1 focus:ring-primary-200 transition-colors h-12 px-4 pr-12 rounded-md'
          />
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors'
          >
            {showPassword ? (
              <EyeOff className='w-5 h-5' />
            ) : (
              <Eye className='w-5 h-5' />
            )}
          </button>
        </div>
        {errors.password && (
          <p className='text-accent-red text-body-xs'>
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Login Button */}
      <Button
        type='submit'
        className='w-full h-12 bg-linear-to-r from-primary-300 to-primary-200 hover:from-primary-200 hover:to-primary-300 text-white font-semibold text-body-md transition-all duration-300 shadow-lg shadow-primary-200/20 rounded-md'
        disabled={mutation.isPending}
      >
        {mutation.isPending ? 'Loading...' : 'Login'}
      </Button>
    </form>
  );
};
