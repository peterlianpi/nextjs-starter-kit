"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel, FieldGroup } from "@/components/ui/field";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import type { LoginPageProps } from "../types/auth";

// ============================================
// Zod Schema
// ============================================

const loginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

// ============================================
// Password Input Component (Inline)
// ============================================

function PasswordInput({
  name,
  placeholder,
  disabled,
  form,
}: {
  name: "password";
  placeholder?: string;
  disabled?: boolean;
  form: ReturnType<typeof useForm<LoginFormValues>>;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input
        id={name}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        disabled={disabled}
        {...form.register(name)}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}

// ============================================
// Login Page Component
// ============================================

export function LoginPage({
  showRegisterLink = true,
  showForgotPasswordLink = true,
  redirectUrl,
  className,
}: LoginPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const { setError } = form;

  const handleSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });

      if (error) {
        // Check if this is an email verification error
        const isVerificationError =
          error.status === 403 ||
          error.message?.toLowerCase().includes("verify");

        if (isVerificationError) {
          setError("root", {
            message:
              "Please verify your email address before logging in. Check your email for the verification link.",
          });
          toast.error("Email verification required");
        } else {
          setError("root", { message: error.message || "Failed to login" });
          toast.error(error.message || "Failed to login");
        }
        return;
      }

      toast.success("Login successful!");
      router.push(redirectUrl || "/dashboard");
      router.refresh();
    } catch {
      setError("root", { message: "An unexpected error occurred" });
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google") => {
    try {
      const { error } = await authClient.signIn.social({
        provider,
        callbackURL: redirectUrl || "/dashboard",
      });
      if (error) {
        toast.error(error.message || "Google sign-in is not available");
      }
    } catch {
      toast.error("Failed to initiate social login");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card className={cn("w-full max-w-md", className)}>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    disabled={isLoading}
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <PasswordInput
                    name="password"
                    placeholder="Enter your password"
                    disabled={isLoading}
                    form={form}
                  />
                  {form.formState.errors.password && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </Field>

                {showForgotPasswordLink && (
                  <p className="text-sm text-right">
                    <Link
                      href="/forgot-password"
                      className="text-muted-foreground underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </p>
                )}

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={form.watch("rememberMe")}
                    onCheckedChange={(checked) =>
                      form.setValue("rememberMe", checked as boolean)
                    }
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="rememberMe"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>

                {form.formState.errors.root && (
                  <div className="space-y-2">
                    <p className="text-sm text-red-500">
                      {form.formState.errors.root.message}
                    </p>
                    {(form.formState.errors.root.message
                      ?.toLowerCase()
                      .includes("verify") ||
                      form.formState.errors.root.message
                        ?.toLowerCase()
                        .includes("email")) && (
                      <p className="text-sm text-blue-600">
                        <Link
                          href="/verification-pending"
                          className="underline underline-offset-4 hover:text-blue-800"
                        >
                          Click here to resend verification email
                        </Link>
                      </p>
                    )}
                  </div>
                )}

                <Field>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>

                  <div className="relative py-1">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        or continue with email
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSocialLogin("google")}
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51Z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </Field>

                {showRegisterLink && (
                  <p className="text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/signup"
                      className="underline underline-offset-4"
                    >
                      Sign up
                    </Link>
                  </p>
                )}
              </FieldGroup>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
}
