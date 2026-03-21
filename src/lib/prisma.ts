import { PrismaClient } from "@prisma/client";

<<<<<<< HEAD
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

export function getKvkPrismaClient(kvkId: string) {
  const dbName = `kvk${kvkId}`;

  if (kvkPrismaInstances[dbName]) {
    return kvkPrismaInstances[dbName];
  }

  const dbUrl = `file:./prisma/${dbName}.db`;

=======
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

>>>>>>> codex/implementar-arquitetura-de-banco-de-dados-hibrido-yc6rdw
  const newClient = new PrismaClient({
    datasources: {
      db: { url: getKvkDbUrl(slug) },
    },
    log: ["error"],
  });

<<<<<<< HEAD
  kvkPrismaInstances[dbName] = newClient;
=======
  kvkPrismaInstances[slug] = newClient;
>>>>>>> codex/implementar-arquitetura-de-banco-de-dados-hibrido-yc6rdw
  return newClient;
}
