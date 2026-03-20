"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createKvkDatabase } from "@/lib/kvk-admin";
import { getSession } from "@/lib/getSession";
import { setActiveKvk } from "@/lib/kvk-registry";

async function assertAdmin() {
  const session = await getSession();

  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
}

export async function createKvkAction(formData: FormData) {
  await assertAdmin();

  const slug = String(formData.get("slug") || "");
  const name = String(formData.get("name") || "");
  const makeActive = formData.get("makeActive") === "on";

  await createKvkDatabase(slug, name, makeActive);

  revalidatePath("/");
  revalidatePath("/admin/kvk");
  redirect("/admin/kvk");
}

export async function activateKvkAction(formData: FormData) {
  await assertAdmin();

  const slug = String(formData.get("slug") || "");
  await setActiveKvk(slug);

  revalidatePath("/");
  revalidatePath("/admin/kvk");
  redirect("/admin/kvk");
}
