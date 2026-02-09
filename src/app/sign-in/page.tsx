'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { SignIn } from "@stackframe/stack";

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
            <SignIn />
        </div>
    );
}
