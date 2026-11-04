import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/ui/field"
import { FaGoogle, FaGithub } from "react-icons/fa"

import { SignInFlow } from "../types"
import { useState } from "react"
import { OctagonAlertIcon } from "lucide-react"
import { useAuthActions } from "@convex-dev/auth/react"

import { ZelraLoader } from "@/components/zelra-loader"
import { cn } from "@/lib/utils"
import { PasswordInput } from "./password-input"

const EMAIL = /^\S+@\S+\.\S+$/;
// The password provider rejects anything shorter than this.
const MIN_PASSWORD = 8;

// 0 = too short, 1 = okay, 2 = good, 3 = strong
const passwordStrength = (value: string) => {
    if (value.length < MIN_PASSWORD) return 0;
    let score = 1;
    if (/[a-zA-Z]/.test(value) && /\d/.test(value)) score++;
    if (/[^a-zA-Z0-9]/.test(value) || value.length >= 14) score++;
    return score;
};
const STRENGTH_LABEL = ["Too short", "Okay", "Good", "Strong"];

interface Props {
    setState: (state: SignInFlow) => void;
}

export const SignUpCard = ({ setState }: Props) => {
    const { signIn } = useAuthActions();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [pending, setPending] = useState(false);
    const [method, setMethod] = useState<"password" | "github" | "google" | null>(null);
    const [emailTouched, setEmailTouched] = useState(false);

    const strength = passwordStrength(password);
    const emailError = emailTouched && email.length > 0 && !EMAIL.test(email) ? "Enter a full email address, like name@company.com." : null;

    const onPasswordSignUp = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password.length < MIN_PASSWORD) {
            setError("Password too short");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setPending(true);
        setMethod("password");

        signIn("password", { name, email, password, flow: "signUp" })
            .catch(() => {
                setError("Something went wrong");
            })
            .finally(() => {
                setPending(false);
                setMethod(null);
            });
    };

    const onProviderSignUp = (value: "github" | "google") => {
        setPending(true)
        setMethod(value);
        signIn(value)
            .finally(() => {
                setPending(false);
                setMethod(null);
            })
    };

    const mismatch = error === "Passwords do not match";
    const tooShort = error === "Password too short";

    return (
        <form onSubmit={onPasswordSignUp} className="grid gap-4">
            <div>
                <h2 className="font-display text-[26px] font-semibold leading-tight tracking-[-0.02em]">Create your account</h2>
                <p className="mt-1.5 text-sm text-ink-2">One account works across every workspace you join.</p>
            </div>
            <Field id="signup-name" label="Full name">
                <Input
                    disabled={pending}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    autoFocus
                    required
                />
            </Field>
            <Field id="signup-email" label="Email" error={emailError}>
                <Input
                    disabled={pending}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="you@company.com"
                    type="email"
                    autoComplete="email"
                    required
                />
            </Field>
            <div className="grid gap-2">
                <Field id="signup-password" label="Password" error={tooShort ? `Use at least ${MIN_PASSWORD} characters.` : null}>
                    <PasswordInput
                        disabled={pending}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); if (tooShort) setError(""); }}
                        autoComplete="new-password"
                        required
                    />
                </Field>
                {/* Strength meter: three leaning segments. */}
                <div className="flex items-center gap-2.5" aria-live="polite">
                    <div className="flex flex-1 gap-1" aria-hidden="true">
                        {[1, 2, 3].map((level) => (
                            <span
                                key={level}
                                className={cn(
                                    "lean-both h-1.5 flex-1 transition-colors duration-200 [--lean:3px]",
                                    password.length === 0 || strength < level
                                        ? "bg-line"
                                        : strength === 1 ? "bg-ink-3" : strength === 2 ? "bg-cobalt" : "bg-ok"
                                )}
                            />
                        ))}
                    </div>
                    <span className={cn("w-24 text-right text-xs", password.length === 0 ? "text-ink-3" : strength === 0 ? "text-danger" : "text-ink-2")}>
                        {password.length === 0 ? `${MIN_PASSWORD}+ characters` : STRENGTH_LABEL[strength]}
                    </span>
                </div>
            </div>
            <Field id="signup-confirm" label="Confirm password" error={mismatch ? "The passwords don't match. Re-enter them both." : null}>
                <PasswordInput
                    disabled={pending}
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); if (mismatch) setError(""); }}
                    autoComplete="new-password"
                    required
                />
            </Field>
            {!!error && !mismatch && !tooShort && (
                <div role="alert" className="flex items-center gap-x-2 rounded-lg bg-danger-wash p-3 text-sm text-danger motion-safe:animate-rise">
                    <OctagonAlertIcon className="size-4 shrink-0" />
                    <p>{error}</p>
                </div>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={pending}>
                {method === "password" ? <ZelraLoader label="Creating your account" /> : "Create account"}
            </Button>
            <div className="flex items-center gap-3 text-xs text-ink-3 before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
                or
            </div>
            <div className="grid gap-2">
                <Button
                    disabled={pending}
                    onClick={() => onProviderSignUp("google")}
                    variant="outline"
                    type="button"
                    className="w-full"
                >
                    {method === "google" ? <ZelraLoader label="Opening Google" /> : <><FaGoogle />Continue with Google</>}
                </Button>
                <Button
                    disabled={pending}
                    onClick={() => onProviderSignUp("github")}
                    variant="outline"
                    type="button"
                    className="w-full"
                >
                    {method === "github" ? <ZelraLoader label="Opening GitHub" /> : <><FaGithub />Continue with GitHub</>}
                </Button>
            </div>
            <p className="text-center text-sm text-ink-3">
                Already have an account?{" "}
                <button type="button" onClick={() => setState("signIn")} className="font-medium text-cobalt-ink hover:underline">
                    Sign in
                </button>
            </p>
        </form>
    )
}
