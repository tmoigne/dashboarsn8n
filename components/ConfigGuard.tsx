"use client";

import { useEffect, useState } from "react";
import { isConfigured } from "@/lib/config";
import { useRouter } from "next/navigation";

export default function ConfigGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isConfigured()) {
      router.push("/settings");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}
