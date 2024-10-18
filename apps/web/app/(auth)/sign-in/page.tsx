import { Suspense } from "react";
import { LoginForm } from "./page-client";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
