"use client";
import React from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Announcement } from '@/components/AnnouncementsView';
import { deleteAnnouncement } from '@/app/announcements/create/actions';
import EditAnnouncementModal from '@/components/EditAnnouncementModal';

export default function AnnouncementDetail({ announcement }: { announcement: Announcement }) {
  
  if (!announcement) {
    return (
      <div className="max-w-[1000px] mx-auto p-20 bg-[#08090a] min-h-screen text-center">
         <h1 className="text-[#d4af37] font-black uppercase tracking-widest text-2xl">Signal Lost</h1>
         <Link href="/announcements" className="mt-8 inline-block text-[#d4af37] border-b border-[#d4af37] pb-1 text-[10px] font-black uppercase">Return to Feed</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto p-4 md:p-20 bg-[#08090a] text-[#d1d5db] min-h-screen font-sans antialiased">
      
      <div className="flex justify-between items-center mb-12">
        <Link href="/announcements" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-[#d4af37] transition-colors group">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" className="group-hover:-translate-x-1 transition-transform">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Return to Feed
        </Link>
        <EditAnnouncementModal announcement={announcement} />
        {/* BOTÃO DE DELETE */}
        <form action={deleteAnnouncement} onSubmit={(e) => {
          if(!confirm("PERMANENTLY DELETE THIS INTEL REPORT?")) e.preventDefault();
        }}>
          <input type="hidden" name="id" value={announcement.id} />
          <button 
            type="submit"
            className="text-[9px] font-black uppercase tracking-widest text-red-900 hover:text-red-500 transition-colors border border-red-900/30 px-3 py-1 rounded-lg hover:bg-red-500/5"
          >
            Delete Notice
          </button>
        </form>
      </div>

      <article>
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-[#d4af37] text-black text-[9px] font-black px-3 py-1 rounded uppercase">
              {announcement.category}
            </span>
            <span className="text-gray-600 font-mono text-xs font-bold uppercase tracking-widest">
              Released: {announcement.date}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-8">
            {announcement.title}
          </h1>

          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 w-fit">
            <div className="w-8 h-8 rounded-full bg-[#d4af37] flex items-center justify-center text-black font-black uppercase">
              {announcement.author ? announcement.author[0] : 'A'}
            </div>
            <div>
              <p className="text-[10px] font-black text-[#d4af37] uppercase leading-none mb-1">Author</p>
              <p className="text-xs font-bold text-white uppercase">{announcement.author}</p>
            </div>
          </div>
        </header>

        <div className="prose prose-invert max-w-none">
          <p className="text-xl text-gray-400 font-medium leading-relaxed mb-8 italic border-l-4 border-[#d4af37] pl-6">
            {announcement.summary}
          </p>
          
          {/* CONTEÚDO COM MARKDOWN RENDERIZADO */}
          <div className="text-lg text-gray-300 leading-relaxed space-y-2 font-sans overflow-hidden">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // Estilização das tags Markdown para bater com seu tema
                h1: ({...props}) => <h2 className="text-3xl font-black text-white uppercase mt-10 mb-4" {...props} />,
                h2: ({...props}) => <h3 className="text-2xl font-bold text-[#d4af37] uppercase mt-8 mb-4" {...props} />,
                h3: ({...props}) => <h4 className="text-xl font-bold text-white uppercase mt-6 mb-2" {...props} />,
                p: ({...props}) => <p className="mb-4 text-gray-300" {...props} />,
                ul: ({...props}) => <ul className="list-disc list-outside ml-6 space-y-2 mb-6 text-[#d4af37]" {...props} />,
                ol: ({...props}) => <ol className="list-decimal list-outside ml-6 space-y-2 mb-6 text-[#d4af37]" {...props} />,
                li: ({...props}) => <li className="text-gray-300 pl-2" {...props} />,
                strong: ({...props}) => <strong className="text-white font-black border-b border-[#d4af37]/20" {...props} />,
                a: ({...props}) => <a className="text-[#d4af37] underline hover:text-white transition-colors" {...props} />,
                hr: () => <hr className="border-white/10 my-10" />,
                blockquote: ({...props}) => <blockquote className="bg-white/5 p-6 rounded-2xl border-l-4 border-gray-600 italic my-8 text-gray-400" {...props} />,
              }}
            >
              {announcement.content}
            </ReactMarkdown>
          </div>
        </div>
      </article>

      <footer className="mt-20 pt-10 border-t border-white/5 flex flex-col items-center">
        <div className="w-12 h-1 bg-[#d4af37]/20 rounded-full mb-6" />
        <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.5em]">End of Transmission</p>
      </footer>
    </div>
  );
}