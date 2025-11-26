import { useEffect, useMemo, useState } from "react";
import api from "../lib/axios";
import KakaoMap from "../components/KakaoMap";

type Campsite = {
  id: number;
  name: string;
  description?: string | null;
  location?: string | null;
  pricePerNight?: number;
};

export default function Campsites() {
  const [campsites, setCampsites] = useState<Campsite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchCampsites = async () => {
      try {
        const { data } = await api.get("/campsites");
        setCampsites(data.data ?? []);
      } catch (err) {
        console.error(err);
        setError("캠핑장 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampsites();
  }, []);

  const filtered = useMemo(() => {
    const keyword = filter.trim().toLowerCase();
    if (!keyword) return campsites;
    return campsites.filter((c) => {
      const haystack = `${c.name} ${c.description ?? ""} ${c.location ?? ""}`.toLowerCase();
      return haystack.includes(keyword);
    });
  }, [campsites, filter]);

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1.4fr]">
      <div className="space-y-4">
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-400">캠핑장 찾기</p>
              <h2 className="text-2xl font-semibold text-white">전체 목록</h2>
            </div>
            <div className="text-xs text-slate-400">
              {loading ? "불러오는 중..." : `${filtered.length}개`}
            </div>
          </div>
          <div className="mt-4">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="지역, 캠핑장 이름 등으로 검색"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-3">
          {error && (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-900/20 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-slate-300">
              조건에 맞는 캠핑장이 없습니다.
            </div>
          )}
          {loading && (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-sm text-slate-300">
              캠핑장을 불러오는 중입니다...
            </div>
          )}
          {!loading &&
            !error &&
            filtered.map((camp) => (
              <div
                key={camp.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{camp.name}</h3>
                    <p className="mt-1 text-sm text-slate-300">
                      {camp.description ?? "설명이 없습니다."}
                    </p>
                    <div className="mt-2 text-xs text-slate-400">
                      {camp.location ? `위치: ${camp.location}` : "위치 정보 없음"}
                    </div>
                  </div>
                  {camp.pricePerNight !== undefined && (
                    <div className="text-sm font-semibold text-emerald-300 whitespace-nowrap">
                      ₩ {camp.pricePerNight}
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="glass sticky top-6 h-[480px] rounded-3xl p-4">
        <h3 className="text-base font-semibold text-white">지도에서 보기</h3>
        <p className="text-xs text-slate-400">
          주소 기반으로 카카오 지도에 표시합니다. 주소가 없는 캠핑장은 지도에 표시되지 않습니다.
        </p>
        <div className="mt-3 h-[400px] overflow-hidden rounded-2xl border border-white/10">
          <KakaoMap campsites={filtered} />
        </div>
      </div>
    </div>
  );
}
