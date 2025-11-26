import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import api from "../lib/axios";

export type AppUser = {
  id: number;
  email: string | null;
  name: string | null;
  role: string;
  firebaseUid: string;
};

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function syncWithBackend(firebaseUser: FirebaseUser, signal?: AbortSignal) {
  const token = await firebaseUser.getIdToken();
  const { data } = await api.post(
    "/auth/firebase",
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
      signal,
    }
  );
  return data.user as AppUser;
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await syncWithBackend(firebaseUser, controller.signal);
        setUser(profile);
      } catch (err) {
        console.error("Failed to sync auth state", err);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      controller.abort();
      unsub();
    };
  }, []);

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const profile = await syncWithBackend(firebaseUser);
      setUser(profile);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const { user: firebaseUser } = await signInWithPopup(
        auth,
        googleProvider
      );
      const profile = await syncWithBackend(firebaseUser);
      setUser(profile);
    } finally {
      setLoading(false);
    }
  };

  const registerWithEmail = async (
    name: string,
    email: string,
    password: string
  ) => {
    setLoading(true);
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (name) {
        await updateProfile(firebaseUser, { displayName: name });
      }
      const profile = await syncWithBackend(firebaseUser);
      setUser(profile);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      loginWithEmail,
      loginWithGoogle,
      registerWithEmail,
      logout,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
