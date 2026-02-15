
import React, { useState, useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { CalendarEvent, AppSettings } from '../types';
import { toHebrewNumeral, getHebrewMonthYear, getGregorianMonthYear, getHebrewDay, getHebrewMonthBounds, getHebrewDateParts } from '../utils/hebrewDateUtils';

interface CalendarViewProps {
  events: CalendarEvent[];
  onDateSelect: (date: string) => void;
  onAddEvent: (date: string) => void;
  settings: AppSettings;
}

const CalendarView: React.FC<CalendarViewProps> = ({ events, onDateSelect, onAddEvent, settings }) => {
  const initialDate = new Date();
  initialDate.setHours(12, 0, 0, 0);
  const [viewDate, setViewDate] = useState(initialDate);
  
  const timerRef = useRef<number | null>(null);
  const startPos = useRef<{ x: number, y: number } | null>(null);
  const isLongPressActive = useRef(false);

  const { firstDay, length } = getHebrewMonthBounds(viewDate);

  const changeMonth = (offset: number) => {
    const newDate = new Date(firstDay);
    if (offset > 0) {
      newDate.setDate(firstDay.getDate() + length + 10);
    } else {
      newDate.setDate(firstDay.getDate() - 15);
    }
    setViewDate(newDate);
  };

  const handlePointerDown = (dateKey: string) => (e: React.PointerEvent) => {
    isLongPressActive.current = false;
    startPos.current = { x: e.clientX, y: e.clientY };
    timerRef.current = window.setTimeout(() => {
      isLongPressActive.current = true;
      if ('vibrate' in navigator) navigator.vibrate(40);
      onAddEvent(dateKey);
    }, 350);
  };

  const handlePointerUp = (dateKey: string) => (e: React.PointerEvent) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!isLongPressActive.current) {
      onDateSelect(dateKey);
    }
    isLongPressActive.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!startPos.current || !timerRef.current) return;
    const dx = Math.abs(e.clientX - startPos.current.x);
    const dy = Math.abs(e.clientY - startPos.current.y);
    if (dx > 15 || dy > 15) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const days = (() => {
    const d = [];
    const startPadding = firstDay.getDay(); 
    for (let i = 0; i < startPadding; i++) d.push(null);
    for (let i = 0; i < length; i++) {
      const current = new Date(firstDay);
      current.setDate(firstDay.getDate() + i);
      d.push(current);
    }
    return d;
  })();

  const weekDays = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = formatDate(new Date());

  return (
    <div className="bg-white w-full h-full flex flex-col select-none overflow-hidden">
      {/* כותרת חודש - כפתורים ענקיים ונגישים */}
      <div className="w-full px-4 bg-indigo-600 text-white flex items-center justify-between h-16 shrink-0 shadow-lg relative z-20">
        <button 
          onClick={() => changeMonth(1)} 
          className="nav-btn active:scale-95 transition-transform"
          aria-label="חודש הבא"
        >
          <ChevronRight size={32} />
        </button>

        <div className="text-center overflow-hidden">
          <h2 className="text-lg font-black truncate leading-tight">
            {getHebrewMonthYear(viewDate)}
          </h2>
          <div className="text-[10px] font-bold opacity-80">
            {getGregorianMonthYear(viewDate)}
          </div>
        </div>

        <button 
          onClick={() => changeMonth(-1)} 
          className="nav-btn active:scale-95 transition-transform"
          aria-label="חודש קודם"
        >
          <ChevronLeft size={32} />
        </button>
      </div>

      {/* ימי השבוע */}
      <div className="calendar-grid bg-slate-50 border-b border-slate-100 shrink-0">
        {weekDays.map(day => (
          <div key={day} className="py-2 text-center text-[11px] font-black text-slate-400">
            {day}'
          </div>
        ))}
      </div>

      {/* גריד התאריכים */}
      <div className="calendar-grid flex-1 overflow-hidden border-r border-slate-100 bg-slate-200 gap-[0.5px]">
        {days.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="bg-slate-50/50" />;
          
          const dateKey = formatDate(day);
          const dayEvents = events.filter(e => e.date === dateKey);
          const isToday = todayStr === dateKey;
          const hebDayNum = getHebrewDay(day);

          return (
            <div
              key={dateKey}
              onPointerDown={handlePointerDown(dateKey)}
              onPointerUp={handlePointerUp(dateKey)}
              onPointerMove={handlePointerMove}
              onPointerCancel={() => { if(timerRef.current) clearTimeout(timerRef.current); }}
              className={`date-cell p-1 flex flex-col justify-between transition-colors ${isToday ? 'bg-indigo-50' : 'bg-white active:bg-slate-100'}`}
            >
              <span className={`text-[15px] font-black leading-none ${isToday ? 'text-indigo-700' : 'text-slate-800'}`}>
                {toHebrewNumeral(hebDayNum)}
              </span>
              
              <div className="flex justify-between items-end w-full">
                <div className="flex flex-wrap gap-0.5 max-w-[70%]">
                  {dayEvents.slice(0, 3).map(e => (
                    <div key={e.id} className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white shadow-sm" />
                  ))}
                </div>
                <span className="text-[9px] text-slate-300 font-bold leading-none">{day.getDate()}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-1.5 bg-slate-100 text-center text-[9px] font-black text-slate-500 border-t shrink-0">
        לחיצה ארוכה להוספה • לחיצה קצרה לצפייה
      </div>
    </div>
  );
};

export default CalendarView;
