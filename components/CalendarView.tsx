
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
  // Use noon to avoid timezone shift issues
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
      // Go to the middle of next month to ensure we land in it
      newDate.setDate(firstDay.getDate() + length + 10);
    } else {
      // Go to the middle of previous month
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

  const handlePointerCancel = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const generateDays = () => {
    const days = [];
    // Start padding based on the day of week the 1st of Hebrew month falls on
    const startPadding = firstDay.getDay(); 
    for (let i = 0; i < startPadding; i++) days.push(null);
    
    for (let i = 0; i < length; i++) {
      const current = new Date(firstDay);
      current.setDate(firstDay.getDate() + i);
      days.push(current);
    }
    return days;
  };

  const days = generateDays();
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
      {/* Month Header */}
      <div className="w-full p-1 bg-indigo-600 text-white flex items-center justify-between h-9 shrink-0">
        <div className="flex items-center gap-1">
          <button onClick={() => changeMonth(1)} className="p-1 active:bg-white/20 rounded"><ChevronRight size={16} /></button>
          <h2 className="text-xs font-black min-w-[80px] text-center">{getHebrewMonthYear(viewDate)}</h2>
          <button onClick={() => changeMonth(-1)} className="p-1 active:bg-white/20 rounded"><ChevronLeft size={16} /></button>
        </div>
        <span className="text-[7px] font-bold opacity-60 ml-2">{getGregorianMonthYear(viewDate)}</span>
      </div>

      {/* Weekdays */}
      <div className="calendar-grid bg-slate-50 border-b border-slate-100 shrink-0">
        {weekDays.map(day => (
          <div key={day} className="py-0.5 text-center text-[8px] font-black text-slate-400">
            {day}'
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="calendar-grid flex-1 border-r border-slate-50 overflow-hidden">
        {days.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="border-l border-b border-slate-50 bg-slate-50/10" />;
          
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
              onPointerCancel={handlePointerCancel}
              onContextMenu={(e) => e.preventDefault()}
              className={`date-cell border-l border-b border-slate-100 p-1 flex flex-col justify-between transition-colors ${isToday ? 'bg-indigo-50/70 ring-1 ring-inset ring-indigo-200' : 'bg-white active:bg-slate-50'}`}
            >
              <span className={`text-[13px] font-black leading-tight ${isToday ? 'text-indigo-700' : 'text-slate-800'}`}>
                {toHebrewNumeral(hebDayNum)}
              </span>
              
              <div className="flex justify-between items-end w-full">
                <div className="flex flex-wrap gap-0.5 mb-0.5 max-w-[70%]">
                  {dayEvents.slice(0, 4).map(e => (
                    <div 
                      key={e.id} 
                      className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm border border-white" 
                      title={e.type}
                    />
                  ))}
                  {dayEvents.length > 4 && (
                    <span className="text-[6px] font-black text-slate-400 self-center leading-none">+{dayEvents.length - 4}</span>
                  )}
                </div>
                <span className="text-[7px] text-slate-300 font-bold leading-none shrink-0">{day.getDate()}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-0.5 bg-slate-50 text-center text-[7px] font-bold text-slate-400 border-t shrink-0 h-4">
        לחיצה ארוכה (350ms) להוספה • לחיצה קצרה לצפייה
      </div>
    </div>
  );
};

export default CalendarView;
