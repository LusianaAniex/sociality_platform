import { z } from 'zod';

// Register Schema
export const RegisterSchema = z.object({
  username: z.string().min(3, { message: 'Username minimal 3 karakter' }),
  name: z.string().min(3, { message: 'Nama minimal 3 karakter' }),
  email: z.email({ message: 'Email tidak valid' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' }),
});

// Login Schema
export const LoginSchema = z.object({
  email: z.email({ message: 'Email tidak valid' }),
  password: z.string().min(1, { message: 'Password wajib diisi' }),
});

//Datatype from ZOD
export type RegisterFormValues = z.infer<typeof RegisterSchema>;
export type LoginFormValues = z.infer<typeof LoginSchema>;
