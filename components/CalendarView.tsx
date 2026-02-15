
import React, { useState, useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { CalendarEvent, AppSettings } from '../types';
import { toHebrewNumeral, getHebrewMonthYear, getGregorianMonthYear, getHebrewDay, getHebrewMonthBounds } from '../utils/hebrewDateUtils';

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
      if ('vibrate' in navigator) navigator.vibrate(30);
      onAddEvent(dateKey);
    }, 450);
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
    if (dx > 8 || dy > 8) {
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
      {/* כותרת חודש דחוסה מאוד */}
      <div className="w-full px-1 bg-indigo-600 text-white flex items-center justify-between h-9 shrink-0 relative z-20">
        <button onClick={() => changeMonth(1)} className="nav-btn">
          <ChevronRight size={22} />
        </button>

        <div className="text-center min-w-0 flex-1">
          <h2 className="text-[12px] font-black truncate leading-none">
            {getHebrewMonthYear(viewDate)}
          </h2>
          <div className="text-[8px] font-bold opacity-75 truncate leading-none mt-0.5">
            {getGregorianMonthYear(viewDate)}
          </div>
        </div>

        <button onClick={() => changeMonth(-1)} className="nav-btn">
          <ChevronLeft size={22} />
        </button>
      </div>

      {/* ימי השבוע */}
      <div className="calendar-grid bg-slate-50 border-b border-slate-100 shrink-0">
        {weekDays.map(day => (
          <div key={day} className="py-0.5 text-center text-[9px] font-black text-slate-400">
            {day}
          </div>
        ))}
      </div>

      {/* גריד התאריכים */}
      <div className="calendar-grid flex-1 overflow-hidden bg-slate-200 gap-[0.2px]">
        {days.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="bg-slate-50/30" />;
          
          const dateKey = formatDate(day);
          const hasEvents = events.some(e => e.date === dateKey);
          const isToday = todayStr === dateKey;
          const hebDayNum = getHebrewDay(day);

          return (
            <div
              key={dateKey}
              onPointerDown={handlePointerDown(dateKey)}
              onPointerUp={handlePointerUp(dateKey)}
              onPointerMove={handlePointerMove}
              onPointerCancel={() => { if(timerRef.current) clearTimeout(timerRef.current); }}
              className={`date-cell transition-colors ${isToday ? 'bg-indigo-50' : 'bg-white'}`}
            >
              <span className={`text-[10px] font-black leading-none ${isToday ? 'text-indigo-700' : 'text-slate-800'}`}>
                {toHebrewNumeral(hebDayNum)}
              </span>
              
              <div className="flex justify-between items-end w-full mt-auto">
                {hasEvents ? (
                  <div className="w-1 h-1 rounded-full bg-amber-500 mb-0.5" />
                ) : <div />}
                <span className="text-[7px] text-slate-300 font-bold leading-none">{day.getDate()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
