"use client";

import { useState, useRef } from "react";
import { createAnnouncement } from "@/app/announcements/create/actions";
import { Bold, Italic, Heading3, List, Link as LinkIcon, Info } from "lucide-react";

export default function AnnouncementForm({ session }: { session: any }) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    const newText = `${beforeText}${prefix}${selectedText || "text"}${suffix}${afterText}`;
    setContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 10);
  };

  return (
    <form action={createAnnouncement} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Headline */}
        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest">Headline</label>
          <input 
            name="title" required placeholder="e.g., Ceroli Crisis Approaching"
            className="bg-[#121417] border border-white/10 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-all placeholder:text-gray-700"
          />
        </div>

        {/* Summary */}
        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Briefing (Summary)</label>
          <textarea 
            name="summary" required rows={2}
            className="bg-[#121417] border border-white/10 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-all resize-none"
          />
        </div>

        {/* Tag & Category */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Tag</label>
          <input name="tag" placeholder="General, Urgent, Peace" className="bg-[#121417] border border-white/10 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none" />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Category</label>
          <select name="category" className="bg-[#121417] border border-white/10 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none appearance-none">
            <option value="System">System</option>
            <option value="Event">Event</option>
            <option value="Diplomacy">Diplomacy</option>
            <option value="War">War</option>
          </select>
        </div>

        {/* Priority & Author */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Priority Level</label>
          <select name="priority" className="bg-[#121417] border border-white/10 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none appearance-none">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High (Red Alert)</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Reporting Officer</label>
          <input 
            name="author" value={session.user.name} readOnly
            className="bg-[#121417]/50 border border-white/5 rounded-xl p-4 text-gray-500 outline-none cursor-not-allowed" 
          />
        </div>

        {/* Content with Toolbar */}
        <div className="md:col-span-2 flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-black uppercase text-[#d4af37] tracking-widest">Full Report Content</label>
            <div className="flex gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
              <button type="button" onClick={() => insertMarkdown("**", "**")} className="p-1.5 hover:bg-[#d4af37] hover:text-black rounded transition-colors"><Bold size={14} /></button>
              <button type="button" onClick={() => insertMarkdown("*", "*")} className="p-1.5 hover:bg-[#d4af37] hover:text-black rounded transition-colors"><Italic size={14} /></button>
              <button type="button" onClick={() => insertMarkdown("### ")} className="p-1.5 hover:bg-[#d4af37] hover:text-black rounded transition-colors"><Heading3 size={14} /></button>
              <button type="button" onClick={() => insertMarkdown("- ")} className="p-1.5 hover:bg-[#d4af37] hover:text-black rounded transition-colors"><List size={14} /></button>
            </div>
          </div>

          <textarea 
            ref={textareaRef} name="content" required rows={12} value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-[#121417] border border-white/10 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-all font-sans"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/5">
        <button type="submit" className="px-10 py-4 bg-[#d4af37] text-black font-black uppercase text-xs rounded-xl hover:scale-105 active:scale-95 transition-all">
          Broadcast Announcement
        </button>
      </div>
    </form>
  );
}