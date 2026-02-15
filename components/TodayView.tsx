
import React from 'react';
import { 
  Calendar, MapPin, Music, Bell, Star, 
  Plus, ChevronRight, ChevronLeft, User, Info, HelpCircle, Clock
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
  const gregorianDateStr = date.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });
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
    <div className="space-y-4 pb-24 animate-in fade-in duration-300">
      {/* כרטיס תאריך מורחב - ללא שוליים בצדדים במובייל */}
      <div className="-mx-2 sm:mx-0 bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 sm:rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-2">
            <button onClick={() => navigateDate(1)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-90">
              <ChevronRight size={28} />
            </button>
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl font-black leading-tight drop-shadow-lg mb-1">{hebrewDateStr}</h2>
              <p className="text-indigo-100 text-xs sm:text-sm font-bold opacity-90">{gregorianDateStr}</p>
            </div>
            <button onClick={() => navigateDate(-1)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all active:scale-90">
              <ChevronLeft size={28} />
            </button>
          </div>
          
          <button 
            onClick={() => onDateChange(new Date())} 
            className="mt-2 text-[11px] font-black bg-white text-indigo-700 px-6 py-2 rounded-full shadow-lg hover:bg-indigo-50 active:scale-95 transition-all"
          >
            חזור להיום
          </button>
        </div>
        
        {/* אלמנט עיצובי ברקע */}
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="px-1">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-lg font-black text-slate-800">אירועים להיום</h3>
          <button onClick={onAddEvent} className="bg-indigo-600 text-white text-[10px] font-black px-4 py-2 rounded-full flex items-center gap-1.5 hover:bg-indigo-700 shadow-md active:scale-95 transition-all">
            <Plus size={14} /> הוסף אירוע
          </button>
        </div>
        
        {events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event) => (
              <div 
                key={event.id} 
                onClick={() => onEventClick(event)} 
                className="bg-white p-4 rounded-2xl border border-slate-100 hover:border-indigo-400 cursor-pointer shadow-sm active:bg-slate-50 transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg text-[10px] font-black">
                      {event.type}
                    </div>
                    {event.eventTime && (
                      <div className="flex items-center gap-1 text-slate-500 font-bold text-[10px]">
                        <Clock size={12} /> {event.eventTime}
                      </div>
                    )}
                  </div>
                  {event.reminderMinutes > 0 && <Bell size={14} className="text-amber-500 fill-amber-500" />}
                </div>
                <h4 className="text-xl font-black text-slate-900 mb-2">{getPrimaryDetail(event)}</h4>
                <div className="space-y-1">
                  {settings.eventFields.slice(1).map(field => {
                    const val = event.details[field.id];
                    if (!val) return null;
                    const Icon = IconMap[field.iconName] || HelpCircle;
                    return (
                      <div key={field.id} className="flex items-center gap-2 text-[11px] text-slate-600">
                        <Icon size={12} className="text-slate-400 shrink-0" />
                        <span className="font-bold">{field.label}:</span>
                        <span className="truncate">{val}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-10 rounded-3xl flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-inner flex items-center justify-center mb-3">
              <Star size={24} className="text-slate-300" />
            </div>
            <p className="text-slate-400 font-bold text-sm">אין אירועים רשומים</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayView;
