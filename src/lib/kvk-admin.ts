"use server";

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

import {
  getKvkBySlug,
  getKvkDbFile,
  getKvkDbUrl,
  normalizeKvkSlug,
  registerKvk,
  setActiveKvk,
} from "@/lib/kvk-registry";

function runPrismaCommand(command: string, databaseUrl: string) {
  return execSync(command, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DATABASE_URL: databaseUrl,
    },
    stdio: "pipe",
  }).toString();
}

function getKvkDbAbsolutePath(slug: string) {
  return path.join(process.cwd(), "prisma", getKvkDbFile(slug));
}

export async function createKvkDatabase(slugInput: string, name?: string, makeActive = true) {
  const slug = normalizeKvkSlug(slugInput);
  const existingKvk = await getKvkBySlug(slug);

  if (existingKvk) {
    throw new Error(`O ${slug.toUpperCase()} já existe.`);
  }

  const databaseUrl = getKvkDbUrl(slug);
  const databasePath = getKvkDbAbsolutePath(slug);
  const databaseAlreadyExists = existsSync(databasePath);

  if (!databaseAlreadyExists) {
    try {
      runPrismaCommand("npx prisma db push --skip-generate", databaseUrl);
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? `Falha ao inicializar ${slug.toUpperCase()}: ${error.message}`
          : `Falha ao inicializar ${slug.toUpperCase()}.`
      );
    }
  }

  const kvk = await registerKvk({ slug, name });

  if (makeActive) {
    await setActiveKvk(kvk.slug);
  }

  return {
    ...kvk,
    databaseAlreadyExists,
  };
}
