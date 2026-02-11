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

// This definition keeps the structure of the FormState, managing the data correctly. If I were to write "state.mesage" (only 1 s), I'll get a TypeScript warn
// If I didn't define FormState, there wouldn't be a way to make sure that "state" has a property .message or .error
type FormState = {
  message: string;
  error?: string;
};

async function signUpAction(
  prevState: FormState, /* Is whatever calling the signUpAction function last time returned, we are not using it (but we have to declare it).
  If we had a 2 steps form, when sending step 2, it would remember what data was used in step 1 instead of saving that data in the local storage, URL query params or a cookie */
  formData: FormData, // Receives all the data that the user wrote in the form
): Promise<FormState> {
  // Promises to return something with the FormState structure (the validation parts are those return promised)

  // Instead of rendering each time the user types, the data is extracted once the user sends the form
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const newPassword = formData.get("new-password") as string;
  const confirmPassword = formData.get("confirm-password") as string;

  // These validations are necessary because the "required" and "type=email" attributes can't handle, for example, if the password is long enough.
  // It also prevents a call to the server to check if the data is correct
  if (username === "") {
    return { message: "Error", error: "The Username field can't be empty." };
  }

  if (email === "") {
    return { message: "Error", error: "The Email field can't be empty." };
  }

  if (newPassword.length < 8) {
    return {
      message: "Error",
      error: "Password must be at least 8 characters.",
    };
  }

  if (newPassword !== confirmPassword) {
    return { message: "Error", error: "Passwords do not match." };
  }

  // Here is where the API is called
  const response = await fetch("http://localhost:3003/v1/user/signup", {
    method: "POST", // The method for creating a new user
    headers: {
      "Content-Type": "application/json", // Lets the server know that we are sending a JSON
    },
    // The data that we got from formData is converted to a JSON ⬆
    body: JSON.stringify({
      username: username,
      email: email,
      "new-password": newPassword,
      "confirm-password": confirmPassword,
    }),
  });

  // Verification of the server response:
  // If the user is already in the db, we see a message. For now, it's the one from the handleExpressValidationErrors
  if (!response.ok) {
    const data = await response.json();
    return { message: "Error", error: `${data.message}` };
  }

  // If the user was able to register, they are redirected to the dashboard
  return redirect("/login");
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [state, formAction, isPending] = useActionState(signUpAction, {
    // Instead of using "useState" in each input and "onSubmit" on the form with a function that manages the state, the page reloading and more, useActionState handles automnatically the form
    // "state" shows the messages or errors depending on the action (for example, if the user didn't use a long enough password)
    /* "formAction" is a function connected to the form, it captures the event of sending the form, changes "isPending" to true so the button is disabled,
    calls the signUpAction function with all the data, waits for the response, updates the state with it and changes isPending to false */
    // "isPending" disables the button while te action is being executed and then is updated after the validations
    message: "", // The value by default of state.message. It's empty until the form is submitted and the validations are made
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
                {state.error && (
                  <p className="text-destructive text-sm font-medium text-center">
                    {state.error}
                  </p>
                )}
                {!state.error && state.message && (
                  <p className="text-muted-foreground text-sm text-center">
                    {state.message}
                  </p>
                )}
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

// When the user clicks on "Create Account", the formAction is called
// signUpAction receives the formData and extracts the data, validates it and if the validation fails, it shows and error below the button (I think that it may be better to use a toast notification later)
// If all validations pass, the formData is converted into a JSON object that the server understands
// If there is an error when the data is sent to the server, it's shown below the button, otherwise the user is redirected correctly
