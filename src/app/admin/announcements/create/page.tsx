import { createAnnouncement } from "@/app/announcements/create/actions";
import { getSession } from "@/lib/getSession";
import { redirect } from "next/navigation";


export default async function CreateAnnouncementPage() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") redirect("/");
  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-10 bg-[#08090a] min-h-screen text-[#d1d5db]">
      
      {/* HEADER */}
      <div className="mb-10 border-b border-[#d4af37]/20 pb-6">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
          Issue <span className="text-[#d4af37]">New Order</span>
        </h1>
        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">
          Authorized Personnel Only // Intel Command
        </p>
      </div>

      <form action={createAnnouncement} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* TITLE */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest">Headline</label>
            <input 
              name="title" 
              required 
              placeholder="e.g., Ceroli Crisis Approaching"
              className="bg-[#121417] border border-white/10 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-all"
            />
          </div>

          {/* SUMMARY */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Briefing (Summary)</label>
            <textarea 
              name="summary" 
              required 
              rows={2}
              placeholder="Short description for the feed..."
              className="bg-[#121417] border border-white/10 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-all resize-none"
            />
          </div>

          {/* TAG & CATEGORY */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Tag</label>
            <input name="tag" placeholder="Urgent, Peace, War" className="bg-[#121417] border border-white/10 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Category</label>
            <select name="category" className="bg-[#121417] border border-white/10 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none">
              <option value="System">System</option>
              <option value="Event">Event</option>
              <option value="Diplomacy">Diplomacy</option>
              <option value="War">War</option>
            </select>
          </div>

          {/* PRIORITY & AUTHOR */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Priority Level</label>
            <select name="priority" className="bg-[#121417] border border-white/10 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none">
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority (Red Alert)</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Reporting Officer (Author)</label>
            <input disabled name="author" value={session.user.name} required placeholder="Your Name/Nick" className="bg-[#121417] border border-white/10 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none" />
          </div>

          {/* MAIN CONTENT */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest">Full Report Content</label>
            <textarea 
              name="content" 
              required 
              rows={10}
              placeholder="Write the full announcement details here..."
              className="bg-[#121417] border border-white/10 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-all"
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/5">
          <button 
            type="button"
            className="px-6 py-3 text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors"
          >
            Discard
          </button>
          <button 
            type="submit"
            className="px-10 py-4 bg-[#d4af37] text-black font-black uppercase text-xs rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          >
            Broadcast Announcement
          </button>
        </div>
      </form>
    </div>
  );
}