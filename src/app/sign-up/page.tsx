"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

import { signUp, usernameCheck } from "@/actions/auth";
import { authClient } from "@/lib/auth-client";
import { signupSchema } from "@/schemas/signup.schema";
import { FcGoogle } from "react-icons/fc";

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

function SignUpPage() {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();

  const [isPending, setIsPending] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<
    boolean | null
  >(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleSignUpPending, setIsGoogleSignUpPending] = useState(false);

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const username = form.watch("username");

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  useEffect(() => {
    if (form.formState.errors.username || !username) {
      setIsUsernameAvailable(null);
      return;
    }
    const debounce = setTimeout(() => {
      setIsCheckingUsername(true);
      usernameCheck(username).then((res) => {
        setIsUsernameAvailable(res.isAvailable);
        setIsCheckingUsername(false);
      });
    }, 500);

    return () => {
      clearTimeout(debounce);
      setIsCheckingUsername(false);
    };
  }, [username, form.formState.errors.username]);

  const onsubmit = async (formData: z.infer<typeof signupSchema>) => {
    setIsPending(true);
    try {
      const result = await signUp(formData);

      if (result?.status === "error") {
        toast.error(result?.message);
      }
    } catch (error: unknown) {
      if (error && typeof error === "object" && "digest" in error && 
          typeof error.digest === "string" && error.digest.startsWith("NEXT_REDIRECT")) {
        toast.success("Account created successfully! Redirecting...");
        form.reset();
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsPending(false);
    }
  };

  const signUpWithGoogle = async () => {
    setIsGoogleSignUpPending(true);
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  if (isSessionPending || session) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-background border-t-primary" />
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <Card className="w-full sm:max-w-md">
        <CardHeader>
          <CardTitle>Sign up to continue</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="signup-form" onSubmit={form.handleSubmit(onsubmit)}>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>

                  <Input
                    id="name"
                    placeholder="name"
                    {...form.register("name")}
                    aria-invalid={!!form.formState.errors.name}
                  />
                  <FieldError errors={[form.formState.errors.name]} />
                </Field>

                <Field>
                  <FieldLabel htmlFor="username">Username</FieldLabel>

                  <Input
                    id="username"
                    placeholder="username"
                    {...form.register("username")}
                    aria-invalid={!!form.formState.errors.username}
                  />
                  {!form.formState.errors.username && (
                    <>
                      {isCheckingUsername && (
                        <p className="text-sm text-muted-foreground">
                          Checking availability...
                        </p>
                      )}

                      {!isCheckingUsername && isUsernameAvailable === true && (
                        <p className="text-sm text-green-500">
                          Username is available
                        </p>
                      )}

                      {!isCheckingUsername && isUsernameAvailable === false && (
                        <p className="text-sm text-red-500">
                          Username is taken
                        </p>
                      )}
                    </>
                  )}
                  <FieldError errors={[form.formState.errors.username]} />
                </Field>

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
                      placeholder="Create a password"
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
            form="signup-form"
            disabled={
              isPending ||
              isUsernameAvailable === false ||
              isGoogleSignUpPending
            }
            className="w-full"
            aria-describedby={isPending ? "submitting-text" : undefined}
          >
            {isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                Creating account...
              </>
            ) : (
              "Create Account"
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
            Already have an account?{"  "}
            <Link
              href="/sign-in"
              className="text-primary underline-offset-4 hover:underline"
            >
              Sign-in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default SignUpPage;
