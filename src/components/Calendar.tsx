"use client";
import React, { useState, useMemo } from 'react';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  addMonths, subMonths 
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import { getEventsForMonth } from '@/lib/rok-engine';

export default function RokCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Detectar o "Hoje" no Horário do Servidor (UTC 0)
  const todayUTC = useMemo(() => {
    const now = new Date();
    return new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  }, []);

  const todayStr = format(todayUTC, 'yyyy-MM-dd');

  const { days, events } = useMemo(() => {
    return {
      days: eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) }),
      events: getEventsForMonth(currentDate)
    };
  }, [currentDate]);

  return (
    <div className="max-w-[1440px] mx-auto p-4 md:p-10 bg-[#08090a] text-[#d1d5db] min-h-screen font-sans antialiased">
      
      {/* STRATEGIC HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-[#121417] p-8 rounded-3xl border border-[#d4af37]/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#d4af37]/5 blur-[100px] -z-10" />
        
        <div className="flex items-center gap-6">
          <div className="h-14 w-1 bg-gradient-to-b from-[#d4af37] to-transparent rounded-full" />
          <div>
            <h2 className="text-5xl font-black uppercase tracking-tighter text-[#d4af37]">
              {format(currentDate, 'MMMM', { locale: enUS })}
            </h2>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.4em] mt-1">
              Server Time (UTC 0) // {format(currentDate, 'yyyy')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-6 md:mt-0 bg-black/40 p-2 rounded-2xl border border-white/5">
          <button 
            onClick={() => setCurrentDate(subMonths(currentDate, 1))} 
            className="p-4 hover:bg-[#d4af37] hover:text-black rounded-xl transition-all duration-300 active:scale-90"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          
          <button 
            onClick={() => setCurrentDate(todayUTC)} // Volta para o mês atual do servidor
            className="px-8 py-3 bg-transparent hover:bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/40 rounded-xl font-black uppercase text-xs tracking-widest transition-all"
          >
            Today
          </button>
          
          <button 
            onClick={() => setCurrentDate(addMonths(currentDate, 1))} 
            className="p-4 hover:bg-[#d4af37] hover:text-black rounded-xl transition-all duration-300 active:scale-90"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>

      {/* CALENDAR GRID */}
      <div className="grid grid-cols-7 gap-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
          <div key={dayName} className="pb-4 text-center text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
            {dayName}
          </div>
        ))}
        
        {days.map((day, idx) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const dayEvents = events.filter(ev => ev.endDate && dayKey >= ev.startDate && dayKey <= ev.endDate);
          
          // Comparação exata de string para evitar erros de fuso horário local
          const isTodayServer = dayKey === todayStr;

          return (
            <div 
              key={dayKey} 
              style={{ gridColumnStart: idx === 0 ? day.getDay() + 1 : undefined }} 
              className={`
                min-h-[150px] p-3 rounded-2xl border-2 transition-all duration-500 flex flex-col
                ${isTodayServer 
                  ? 'bg-[#1a1c20] border-[#d4af37] shadow-[0_0_40px_rgba(212,175,55,0.15)] z-10 scale-[1.02]' 
                  : 'bg-[#0f1114] border-white/5 hover:border-white/10 hover:bg-[#14161a]'
                }
              `}
            >
              <div className="flex justify-between items-center mb-3">
                <span className={`text-xl font-black ${isTodayServer ? 'text-[#d4af37]' : 'text-gray-700'}`}>
                  {format(day, 'dd')}
                </span>
                {isTodayServer && <span className="text-[8px] font-black bg-[#d4af37] text-black px-1.5 py-0.5 rounded uppercase shadow-[0_0_10px_rgba(212,175,55,0.5)]">Now</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                {dayEvents.map((ev, i) => (
                  <div key={`${ev.title}-${i}`} className="relative group">
                    <div 
                      style={{ backgroundColor: ev.color }} 
                      className="px-2.5 py-1.5 rounded-lg shadow-md border border-black/20"
                    >
                      <span className="text-[10px] font-extrabold leading-none text-black uppercase tracking-tight block truncate">
                        {ev.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER LEGEND */}
      <div className="mt-12 p-8 bg-[#121417] rounded-[2rem] border border-white/5 shadow-inner">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-6 text-center">Active Event Protocols</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...new Set(events.map(e => JSON.stringify({t: e.title, c: e.color})))]
            .map(str => JSON.parse(str))
            .map(item => (
              <div key={item.t} className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-white/5">
                <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,1)]" style={{ backgroundColor: item.c }} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{item.t}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}