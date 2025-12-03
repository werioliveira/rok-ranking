"use client";
import { useEffect } from "react";
import * as Ackee from "ackee-tracker";

export default function Analytics() {
  useEffect(() => {
    try {
      const instance = Ackee.create(`${process.env.ACKEE_URL}`, {
        detailed: true,
        ignoreLocalhost: false,
        ignoreOwnVisits: false,
      });

      // Usar o domainId correto do Ackee
      instance.record("ff94be23-1f95-4ebf-9c57-afdf83322a5c")
    } catch (error) {
      console.error("❌ Erro no Ackee:", error);
    }
  }, []);

  return null;
}
