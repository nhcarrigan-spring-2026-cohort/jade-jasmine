import { LoginForm } from "@/components/login-form";

export default function Home() {
  return (
    <div className="bg-blue-400 min-h-screen place-content-center">
      <div className="">
        <LoginForm className="max-w-xl mx-auto" />
      </div>
    </div>
  );
}
