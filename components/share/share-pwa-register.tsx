"use client";

import { useEffect } from "react";

export function SharePwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      /* optional */
    });
  }, []);
  return null;
}
