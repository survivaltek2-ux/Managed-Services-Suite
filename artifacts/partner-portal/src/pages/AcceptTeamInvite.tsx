import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

interface InviteInfo {
  email: string;
  name: string;
  companyName: string;
  status: "pending" | "active" | "revoked";
}

export default function AcceptTeamInvite() {
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("Missing invitation token.");
      setLoading(false);
      return;
    }
    fetch(`/api/partner/team/invite/${token}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (res.status === 410) throw new Error("This invitation has expired. Please ask your admin for a new invite.");
          if (res.status === 403) throw new Error("This invitation is no longer valid.");
          if (res.status === 404) throw new Error("We couldn't find that invitation. It may have been revoked or already used.");
          throw new Error(data?.message || "We couldn't load this invitation.");
        }
        setInfo(data as InviteInfo);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  function startSso() {
    window.location.href = `/api/auth/sso/microsoft?type=partner`;
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center p-4">
      <div className="bg-white border border-[#d8dde6] rounded-lg shadow-sm w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto bg-[#032d60] rounded flex items-center justify-center text-white font-bold text-lg mb-3">S</div>
          <h1 className="text-xl font-semibold text-[#032d60]">Accept Team Invitation</h1>
        </div>

        {loading && (
          <div className="flex flex-col items-center text-[#706e6b] py-8">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <p className="text-sm">Loading invitation…</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-[#f8d7da] border border-[#f5c2c7] text-[#721c24] rounded p-4 text-sm flex gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {!loading && info && (
          <>
            <p className="text-sm text-[#444] mb-4">
              You've been invited to join <strong>{info.companyName}</strong> on the Siebert Services Partner Portal.
            </p>
            <div className="bg-[#fafaf9] border border-[#e5e5e5] rounded p-4 mb-5 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-[#706e6b]">Name</span>
                <span className="font-medium">{info.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#706e6b]">Email</span>
                <span className="font-medium">{info.email}</span>
              </div>
            </div>
            {info.status === "active" ? (
              <div className="bg-[#d4edda] border border-[#c3e6cb] text-[#155724] rounded p-3 mb-4 text-sm flex gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>You've already accepted this invitation. Sign in to continue.</span>
              </div>
            ) : (
              <p className="text-xs text-[#706e6b] mb-4">
                Click below to sign in with your Microsoft work account. You must use the email address shown above.
              </p>
            )}
            <button
              onClick={startSso}
              className="w-full bg-[#0176d3] hover:bg-[#014486] text-white py-2.5 rounded text-sm font-medium flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 23 23" fill="none"><rect x="1" y="1" width="10" height="10" fill="#f25022"/><rect x="12" y="1" width="10" height="10" fill="#7fba00"/><rect x="1" y="12" width="10" height="10" fill="#00a4ef"/><rect x="12" y="12" width="10" height="10" fill="#ffb900"/></svg>
              Sign in with Microsoft
            </button>
          </>
        )}
      </div>
    </div>
  );
}
