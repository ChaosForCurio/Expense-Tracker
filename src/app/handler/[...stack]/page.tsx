import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "@/stack-server";

export const dynamic = 'force-dynamic';

export default function Handler(props: any) {
    try {
        return <StackHandler {...props} app={stackServerApp} />;
    } catch (e: any) {
        return <div>Error: {e.message}</div>;
    }
}
