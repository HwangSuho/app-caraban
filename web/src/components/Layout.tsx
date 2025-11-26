import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 glass">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-semibold text-lg text-white">
            Caraban
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm text-slate-300">
            <Link to="/campsites" className="hover:text-white transition">
              캠핑장 목록
            </Link>
            <Link to="/dashboard" className="hover:text-white transition">
              대시보드
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-200">
          {user ? (
            <>
              <div className="flex flex-col text-right">
                <span className="font-semibold leading-tight">{user.name ?? "캠퍼"}</span>
                <span className="text-xs text-slate-400">{user.email}</span>
              </div>
              <button
                onClick={logout}
                className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white hover:bg-white/20 transition"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white hover:bg-white/20 transition"
            >
              로그인
            </Link>
          )}
        </div>
      </header>
      <main className="px-6 py-10 max-w-4xl mx-auto">{children}</main>
    </div>
  );
}
