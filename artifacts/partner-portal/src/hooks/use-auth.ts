import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

export function getAuthHeaders() {
  const token = localStorage.getItem("partner_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface PartnerUser {
  id: number;
  companyName: string;
  contactName: string;
  email: string;
  tier: "registered" | "silver" | "gold" | "platinum";
  status: "pending" | "approved" | "rejected" | "suspended";
  totalDeals: number;
  ytdRevenue: string | number;
  totalRevenue?: string | number;
  isAdmin: boolean;
  isMainSiteAdmin?: boolean;
  stripeConnectAccountId?: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface PreFetchedToken {
  token: string;
  user: PartnerUser;
}

type LoginInput = LoginCredentials | PreFetchedToken;

interface LoginResult {
  token: string;
  user: PartnerUser;
  isMainSiteAdmin?: boolean;
}

function isPreFetchedToken(input: LoginInput): input is PreFetchedToken {
  return "token" in input;
}

export function useAuth() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const userQuery = useQuery<PartnerUser | null>({
    queryKey: ["/api/partner/auth/me"],
    queryFn: async () => {
      const token = localStorage.getItem("partner_token");
      if (!token) return null;

      const res = await fetch("/api/partner/auth/me", {
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("partner_token");
        }
        return null;
      }
      return res.json() as Promise<PartnerUser>;
    },
    retry: false,
  });

  const loginMutation = useMutation<LoginResult, Error, LoginInput>({
    mutationFn: async (input: LoginInput): Promise<LoginResult> => {
      if (isPreFetchedToken(input)) {
        return { token: input.token, user: input.user };
      }

      const res = await fetch("/api/partner/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (res.ok) {
        const data = await res.json();
        return { token: data.token as string, user: (data.partner ?? data.user) as PartnerUser };
      }

      if (res.status === 401) {
        const adminRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });

        if (adminRes.ok) {
          const adminData = await adminRes.json();
          if (adminData.user?.role === "admin") {
            return { token: adminData.token as string, user: adminData.user as PartnerUser, isMainSiteAdmin: true };
          }
          throw new Error("Your account does not have partner or admin access.");
        }
      }

      const err = await res.json().catch(() => ({ message: "Login failed" }));
      throw new Error((err as { message: string }).message || "Login failed");
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("partner_token", data.token);
        queryClient.invalidateQueries({ queryKey: ["/api/partner/auth/me"] });
        setLocation("/dashboard");
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: Record<string, string | number | boolean | null>) => {
      const res = await fetch("/api/partner/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Registration failed" }));
        throw new Error((err as { message: string }).message || "Registration failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      if (data.token) {
        localStorage.setItem("partner_token", data.token);
        queryClient.setQueryData(["/api/partner/auth/me"], data.user);
        setLocation("/dashboard");
      }
    },
  });

  const handleSsoToken = (token: string) => {
    localStorage.setItem("partner_token", token);
    queryClient.invalidateQueries({ queryKey: ["/api/partner/auth/me"] });
    setLocation("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("partner_token");
    queryClient.setQueryData(["/api/partner/auth/me"], null);
    setLocation("/login");
  };

  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    handleSsoToken,
    logout,
  };
}
