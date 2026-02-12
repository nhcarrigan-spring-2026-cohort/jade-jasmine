"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useActionState } from "react";
import { redirect } from "next/navigation";

type FormState = {
  message: string;
  errors?: { [key: string]: string };
};

type ValidationError = {
  path: string;
  msg: string;
};

async function signUpAction(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const newPassword = formData.get("new-password") as string;
  const confirmPassword = formData.get("confirm-password") as string;

  // const errors = {};

  // if (username === "") {
  //   errors.username = "message";
  // }

  // if (email === "") {
  //   return { message: "Error", error: "The Email field can't be empty." };
  // }

  // if (newPassword.length < 8) {
  //   return {
  //     message: "Error",
  //     error: "Password must be at least 8 characters.",
  //   };
  // }

  // if (newPassword !== confirmPassword) {
  //   return { message: "Error", error: "Passwords do not match." };
  // }

  const response = await fetch("http://localhost:3003/v1/user/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: username,
      email: email,
      "new-password": newPassword,
      "confirm-password": confirmPassword,
    }),
  });

  if (!response.ok) {
    const dataFromServer = await response.json();
    const serverErrors: { [key: string]: string } = {};
    if (dataFromServer.data) {
      dataFromServer.data.forEach((err: ValidationError) => {
        serverErrors[err.path] = err.msg;
      });
    }
    return { message: "Error", errors: serverErrors };
  }

  return redirect("/login");
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, formAction, isPending] = useActionState(signUpAction, {
    message: "",
  });

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Username</FieldLabel>
                <Input
                  id="name"
                  type="text"
                  name="username"
                  placeholder="littleduckie"
                  required
                />
                {state.errors?.username && (
                  <p className="text-destructive text-sm font-medium text-center">
                    {state.errors.username}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="m@example.com"
                  required
                />
                {state.errors?.email && (
                  <p className="text-destructive text-sm font-medium text-center">
                    {state.errors.email}
                  </p>
                )}
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      name="new-password"
                      required
                    />
                    {state.errors?.["new-password"] && (
                      <p className="text-destructive text-sm font-medium text-center">
                        {state.errors["new-password"]}
                      </p>
                    )}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password">
                      Confirm Password
                    </FieldLabel>
                    <Input
                      id="confirm-password"
                      type="password"
                      name="confirm-password"
                      required
                    />
                    {state.errors?.["confirm-password"] && (
                      <p className="text-destructive text-sm font-medium text-center">
                        {state.errors["confirm-password"]}
                      </p>
                    )}
                  </Field>
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" disabled={isPending}>
                  Create Account
                </Button>
                <FieldDescription className="text-center">
                  Already have an account? <Link href="/">Sign in</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      {/* <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription> */}
    </div>
  );
}
