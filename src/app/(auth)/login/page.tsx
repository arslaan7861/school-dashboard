"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { loginSchema, LoginFormValues } from "@/schemas/login.schema";
import { useLogin } from "@/features/auth/hooks";
import { toast } from "sonner";

export default function LoginPage() {
  const login = useLogin();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "arslaan@gmail.com",
      password: "Admin@123",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    await login.mutate(
      { ...values },
      {
        onError: (e) => {
          console.log(e);
          toast.error(e.message);
          if (e.errors && e.errors.length) {
            e.errors.forEach(({ field, message }) => {
              form.setError(field as keyof LoginFormValues, { message });
            });
          }
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Login</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="admin@school.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            Login / Add Account
          </Button>
        </form>
      </Form>
    </div>
  );
}
