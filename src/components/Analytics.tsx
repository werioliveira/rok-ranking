"use client";
import { useEffect } from "react";
import * as Ackee from "ackee-tracker";

export default function Analytics() {
  const ackeeUrl = process.env.NEXT_PUBLIC_ACKEE_URL;
  const ackeeId = process.env.NEXT_PUBLIC_ACKEE_ID;

  useEffect(() => {
    if (!ackeeUrl || !ackeeId) {
      console.warn("Ackee desativado: variáveis de ambiente ausentes.");
      return;
    }

    try {
      const instance = Ackee.create(ackeeUrl, {
        detailed: true,
        ignoreLocalhost: false,
        ignoreOwnVisits: false,
      });

      instance.record(ackeeId);
    } catch (error) {
      console.error("❌ Erro no Ackee:", error);
    }
  }, [ackeeUrl, ackeeId]);

  return null;
}
