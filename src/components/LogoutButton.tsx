"use client";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { signOut } from "@/actions/auth";
import { toast } from "sonner";
import { string } from "zod";

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const handleClick = async () => {
    setIsLoading(true);
    try {
      const result = await signOut();

      if (result?.status === "error") {
        toast.error(result.message);
      }
    } catch (error: unknown) {
      if (error && typeof error === "object" && "digest" in error && 
          typeof error.digest === "string" && error.digest.startsWith("NEXT_REDIRECT")) {
        // This is a successful redirect, no need to show an error toast
        // The component will unmount due to the redirect
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div>
      <Button onClick={handleClick} disabled={isLoading}>
        {isLoading ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
            Signing Out...
          </>
        ) : (
          "Signout"
        )}
      </Button>
    </div>
  );
}
