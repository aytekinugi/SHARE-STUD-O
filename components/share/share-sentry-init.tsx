"use client";

import { useEffect } from "react";

/** NEXT_PUBLIC_SENTRY_DSN tanımlıysa tarayıcıda Sentry başlatır (PII scrub varsayılan). */
let shareSentryStarted = false;

export function ShareSentryInit() {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN?.trim();
    if (!dsn || shareSentryStarted) return;
    shareSentryStarted = true;

    let cancelled = false;
    void import("@sentry/browser")
      .then((Sentry) => {
        if (cancelled) return;
        const release =
          process.env.NEXT_PUBLIC_SENTRY_RELEASE?.trim() ||
          process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.trim() ||
          undefined;

        Sentry.init({
          dsn,
          environment: process.env.NODE_ENV,
          release,
          tracesSampleRate: 0,
          replaysSessionSampleRate: 0,
          replaysOnErrorSampleRate: 0,
          beforeSend(event) {
            if (event.request?.data && typeof event.request.data === "string" && event.request.data.length > 2000) {
              return { ...event, request: { ...event.request, data: "[redacted large body]" } };
            }
            return event;
          }
        });
        Sentry.setTag("surface", "share");
      })
      .catch(() => {
        shareSentryStarted = false;
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
