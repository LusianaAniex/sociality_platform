import { LoginForm } from '@/features/auth/components/LoginForm';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <main className='relative flex min-h-screen flex-col items-center justify-center p-6 bg-black overflow-hidden'>
      {/* Vibrant Purple Gradient Background */}
      <div className='absolute inset-0 bg-linear-to-t from-[#7c3aed] via-[#5b21b6]/50 to-black pointer-events-none' />

      {/* Content Container */}
      <div className='relative z-10 w-full max-w-[360px] mx-auto bg-[#0a0a0a]/95 backdrop-blur-sm border border-neutral-800/60 rounded-2xl p-8 shadow-2xl'>
        {/* Logo and Welcome Section */}
        <div className='mb-8 flex flex-col items-center text-center'>
          <h1 className='flex items-center justify-center text-lg font-bold text-white mb-2'>
            <Image
              src='/Logo.svg'
              alt='Sociality Logo'
              width={20}
              height={20}
              className='w-5 h-5 mr-2'
            />
            Sociality
          </h1>

          {/* Welcome Text */}
          <p className='text-sm text-neutral-300'>Welcome Back!</p>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Register Link */}
        <p className='mt-6 text-center text-xs text-neutral-400'>
          Don't have an account?{' '}
          <Link
            href='/register'
            className='text-violet-400 hover:text-violet-300 font-semibold transition-colors'
          >
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
