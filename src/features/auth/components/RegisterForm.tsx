'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, RegisterFormValues } from '@/lib/validation';
import { useMutation } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      alert('Registrasi Berhasil! Silakan Login.'); // Nanti kita ganti Toast
      router.push('/login'); // Arahkan ke login page
    },
    onError: (error: any) => {
      // Tampilkan error dari backend jika ada
      alert(error.response?.data?.message || 'Terjadi kesalahan saat register');
    },
  });

  // 3. Handle Submit
  const onSubmit = (data: RegisterFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader>
        <CardTitle className='text-2xl text-center'>Daftar Akun</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='username'>Username</Label>
            <Input
              id='username'
              placeholder='johndoe'
              {...register('username')}
            />
            {errors.username && (
              <p className='text-red-500 text-sm'>{errors.username.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='name'>Name</Label>
            <Input id='name' placeholder='John Doe' {...register('name')} />
            {errors.name && (
              <p className='text-red-500 text-sm'>{errors.name.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='john@example.com'
              {...register('email')}
            />
            {errors.email && (
              <p className='text-red-500 text-sm'>{errors.email.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <Input id='password' type='password' {...register('password')} />
            {errors.password && (
              <p className='text-red-500 text-sm'>{errors.password.message}</p>
            )}
          </div>

          <Button
            type='submit'
            className='w-full'
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Loading...' : 'Daftar Sekarang'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
