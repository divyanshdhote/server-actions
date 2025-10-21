"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "@/actions/auth";
import { authClient } from "@/lib/auth-client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { signinSchema } from "@/schemas/signin.schema";

function SignInPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [isGoogleSignUpPending, setIsGoogleSignUpPending] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof signinSchema>>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router, isRedirecting]);

  if (isSessionPending || session) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-background border-t-primary" />
      </div>
    );
  }

  const signUpWithGoogle = async () => {
    setIsGoogleSignUpPending(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  const onsubmit = async (formData: z.infer<typeof signinSchema>) => {
    setIsPending(true);
    try {
      const result = await signIn(formData);

      if (result?.status === "error") {
        toast.error(result?.message);
      }
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "digest" in error &&
        typeof error.digest === "string" &&
        error.digest.startsWith("NEXT_REDIRECT")
      ) {
        setIsRedirecting(true);
        toast.success("Sign in successful..");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="signin-form" onSubmit={form.handleSubmit(onsubmit)}>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>

                  <Input
                    id="email"
                    placeholder="you@example.com"
                    {...form.register("email")}
                    aria-invalid={!!form.formState.errors.email}
                  />

                  <FieldError errors={[form.formState.errors.email]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...form.register("password")}
                      aria-invalid={!!form.formState.errors.password}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-transparent focus-visible:bg-transparent"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FieldError errors={[form.formState.errors.password]} />
                </Field>
              </FieldGroup>
            </FieldSet>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            form="signin-form"
            disabled={isPending || isRedirecting || isGoogleSignUpPending}
            className="w-full"
            aria-describedby={isPending ? "submitting-text" : undefined}
          >
            {isPending || isRedirecting || isGoogleSignUpPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={signUpWithGoogle}
            disabled={isPending || isGoogleSignUpPending}
          >
            {isGoogleSignUpPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Redirecting to Google...
              </>
            ) : (
              <>
                <FcGoogle className="mr-2" size={20} />
                Sign up with Google
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground">
            New here?{"  "}
            <Link
              href="/sign-up"
              className="text-primary underline-offset-4 hover:underline"
            >
              Sign-up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default SignInPage;
