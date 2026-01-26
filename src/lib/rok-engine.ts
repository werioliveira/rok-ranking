import { addWeeks, addDays } from 'date-fns';

export interface RokEvent {
  title: string;
  startDate: string;
  endDate?: string; // Tornamos opcional para aceitar eventos estáticos antes do cálculo
  color: string;
  duration?: number;
  description?: string;
}
// Converte data para string YYYY-MM-DD sem interferência de fuso
const toISO = (date: Date) => {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// Mapeamento de frequências de texto para números (semanas)
const frequencyMap: Record<string, number> = {
  "one-week": 1,
  "two-weeks": 2,
  "four-weeks": 4,
  "five-weeks": 5,
  "eight-weeks": 8
};

// 1. EVENTOS RECORRENTES (Com compensação de -1 dia na startDate para alinhar o grid)
export const RECURRING_PATTERNS = [
  {
    "title": "More Than Gems",
    "color": "#FF5733",
    "patterns": [{ "startDate": "2025-08-15", "frequency": 4, "duration": 2 }]
  },
  {
    "title": "Egg / Hammer Event",
    "color": "#4c89a6",
    "patterns": [
      { "startDate": "2024-01-11", "frequency": 4, "duration": 2 },
      { "startDate": "2024-01-25", "frequency": 4, "duration": 2 }
    ]
  },
  {
    "title": "20 Gold Head Event",
    "color": "#de4d40",
    "patterns": [
      { "startDate": "2024-01-11", "frequency": 4, "duration": 2 },
      { "startDate": "2024-01-25", "frequency": 4, "duration": 2 }
    ]
  },
  {
    "title": "MGE",
    "color": "#3a94ee",
    "patterns": [
      { "startDate": "2023-12-31", "frequency": 8, "duration": 6 },
      { "startDate": "2024-01-14", "frequency": 8, "duration": 6 },
      { "startDate": "2024-01-28", "frequency": 8, "duration": 6 },
      { "startDate": "2024-02-11", "frequency": 8, "duration": 6 }
    ]
  },
  {
    "title": "Wheel of Fortune",
    "color": "#f99806",
    "patterns": [
      { "startDate": "2024-01-01", "frequency": 8, "duration": 3 },
      { "startDate": "2024-01-15", "frequency": 8, "duration": 3 },
      { "startDate": "2024-01-29", "frequency": 8, "duration": 3 },
      { "startDate": "2024-02-12", "frequency": 8, "duration": 3 }
    ]
  },
  {
    "title": "Esmeralda",
    "color": "#33FF57",
    "patterns": [{ "startDate": "2025-03-16", "frequency": 8, "duration": 2 }]
  },
{ 
    "title": "The Golden Kingdom", 
    "color": "#FFFF00", 
    "patterns": [{ "startDate": "2025-07-30", "frequency": 2, "duration": 3 }] 
  },

  // Alliance Mobilization: A cada 4 semanas, duração de 14 dias
  { 
    "title": "Alliance Mobilization", 
    "color": "#00ffbb", 
    "patterns": [{ "startDate": "2026-01-30", "frequency": 4, "duration": 14 }] 
  },

{ 
    "title": "Ceroli Crisis", 
    "color": "#6b9a89", 
    "patterns": [{ 
      "startDate": "2026-01-25", 
      "frequency": 4, 
      "duration": 3 
    }] 
  },
  {
    "title": "Realm of Mystique",
    "color": "#FFC0CB",
    "patterns": [{ 
      "startDate": "2026-02-08", 
      "frequency": 4, 
      "duration": 2 
    }]
  },
  {
    "title": "Dhalruk's Puzzle Box",
    "color": "#abab4d",
    "patterns": [{ "startDate": "2025-02-16", "frequency": 8, "duration": 2 }]
  },
  {
    "title": "Ark of Osiris",
    "color": "#b7a8ff",
    "patterns": [{ "startDate": "2025-02-04", "frequency": 2, "duration": 5 }]
  },
  {
    "title": "Champions of Olympia",
    "color": "#a6ff73",
    "patterns": [{ "startDate": "2025-01-31", "frequency": 1, "duration": 2 }]
  }
];

export const STATIC_EVENTS: RokEvent[] = [
  { "title": "Zenith of Power", "startDate": "2024-12-25", "duration": 4, "color": "#FF0000" },
  { "title": "Canyon Clash", "startDate": "2025-02-24", "duration": 5, "color": "#e0ff33" },
  { "title": "Zenith of Power", "startDate": "2025-04-21", "duration": 4, "color": "#FF0000" },
  { "title": "Armament, Reveal Thyself", "startDate": "2025-04-28", "duration": 3, "color": "#Ffff00" },
  { "title": "Alliance Mobilization", "startDate": "2025-07-31", "duration": 14, "color": "#00ffbb" },
  

  { "title": "Protect the Supplies", "startDate": "2025-08-25", "duration": 3, "color": "#ffd500" },
  { "title": "Hoist your Mainsail", "startDate": "2025-08-25", "duration": 8, "color": "#c74671" },
  { "title": "Treasure Island", "startDate": "2025-08-25", "duration": 8, "color": "#f0924f" },
  { "title": "Breaking Waves", "startDate": "2025-08-25", "duration": 7, "color": "#bad468" },
  { "title": "Alliance Mobilization", "startDate": "2025-09-04", "duration": 14, "color": "#00ffbb" },
  //{ "title": "Realm of Mystique", "startDate": "2025-09-08", "duration": 2, "color": "#FFC0CB" },
  //{ "title": "Realm of Mystique", "startDate": "2025-08-05", "duration": 2, "color": "#FFC0CB" },
  { "title": "Armament, Reveal Thyself", "startDate": "2025-09-15", "duration": 3, "color": "#Ffff00" },
  { "title": "Zenith of Power", "startDate": "2025-09-25", "duration": 4, "color": "#FF0000" },
  { "title": "Alliance Mobilization", "startDate": "2025-10-02", "duration": 14, "color": "#00ffbb" },
  { "title": "Alliance Mobilization", "startDate": "2025-10-30", "duration": 14, "color": "#00ffbb" },
  { "title": "Alliance Mobilization", "startDate": "2025-11-27", "duration": 14, "color": "#00ffbb" }
];

export function getEventsForMonth(viewDate: Date): RokEvent[] {
  const allEvents: RokEvent[] = [];
  const targetMonth = viewDate.getMonth();
  const targetYear = viewDate.getFullYear();

  // Processar Recorrentes
  RECURRING_PATTERNS.forEach(group => {
    group.patterns.forEach(p => {
      const anchor = new Date(`${p.startDate}T12:00:00Z`);
      const freq = typeof p.frequency === 'string' ? frequencyMap[p.frequency] : p.frequency;
      
      for (let i = 0; i <= 600; i += freq) {
        const start = addWeeks(anchor, i);
        const end = addDays(start, p.duration - 1);

        const sStr = toISO(start);
        const eStr = toISO(end);

        // Se o evento toca o mês alvo
        if ((start.getUTCFullYear() === targetYear && start.getUTCMonth() === targetMonth) ||
            (end.getUTCFullYear() === targetYear && end.getUTCMonth() === targetMonth)) {
          allEvents.push({ title: group.title, color: group.color, startDate: sStr, endDate: eStr });
        }
      }
    });
  });

 // Processar Estáticos
  STATIC_EVENTS.forEach(ev => {
    // Forçamos o T12:00:00Z para que o fuso -3h do Brasil ainda mantenha a data no mesmo dia
    const start = new Date(`${ev.startDate}T12:00:00Z`);
    const end = addDays(start, (ev.duration || 1) - 1);
    
    // Verifica se o evento ocorre no mês que estamos visualizando
    if ((start.getUTCFullYear() === targetYear && start.getUTCMonth() === targetMonth) ||
        (end.getUTCFullYear() === targetYear && end.getUTCMonth() === targetMonth)) {
      
      allEvents.push({ 
        ...ev, 
        startDate: ev.startDate, // Mantém a string exata (ex: "2026-01-01")
        endDate: toISO(end),
        duration: ev.duration || 1,
        description: ev.description || ""
      } as Required<RokEvent>);
    }
  });

  return allEvents;
}