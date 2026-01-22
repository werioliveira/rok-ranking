// src/app/tools/mge/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/getSession";
import { getPrismaClient } from "@/lib/prisma"; 
import MGEForm from "./MGEForm";

export default async function MGEPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const kvkId = process.env.KVK_DB_VERSION || "1";
  const prisma = getPrismaClient(kvkId);

  // Checks for an active event
  const activeEvent = await prisma.mGEEvent.findFirst({ where: { active: true } });

  return (
    <div className="max-w-screen-md mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">
        MGE Registration
      </h1>

      {!activeEvent ? (
        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-lg text-center">
          <p className="text-amber-500 font-medium">
            MGE registrations are currently closed.
          </p>
          <p className="text-sm text-slate-400 mt-1">Please wait for leadership to open the next event.</p>
        </div>
      ) : (
        <>
          <p className="text-muted-foreground mb-6 italic">
            Current Event: <span className="text-white font-bold">{activeEvent.name}</span>
          </p>
          <MGEForm userName={session.user.name!} />
        </>
      )}
    </div>
  );
}