import { stackServerApp } from "@/stack-server";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
    const user = await stackServerApp.getUser();
    if (!user) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|handler|_next|favicon.ico|sign-in|sign-up).*)"],
};

