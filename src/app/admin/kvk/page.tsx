import { redirect } from "next/navigation";

import { activateKvkAction, createKvkAction } from "@/app/admin/kvk/actions";
import { getSession } from "@/lib/getSession";
import { getKvkRegistry } from "@/lib/kvk-registry";

export default async function AdminKvkPage() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const { kvks, activeSlug } = await getKvkRegistry();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="border-b border-slate-800 pb-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">Admin</p>
          <h1 className="text-3xl font-black text-amber-500">KvK Database Control</h1>
          <p className="text-slate-400 mt-3 max-w-3xl">
            Crie um novo KvK sem duplicar páginas ou rotas. O sistema registra o KvK,
            inicializa o arquivo SQLite e permite marcar qualquer um como ativo.
          </p>
        </header>

        <section className="bg-[#111] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white">Create new KvK</h2>
            <p className="text-sm text-slate-400 mt-1">
              Exemplo de slug: <span className="font-mono text-amber-400">kvk5</span>.
            </p>
          </div>

          <form action={createKvkAction} className="grid gap-4 md:grid-cols-[1fr_1.5fr_auto]">
            <input
              name="slug"
              required
              placeholder="kvk5"
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              name="name"
              placeholder="KvK 5"
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-500 text-black px-6 py-3 rounded-lg font-black uppercase text-sm transition-all"
            >
              Create KvK
            </button>
            <label className="flex items-center gap-2 text-sm text-slate-300 md:col-span-3">
              <input type="checkbox" name="makeActive" defaultChecked className="accent-amber-500" />
              Set as active after creation
            </label>
          </form>
        </section>

        <section className="bg-[#111] border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-white">Registered KvKs</h2>
            <p className="text-sm text-slate-400 mt-1">
              O KvK ativo define a Home, uploads sem parâmetro e os endpoints padrão do sistema.
            </p>
          </div>

          <div className="space-y-3">
            {kvks.map((kvk) => {
              const isActive = kvk.slug === activeSlug;

              return (
                <div
                  key={kvk.slug}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/70 border border-slate-800 rounded-xl p-4"
                >
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold text-white">{kvk.name}</h3>
                      <span className="font-mono text-xs px-2 py-1 rounded border border-slate-700 text-slate-400">
                        {kvk.slug}
                      </span>
                      <span className="font-mono text-xs px-2 py-1 rounded border border-slate-700 text-slate-400">
                        {kvk.dbFile}
                      </span>
                      {isActive && (
                        <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase tracking-wide">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Created at {new Date(kvk.createdAt).toLocaleString("en-GB", { timeZone: "UTC" })} UTC
                    </p>
                  </div>

                  {!isActive && (
                    <form action={activateKvkAction}>
                      <input type="hidden" name="slug" value={kvk.slug} />
                      <button
                        type="submit"
                        className="bg-slate-200 hover:bg-white text-black px-4 py-2 rounded-lg font-bold text-sm transition-all"
                      >
                        Set active
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
