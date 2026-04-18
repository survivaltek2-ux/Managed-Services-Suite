import { useEffect, useState } from "react";
import type { CaseStudy } from "@/components/trust";

export function useCaseStudies() {
  const [items, setItems] = useState<CaseStudy[]>([]);
  useEffect(() => {
    fetch("/api/cms/case-studies")
      .then((r) => (r.ok ? r.json() : []))
      .then(setItems)
      .catch(() => setItems([]));
  }, []);
  return items;
}
