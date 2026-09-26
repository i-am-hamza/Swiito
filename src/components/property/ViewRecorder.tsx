"use client";

import { useEffect, useRef } from "react";
import { recordView } from "@/lib/actions/viewcount";

export function ViewRecorder({ propertyId }: { propertyId: string }) {
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;
    recordView(propertyId);
  }, [propertyId]);

  return null;
}
