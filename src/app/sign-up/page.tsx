'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { SignUp } from "@stackframe/stack";

export default function SignUpPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
            <SignUp oauthProviders={['google']} />
        </div>
    );
}
