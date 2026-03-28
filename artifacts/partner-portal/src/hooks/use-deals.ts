import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "./use-auth";

export interface TsdSyncLog {
  id: number;
  dealId: number;
  tsdId: string;
  status: "pending" | "success" | "failed";
  errorMessage: string | null;
  payload: string | null;
  createdAt: string;
}

export interface TsdMatch {
  id: string;
  label: string;
}

export interface Deal {
  id: number;
  title: string;
  customerName: string;
  customerEmail: string;
  products: string[];
  estimatedValue: string | number;
  status: "registered" | "in_progress" | "won" | "lost" | "expired";
  stage: "prospect" | "qualification" | "proposal" | "negotiation" | "closed_won" | "closed_lost";
  tsdTargets: string[];
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
    mutationFn: async (data: Record<string, any>) => {
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

export function useResolveTsdMatches() {
  return useMutation({
    mutationFn: async (products: string[]): Promise<{ matches: TsdMatch[] }> => {
      const res = await fetch("/api/partner/deals/tsd-matches", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ products }),
      });
      if (!res.ok) throw new Error("Failed to resolve TSD matches");
      return res.json();
    },
  });
}

export function useDealTsdLogs(dealId: number | null) {
  return useQuery<TsdSyncLog[]>({
    queryKey: ["/api/partner/deals", dealId, "tsd-logs"],
    queryFn: async () => {
      if (!dealId) return [];
      const res = await fetch(`/api/partner/deals/${dealId}/tsd-logs`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch TSD logs");
      return res.json();
    },
    enabled: !!dealId,
  });
}

export function useRetryTsdPush() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dealId: number) => {
      const res = await fetch(`/api/partner/deals/${dealId}/retry-tsd-push`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to retry TSD push");
      return res.json();
    },
    onSuccess: (_data, dealId) => {
      queryClient.invalidateQueries({ queryKey: ["/api/partner/deals", dealId, "tsd-logs"] });
    },
  });
}
