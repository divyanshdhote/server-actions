import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user: User | undefined | null = session?.user;

  console.log(user);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <h1>{user?.email}</h1>
    </div>
  );
}
