import LogoutButton from "@/components/LogoutButton";
import { requireUser } from "@/data/user.dal";

export default async function Home() {
  const user = await requireUser();

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <h1 className="text-7xl">Hello {user?.name}</h1>
      <LogoutButton />
    </div>
  );
}
