
import React, { useState, useEffect, useMemo } from 'react';
import { CalendarEvent } from './types';
import { getHebrewDate, getMonthDays, formatHebrewDateShort, DAYS_OF_WEEK } from './utils/hebrewDateUtils';
import { isAfterSunset } from './utils/zmanimUtils';
import EventModal from './components/EventModal';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, List as ListIcon, Search, MapPin, User, Music, CalendarDays } from 'lucide-react';

type ViewType = 'calendar' | 'events';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Record<string, CalendarEvent>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(undefined);
  const [view, setView] = useState<ViewType>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => console.log("Location access denied, using defaults.")
    );

    const savedEvents = localStorage.getItem('hebrew_calendar_events');
    if (savedEvents) {
      try {
        setEvents(JSON.parse(savedEvents));
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('hebrew_calendar_events', JSON.stringify(events));
  }, [events]);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const handleDayClick = (date: Date) => {
    const dateId = date.toISOString().split('T')[0];
    setSelectedDate(date);
    setEditingEvent(events[dateId]);
    setIsModalOpen(true);
  };

  const handleEditFromList = (event: CalendarEvent) => {
    setSelectedDate(new Date(event.id));
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (event: CalendarEvent) => {
    setEvents(prev => ({ ...prev, [event.id]: event }));
    setIsModalOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    const newEvents = { ...events };
    delete newEvents[id];
    setEvents(newEvents);
    setIsModalOpen(false);
  };

  const sortedEventsList = useMemo(() => {
    return Object.values(events)
      .sort((a, b) => new Date(a.id).getTime() - new Date(b.id).getTime())
      .filter(event => {
        const query = searchQuery.toLowerCase();
        return event.groomName.toLowerCase().includes(query) || event.hallName.toLowerCase().includes(query);
      });
  }, [events, searchQuery]);

  const days = getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
  const firstDayOfMonth = days[0].getDay();
  const blanks = Array(firstDayOfMonth).fill(null);

  const monthNameGregorian = currentDate.toLocaleString('he-IL', { month: 'long' });
  const yearGregorian = currentDate.getFullYear();
  const hebrewDateRange = `${formatHebrewDateShort(days[0])} - ${formatHebrewDateShort(days[days.length - 1])}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-lg mx-auto shadow-xl ring-1 ring-slate-200 h-screen overflow-hidden">
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md">
              {view === 'calendar' ? <CalendarIcon size={24} /> : <ListIcon size={24} />}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">
                {view === 'calendar' ? 'יומן אירועים' : 'רשימת אירועים'}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {view === 'calendar' ? `${monthNameGregorian} ${yearGregorian}` : `סה"כ ${sortedEventsList.length} אירועים`}
              </p>
            </div>
          </div>
          {view === 'calendar' && (
            <button onClick={goToToday} className="px-4 py-2 text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-full">
              היום
            </button>
          )}
        </div>

        {view === 'calendar' ? (
          <div className="flex items-center justify-between bg-slate-100 p-2 rounded-2xl">
            <button onClick={prevMonth} className="p-2 text-slate-600"><ChevronRight size={20} /></button>
            <div className="text-sm font-extrabold text-slate-800">{hebrewDateRange}</div>
            <button onClick={nextMonth} className="p-2 text-slate-600"><ChevronLeft size={20} /></button>
          </div>
        ) : (
          <div className="relative">
            <input type="text" placeholder="חפש אירוע..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-4 pr-10 py-3 bg-slate-100 rounded-2xl outline-none" />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto bg-slate-50">
        {view === 'calendar' ? (
          <div className="p-2">
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_OF_WEEK.map(day => <div key={day} className="text-center text-[11px] font-black text-slate-400 py-2">{day}'</div>)}
              {blanks.map((_, i) => <div key={`blank-${i}`} className="aspect-square bg-slate-200/10 rounded-xl"></div>)}
              {days.map(date => {
                const dateId = date.toISOString().split('T')[0];
                const event = events[dateId];
                
                // Adjust Hebrew date if it's today and after sunset
                const isToday = new Date().toDateString() === date.toDateString();
                let displayDate = date;
                if (isToday && location && isAfterSunset(new Date(), location.lat, location.lng)) {
                   // This logic for visual indicator could be expanded to show the "next" hebrew day
                }
                
                const heb = getHebrewDate(date);

                return (
                  <div key={dateId} onClick={() => handleDayClick(date)} className={`relative aspect-square rounded-2xl p-1.5 cursor-pointer border ${isToday ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/10' : 'bg-white border-slate-100'}`}>
                    <div className="flex justify-between items-start">
                      <span className={`text-lg font-black ${isToday ? 'text-indigo-700' : 'text-slate-800'}`}>{heb.dayHebrew}</span>
                      <span className="text-[10px] text-slate-400">{date.getDate()}</span>
                    </div>
                    <div className="absolute inset-x-1 bottom-1.5">
                      {event && <div className="bg-amber-100 text-amber-900 text-[9px] font-black px-1 py-0.5 rounded truncate border border-amber-200">{event.groomName}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {sortedEventsList.map(event => (
              <div key={event.id} onClick={() => handleEditFromList(event)} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-indigo-600 uppercase">{event.eventType}</span>
                  <span className="text-[10px] font-bold text-slate-400">{getHebrewDate(new Date(event.id)).full}</span>
                </div>
                <div className="flex items-center gap-2"><User size={14} className="text-slate-400"/><span className="font-black text-slate-800">{event.groomName}</span></div>
                <div className="flex items-center gap-2"><MapPin size={14} className="text-slate-400"/><span className="text-xs font-bold text-slate-500">{event.hallName}</span></div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-3 px-4 flex justify-around items-center sticky bottom-0">
        <button onClick={() => setView('calendar')} className={`flex flex-col items-center gap-1 ${view === 'calendar' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <CalendarIcon size={22} strokeWidth={2.5} /><span className="text-[10px] font-black">לוח שנה</span>
        </button>
        <button onClick={() => setView('events')} className={`flex flex-col items-center gap-1 ${view === 'events' ? 'text-indigo-600' : 'text-slate-400'}`}>
          <ListIcon size={22} strokeWidth={2.5} /><span className="text-[10px] font-black">אירועים</span>
        </button>
      </footer>

      <EventModal
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEvent} onDelete={handleDeleteEvent}
        selectedDate={selectedDate} existingEvent={editingEvent}
        hebrewDateStr={selectedDate ? getHebrewDate(selectedDate).full : ''}
      />
    </div>
  );
};

export default App;
