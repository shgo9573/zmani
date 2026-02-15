
import React from 'react';
import { 
  Calendar, MapPin, Music, Bell, Star, 
  Plus, ChevronRight, ChevronLeft, User, Info, HelpCircle
} from 'lucide-react';
import { CalendarEvent, AppSettings } from '../types';
import { getHebrewDateInfo } from '../utils/hebrewDateUtils';

const IconMap: Record<string, any> = {
  User, MapPin, Music, Info, HelpCircle
};

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
  const dateStr = date.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
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
    <div className="space-y-6 pb-24 animate-in fade-in duration-300">
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          <p className="text-indigo-200 text-sm font-medium mb-2 uppercase tracking-widest">{dateStr}</p>
          <div className="flex items-center justify-between w-full mb-4">
            <button onClick={() => navigateDate(1)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-90">
              <ChevronRight size={24} />
            </button>
            <h2 className="text-3xl font-black leading-tight flex-1 text-center drop-shadow-md">{hebrewDateStr}</h2>
            <button onClick={() => navigateDate(-1)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-90">
              <ChevronLeft size={24} />
            </button>
          </div>
          <button onClick={() => onDateChange(new Date())} className="text-[10px] font-black bg-white text-indigo-700 px-4 py-1.5 rounded-full shadow-lg hover:bg-indigo-50 transition-colors">
            חזור להיום
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-xl font-bold text-slate-800">אירועים</h3>
          <button onClick={onAddEvent} className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 hover:bg-indigo-700 shadow-md">
            <Plus size={14} /> הוסף אירוע
          </button>
        </div>
        
        {events.length > 0 ? (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} onClick={() => onEventClick(event)} className="bg-white p-5 rounded-2xl border-2 border-slate-100 hover:border-indigo-400 cursor-pointer shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full text-xs font-bold">
                    {event.type}
                  </div>
                  {event.reminderMinutes > 0 && <Bell size={16} className="text-amber-500 fill-amber-500" />}
                </div>
                <h4 className="text-2xl font-black text-slate-900 mb-3">{getPrimaryDetail(event)}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-slate-600">
                  {settings.eventFields.slice(1, 3).map(field => {
                    const Icon = IconMap[field.iconName] || HelpCircle;
                    return (
                      <div key={field.id} className="flex items-center gap-2">
                        <Icon size={16} className="text-slate-400 shrink-0" />
                        <span className="truncate">{event.details[field.id] || `ללא ${field.label}`}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-8 rounded-3xl flex flex-col items-center justify-center text-center">
            <Star size={32} className="text-slate-300 mb-2" />
            <p className="text-slate-500 font-bold text-sm">אין אירועים רשומים ליום זה</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayView;
