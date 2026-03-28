import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "./use-auth";

export interface TsdProduct {
  id: number;
  category: string;
  name: string;
  description: string | null;
  availableAt: string[];
  active: boolean;
  sortOrder: number;
}

export interface TsdProductCatalog {
  products: TsdProduct[];
  grouped: Record<string, TsdProduct[]>;
}

export function useTsdProducts() {
  return useQuery<TsdProductCatalog>({
    queryKey: ["/api/partner/tsd-products"],
    queryFn: async () => {
      const res = await fetch("/api/partner/tsd-products", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch product catalog");
      return res.json();
    },
  });
}
