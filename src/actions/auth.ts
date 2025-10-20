"use server";
import { auth } from "@/lib/auth";
import { signinSchema } from "@/schemas/signin.schema";
import { signupSchema } from "@/schemas/signup.schema";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import * as z from "zod";
import { PrismaClient } from "@/generated/prisma";


const prisma = new PrismaClient();

export const signUp = async (data: z.infer<typeof signupSchema>) => {
  try {
    const result = signupSchema.safeParse(data);

    if (!result.success) {
      return {
        status: "error",
        message: result.error,
      };
    }

    const sanitizedData = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      username: data.username.trim().toLowerCase(),
    };

    const user = await auth.api.signUpEmail({
      body: sanitizedData,
    });

    if (!user) {
      return {
        status: "error",
        message: "Failed to create user account. Please try again.",
      };
    }
  } catch (error: unknown) {
    console.error("SignUp error:", error);

    return {
      status: "error",
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
  redirect("/");
};

export const signIn = async (data: z.infer<typeof signinSchema>) => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user) {
      redirect("/");
    }
    const result = signinSchema.safeParse(data);

    if (!result.success) {
      return {
        status: "error",
        message: result.error,
      };
    }

    await auth.api.signInEmail({
      body: {
        email: data.email.trim().toLowerCase(),
        password: data.password,
      },
    });
  } catch (error: unknown) {
    console.error("SignIn error:", error);

    return {
      status: "error",
      message: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }

  redirect("/");
};

export const signOut = async () => {
  await auth.api.signOut({
    headers: await headers(),
  });

  redirect("/sign-in");
};

export const usernameCheck = async (username: string) => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  return {
    isAvailable: !user,
  };
};
