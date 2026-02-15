
import React, { useState, useRef } from 'react';
import { ChevronRight, ChevronLeft, Bell } from 'lucide-react';
import { CalendarEvent, AppSettings } from '../types';
import { toHebrewNumeral, getHebrewMonthYear, getGregorianMonthYear, getHebrewDay, getHebrewMonthBounds } from '../utils/hebrewDateUtils';

interface CalendarViewProps {
  events: CalendarEvent[];
  onDateSelect: (date: string) => void;
  onAddEvent: (date: string) => void;
  settings: AppSettings;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, onDateSelect, onAddEvent, settings }) => {
  const [viewDate, setViewDate] = useState(new Date());
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate);
    newDate.setDate(newDate.getDate() + (offset * 30));
    setViewDate(newDate);
  };

  const handleTouchStart = (e: React.TouchEvent, dateStr?: string) => {
    touchStart.current = e.targetTouches[0].clientX;
    if (dateStr) {
      timerRef.current = window.setTimeout(() => {
        onAddEvent(dateStr);
        timerRef.current = null;
      }, 600);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleTouchEnd = (dateStr?: string) => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      if (dateStr) onDateSelect(dateStr);
      timerRef.current = null;
    }

    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    if (distance > 70) changeMonth(1);
    if (distance < -70) changeMonth(-1);

    touchStart.current = null;
    touchEnd.current = null;
  };

  const generateHebrewMonthDays = () => {
    const { firstDay, length } = getHebrewMonthBounds(viewDate);
    const days = [];
    const startPadding = firstDay.getDay();
    for (let i = 0; i < startPadding; i++) days.push(null);
    for (let i = 0; i < length; i++) {
      const current = new Date(firstDay);
      current.setDate(firstDay.getDate() + i);
      days.push(current);
    }
    return days;
  };

  const days = generateHebrewMonthDays();
  const weekDays = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = formatDate(new Date());

  const getPrimaryDetail = (event: CalendarEvent) => {
    const firstFieldId = settings.eventFields[0]?.id;
    return event.details[firstFieldId] || 'אירוע';
  };

  return (
    <div className="bg-white w-full min-h-[calc(100vh-160px)] flex flex-col select-none">
      {/* כותרת החודש - רחבה ויוקרתית */}
      <div className="w-full p-6 bg-gradient-to-r from-indigo-600 to-indigo-800 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => changeMonth(1)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-90">
              <ChevronRight size={28} />
            </button>
            <h2 className="text-3xl font-black tracking-tight drop-shadow-md">{getHebrewMonthYear(viewDate)}</h2>
            <button onClick={() => changeMonth(-1)} className="p-2.5 bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-90">
              <ChevronLeft size={28} />
            </button>
          </div>
          <div className="text-left">
            <span className="text-sm font-black opacity-90">{getGregorianMonthYear(viewDate)}</span>
          </div>
        </div>
        <div className="mt-3 text-[11px] font-black text-indigo-100 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_white] animate-pulse"></div>
          לחיצה ארוכה על תאריך להוספה מהירה
        </div>
      </div>

      {/* ימי השבוע */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
        {weekDays.map(day => (
          <div key={day} className="py-3 text-center text-xs font-black text-slate-400 uppercase">
            יום {day}'
          </div>
        ))}
      </div>

      {/* רשת התאריכים - מורחבת למקסימום */}
      <div className="grid grid-cols-7 flex-1">
        {days.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="bg-slate-50/40 border-l border-b border-slate-100/50" />;
          const dateKey = formatDate(day);
          const dayEvents = events.filter(e => e.date === dateKey);
          const isToday = todayStr === dateKey;
          const hebDay = getHebrewDay(day);

          return (
            <div
              key={dateKey}
              onTouchStart={(e) => handleTouchStart(e, dateKey)}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => handleTouchEnd(dateKey)}
              className={`border-l border-b border-slate-100 p-2 relative cursor-pointer min-h-[85px] sm:min-h-[120px] transition-all group ${isToday ? 'bg-indigo-50/60' : 'hover:bg-slate-50 active:bg-indigo-50/30'}`}
            >
              <div className="flex items-start justify-start relative z-10">
                <span className={`text-xl sm:text-2xl font-black leading-tight ${isToday ? 'text-indigo-600' : 'text-slate-800'}`}>
                  {toHebrewNumeral(hebDay)}
                </span>
              </div>

              {/* תאריך לועזי - פינה שמאלית תחתונה */}
              <div className="absolute bottom-2 left-2 text-[11px] font-black text-slate-300 group-hover:text-indigo-300 pointer-events-none transition-colors">
                {day.getDate()}
              </div>

              {/* אירועים בתוך המשבצת */}
              <div className="mt-1.5 space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div key={event.id} className="bg-amber-100/80 text-amber-900 text-[9px] sm:text-[11px] px-1.5 py-0.5 rounded border border-amber-200 truncate font-black leading-none shadow-sm">
                    {getPrimaryDetail(event)}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[9px] text-indigo-500 font-black text-center">+ עוד {dayEvents.length - 3}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
