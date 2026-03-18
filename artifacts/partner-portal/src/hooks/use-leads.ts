import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "./use-auth";

export interface Lead {
  id: number;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  interest: string;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  assignedAt: string;
}

export function useLeads() {
  return useQuery<Lead[]>({
    queryKey: ["/api/partner/leads"],
    queryFn: async () => {
      const res = await fetch("/api/partner/leads", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch leads");
      return res.json();
    },
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/partner/leads/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update lead");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partner/leads"] });
    },
  });
}
