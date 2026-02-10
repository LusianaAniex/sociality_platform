"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginFormValues } from "@/lib/validation";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/store/authSlice"; // Action Redux kita
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export const LoginForm = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
  });

  const mutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      const response = await axiosInstance.post("/auth/login", data);
      return response.data; // Biasanya berisi { token, user }
    },
    onSuccess: (data) => {
      // 1. Simpan Token & User ke Redux (dan LocalStorage otomatis via slice kita)
      // Sesuaikan struktur data dengan respon API backendmu
      // Contoh asumsi response: { token: "abc", user: { id: 1, ... } }
      dispatch(setCredentials({ 
        user: data.user, 
        token: data.token 
      }));

      // 2. Redirect ke Feed 
      router.push("/"); 
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Email atau password salah");
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Masuk</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={mutation.isPending}>
            {mutation.isPending ? "Loading..." : "Masuk"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};