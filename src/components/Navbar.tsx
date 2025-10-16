"use client";
import { authClient } from "@/lib/auth-client";
import React from "react";

function Navbar() {
  const { data: session } = authClient.useSession();
  const user = session?.user;
  return <div>navbar {user?.name}</div>;
}

export default Navbar;
