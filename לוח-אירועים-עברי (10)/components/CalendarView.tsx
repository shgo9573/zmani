
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
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  });
  
  const timerRef = useRef<number | null>(null);
  const startPos = useRef<{ x: number, y: number } | null>(null);

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
    <div style={{height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: 'white'}}>
      <div className="cal-header">
        {/* הבא בימין */}
        <button onClick={() => changeMonth(1)} className="cal-btn">
          <ChevronRight size={20} />
        </button>

        <div className="cal-title">
          <div style={{fontSize: '12px', fontWeight: '900', lineHeight: '1'}}>{getHebrewMonthYear(viewDate)}</div>
          <div style={{fontSize: '7px', opacity: 0.8}}>{getGregorianMonthYear(viewDate)}</div>
        </div>

        {/* קודם בשמאל */}
        <button onClick={() => changeMonth(-1)} className="cal-btn">
          <ChevronLeft size={20} />
        </button>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#f8fafc', borderBottom: '1px solid #e2e8f0'}}>
        {weekDays.map(day => (
          <div key={day} className="weekday-header">{day}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} style={{background: '#fcfcfc'}} />;
          const dateKey = formatDate(day);
          const hasEvents = events.some(e => e.date === dateKey);
          const isToday = todayStr === dateKey;
          const hebDayNum = getHebrewDay(day);

          return (
            <div
              key={dateKey}
              onClick={() => onDateSelect(dateKey)}
              onPointerDown={(e) => {
                startPos.current = { x: e.clientX, y: e.clientY };
                timerRef.current = window.setTimeout(() => {
                  if ('vibrate' in navigator) navigator.vibrate(20);
                  onAddEvent(dateKey);
                }, 550);
              }}
              onPointerUp={() => { if(timerRef.current) clearTimeout(timerRef.current); }}
              onPointerMove={(e) => {
                if (startPos.current && timerRef.current) {
                  const dist = Math.sqrt(Math.pow(e.clientX - startPos.current.x, 2) + Math.pow(e.clientY - startPos.current.y, 2));
                  if (dist > 6) clearTimeout(timerRef.current);
                }
              }}
              className={`date-cell ${isToday ? 'today' : ''}`}
            >
              <span className="heb-day" style={isToday ? {color: '#4f46e5'} : {}}>
                {toHebrewNumeral(hebDayNum)}
              </span>
              {hasEvents && <div className="dot" />}
              <span className="greg-day">{day.getDate()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
