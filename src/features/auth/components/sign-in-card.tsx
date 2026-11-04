import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
import { FaGoogle, FaGithub } from "react-icons/fa"
import { SignInFlow } from "../types"
import { useState } from "react"
import { useAuthActions } from "@convex-dev/auth/react";
import { OctagonAlertIcon } from "lucide-react"

import { ZelraLoader } from "@/components/zelra-loader"
import { PasswordInput } from "./password-input"

const EMAIL = /^\S+@\S+\.\S+$/;

interface Props {
    setState: (state: SignInFlow) => void;
}

export const SignInCard = ({ setState }: Props) => {
    const { signIn } = useAuthActions();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);
    // Which way the person is signing in, so only that button shows progress.
    const [method, setMethod] = useState<"password" | "github" | "google" | null>(null);
    const [emailTouched, setEmailTouched] = useState(false);

    const emailError = emailTouched && email.length > 0 && !EMAIL.test(email) ? "Enter a full email address, like name@company.com." : null;

    const onPasswordSignIn = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setPending(true);
        setMethod("password");
        signIn("password", { email, password, flow: "signIn" })
            .catch(() => {
                setError("Invalid email or password");
            })
            .finally(() => {
                setPending(false);
                setMethod(null);
            });
    };

    const onProviderSignIn = (value: "github" | "google") => {
        setPending(true)
        setMethod(value);
        signIn(value)
            .finally(() => {
                setPending(false);
                setMethod(null);
            })
    };

    return (
        <form onSubmit={onPasswordSignIn} className="grid gap-5">
            <div>
                <h2 className="font-display text-[26px] font-semibold leading-tight tracking-[-0.02em]">Welcome back</h2>
                <p className="mt-1.5 text-sm text-ink-2">Sign in to pick up where your team left off.</p>
            </div>
            <Field id="signin-email" label="Email" error={emailError}>
                <Input
                    disabled={pending}
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="you@company.com"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    required
                />
            </Field>
            <Field id="signin-password" label="Password">
                <PasswordInput
                    disabled={pending}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    autoComplete="current-password"
                    required
                />
            </Field>
            {!!error && (
                <div role="alert" className="flex items-center gap-x-2 rounded-lg bg-danger-wash p-3 text-sm text-danger motion-safe:animate-rise">
                    <OctagonAlertIcon className="size-4 shrink-0" />
                    <p>{error}</p>
                </div>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={pending}>
                {method === "password" ? <ZelraLoader label="Signing in" /> : "Sign in"}
            </Button>
            <div className="flex items-center gap-3 text-xs text-ink-3 before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
                or
            </div>
            <div className="grid gap-2">
                <Button
                    disabled={pending}
                    onClick={() => onProviderSignIn("google")}
                    variant="outline"
                    type="button"
                    className="w-full"
                >
                    {method === "google" ? <ZelraLoader label="Opening Google" /> : <><FaGoogle />Continue with Google</>}
                </Button>
                <Button
                    disabled={pending}
                    onClick={() => onProviderSignIn("github")}
                    variant="outline"
                    type="button"
                    className="w-full"
                >
                    {method === "github" ? <ZelraLoader label="Opening GitHub" /> : <><FaGithub />Continue with GitHub</>}
                </Button>
            </div>
            <p className="text-center text-sm text-ink-3">
                New to Zelra?{" "}
                <button type="button" onClick={() => setState("signUp")} className="font-medium text-cobalt-ink hover:underline">
                    Create an account
                </button>
            </p>
        </form>
    )
}
