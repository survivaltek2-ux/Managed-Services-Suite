import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthHeaders } from "./use-auth";

export interface Resource {
  id: number;
  title: string;
  description: string;
  url: string;
  type: "pdf" | "video" | "link" | "image" | "presentation";
  category: string;
  minTier: string;
  featured: boolean;
}

export function useResources() {
  return useQuery<Resource[]>({
    queryKey: ["/api/partner/resources"],
    queryFn: async () => {
      const res = await fetch("/api/partner/resources", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch resources");
      return res.json();
    },
  });
}

export function useTrackDownload() {
  return useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/partner/resources/${id}/download`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
    },
  });
}
