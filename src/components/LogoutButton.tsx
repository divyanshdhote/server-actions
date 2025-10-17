"use client";
import { Button } from "@/components/ui/button";
import React from "react";
import { signOut } from "@/actions/auth";

export default function LogoutButton() {
  const handleClick = async () => {
    await signOut();
  };
  return (
    <div>
      <Button onClick={handleClick}>Signout</Button>
    </div>
  );
}
