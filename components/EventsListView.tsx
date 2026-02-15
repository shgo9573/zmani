
import React, { useState } from 'react';
import { Search, Calendar, Filter, Bell, MapPin, User, Music, Info, HelpCircle } from 'lucide-react';
import { CalendarEvent, AppSettings } from '../types';
import { getHebrewDateInfo } from '../utils/hebrewDateUtils';

const IconMap: Record<string, any> = {
  User, MapPin, Music, Info, HelpCircle
};

interface EventsListViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  settings: AppSettings;
}

const EventsListView: React.FC<EventsListViewProps> = ({ events, onEventClick, settings }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = events
    .filter(event => {
      const detailsString = Object.values(event.details).join(' ').toLowerCase();
      return detailsString.includes(searchTerm.toLowerCase()) || 
             event.type.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getPrimaryDetail = (event: CalendarEvent) => {
    const firstFieldId = settings.eventFields[0]?.id;
    return event.details[firstFieldId] || 'ללא שם';
  };

  const getReminderText = (event: CalendarEvent) => {
    if (event.reminderMinutes === -1 && event.customReminderDate) {
      return `ב-${new Date(event.customReminderDate).toLocaleDateString('he-IL')}`;
    }
    if (event.reminderMinutes === 10080) return 'שבוע לפני';
    if (event.reminderMinutes === 1440) return 'יום לפני';
    if (event.reminderMinutes > 0) return 'פעילה';
    return '';
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md pt-4 pb-2">
        <div className="relative">
          <Search className="absolute right-4 top-3.5 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="חפש אירוע לפי שם, סוג או פרטים..."
            className="w-full pr-12 pl-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredEvents.length > 0 ? (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <div key={event.id} onClick={() => onEventClick(event)} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mb-1">
                    <Calendar size={12} /> {getHebrewDateInfo(new Date(event.date))}
                  </span>
                  <h4 className="text-xl font-black text-slate-900">{getPrimaryDetail(event)}</h4>
                </div>
                <div className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                  {event.type}
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                 {settings.eventFields.slice(1, 3).map(field => {
                    const val = event.details[field.id];
                    if (!val) return null;
                    const Icon = IconMap[field.iconName] || HelpCircle;
                    return (
                      <div key={field.id} className="flex items-center gap-1">
                        <Icon size={14} className="text-slate-400" />
                        <span className="max-w-[120px] truncate">{val}</span>
                      </div>
                    );
                 })}
                {(event.reminderMinutes !== 0) && (
                  <div className="flex items-center gap-1 text-amber-600 font-bold">
                    <Bell size={14} /> <span>תזכורת {getReminderText(event)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
          <Filter size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-bold">לא נמצאו אירועים מתאימים</p>
          <button onClick={() => setSearchTerm('')} className="mt-2 text-indigo-600 font-bold underline">נקה חיפוש</button>
        </div>
      )}
    </div>
  );
};

export default EventsListView;
