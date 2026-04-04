"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ConfigGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/instances")
      .then(r => r.json())
      .then((instances: Array<{ baseUrl: string; apiKey: string; active?: boolean }>) => {
        const active = instances.find(i => i.active) ?? instances[0] ?? null;
        if (!active?.baseUrl || !active?.apiKey) {
          router.push("/settings");
        } else {
          setReady(true);
        }
      })
      .catch(() => router.push("/settings"));
  }, [router]);

  if (!ready) return null;
  return <>{children}</>;
}
