import { RefreshCcw } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex items-center justify-center h-screen">
            <RefreshCcw className="animate-spin" />
        </div>
    );
}