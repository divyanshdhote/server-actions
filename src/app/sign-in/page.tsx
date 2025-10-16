import React from "react";
import { signUp } from "@/actions/auth";

function page() {
  return (
    <div className="flex justify-center">
      <form action={signUp}>
        <input type="text" name="name" placeholder="name" />

        <input type="email" name="email" placeholder="email" />

        <input type="password" name="password" placeholder="password" />

        <button type="submit">Sign up</button>
      </form>
    </div>
  );
}

export default page;
