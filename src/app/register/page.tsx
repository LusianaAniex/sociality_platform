import { RegisterForm } from "@/features/auth/components/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">Sociality</h1>
        <p className="text-gray-600">Gabung komunitas kami hari ini.</p>
      </div>
      
      <RegisterForm />
      
      <p className="mt-4 text-center text-sm text-gray-600">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Masuk di sini
        </Link>
      </p>
    </main>
  );
}