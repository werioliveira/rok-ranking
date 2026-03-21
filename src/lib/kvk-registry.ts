import { unstable_noStore as noStore } from "next/cache";
import { promises as fs } from "node:fs";
import path from "node:path";

export interface KvkEntry {
  slug: string;
  name: string;
  dbFile: string;
  createdAt: string;
}

interface KvkRegistry {
  activeSlug: string;
  kvks: KvkEntry[];
  updatedAt: string;
}

const registryPath = path.join(process.cwd(), "prisma", "kvks.json");

function normalizeKvkSlug(value: string) {
  const normalized = value.trim().toLowerCase();

  if (/^kvk\d+$/.test(normalized)) {
    return normalized;
  }

  if (/^\d+$/.test(normalized)) {
    return `kvk${normalized}`;
  }

  throw new Error("Use um identificador no formato kvk5 ou apenas 5.");
}

function buildDefaultRegistry(): KvkRegistry {
  const fallbackRaw =
    process.env.KVK_DB_VERSION || process.env.NEXT_PUBLIC_KVK_DEFAULT || "1";
  const activeSlug = normalizeKvkSlug(String(fallbackRaw));
  const createdAt = new Date().toISOString();

  return {
    activeSlug,
    updatedAt: createdAt,
    kvks: [
      {
        slug: activeSlug,
        name: activeSlug.toUpperCase(),
        dbFile: `${activeSlug}.db`,
        createdAt,
      },
    ],
  };
}

async function ensureRegistryFile() {
  try {
    await fs.access(registryPath);
  } catch {
    await fs.mkdir(path.dirname(registryPath), { recursive: true });
    await fs.writeFile(
      registryPath,
      `${JSON.stringify(buildDefaultRegistry(), null, 2)}\n`,
      "utf8"
    );
  }
}

async function readRegistry(): Promise<KvkRegistry> {
  await ensureRegistryFile();
  const raw = await fs.readFile(registryPath, "utf8");
  const parsed = JSON.parse(raw) as KvkRegistry;

  if (!parsed.kvks?.length) {
    const fallback = buildDefaultRegistry();
    await writeRegistry(fallback);
    return fallback;
  }

  return parsed;
}

async function writeRegistry(registry: KvkRegistry) {
  await fs.writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`, "utf8");
}

function sortKvks(kvks: KvkEntry[]) {
  return [...kvks].sort((a, b) => {
    const aNumber = Number(a.slug.replace("kvk", ""));
    const bNumber = Number(b.slug.replace("kvk", ""));
    return aNumber - bNumber;
  });
}

export async function getKvkRegistry() {
  noStore();
  const registry = await readRegistry();
  const kvks = sortKvks(registry.kvks);
  const activeKvk = kvks.find((kvk) => kvk.slug === registry.activeSlug) ?? kvks[0];

  return {
    activeSlug: activeKvk.slug,
    kvks,
  };
}

export async function listKvks() {
  const { kvks } = await getKvkRegistry();
  return kvks;
}

export async function getActiveKvk() {
  const { activeSlug, kvks } = await getKvkRegistry();
  return kvks.find((kvk) => kvk.slug === activeSlug) ?? kvks[0];
}

export async function getKvkBySlug(slug: string) {
  const normalizedSlug = normalizeKvkSlug(slug);
  const kvks = await listKvks();
  return kvks.find((kvk) => kvk.slug === normalizedSlug) ?? null;
}

export async function requireKvkSlug(slug?: string | null) {
  if (slug) {
    const normalizedSlug = normalizeKvkSlug(slug);
    const kvk = await getKvkBySlug(normalizedSlug);

    if (!kvk) {
      throw new Error(`KvK ${normalizedSlug.toUpperCase()} não está cadastrado.`);
    }

    return kvk.slug;
  }

  const activeKvk = await getActiveKvk();
  return activeKvk.slug;
}

export async function setActiveKvk(slug: string) {
  const registry = await readRegistry();
  const normalizedSlug = normalizeKvkSlug(slug);
  const exists = registry.kvks.some((kvk) => kvk.slug === normalizedSlug);

  if (!exists) {
    throw new Error(`KvK ${normalizedSlug.toUpperCase()} não está cadastrado.`);
  }

  const nextRegistry: KvkRegistry = {
    ...registry,
    activeSlug: normalizedSlug,
    updatedAt: new Date().toISOString(),
  };

  await writeRegistry(nextRegistry);
  return normalizedSlug;
}

export async function registerKvk(input: { slug: string; name?: string }) {
  const registry = await readRegistry();
  const slug = normalizeKvkSlug(input.slug);

  if (registry.kvks.some((kvk) => kvk.slug === slug)) {
    throw new Error(`O ${slug.toUpperCase()} já existe.`);
  }

  const createdAt = new Date().toISOString();
  const nextEntry: KvkEntry = {
    slug,
    name: input.name?.trim() || slug.toUpperCase(),
    dbFile: `${slug}.db`,
    createdAt,
  };

  const nextRegistry: KvkRegistry = {
    ...registry,
    kvks: sortKvks([...registry.kvks, nextEntry]),
    updatedAt: createdAt,
  };

  await writeRegistry(nextRegistry);
  return nextEntry;
}

export function getKvkDbFile(slug: string) {
  return `${normalizeKvkSlug(slug)}.db`;
}

export function getKvkDbUrl(slug: string) {
  return `file:./prisma/${getKvkDbFile(slug)}`;
}

export function formatKvkLabel(slug: string) {
  return normalizeKvkSlug(slug).toUpperCase();
}

export { normalizeKvkSlug };
