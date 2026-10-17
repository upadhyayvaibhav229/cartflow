"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AccountStatus = "loading" | "signed-out" | "signed-in";
type AccountMode = "login" | "register";

function responseMessage(payload: unknown) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }
  return "Something went wrong. Please try again.";
}

export function AccountForm() {
  const [status, setStatus] = useState<AccountStatus>("loading");
  const [returnToCheckout, setReturnToCheckout] = useState(false);
  const [mode, setMode] = useState<AccountMode>("login");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let current = true;
    setReturnToCheckout(new URLSearchParams(window.location.search).get("next") === "checkout");
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(responseMessage(await response.json()));
        return response.json() as Promise<{
          authenticated: boolean;
          displayName?: string;
          email?: string;
        }>;
      })
      .then((result) => {
        if (!current) return;
        setDisplayName(result.displayName ?? "");
        setStatus(result.authenticated ? "signed-in" : "signed-out");
      })
      .catch((requestError: unknown) => {
        if (!current) return;
        setStatus("signed-out");
        setError(requestError instanceof Error ? requestError.message : "Unable to check your account.");
      });
    return () => {
      current = false;
    };
  }, []);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: String(form.get("username") ?? ""),
          password: String(form.get("password") ?? ""),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(responseMessage(payload));
      setDisplayName(typeof payload.displayName === "string" ? payload.displayName : "");
      setStatus("signed-in");
      if (returnToCheckout) window.location.assign("/");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  async function register(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(form.get("email") ?? ""),
          firstName: String(form.get("first_name") ?? ""),
          lastName: String(form.get("last_name") ?? ""),
          password: String(form.get("password") ?? ""),
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(responseMessage(payload));
      setDisplayName(typeof payload.displayName === "string" ? payload.displayName : "");
      setStatus("signed-in");
      if (returnToCheckout) window.location.assign("/");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to create your account.");
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST", cache: "no-store" });
      if (!response.ok) throw new Error(responseMessage(await response.json()));
      setDisplayName("");
      setStatus("signed-out");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to sign out.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#fbfaf6] px-5 py-8 text-[#26352d] md:px-10">
      <header className="mx-auto flex max-w-[1440px] items-center justify-between border-b border-[#26352d]/10 pb-5">
        <Link href="/" className="font-serif text-2xl tracking-[-0.06em] md:text-3xl">morrow</Link>
        <Link href="/" className="text-xs font-semibold tracking-[0.1em] uppercase">Back to shop</Link>
      </header>
      <section className="mx-auto max-w-md py-20">
        <p className="text-[10px] font-semibold tracking-[0.18em] text-[#a56f55] uppercase">Your account</p>
        {status === "loading" ? (
          <p className="mt-5 text-sm">Checking your account…</p>
        ) : status === "signed-in" ? (
          <>
            <h1 className="mt-3 font-serif text-5xl tracking-[-0.06em]">Welcome{displayName ? `, ${displayName}` : " back"}.</h1>
            <p className="mt-4 text-sm text-[#26352d]/65">You’re signed in to your store account.</p>
            <button
              type="button"
              disabled={busy}
              onClick={() => void signOut()}
              className="mt-8 bg-[#26352d] px-6 py-4 text-xs font-semibold tracking-[0.14em] text-white uppercase disabled:opacity-50"
            >
              {busy ? "Please wait…" : "Sign out"}
            </button>
          </>
        ) : (
          <>
            <h1 className="mt-3 font-serif text-5xl tracking-[-0.06em]">
              {mode === "login" ? "Welcome back." : "Create account."}
            </h1>
            <p className="mt-4 text-sm text-[#26352d]/65">
              {mode === "login"
                ? "Sign in with your WordPress / WooCommerce customer account."
                : "Create a customer account for a more personal shopping experience."}
            </p>
            <div className="mt-8 grid grid-cols-2 border-b border-[#26352d]/15 text-center text-xs uppercase">
              <button
                type="button"
                aria-pressed={mode === "login"}
                onClick={() => { setMode("login"); setError(""); }}
                className={`pb-3 ${mode === "login" ? "border-b border-[#26352d] font-semibold" : "text-[#26352d]/50"}`}
              >
                Sign in
              </button>
              <button
                type="button"
                aria-pressed={mode === "register"}
                onClick={() => { setMode("register"); setError(""); }}
                className={`pb-3 ${mode === "register" ? "border-b border-[#26352d] font-semibold" : "text-[#26352d]/50"}`}
              >
                Create account
              </button>
            </div>
            {mode === "login" ? (
              <form className="mt-7 flex flex-col gap-6" onSubmit={(event) => void signIn(event)}>
                <label className="flex flex-col gap-2 text-[10px] font-semibold tracking-[0.08em] uppercase">
                  Username or email
                  <input
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    className="border-b border-[#26352d]/30 bg-transparent py-3 text-sm font-normal tracking-normal outline-none focus:border-[#26352d]"
                  />
                </label>
                <label className="flex flex-col gap-2 text-[10px] font-semibold tracking-[0.08em] uppercase">
                  Password
                  <input
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="border-b border-[#26352d]/30 bg-transparent py-3 text-sm font-normal tracking-normal outline-none focus:border-[#26352d]"
                  />
                </label>
                {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
                <button
                  type="submit"
                  disabled={busy}
                  className="bg-[#26352d] py-4 text-xs font-semibold tracking-[0.14em] text-white uppercase disabled:opacity-50"
                >
                  {busy ? "Signing in…" : "Sign in"}
                </button>
              </form>
            ) : (
              <form className="mt-7 flex flex-col gap-6" onSubmit={(event) => void register(event)}>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex flex-col gap-2 text-[10px] font-semibold tracking-[0.08em] uppercase">
                    First name
                    <input name="first_name" autoComplete="given-name" required className="border-b border-[#26352d]/30 bg-transparent py-3 text-sm font-normal tracking-normal outline-none focus:border-[#26352d]" />
                  </label>
                  <label className="flex flex-col gap-2 text-[10px] font-semibold tracking-[0.08em] uppercase">
                    Last name
                    <input name="last_name" autoComplete="family-name" required className="border-b border-[#26352d]/30 bg-transparent py-3 text-sm font-normal tracking-normal outline-none focus:border-[#26352d]" />
                  </label>
                </div>
                <label className="flex flex-col gap-2 text-[10px] font-semibold tracking-[0.08em] uppercase">
                  Email address
                  <input name="email" type="email" autoComplete="email" required className="border-b border-[#26352d]/30 bg-transparent py-3 text-sm font-normal tracking-normal outline-none focus:border-[#26352d]" />
                </label>
                <label className="flex flex-col gap-2 text-[10px] font-semibold tracking-[0.08em] uppercase">
                  Password
                  <input name="password" type="password" autoComplete="new-password" minLength={8} required className="border-b border-[#26352d]/30 bg-transparent py-3 text-sm font-normal tracking-normal outline-none focus:border-[#26352d]" />
                  <span className="text-[10px] font-normal normal-case text-[#26352d]/55">Use at least 8 characters.</span>
                </label>
                {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
                <button
                  type="submit"
                  disabled={busy}
                  className="bg-[#26352d] py-4 text-xs font-semibold tracking-[0.14em] text-white uppercase disabled:opacity-50"
                >
                  {busy ? "Creating account…" : "Create account"}
                </button>
              </form>
            )}
          </>
        )}
        {error && status === "signed-in" && <p role="alert" className="mt-5 text-sm text-red-800">{error}</p>}
      </section>
    </main>
  );
}
