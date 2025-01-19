import { cn } from "@/lib/utils"; // Optional: Utility function to merge classNames

interface InfoRowProps {
    label: string; // Label for the data (e.g., "Meeting ID")
    value: string | number; // Value for the data (e.g., "12345")
    className?: string; // Optional custom className for styling
}

export default function InfoRow({ label, value, className }: InfoRowProps) {
    return (
        <div className={cn("flex items-center space-x-2", className)}>
            <p className="text-xs font-medium">
                <span className="text-green-500 bg-green-500/15 px-2 py-1 rounded-md whitespace-nowrap">
                    $ {label}
                </span>
            </p>
            <p className="ml-2 overflow-hidden truncate">{value}</p>
        </div>
    );
}
