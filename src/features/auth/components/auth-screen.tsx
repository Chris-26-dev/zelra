"use client";

import { useState } from "react";
import { SignInFlow } from "../types";
import { SignInCard } from "./sign-in-card";
import { SignUpCard } from "./sign-up-card";


export const AuthScreen = () => {
  const [state, setState] = useState<SignInFlow>("signIn");

    return (
        <div className="h-full flex items-center justify-center bg-blue-600">
            <div className="w-full md:h-auto md:w-[700px]">
                {state === "signIn" ? <SignInCard setState={setState}/> : <SignUpCard setState={setState}/> }
            </div>
        </div>
    )
}