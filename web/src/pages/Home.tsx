import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <section className="glass rounded-3xl p-10">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
          Everything for your next camping trip
        </p>
        <h1 className="mt-3 text-4xl font-bold text-white">
          Caraban: Reserve, pay, and review campsites in one place
        </h1>
        <p className="mt-4 max-w-2xl text-slate-300">
          Sign in with Firebase to get started quickly, find a campsite, and book it.
          Dashboards for hosts and admins are ready to extend.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to={user ? "/dashboard" : "/login"}
            className="rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300"
          >
            {user ? "Go to dashboard" : "Start after login"}
          </Link>
          {!user && (
            <Link
              to="/register"
              className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/60"
            >
              Create account
            </Link>
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Firebase Auth",
            desc: "Email/password + Google login wired to the backend.",
          },
          {
            title: "Reservations & reviews",
            desc: "Campsite, reservation, and review models exposed via API.",
          },
          {
            title: "Deployment ready",
            desc: "Templates for Docker, HTTPS, CI/CD to launch on EC2.",
          },
        ].map((card) => (
          <div key={card.title} className="glass rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-white">{card.title}</h3>
            <p className="mt-2 text-sm text-slate-300">{card.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
