"use client";
import { useState } from "react";
import { updateAnnouncement } from "@/app/announcements/create/actions";
import { Edit3, X, Save } from "lucide-react";

export default function EditAnnouncementModal({ announcement }: { announcement: any }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#d4af37] border border-[#d4af37]/30 px-4 py-1.5 rounded-lg hover:bg-[#d4af37]/10 transition-all"
      >
        <Edit3 size={12} />
        Edit Report
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-[#0d0f12] border border-[#d4af37]/20 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#121417]">
          <div>
            <h3 className="text-[#d4af37] font-black uppercase tracking-[0.2em] text-xs">Correction Protocol</h3>
            <p className="text-[10px] text-gray-500 uppercase mt-1">Modifying Record ID: {announcement.id}</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">
            <X size={24}/>
          </button>
        </div>

        <form action={async (fd) => {
          await updateAnnouncement(fd);
          setIsOpen(false);
        }} className="p-8 overflow-y-auto custom-scrollbar space-y-6">
          <input type="hidden" name="id" value={announcement.id} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Headline</label>
              <input name="title" defaultValue={announcement.title} className="bg-[#121417] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#d4af37] transition-all" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tag</label>
              <input name="tag" defaultValue={announcement.tag} className="bg-[#121417] border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#d4af37] transition-all" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Category</label>
              <select name="category" defaultValue={announcement.category} className="bg-[#121417] border border-white/10 p-4 rounded-xl text-white outline-none appearance-none">
                <option value="System">System</option>
                <option value="Event">Event</option>
                <option value="Diplomacy">Diplomacy</option>
                <option value="War">War</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Priority</label>
              <select name="priority" defaultValue={announcement.priority} className="bg-[#121417] border border-white/10 p-4 rounded-xl text-white outline-none appearance-none">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High (Red Alert)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Briefing (Summary)</label>
            <textarea name="summary" defaultValue={announcement.summary} rows={2} className="bg-[#121417] border border-white/10 p-4 rounded-xl text-white outline-none resize-none focus:border-[#d4af37]" />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-[#d4af37] uppercase tracking-widest">Full Report Content (Markdown)</label>
            <textarea name="content" defaultValue={announcement.content} rows={10} className="bg-[#121417] border border-white/10 p-4 rounded-xl text-white outline-none font-mono text-sm focus:border-[#d4af37]" />
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
            <button type="button" onClick={() => setIsOpen(false)} className="px-8 py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors">
              Abort Changes
            </button>
            <button type="submit" className="flex items-center gap-2 px-10 py-4 bg-[#d4af37] text-black text-[10px] font-black uppercase rounded-xl hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]">
              <Save size={14} />
              Commit Updates
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}