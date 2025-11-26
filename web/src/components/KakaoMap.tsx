import { useEffect, useRef, useState } from "react";

type Campsite = {
  id: number;
  name: string;
  location?: string | null;
};

type Props = {
  campsites: Campsite[];
};

declare global {
  interface Window {
    kakao?: any;
  }
}

const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY as string | undefined;

async function loadKakaoSdk() {
  if (typeof window === "undefined") return null;
  if (!KAKAO_APP_KEY) {
    console.warn("VITE_KAKAO_MAP_KEY is missing; Kakao map will not render.");
    return null;
  }
  if (window.kakao?.maps) return window.kakao;

  const existing = document.getElementById("kakao-maps-sdk") as HTMLScriptElement | null;
  if (existing) {
    await new Promise<void>((resolve) => {
      existing.addEventListener("load", () => resolve(), { once: true });
    });
    return window.kakao;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = "kakao-maps-sdk";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false&libraries=services`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Kakao map SDK"));
    document.head.appendChild(script);
  });

  return window.kakao;
}

export default function KakaoMap({ campsites }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  useEffect(() => {
    let cancelled = false;
    async function init() {
      setStatus("loading");
      try {
        const kakao = await loadKakaoSdk();
        if (!kakao || cancelled || !mapRef.current) return;
        await new Promise((resolve) => kakao.maps.load(resolve));

        if (!mapRef.current) return;

        const center = new kakao.maps.LatLng(37.5665, 126.978); // Seoul as default
        const map = new kakao.maps.Map(mapRef.current, {
          center,
          level: 10,
        });
        const geocoder = new kakao.maps.services.Geocoder();
        const bounds = new kakao.maps.LatLngBounds();

        const markerPromises = campsites
          .filter((c) => c.location)
          .map(
            (c) =>
              new Promise<void>((resolve) => {
                geocoder.addressSearch(c.location!, (result: any[], status: string) => {
                  if (status === kakao.maps.services.Status.OK && result[0]) {
                    const { x, y } = result[0];
                    const pos = new kakao.maps.LatLng(Number(y), Number(x));
                    bounds.extend(pos);
                    const marker = new kakao.maps.Marker({
                      map,
                      position: pos,
                      title: c.name,
                    });
                    const info = new kakao.maps.InfoWindow({
                      content: `<div style="padding:6px 10px;font-size:12px;color:#0f172a">${c.name}</div>`,
                    });
                    kakao.maps.event.addListener(marker, "mouseover", () => info.open(map, marker));
                    kakao.maps.event.addListener(marker, "mouseout", () => info.close());
                  }
                  resolve();
                });
              })
          );

        await Promise.all(markerPromises);
        if (!bounds.isEmpty()) {
          map.setBounds(bounds);
        }

        setStatus("ready");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [campsites]);

  if (!KAKAO_APP_KEY) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-900 text-center text-sm text-slate-300">
        카카오 지도 키(VITE_KAKAO_MAP_KEY)를 설정하면 지도가 표시됩니다.
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />
      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-sm text-white">
          지도를 불러오는 중...
        </div>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 px-4 text-center text-sm text-rose-200">
          지도를 불러오지 못했습니다. API 키와 네트워크를 확인하세요.
        </div>
      )}
    </div>
  );
}
