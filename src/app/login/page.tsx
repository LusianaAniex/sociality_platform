import { LoginForm } from '@/features/auth/components/LoginForm';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <main className='relative flex min-h-screen flex-col items-center justify-center p-6 bg-[#000000] overflow-hidden'>
      {/* Purple Gradient Background */}
      <div className='absolute inset-0 bg-linear-to-t from-[#7F51F9]/40 via-[#7F51F9]/10 to-transparent pointer-events-none' />

      {/* Content Container */}
      <div className='relative z-10 w-full max-w-md mx-auto'>
        {/* Logo and Welcome Section */}
        <div className='mb-8 text-center flex flex-col items-center'>
          {/* Sun Icon Logo */}
          <div className='mb-4'>
            <Image
              src='/Logo.svg'
              alt='Sociality Logo'
              width={48}
              height={48}
              className='w-12 h-12'
            />
          </div>

          {/* Sociality Text */}
          <h1 className='text-display-xs font-bold text-white mb-2'>
            Sociality
          </h1>

          {/* Welcome Text */}
          <p className='text-body-lg text-[#D5D7DA]'>Welcome Back!</p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Register Link */}
        <p className='mt-6 text-center text-body-sm text-[#A4A7AE]'>
          Don't have an account?{' '}
          <Link
            href='/register'
            className='text-[#7F51F9] hover:text-[#6936F2] font-semibold transition-colors'
          >
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
