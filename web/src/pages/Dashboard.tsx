import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/axios";

type Campsite = {
  id: number;
  name: string;
  description?: string | null;
  location?: string | null;
  pricePerNight?: number;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [campsites, setCampsites] = useState<Campsite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampsites = async () => {
      try {
        const { data } = await api.get("/campsites");
        setCampsites(data.data ?? []);
      } catch (err) {
        console.error(err);
        setError("Failed to load campsites.");
      } finally {
        setLoading(false);
      }
    };

    fetchCampsites();
  }, []);

  return (
    <div className="space-y-6">
      <div className="glass rounded-3xl p-6">
        <p className="text-sm text-slate-400">Welcome</p>
        <h2 className="text-2xl font-semibold text-white">
          {user?.name ?? "Camper"}
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          Firebase login is verified by the backend. Below is a sample list fetched from the API.
        </p>
      </div>

      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Campsites</h3>
          <span className="text-xs text-slate-400">
            {loading ? "Loading..." : `${campsites.length} sites`}
          </span>
        </div>
        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}
        {!loading && !error && (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {campsites.length === 0 ? (
              <p className="text-sm text-slate-400">
                No campsites yet. Add one as a host user.
              </p>
            ) : (
              campsites.map((camp) => (
                <div
                  key={camp.id}
                  className="rounded-2xl border border-white/5 bg-white/5 p-4"
                >
                  <h4 className="text-base font-semibold text-white">
                    {camp.name}
                  </h4>
                  <p className="mt-1 text-sm text-slate-300">
                    {camp.description ?? "No description."}
                  </p>
                  <div className="mt-2 text-xs text-slate-400">
                    {camp.location ? `Location: ${camp.location}` : "Location unknown"}
                  </div>
                  {camp.pricePerNight !== undefined && (
                    <div className="mt-1 text-sm font-semibold text-emerald-300">
                      KRW {camp.pricePerNight} per night
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
