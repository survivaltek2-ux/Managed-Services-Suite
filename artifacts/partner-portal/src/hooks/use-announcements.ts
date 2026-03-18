import { useQuery } from "@tanstack/react-query";
import { getAuthHeaders } from "./use-auth";

export interface Announcement {
  id: number;
  title: string;
  body: string;
  category: string;
  pinned: boolean;
  publishedAt: string;
}

export function useAnnouncements() {
  return useQuery<Announcement[]>({
    queryKey: ["/api/partner/announcements"],
    queryFn: async () => {
      const res = await fetch("/api/partner/announcements", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch announcements");
      return res.json();
    },
  });
}
