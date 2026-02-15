
import React, { useState, useRef } from 'react';
import { ChevronRight, ChevronLeft, Bell } from 'lucide-react';
import { CalendarEvent, AppSettings } from '../types';
import { toHebrewNumeral, getHebrewMonthYear, getGregorianMonthYear, getHebrewDay, getHebrewMonthBounds } from '../utils/hebrewDateUtils';

interface CalendarViewProps {
  events: CalendarEvent[];
  onDateSelect: (date: string) => void;
  onAddEvent: (date: string) => void;
  // Fix: Added settings to props to access dynamic field definitions
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
      }, 600); // Long press threshold
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

  // Fix: Added helper to get the primary detail text for an event
  const getPrimaryDetail = (event: CalendarEvent) => {
    const firstFieldId = settings.eventFields[0]?.id;
    return event.details[firstFieldId] || 'אירוע';
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-20 select-none">
      <div className="p-6 bg-indigo-600 text-white flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black">{getHebrewMonthYear(viewDate)}</h2>
          <div className="flex gap-1">
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/20 rounded-full">
              <ChevronRight size={24} />
            </button>
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/20 rounded-full">
              <ChevronLeft size={24} />
            </button>
          </div>
        </div>
        <div className="text-xs font-medium opacity-80 flex items-center justify-between">
          <span>{getGregorianMonthYear(viewDate)}</span>
          <span className="bg-white/20 px-2 py-0.5 rounded-full">לחיצה ארוכה להוספה</span>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-100">
        {weekDays.map(day => (
          <div key={day} className="py-3 text-center text-xs font-black text-slate-400">
            {day}'
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[100px] sm:auto-rows-[120px]">
        {days.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="bg-slate-50/50" />;
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
              onMouseDown={() => {
                timerRef.current = window.setTimeout(() => {
                  onAddEvent(dateKey);
                  timerRef.current = null;
                }, 600);
              }}
              onMouseUp={() => {
                if (timerRef.current) {
                  window.clearTimeout(timerRef.current);
                  onDateSelect(dateKey);
                  timerRef.current = null;
                }
              }}
              className={`border-l border-b border-slate-100 p-2 relative cursor-pointer hover:bg-indigo-50/50 transition-colors ${isToday ? 'bg-indigo-50' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-lg font-bold ${isToday ? 'text-indigo-600' : 'text-slate-700'}`}>
                  {toHebrewNumeral(hebDay)}
                </span>
                <span className="text-[10px] text-slate-400">{day.getDate()}</span>
              </div>

              <div className="mt-1 space-y-1">
                {dayEvents.slice(0, 2).map(event => (
                  <div key={event.id} className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.5 rounded border border-amber-200 truncate font-bold">
                    {/* Fix: Replaced event.groomName with primary detail from settings */}
                    {getPrimaryDetail(event)}
                  </div>
                ))}
                {dayEvents.length > 2 && <div className="text-[8px] text-indigo-500 font-bold text-center">+{dayEvents.length - 2}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
