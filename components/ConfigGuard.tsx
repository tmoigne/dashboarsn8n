"use client";

import { useEffect, useState } from "react";
import { useInstances } from "@/hooks/useInstances";
import { useRouter } from "next/navigation";

export default function ConfigGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { instances, activeInstance } = useInstances();
  const [ready, setReady] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Wait until instances have been fetched (instances array populated or confirmed empty)
    if (!checked) return;
    const cfg = activeInstance ?? instances[0] ?? null;
    if (!cfg?.baseUrl || !cfg?.apiKey) {
      router.push("/settings");
    } else {
      setReady(true);
    }
  }, [checked, activeInstance, instances, router]);

  // useInstances sets instances synchronously to [] and then fetches — we need to
  // detect when the fetch has completed. We mark checked after a microtask so the
  // first render (empty array before fetch) doesn't redirect immediately.
  useEffect(() => {
    const id = setTimeout(() => setChecked(true), 300);
    return () => clearTimeout(id);
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}
