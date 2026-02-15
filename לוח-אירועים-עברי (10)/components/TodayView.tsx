
import React from 'react';
import { 
  Calendar, MapPin, Music, Bell, Star, 
  Plus, ChevronRight, ChevronLeft, User, Info, HelpCircle, Clock
} from 'lucide-react';
import { CalendarEvent, AppSettings } from '../types';
import { getHebrewDateInfo } from '../utils/hebrewDateUtils';

const IconMap: Record<string, any> = { User, MapPin, Music, Info, HelpCircle };

interface TodayViewProps {
  date: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onAddEvent: () => void;
  onDateChange: (newDate: Date) => void;
  settings: AppSettings;
}

const TodayView: React.FC<TodayViewProps> = ({ 
  date, events, onEventClick, onAddEvent, onDateChange, settings 
}) => {
  const gregorianDateStr = date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
  const hebrewDateStr = getHebrewDateInfo(date);

  const navigateDate = (offset: number) => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + offset);
    onDateChange(newDate);
  };

  const getPrimaryDetail = (event: CalendarEvent) => {
    const firstFieldId = settings.eventFields[0]?.id;
    return event.details[firstFieldId] || 'ללא שם';
  };

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* כותרת דחוסה */}
      {/* Fix: Changed justifyBetween to justifyContent as justifyBetween is not a valid React CSS property */}
      <div style={{background: '#4f46e5', padding: '8px 4px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <button onClick={() => navigateDate(1)} className="p-1"><ChevronRight size={24} /></button>
        <div style={{textAlign: 'center'}}>
          <h2 style={{fontSize: '14px', fontWeight: '900', lineHeight: '1'}}>{hebrewDateStr}</h2>
          <p style={{fontSize: '9px', opacity: 0.8}}>{gregorianDateStr}</p>
        </div>
        <button onClick={() => navigateDate(-1)} className="p-1"><ChevronLeft size={24} /></button>
      </div>

      <div style={{flex: 1, overflowY: 'auto', padding: '8px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
          <span style={{fontSize: '11px', fontWeight: '900'}}>אירועים ({events.length})</span>
          <button onClick={onAddEvent} style={{fontSize: '9px', fontWeight: 'bold', background: '#eef2ff', color: '#4f46e5', padding: '2px 8px', borderRadius: '4px'}}>+ הוסף</button>
        </div>
        
        {events.length > 0 ? (
          <div style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
            {events.map((event) => (
              <div 
                key={event.id} 
                onClick={() => onEventClick(event)} 
                style={{background: '#f8fafc', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0'}}
              >
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '2px'}}>
                  <span style={{fontSize: '9px', fontWeight: '900', color: '#4f46e5'}}>{event.type}</span>
                  {event.eventTime && <span style={{fontSize: '9px', color: '#64748b'}}>{event.eventTime}</span>}
                </div>
                <div style={{fontSize: '12px', fontWeight: '900'}}>{getPrimaryDetail(event)}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '10px'}}>אין אירועים להיום</div>
        )}
      </div>
    </div>
  );
};

export default TodayView;
