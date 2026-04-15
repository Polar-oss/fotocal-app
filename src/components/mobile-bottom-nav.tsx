"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

type NavKey = "camera" | "circle" | "home" | "premium" | "summary";

type ObservedSection = {
  id: string;
  key: Exclude<NavKey, "camera" | "premium">;
};

const observedSections: ObservedSection[] = [
  { id: "inicio-app", key: "home" },
  { id: "resumo-dia", key: "summary" },
  { id: "circulo-app", key: "circle" },
];

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M4.75 10.5 12 4.75l7.25 5.75v8a1.5 1.5 0 0 1-1.5 1.5H6.25a1.5 1.5 0 0 1-1.5-1.5v-8Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.25 19.75v-5.5h5.5v5.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SummaryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M5.25 18.75h13.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M7.5 16.5v-4.25m4.5 4.25V8.5m4.5 8V11"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path
        d="M8.25 7.25 9.5 5.5h5L15.75 7.25h2.5a1.5 1.5 0 0 1 1.5 1.5v7.5a1.5 1.5 0 0 1-1.5 1.5H5.75a1.5 1.5 0 0 1-1.5-1.5v-7.5a1.5 1.5 0 0 1 1.5-1.5h2.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15.25a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M8.25 11.25a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.75 12.25a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.75 18.25a3.5 3.5 0 0 1 7 0m1.5 0a3 3 0 0 1 6 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PremiumIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="m5.25 8.5 2.9 8.5h7.7l2.9-8.5-4.1 3.25L12 6.5l-2.65 5.25L5.25 8.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavItem({
  active,
  children,
  href,
  label,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  href: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-3 text-[11px] font-medium transition ${
        active ? "text-white" : "text-white/48"
      }`}
    >
      <span>{children}</span>
      <span className="truncate">{label}</span>
    </a>
  );
}

export function MobileBottomNav() {
  const [activeKey, setActiveKey] = useState<NavKey>("home");

  const sectionById = useMemo(
    () =>
      new Map(observedSections.map((section) => [section.id, section.key])),
    [],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (!visibleEntry) {
          return;
        }

        const nextKey = sectionById.get(visibleEntry.target.id);

        if (nextKey) {
          setActiveKey(nextKey);
        }
      },
      {
        rootMargin: "-18% 0px -48% 0px",
        threshold: [0.2, 0.45, 0.7],
      },
    );

    observedSections.forEach((section) => {
      const element = document.getElementById(section.id);

      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [sectionById]);

  function handleOpenCamera() {
    setActiveKey("camera");
    window.dispatchEvent(new CustomEvent("fotocal:open-camera"));
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+0.8rem)] sm:hidden">
      <nav className="pointer-events-auto mx-auto grid max-w-md grid-cols-5 items-end rounded-[2rem] border border-white/12 bg-[#07150f]/92 px-3 pb-3 pt-2 shadow-[0_24px_80px_rgba(0,0,0,0.58)] backdrop-blur-xl">
        <NavItem
          href="#inicio-app"
          label="Inicio"
          active={activeKey === "home"}
          onClick={() => setActiveKey("home")}
        >
          <HomeIcon />
        </NavItem>

        <NavItem
          href="#resumo-dia"
          label="Hoje"
          active={activeKey === "summary"}
          onClick={() => setActiveKey("summary")}
        >
          <SummaryIcon />
        </NavItem>

        <button
          type="button"
          onClick={handleOpenCamera}
          className="mx-auto flex h-16 w-16 -translate-y-5 items-center justify-center rounded-full border border-emerald-300/35 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_18px_40px_rgba(16,185,129,0.35)] transition hover:-translate-y-6"
          aria-label="Abrir camera para nova refeicao"
        >
          <CameraIcon />
        </button>

        <NavItem
          href="#circulo-app"
          label="Circulo"
          active={activeKey === "circle"}
          onClick={() => setActiveKey("circle")}
        >
          <CircleIcon />
        </NavItem>

        <Link
          href="/pricing"
          onClick={() => setActiveKey("premium")}
          className={`flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-3 text-[11px] font-medium transition ${
            activeKey === "premium" ? "text-white" : "text-white/48"
          }`}
        >
          <PremiumIcon />
          <span className="truncate">Premium</span>
        </Link>
      </nav>
    </div>
  );
}
