import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FaGoogle, FaGithub } from "react-icons/fa"
import { SignInFlow } from "../types"
import Image from "next/image"
import { useState } from "react"
import { useAuthActions } from "@convex-dev/auth/react";

interface Props {
    setState: (state: SignInFlow) => void;
}

export const SignInCard = ({ setState }: Props) => {
    const { signIn } = useAuthActions();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleProviderSignIn = (value: "github" | "google") => {
        signIn(value);
    };

    return (
        <div className="flex flex-col gap-6">
            <Card className="overflow-hidden p-0 border-0 shadow-none">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <form className="p-6 md:p-8">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col items-center text-center">
                                <h1 className="text-2xl font-bold">
                                    Welcome back!
                                </h1>
                                <p className="text-muted-foreground text-balance">
                                    Login to your account
                                </p>
                            </div>
                            <div className="grid gap-3">
                                <Input
                                    disabled={false}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                    type="email"
                                    required
                                />
                            </div>
                            <div className="grid gap-3">
                                <Input
                                    disabled={false}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Password"
                                    type="password"
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full" size="lg" disabled={false}>
                                Sign In
                            </Button>
                            <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                <span className="bg-card text-muted-foreground relative z-10 px-2">
                                    Or continue with
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="outline"
                                    type="button"
                                    className="w-full"
                                >
                                    <FaGoogle />
                                </Button>
                                <Button
                                    disabled={false}
                                    onClick={() => handleProviderSignIn("github")}
                                    variant="outline"
                                    type="button"
                                    className="w-full"
                                >
                                    <FaGithub />
                                </Button>
                            </div>
                            <p className="text-center text-xs text-muted-foreground">
                                Don&apos;t have an account? <span onClick={() => setState("signUp")} className="text-sky-700 hover:underline cursor-pointer">Sign up</span>
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