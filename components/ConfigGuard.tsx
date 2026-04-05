"use client";

// ConfigGuard is no longer used — replaced by inline banner in homepage.
// Kept as pass-through to avoid breaking any remaining imports.
export default function ConfigGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
