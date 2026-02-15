
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

  // שדה המידע הראשון (בדרך כלל "שם")
  const firstFieldId = settings.eventFields[0]?.id;

  return (
    <div style={{height: '100%', width: '100%', display: 'flex', flexDirection: 'column', background: 'white', overflow: 'hidden'}}>
      <div className="cal-header">
        <button onClick={() => changeMonth(-1)} style={{background: 'none', border: 'none', color: 'white', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
          <ChevronRight size={28} strokeWidth={2.5} />
        </button>

        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: '18px', fontWeight: '900'}}>{getHebrewMonthYear(viewDate)}</div>
          <div style={{fontSize: '11px', opacity: 0.8}}>{getGregorianMonthYear(viewDate)}</div>
        </div>

        <button onClick={() => changeMonth(1)} style={{background: 'none', border: 'none', color: 'white', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center'}}>
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', height: '36px', alignItems: 'center', flexShrink: 0}}>
        {weekDays.map(day => (
          <div key={day} style={{textAlign: 'center', fontSize: '14px', fontWeight: 'bold', color: '#64748b'}}>{day}</div>
        ))}
      </div>

      <div className="view-container" style={{flex: 1, overflowY: 'auto'}}>
        <div className="calendar-grid">
          {days.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} style={{background: '#fcfcfc'}} />;
            const dateKey = formatDate(day);
            const dayEvents = events.filter(e => e.date === dateKey);
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
                    if (dist > 10) clearTimeout(timerRef.current);
                  }
                }}
                className="date-cell"
                style={isToday ? {background: '#f0f4ff'} : {}}
              >
                <span className="heb-day" style={isToday ? {color: '#4f46e5'} : {}}>
                  {toHebrewNumeral(hebDayNum)}
                </span>
                
                {/* תצוגת שמות האירועים בתוך המשבצת */}
                <div style={{marginTop: '4px', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column', gap: '2px'}}>
                  {dayEvents.map(ev => (
                    <div key={ev.id} style={{
                      fontSize: '10px', 
                      fontWeight: '900', 
                      color: '#4f46e5', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      background: 'rgba(79, 70, 229, 0.1)',
                      padding: '1px 3px',
                      borderRadius: '4px',
                      textAlign: 'center'
                    }}>
                      {ev.details[firstFieldId] || ev.type}
                    </div>
                  ))}
                </div>

                <span className="greg-day">{day.getDate()}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
