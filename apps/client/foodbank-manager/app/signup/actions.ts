"use server";

import { registerSchema, type RegisterSchema } from "@/lib/schema/auth";

export async function registerFormAction(
  _prevState: RegisterSchema,
  formData: FormData,
) {
  const data = { 
    username: formData.get("username") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword"),
  };
  console.log(data);
  const result = registerSchema.safeParse(data);

  if (!result.success) {
    return {
      errors: result.error.flatten().fieldErrors,
    };
  }

  if (data.password != data.confirmPassword) {
    return { error: "Passwords don't match!" };
  }

  return {
    data: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    errors: null,
    success: true,
  };
}
