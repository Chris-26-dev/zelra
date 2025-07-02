import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FaGoogle, FaGithub } from "react-icons/fa"

import { SignInFlow } from "../types"
import Image from "next/image"
import { useState } from "react"
import { OctagonAlertIcon } from "lucide-react"
import { useAuthActions } from "@convex-dev/auth/react"

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

    const onPasswordSignUp = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setPending(true);
        signIn("password", { name, email, password, flow: "signUp" })
            .catch(() => {
                setError("Something went wrong");
            })
            .finally(() => {
                setPending(false);
            });
    };

    const onProviderSignUp = (value: "github" | "google") => {
        setPending(true)
        signIn(value)
            .finally(() => {
                setPending(false);
            })
    };



    return (
        <div className="flex flex-col gap-6">
            <Card className="overflow-hidden p-0 border-0 shadow-none">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form onSubmit={onPasswordSignUp} className="p-6 md:p-8">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center text-center">
                                <h1 className="text-2xl font-bold">
                                    Let&apos;s get started
                                </h1>
                                <p className="text-muted-foreground text-balance">
                                    Create your account
                                </p>
                            </div>
                            <div className="grid gap-3">
                                <Input
                                    disabled={pending}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Full name"
                                    required
                                />
                                <Input
                                    disabled={pending}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                    type="email"
                                    required
                                />
                                <Input
                                    disabled={pending}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    type="password"
                                    required
                                />
                                <Input
                                    disabled={pending}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm password"
                                    type="password"
                                    required
                                />
                            </div>
                            {!!error && (
                                <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-destructive">
                                    <OctagonAlertIcon className="size-4" />
                                    <p>{error}</p>
                                </div>
                            )}
                            <Button type="submit" className="w-full" size="lg" disabled={pending}>
                                Sign Up
                            </Button>
                            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                <span className="bg-card text-muted-foreground relative z-10 px-2">
                                    Or continue with
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    disabled={pending}
                                    onClick={() => onProviderSignUp("google")}
                                    variant="outline"
                                    type="button"
                                    className="w-full"
                                >
                                    <FaGoogle />
                                </Button>
                                <Button
                                    disabled={pending}
                                    onClick={() => onProviderSignUp("github")}
                                    variant="outline"
                                    type="button"
                                    className="w-full"
                                >
                                    <FaGithub />
                                </Button>
                            </div>
                            <p className="text-center text-sm text-muted-foreground">
                                Already have an account? <span onClick={() => setState("signIn")} className="text-sky-800 hover:underline cursor-pointer">Sign in</span>
                            </p>
                        </div>


                    </form>
                    <div className="bg-radial from-sky-700 to-blue-900 relative hidden md:flex flex-col gap-y-4 items-center justify-center">
                        <Image src="/logo.svg" alt="Image" width={92} height={92} className="h-[92px] w-[92px]" />
                        <p className="text-2xl font-semibold text-white">
                            ZELRA
                        </p>
                    </div>
                </CardContent>
            </Card>
            <div className="text-white *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#"> Privacy Policy</a>
            </div>
        </div>
    )
}