"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";


export default function LoginPage() {
  const { user, login, signup, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
  if (user) {
    router.replace("/");
  }
}, [user, router]);


  async function handleLogin() {
    try {
      setError("");
      await login(email, password);
    } catch {
      setError("Invalid login credentials");
    }
  }

  async function handleSignup() {
    try {
      setError("");
      await signup(email, password);
    } catch {
      setError("Signup failed");
    }
  }

  async function handleGoogle() {
    try {
      setError("");
      await loginWithGoogle();
    } catch {
      setError("Google sign-in failed");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="card w-full max-w-sm space-y-4 text-center">
        <h1 className="page-title">Welcome 💗</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full rounded-lg border p-2 dark:bg-gray-800"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full rounded-lg border p-2 dark:bg-gray-800"
        />

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <button onClick={handleLogin} className="btn btn-primary w-full">
          Login
        </button>

        <button onClick={handleSignup} className="btn btn-secondary w-full">
          Sign up
        </button>

        <div className="text-sm text-gray-500">or</div>

        <button onClick={handleGoogle} className="btn btn-secondary w-full">
          Continue with Google
        </button>
      </div>
    </main>
  );
}
