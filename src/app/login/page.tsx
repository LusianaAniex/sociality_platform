import { LoginForm } from "@/features/auth/components/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">Sociality</h1>
        <p className="text-gray-600">Selamat datang kembali!</p>
      </div>
      
      <LoginForm />
      
      <p className="mt-4 text-center text-sm text-gray-600">
        Belum punya akun?{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          Daftar di sini
        </Link>
      </p>
    </main>
  );
}