"use client";

import { useState } from "react";
import { SignInFlow } from "../types";
import { SignInCard } from "./sign-in-card";
import { SignUpCard } from "./sign-up-card";


export const AuthScreen = () => {
  const [state, setState] = useState<SignInFlow>("signIn");

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-600 px-4">
            <div className="w-full max-w-md md:max-w-2xl">
                {state === "signIn" ? <SignInCard setState={setState}/> : <SignUpCard setState={setState}/> }
            </div>
        </div>
    )
}