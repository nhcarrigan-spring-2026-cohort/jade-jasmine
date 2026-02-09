import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(2, "Userame must be at least 2 characters long"),
  email: z.string().min(5, "Email must be at least 5 characters long"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterSchema = {
  value?: z.infer<typeof registerSchema>;
  errors: null | Partial<
    Record<keyof z.infer<typeof registerSchema>, string[]>
  >;
  success: boolean;
};
