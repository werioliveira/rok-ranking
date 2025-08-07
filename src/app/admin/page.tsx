import { cookies } from "next/headers";
import AdminContent from "./AdminContent";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("admin-auth")?.value === "true";

  if (!isAuthenticated) {
    redirect("/login"); // redireciona automaticamente se não estiver logado
  }

  return <AdminContent />;
}
