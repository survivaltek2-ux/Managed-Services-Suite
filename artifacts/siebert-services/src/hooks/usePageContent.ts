import { useState, useEffect } from "react";

const BASE = import.meta.env.BASE_URL;

export function usePageContent(
  pageSlug: string,
  defaults: Record<string, string>
): Record<string, string> {
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`${BASE}api/page-content/${pageSlug}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((data: Record<string, string>) => setOverrides(data))
      .catch(() => {});
  }, [pageSlug]);

  return { ...defaults, ...overrides };
}
