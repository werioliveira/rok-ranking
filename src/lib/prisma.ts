import { PrismaClient } from "@prisma/client";

import { getKvkDbUrl, normalizeKvkSlug } from "@/lib/kvk-registry";

const mainPrisma = new PrismaClient({
  datasources: {
    db: { url: "file:./prisma/main.db" },
  },
  log: ["error"],
});

const kvkPrismaInstances: Record<string, PrismaClient> = {};

export function getMainPrismaClient() {
  return mainPrisma;
}

export function getKvkPrismaClient(kvkInput: string) {
  const slug = normalizeKvkSlug(kvkInput);

  if (kvkPrismaInstances[slug]) {
    return kvkPrismaInstances[slug];
  }

  const newClient = new PrismaClient({
    datasources: {
      db: { url: getKvkDbUrl(slug) },
    },
    log: ["error"],
  });

  kvkPrismaInstances[slug] = newClient;
  return newClient;
}
