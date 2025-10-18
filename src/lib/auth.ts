import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@/generated/prisma";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";

const prisma = new PrismaClient();
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      mapProfileToUser: async (profile) => {
        let baseUsername =
          profile.email?.split("@")[0] ?? profile.name ?? "user";
        let username = baseUsername;
        let i = 1;

        while (await prisma.user.findUnique({ where: { username } })) {
          username = `${baseUsername}${i++}`;
        }
        return {
          username: username,
          displayUsername: username,
        };
      },
    },
  },
  plugins: [username(), nextCookies()],
});
