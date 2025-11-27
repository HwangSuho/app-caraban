import { FormEvent, useEffect, useMemo, useState } from "react";
import api from "../lib/axios";
import { useAuth } from "../context/AuthContext";

type Campsite = {
  id: number;
  name: string;
  description?: string | null;
  location?: string | null;
  pricePerNight?: number;
};

const emptyForm: Campsite = {
  id: 0,
  name: "",
  description: "",
  location: "",
  pricePerNight: 0,
};

export default function ManageCampsites() {
  const { user } = useAuth();
  const [items, setItems] = useState<Campsite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Campsite>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("");

  const editing = form.id !== 0;

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter((c) => {
      const text = `${c.name} ${c.description ?? ""} ${c.location ?? ""}`.toLowerCase();
      return text.includes(q);
    });
  }, [items, filter]);

  const loadMine = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/campsites/mine");
      setItems(data.data ?? []);
    } catch (err) {
      console.error(err);
      setError("내 캠핑장 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMine();
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await api.put(`/campsites/${form.id}`, {
          name: form.name,
          description: form.description,
          location: form.location,
          pricePerNight: form.pricePerNight,
        });
      } else {
        await api.post("/campsites", {
          name: form.name,
          description: form.description,
          location: form.location,
          pricePerNight: form.pricePerNight,
        });
      }
      await loadMine();
      setForm(emptyForm);
    } catch (err: any) {
      console.error(err);
      const message = err?.response?.data?.message ?? "저장에 실패했습니다.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (c: Campsite) => {
    setForm({
      id: c.id,
      name: c.name,
      description: c.description ?? "",
      location: c.location ?? "",
      pricePerNight: c.pricePerNight ?? 0,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    setSaving(true);
    try {
      await api.delete(`/campsites/${id}`);
      await loadMine();
      if (form.id === id) setForm(emptyForm);
    } catch (err) {
      console.error(err);
      setError("삭제에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-6">
        <p className="text-sm text-slate-400">내 캠핑장 관리</p>
        <h2 className="text-2xl font-semibold text-white">
          {user?.name ?? "캠퍼"} 님의 캠핑장
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          새로운 캠핑장을 등록하거나 기존 캠핑장을 수정/삭제할 수 있습니다. 저장 시 백엔드에서 Firebase 인증을 검증하고 호스트 권한을 부여합니다.
        </p>
      </div>

      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            {editing ? "캠핑장 수정" : "새 캠핑장 등록"}
          </h3>
          {editing && (
            <button
              type="button"
              onClick={() => setForm(emptyForm)}
              className="text-xs text-slate-300 hover:text-white"
            >
              새로 등록하기로 전환
            </button>
          )}
        </div>
        {error && (
          <div className="mt-3 rounded-xl border border-rose-400/40 bg-rose-900/20 px-3 py-2 text-sm text-rose-200">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm text-slate-300">이름 *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-slate-300">설명</label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
              rows={3}
              placeholder="캠핑장 특징, 편의시설 등을 적어주세요."
            />
          </div>
          <div>
            <label className="text-sm text-slate-300">위치</label>
            <input
              type="text"
              value={form.location ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
              placeholder="예: 가평군 상면"
            />
            <p className="mt-1 text-xs text-slate-400">지도 표시를 위해 주소/지역명을 입력하세요.</p>
          </div>
          <div>
            <label className="text-sm text-slate-300">1박 요금 (KRW)</label>
            <input
              type="number"
              min={0}
              value={form.pricePerNight ?? 0}
              onChange={(e) =>
                setForm((f) => ({ ...f, pricePerNight: Number(e.target.value) }))
              }
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
            />
          </div>
          <div className="md:col-span-2 flex justify-end gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:opacity-60"
            >
              {saving ? "저장 중..." : editing ? "수정하기" : "등록하기"}
            </button>
          </div>
        </form>
      </div>

      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">내 캠핑장 목록</h3>
            <p className="text-xs text-slate-400">
              수정/삭제하려면 카드의 버튼을 사용하세요.
            </p>
          </div>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-56 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-emerald-400 focus:outline-none"
            placeholder="검색"
          />
        </div>
        {loading && <p className="mt-4 text-sm text-slate-300">불러오는 중...</p>}
        {items.length === 0 && !loading && (
          <p className="mt-4 text-sm text-slate-300">아직 등록한 캠핑장이 없습니다.</p>
        )}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-base font-semibold text-white">{c.name}</h4>
                  <p className="mt-1 text-sm text-slate-300">
                    {c.description ?? "설명이 없습니다."}
                  </p>
                  <div className="mt-2 text-xs text-slate-400">
                    {c.location ? `위치: ${c.location}` : "위치 정보 없음"}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-emerald-300">
                    ₩ {c.pricePerNight ?? 0} / 박
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => startEdit(c)}
                    className="rounded-full border border-white/20 px-3 py-1 text-xs font-medium text-white hover:border-emerald-300"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => onDelete(c.id)}
                    className="rounded-full border border-rose-400/40 px-3 py-1 text-xs font-medium text-rose-200 hover:border-rose-300"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
