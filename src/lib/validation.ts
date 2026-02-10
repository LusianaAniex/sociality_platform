import { z } from "zod";

// Aturan untuk Register
export const RegisterSchema = z.object({
  username: z.string().min(3, { message: "Username minimal 3 karakter" }),
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

// Aturan untuk Login
export const LoginSchema = z.object({
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(1, { message: "Password wajib diisi" }),
});

// Tipe data otomatis dari Zod (biar kita gak ngetik interface manual)
export type RegisterFormValues = z.infer<typeof RegisterSchema>;
export type LoginFormValues = z.infer<typeof LoginSchema>;