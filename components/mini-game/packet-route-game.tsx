"use client";

import {
  Check,
  Database,
  Monitor,
  RotateCcw,
  Rocket,
  ServerCog,
  SkipForward,
  Sparkles,
  X,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/status-dot";
import { buildLocalizedHref } from "@/i18n/routing";
import {
  evaluatePacketRouteSelection,
  getInitialStepIndex,
  PACKET_ROUTE_STEPS,
  type PacketRouteNode,
  type PacketRouteStatus,
} from "@/lib/mini-game/packet-route";
import { cn } from "@/lib/cn";

const COMPLETED_STORAGE_KEY = "portfolio-packet-route-completed";
const PACKET_TRANSITION_MS = 280;

const nodeIcons = {
  client: Monitor,
  frontend: Sparkles,
  api: ServerCog,
  database: Database,
  deploy: Rocket,
} as const;

const nodeLabelKeys = {
  client: "request",
  frontend: "interface",
  api: "logic",
  database: "data",
  deploy: "production",
} as const;

type PacketRouteGameProps = {
  className?: string;
};

export function PacketRouteGame({ className }: PacketRouteGameProps) {
  const t = useTranslations("Home.hero.miniGame");
  const locale = useLocale();
  const [status, setStatus] = useState<PacketRouteStatus>("idle");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [visualStepIndex, setVisualStepIndex] = useState(0);
  const [incorrectNode, setIncorrectNode] = useState<PacketRouteNode | null>(
    null,
  );
  const [showAchievement, setShowAchievement] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [completedBefore, setCompletedBefore] = useState(false);
  const isReducedMotion = usePrefersReducedMotion();
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const achievementTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const routeCompleted = status === "completed";
  const expectedNode = PACKET_ROUTE_STEPS[currentStepIndex + 1];

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(COMPLETED_STORAGE_KEY);
      const hasCompletedBefore = storedValue === "true";

      window.setTimeout(() => {
        setCompletedBefore(hasCompletedBefore);
        if (!hasCompletedBefore) return;

        const initialStepIndex = getInitialStepIndex(true);
        setCurrentStepIndex(initialStepIndex);
        setVisualStepIndex(initialStepIndex);
        setStatus("completed");
      }, 0);
    } catch {
      // Local storage is optional; the game remains fully usable without it.
    }
  }, []);

  useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      if (achievementTimerRef.current)
        clearTimeout(achievementTimerRef.current);
    };
  }, []);

  const progressPercent = useMemo(() => {
    return (visualStepIndex / (PACKET_ROUTE_STEPS.length - 1)) * 100;
  }, [visualStepIndex]);

  const resetGame = () => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setStatus("idle");
    setCurrentStepIndex(0);
    setVisualStepIndex(0);
    setIncorrectNode(null);
    setIsAnimating(false);
    setShowAchievement(false);
  };

  const completeGame = (nextStepIndex: number) => {
    setCurrentStepIndex(nextStepIndex);
    setVisualStepIndex(nextStepIndex);
    setStatus("completed");
    setCompletedBefore(true);
    setShowAchievement(true);

    try {
      window.localStorage.setItem(COMPLETED_STORAGE_KEY, "true");
    } catch {
      // Completion memory is progressive enhancement only.
    }

    if (achievementTimerRef.current) clearTimeout(achievementTimerRef.current);
    achievementTimerRef.current = setTimeout(() => {
      setShowAchievement(false);
    }, 4200);
  };

  const selectNode = (node: PacketRouteNode) => {
    if (isAnimating || routeCompleted) return;

    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }

    const result = evaluatePacketRouteSelection(currentStepIndex, node);

    if (result.type === "wrong") {
      setStatus("error");
      setIncorrectNode(result.selectedNode);

      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
      errorTimerRef.current = setTimeout(() => {
        setStatus(currentStepIndex === 0 ? "idle" : "playing");
        setIncorrectNode(null);
      }, 900);

      return;
    }

    setStatus("playing");
    setIncorrectNode(null);

    if (isReducedMotion) {
      if (result.completed) completeGame(result.nextStepIndex);
      else {
        setCurrentStepIndex(result.nextStepIndex);
        setVisualStepIndex(result.nextStepIndex);
      }
      return;
    }

    setIsAnimating(true);
    setVisualStepIndex(result.nextStepIndex);
    window.setTimeout(() => {
      setIsAnimating(false);
      if (result.completed) completeGame(result.nextStepIndex);
      else setCurrentStepIndex(result.nextStepIndex);
    }, PACKET_TRANSITION_MS);
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[6px] border border-border bg-surface/72 p-4",
        className,
      )}
      aria-labelledby="packet-route-title"
      data-testid="packet-route-game"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-normal text-accent">
            {t("eyebrow")}
          </p>
          <h2
            id="packet-route-title"
            className="mt-1 text-sm font-semibold text-foreground"
          >
            {t("title")}
          </h2>
        </div>
        <StatusDot />
      </div>

      <p
        id="packet-route-instruction"
        className="mt-3 text-sm leading-6 text-muted"
      >
        {routeCompleted
          ? completedBefore
            ? t("completedBefore")
            : t("description")
          : t("instruction")}
      </p>

      <div className="relative mt-5">
        <div
          className="absolute left-5 right-5 top-8 hidden h-px bg-border sm:block"
          aria-hidden="true"
        >
          <span
            className="block h-px bg-accent transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div
          className="absolute top-6 hidden h-4 w-4 rounded-[4px] border border-accent bg-accent shadow-none transition-[left] duration-300 motion-reduce:hidden sm:block"
          style={{
            left: `calc(${progressPercent}% - 0.5rem)`,
          }}
          aria-hidden="true"
        />

        <ol className="grid gap-3 sm:grid-cols-5">
          {PACKET_ROUTE_STEPS.map((node, index) => (
            <PacketNodeButton
              key={node}
              node={node}
              index={index}
              isActive={index === currentStepIndex && !routeCompleted}
              isCompleted={index <= currentStepIndex || routeCompleted}
              isExpected={node === expectedNode && !routeCompleted}
              isIncorrect={incorrectNode === node}
              onSelect={selectNode}
              t={t}
            />
          ))}
        </ol>
      </div>

      <div
        className="mt-4 min-h-10 rounded-[6px] border border-border bg-background/60 px-3 py-2 text-sm text-muted-foreground"
        aria-live="polite"
        data-testid="packet-route-feedback"
      >
        {status === "error" ? (
          <span className="text-[#d26a5c]">
            {t("feedback.wrong")} · {t("feedback.tryAgain")}
          </span>
        ) : routeCompleted ? (
          <span className="text-foreground">
            {t("success.status")} · {t("success.message")}
          </span>
        ) : (
          <span>
            {status === "playing" ? t("feedback.correct") : t("feedback.ready")}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          className="sm:flex-1"
          data-testid="packet-route-reset"
          onClick={resetGame}
        >
          <RotateCcw size={16} aria-hidden="true" />
          {routeCompleted ? t("actions.playAgain") : t("actions.reset")}
        </Button>
        <Button asChild variant="secondary" className="sm:flex-1">
          <Link
            href={buildLocalizedHref(locale, "/projects")}
            data-testid="packet-route-projects-link"
          >
            <SkipForward size={16} aria-hidden="true" />
            {routeCompleted ? t("actions.viewProjects") : t("actions.skip")}
          </Link>
        </Button>
      </div>

      {showAchievement ? (
        <div
          className="absolute bottom-4 left-4 right-4 rounded-[6px] border border-accent/60 bg-background/95 p-3 shadow-2xl"
          role="status"
          aria-live="polite"
          data-testid="packet-route-achievement"
        >
          <button
            className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-muted-foreground transition hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            type="button"
            aria-label={t("success.dismiss")}
            data-testid="packet-route-dismiss"
            onClick={() => setShowAchievement(false)}
          >
            <X size={14} aria-hidden="true" />
          </button>
          <p className="font-mono text-xs uppercase tracking-normal text-accent">
            {t("success.status")}
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {t("success.message")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("success.achievement")}
          </p>
        </div>
      ) : null}
    </section>
  );
}

type PacketNodeButtonProps = {
  node: PacketRouteNode;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  isExpected: boolean;
  isIncorrect: boolean;
  onSelect: (node: PacketRouteNode) => void;
  t: (key: string) => string;
};

function PacketNodeButton({
  node,
  index,
  isActive,
  isCompleted,
  isExpected,
  isIncorrect,
  onSelect,
  t,
}: PacketNodeButtonProps) {
  const Icon = nodeIcons[node];

  return (
    <li className="relative z-10">
      <button
        className={cn(
          "group flex min-h-16 w-full items-center gap-3 rounded-[6px] border bg-background px-3 py-3 text-left transition duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-0 motion-reduce:transition-none sm:min-h-28 sm:flex-col sm:items-start sm:justify-between",
          isExpected && "border-border-strong text-foreground",
          isActive && "border-accent text-foreground",
          isCompleted && "bg-surface/92 text-foreground",
          isIncorrect && "border-[#d26a5c] bg-[#d26a5c]/10 text-foreground",
        )}
        type="button"
        aria-describedby="packet-route-instruction"
        aria-current={isActive ? "step" : undefined}
        aria-pressed={isCompleted}
        data-packet-node={node}
        onClick={() => onSelect(node)}
      >
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] border border-border bg-surface text-muted-foreground transition group-hover:text-foreground">
          {isCompleted ? (
            <Check size={16} aria-hidden="true" />
          ) : (
            <Icon size={16} aria-hidden="true" />
          )}
        </span>
        <span className="min-w-0">
          <span className="block font-mono text-[11px] uppercase tracking-normal text-muted">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="block break-words text-sm font-semibold text-foreground">
            {t(`nodes.${node}`)}
          </span>
          <span className="mt-0.5 block break-words text-xs text-muted">
            {t(`labels.${nodeLabelKeys[node]}`)}
          </span>
        </span>
      </button>
    </li>
  );
}

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener("change", updatePreference);
    };
  }, []);

  return prefersReducedMotion;
}
