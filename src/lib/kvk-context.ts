import { getActiveKvk, requireKvkSlug } from "@/lib/kvk-registry";

export async function resolveKvkSlug(input?: string | null) {
  if (input) {
    return requireKvkSlug(input);
  }

  const activeKvk = await getActiveKvk();
  return activeKvk.slug;
}

export async function resolveKvkLabel(input?: string | null) {
  const slug = await resolveKvkSlug(input);
  return slug.toUpperCase();
}
