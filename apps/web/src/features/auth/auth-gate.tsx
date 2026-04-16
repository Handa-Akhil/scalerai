"use client";

import { useEffect, useState } from "react";

import { getCurrentUser, login, signup, type AuthUser } from "./api";

type AuthGateProps = {
  children: (props: { user: AuthUser; onLogout: () => void }) => React.ReactNode;
};

export function AuthGate({ children }: AuthGateProps) {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem("trello_token");
    if (!token) {
      setLoading(false);
      return;
    }

    getCurrentUser()
      .then(setUser)
      .catch(() => window.localStorage.removeItem("trello_token"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result =
        mode === "signup"
          ? await signup(name || "Project Member", email, password)
          : await login(email, password);
      window.localStorage.setItem("trello_token", result.token);
      setUser(result.user);
    } catch (unknownError) {
      const message = unknownError instanceof Error ? unknownError.message : "Authentication failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    window.localStorage.removeItem("trello_token");
    setUser(null);
    setMode("login");
  }

  if (loading && user === null) {
    return <div className="loading-state">Loading workspace...</div>;
  }

  if (user) {
    return <>{children({ user, onLogout: handleLogout })}</>;
  }

  return (
    <main className="auth-screen">
      <form className="auth-panel" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Project workspace</p>
          <h1>{mode === "signup" ? "Create your account" : "Log in to your boards"}</h1>
        </div>

        {mode === "signup" ? (
          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Akhil Handa" />
          </label>
        ) : null}

        <label>
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
        </label>

        <label>
          Password
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
        </label>

        {error ? <p className="auth-error">{error}</p> : null}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Please wait..." : mode === "signup" ? "Sign up" : "Log in"}
        </button>

        <button
          className="auth-switch"
          type="button"
          onClick={() => {
            setError(null);
            setMode(mode === "signup" ? "login" : "signup");
          }}
        >
          {mode === "signup" ? "Already have an account? Log in" : "Need an account? Sign up"}
        </button>
      </form>
    </main>
  );
}
