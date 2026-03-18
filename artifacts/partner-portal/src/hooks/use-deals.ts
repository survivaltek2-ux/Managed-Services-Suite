import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "./use-auth";

export interface Deal {
  id: number;
  title: string;
  customerName: string;
  customerEmail: string;
  products: string; // JSON string array
  estimatedValue: string | number;
  status: "registered" | "in_progress" | "won" | "lost" | "expired";
  stage: "prospect" | "qualification" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  createdAt: string;
}

export function useDeals() {
  return useQuery<Deal[]>({
    queryKey: ["/api/partner/deals"],
    queryFn: async () => {
      const res = await fetch("/api/partner/deals", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch deals");
      return res.json();
    },
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Deal>) => {
      const res = await fetch("/api/partner/deals", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create deal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partner/deals"] });
    },
  });
}
