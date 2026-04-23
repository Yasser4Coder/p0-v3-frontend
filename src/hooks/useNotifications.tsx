import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import SubmissionFeedbackToast, {
  type SubmissionFeedback,
} from "../components/SubmissionFeedbackToast";
import { playNotificationSound } from "../audio/playNotificationSound";
import { API_BASE_URL } from "../lib/api/client";
import { getAccessToken, getAuthUser } from "../lib/auth/storage";
import type {
  StoredNotification,
  SubmissionReviewedPayload,
} from "../types/notifications";

const SSE_PATH = "/api/notifications/stream";
const RECONNECT_MS = 5000;
const MAX_ITEMS = 80;

function getJwtForStream(): string | null {
  try {
    return (
      getAccessToken() ??
      (typeof localStorage !== "undefined"
        ? localStorage.getItem("token")
        : null)
    );
  } catch {
    return null;
  }
}

function streamUrl(token: string): string {
  const base = API_BASE_URL.replace(/\/+$/, "");
  const url = new URL(SSE_PATH, `${base}/`);
  url.searchParams.set("token", token);
  return url.toString();
}

function payloadToItem(payload: SubmissionReviewedPayload): StoredNotification {
  const id = `${payload.submissionId}-${payload.timestamp}`;
  return {
    ...payload,
    id,
    read: false,
  };
}

function toastFromPayload(payload: SubmissionReviewedPayload): SubmissionFeedback {
  const ok = payload.status?.toLowerCase() === "accepted";
  return {
    kind: ok ? "success" : "error",
    message: payload.message,
  };
}

export type NotificationsContextValue = {
  notifications: StoredNotification[];
  unreadCount: number;
  clearAllNotifications: () => void;
  markAllRead: () => void;
  /** True when user is participant and SSE may run */
  sseEnabled: boolean;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

function useNotificationsInternal(pathname: string) {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [toastFeedback, setToastFeedback] = useState<SubmissionFeedback | null>(
    null,
  );

  const esRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<number>(0);

  const dismissToast = useCallback(() => setToastFeedback(null), []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );

  useEffect(() => {
    const user = getAuthUser();
    const token = getJwtForStream();
    const participant = user?.role === "participant";

    const disconnect = () => {
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = 0;
      }
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };

    if (!participant || !token) {
      disconnect();
      return disconnect;
    }

    const handleMessage = (event: MessageEvent<string>) => {
      try {
        const raw = JSON.parse(event.data) as SubmissionReviewedPayload;
        const item = payloadToItem(raw);
        playNotificationSound();
        setNotifications((prev) => [item, ...prev].slice(0, MAX_ITEMS));
        setToastFeedback(toastFromPayload(raw));
      } catch {
        /* ignore malformed payloads */
      }
    };

    const connect = () => {
      disconnect();
      const url = streamUrl(token);
      const es = new EventSource(url);
      esRef.current = es;

      es.addEventListener("submission_reviewed", handleMessage);

      es.onerror = () => {
        try {
          es.close();
        } catch {
          /* ignore */
        }
        esRef.current = null;
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = window.setTimeout(() => {
          reconnectTimerRef.current = 0;
          connect();
        }, RECONNECT_MS);
      };
    };

    connect();

    return disconnect;
  }, [pathname]);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount,
      clearAllNotifications,
      markAllRead,
      sseEnabled:
        getAuthUser()?.role === "participant" && !!getJwtForStream(),
    }),
    [
      pathname,
      notifications,
      unreadCount,
      clearAllNotifications,
      markAllRead,
    ],
  );

  return { value, toastFeedback, dismissToast };
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { value, toastFeedback, dismissToast } = useNotificationsInternal(
    pathname,
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
      <SubmissionFeedbackToast
        feedback={toastFeedback}
        onDismiss={dismissToast}
      />
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationsProvider");
  }
  return ctx;
}
