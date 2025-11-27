import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../lib/axios";
import { useAuth } from "../context/AuthContext";

type Campsite = {
  id: number;
  name: string;
  description?: string | null;
  location?: string | null;
  pricePerNight?: number;
};

type Reservation = {
  id: number;
  campsiteId: number;
  startDate: string;
  endDate: string;
  status: string;
};

type Review = {
  id: number;
  campsiteId: number;
  userId: number;
  rating: number;
  comment?: string | null;
  createdAt?: string;
};

export default function CampsiteDetail() {
  const { id } = useParams<{ id: string }>();
  const campsiteId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [campsite, setCampsite] = useState<Campsite | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);

  const myReservation = useMemo(
    () =>
      reservations.find(
        (r) => r.campsiteId === campsiteId && r.status !== "cancelled"
      ),
    [reservations, campsiteId]
  );

  const myReview = useMemo(
    () => reviews.find((r) => r.userId === user?.id),
    [reviews, user]
  );

  useEffect(() => {
    if (!campsiteId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const detail = api.get(`/campsites/${campsiteId}`);
        const reviewList = api.get(`/reviews/campsite/${campsiteId}`);
        const myRes = user ? api.get("/reservations/me") : Promise.resolve({ data: { data: [] } });

        const [detailRes, reviewRes, reservationRes] = await Promise.all([
          detail,
          reviewList,
          myRes,
        ]);

        setCampsite(detailRes.data.data);
        setReviews(reviewRes.data.data ?? []);
        setReservations(reservationRes.data.data ?? []);
      } catch (err) {
        console.error(err);
        setError("캠핑장 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [campsiteId, user]);

  useEffect(() => {
    if (myReview) {
      setReviewRating(myReview.rating);
      setReviewComment(myReview.comment ?? "");
    }
  }, [myReview]);

  const createReservation = async () => {
    if (!user) {
      setActionError("로그인이 필요합니다.");
      return;
    }
    if (!startDate || !endDate) {
      setActionError("시작일과 종료일을 입력하세요.");
      return;
    }
    setSaving(true);
    setActionError(null);
    setActionMessage(null);
    try {
      await api.post("/reservations", {
        campsiteId,
        startDate,
        endDate,
      });
      const { data } = await api.get("/reservations/me");
      setReservations(data.data ?? []);
      setActionMessage("예약이 생성되었습니다.");
      setStartDate("");
      setEndDate("");
    } catch (err: any) {
      console.error(err);
      setActionError(err?.response?.data?.message ?? "예약에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const cancelReservation = async (reservationId: number) => {
    setSaving(true);
    setActionError(null);
    setActionMessage(null);
    try {
      await api.post(`/reservations/${reservationId}/cancel`);
      const { data } = await api.get("/reservations/me");
      setReservations(data.data ?? []);
      setActionMessage("예약이 취소되었습니다.");
    } catch (err: any) {
      console.error(err);
      setActionError(err?.response?.data?.message ?? "취소에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const saveReview = async () => {
    if (!user) {
      setActionError("로그인이 필요합니다.");
      return;
    }
    setReviewSaving(true);
    setActionError(null);
    try {
      if (myReview) {
        await api.put(`/reviews/${myReview.id}`, {
          rating: reviewRating,
          comment: reviewComment,
        });
      } else {
        await api.post("/reviews", {
          campsiteId,
          rating: reviewRating,
          comment: reviewComment,
        });
      }
      const { data } = await api.get(`/reviews/campsite/${campsiteId}`);
      setReviews(data.data ?? []);
    } catch (err: any) {
      console.error(err);
      setActionError(err?.response?.data?.message ?? "리뷰 저장에 실패했습니다.");
    } finally {
      setReviewSaving(false);
    }
  };

  const deleteReview = async () => {
    if (!myReview) return;
    if (!confirm("리뷰를 삭제하시겠습니까?")) return;
    setReviewSaving(true);
    setActionError(null);
    try {
      await api.delete(`/reviews/${myReview.id}`);
      const { data } = await api.get(`/reviews/campsite/${campsiteId}`);
      setReviews(data.data ?? []);
      setReviewComment("");
      setReviewRating(5);
    } catch (err: any) {
      console.error(err);
      setActionError(err?.response?.data?.message ?? "리뷰 삭제에 실패했습니다.");
    } finally {
      setReviewSaving(false);
    }
  };

  const averageRating = useMemo(() => {
    if (!reviews.length) return null;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  if (loading) {
    return <div className="py-10 text-center text-slate-300">불러오는 중...</div>;
  }

  if (error || !campsite) {
    return (
      <div className="py-10 text-center text-rose-200">
        {error ?? "캠핑장을 찾을 수 없습니다."}
        <div className="mt-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:border-white/50"
          >
            뒤로가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400">
              <Link to="/campsites" className="text-emerald-300 underline">
                캠핑장 목록
              </Link>{" "}
              / 상세
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{campsite.name}</h1>
            <p className="mt-2 text-sm text-slate-300">
              {campsite.description ?? "설명이 없습니다."}
            </p>
            <div className="mt-3 text-xs text-slate-400">
              {campsite.location ? `위치: ${campsite.location}` : "위치 정보 없음"}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-400">1박 요금</p>
            <p className="text-2xl font-semibold text-emerald-300">
              ₩ {campsite.pricePerNight ?? 0}
            </p>
            {averageRating && (
              <p className="mt-1 text-sm text-slate-300">평점 {averageRating} / 5</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">예약</h3>
            {actionMessage && (
              <span className="text-xs text-emerald-300">{actionMessage}</span>
            )}
          </div>
          {actionError && (
            <div className="rounded-xl border border-rose-400/40 bg-rose-900/20 px-3 py-2 text-sm text-rose-200">
              {actionError}
            </div>
          )}

          {myReservation ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">
                예약 상태: <span className="font-semibold text-white">{myReservation.status}</span>
              </p>
              <p className="mt-1 text-sm text-slate-300">
                기간: {new Date(myReservation.startDate).toLocaleDateString()} ~{" "}
                {new Date(myReservation.endDate).toLocaleDateString()}
              </p>
              <button
                disabled={saving}
                onClick={() => cancelReservation(myReservation.id)}
                className="mt-3 rounded-full border border-rose-400/40 px-4 py-2 text-xs font-semibold text-rose-200 hover:border-rose-200 disabled:opacity-60"
              >
                {saving ? "취소 중..." : "예약 취소"}
              </button>
            </div>
          ) : (
            <form
              className="grid gap-3 md:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                createReservation();
              }}
            >
              <div>
                <label className="text-sm text-slate-300">시작일</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300">종료일</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:opacity-60"
                >
                  {saving ? "예약 중..." : "예약하기"}
                </button>
                {!user && (
                  <p className="mt-2 text-xs text-slate-400">
                    예약하려면 로그인하세요.
                  </p>
                )}
              </div>
            </form>
          )}
        </div>

        <div className="glass rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">리뷰</h3>
            <span className="text-xs text-slate-400">{reviews.length}개</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setReviewRating(n)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    reviewRating >= n ? "bg-emerald-400 text-emerald-950" : "bg-white/10 text-white"
                  }`}
                >
                  {n}점
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
              rows={3}
              placeholder="후기를 남겨주세요."
            />
            <div className="mt-3 flex gap-2">
              <button
                disabled={reviewSaving}
                onClick={saveReview}
                className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:opacity-60"
              >
                {myReview ? "리뷰 수정" : "리뷰 작성"}
              </button>
              {myReview && (
                <button
                  disabled={reviewSaving}
                  onClick={deleteReview}
                  className="rounded-xl border border-rose-400/50 px-4 py-2 text-sm font-semibold text-rose-200 hover:border-rose-200 disabled:opacity-60"
                >
                  삭제
                </button>
              )}
            </div>
            {!user && (
              <p className="mt-2 text-xs text-slate-400">
                리뷰 작성하려면 로그인하세요.
              </p>
            )}
          </div>

          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">평점 {r.rating} / 5</div>
                  <div className="text-xs text-slate-400">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                  </div>
                </div>
                <p className="mt-1 text-sm text-slate-300">
                  {r.comment ?? "내용 없음"}
                </p>
                {user?.id === r.userId && (
                  <p className="mt-1 text-xs text-emerald-300">내가 작성한 리뷰</p>
                )}
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="text-sm text-slate-300">아직 리뷰가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
