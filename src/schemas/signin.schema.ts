import * as z from "zod";

export const signinSchema = z.object({
  email: z.email({ message: "Please provide a valid email address" }),
  password: z.string(),
});
