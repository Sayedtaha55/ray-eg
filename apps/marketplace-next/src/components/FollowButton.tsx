'use client';

import { useEffect, useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { BACKEND_URL } from '@/lib/api';

export function FollowButton({ shopId, shopSlug }: { shopId: string; shopSlug: string }) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) { setChecking(false); return; }
        const res = await fetch(`${BACKEND_URL}/api/v1/shops/${shopId}/follow-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setFollowing(Boolean(data?.following));
        }
      } catch {}
      setChecking(false);
    })();
  }, [shopId]);

  const toggleFollow = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      window.location.href = '/login?returnTo=/shop/' + shopSlug;
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/shops/${shopId}/follow`, {
        method: following ? 'DELETE' : 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setFollowing(!following);
    } catch {}
    setLoading(false);
  };

  if (checking) {
    return (
      <button disabled className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold flex items-center gap-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      </button>
    );
  }

  return (
    <button
      onClick={toggleFollow}
      disabled={loading}
      className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-60 ${
        following
          ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20'
          : 'bg-brand-gradient text-white hover:shadow-glow-cyan'
      }`}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Heart className={`w-3.5 h-3.5 ${following ? 'fill-current' : ''}`} />}
      {following ? 'إلغاء المتابعة' : 'متابعة'}
    </button>
  );
}
