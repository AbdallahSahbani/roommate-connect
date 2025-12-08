import { AlertTriangle } from "lucide-react";
import { useSecurityCheck } from "@/hooks/useSecurityCheck";

/**
 * Banner shown to suspended users
 * Add this to your main layout to block suspended accounts
 */
export const SuspendedBanner = () => {
  const { isSuspended, suspensionReason, loading } = useSecurityCheck();

  if (loading || !isSuspended) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 flex items-center justify-center p-4">
      <div className="max-w-md text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Account Suspended</h1>
        <p className="text-muted-foreground">
          Your account has been temporarily suspended.
        </p>
        {suspensionReason && (
          <p className="text-sm text-muted-foreground border-t pt-4">
            <strong>Reason:</strong> {suspensionReason}
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          If you believe this is an error, please contact support at{" "}
          <a href="mailto:support@roommates.com" className="text-primary hover:underline">
            support@roommates.com
          </a>
        </p>
      </div>
    </div>
  );
};
