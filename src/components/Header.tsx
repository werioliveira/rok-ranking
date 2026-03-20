import HeaderClient from "@/components/HeaderClient";
import { getKvkRegistry } from "@/lib/kvk-registry";

export default async function Header() {
  const { kvks, activeSlug } = await getKvkRegistry();

  return <HeaderClient kvks={kvks} activeSlug={activeSlug} />;
}
