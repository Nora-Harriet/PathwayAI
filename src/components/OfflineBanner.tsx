import { useEffect, useRef, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { useOnlineStatus } from "@/hooks/use-online-status";

export function OfflineBanner() {
  const online = useOnlineStatus();
  const wasOffline = useRef(false);
  const [back, setBack] = useState(false);

  useEffect(() => {
    if (!online) {
      wasOffline.current = true;
      setBack(false);
      return;
    }
    if (wasOffline.current) {
      wasOffline.current = false;
      setBack(true);
      const t = setTimeout(() => setBack(false), 3000);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [online]);

  if (!online)
    return (
      <div role="status" className="flex items-center justify-center gap-2 bg-secondary px-4 py-2 text-center text-sm text-secondary-foreground">
        <WifiOff className="size-4 shrink-0" />
        You're offline. Your goals, saved chats and career tips are still here — AI features return when you reconnect.
      </div>
    );
  if (back)
    return (
      <div role="status" className="flex items-center justify-center gap-2 bg-accent px-4 py-2 text-sm text-accent-foreground">
        <Wifi className="size-4" /> Back online — your changes are syncing.
      </div>
    );
  return null;
}
