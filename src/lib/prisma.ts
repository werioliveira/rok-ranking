import { PrismaClient } from "@prisma/client";

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

  const newClient = new PrismaClient({
    datasources: {
      db: { url: dbUrl },
    },
    log: ["error"],
  });

  kvkPrismaInstances[dbName] = newClient;
  return newClient;
}
