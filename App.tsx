
import React, { useState, useEffect } from 'react';
import { Calendar, Home, List, Plus, Settings } from 'lucide-react';
import { CalendarEvent, ViewType, AppSettings } from './types';
import TodayView from './components/TodayView';
import CalendarView from './components/CalendarView';
import EventsListView from './components/EventsListView';
import EventModal from './components/EventModal';
import SettingsView from './components/SettingsView';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('calendar');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent> | undefined>();

  const getTodayStr = (date: Date = new Date()) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [viewingDate, setViewingDate] = useState<Date>(new Date());
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('hebrew_calendar_settings_v4');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    
    const initialTypes = ['חתונה', 'אירוסין', 'בר מצווה'];
    return {
      notificationsEnabled: false,
      defaultReminderMinutes: 60,
      themeColor: 'indigo',
      eventTypes: initialTypes,
      mutedEventTypes: [],
      eventFields: [
        { id: 'main_name', label: 'שם בעל השמחה', iconName: 'User', enabledFor: initialTypes },
        { id: 'location', label: 'אולם / מיקום', iconName: 'MapPin', enabledFor: initialTypes },
        { id: 'notes', label: 'הערות', iconName: 'Info', enabledFor: initialTypes }
      ]
    };
  });

  useEffect(() => {
    localStorage.setItem('hebrew_calendar_settings_v4', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const saved = localStorage.getItem('hebrew_events_v4');
    if (saved) setEvents(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('hebrew_events_v4', JSON.stringify(events));
  }, [events]);

  const handleSaveEvent = (event: CalendarEvent) => {
    setEvents(prev => {
      const idx = prev.findIndex(e => e.id === event.id);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = event;
        return updated;
      }
      return [...prev, event];
    });
    setIsModalOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setIsModalOpen(false);
  };

  const themeColorKey = settings.themeColor || 'indigo';

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col overflow-hidden">
      {/* Header קטנטן */}
      <header className="w-full bg-white border-b border-slate-100 px-2 flex items-center justify-between shrink-0 h-8">
        <div className="flex items-center gap-1 overflow-hidden">
          <Calendar size={12} className={`text-${themeColorKey}-600`} />
          <h1 className="text-[11px] font-black text-slate-800 truncate">לוח אירועים</h1>
        </div>
        <button 
          onClick={() => {
            setSelectedDate(getTodayStr(viewingDate));
            setEditingEvent({ eventTime: '19:30', reminderMinutes: settings.defaultReminderMinutes, reminderTime: '09:00', type: settings.eventTypes[0], details: {} });
            setIsModalOpen(true);
          }}
          className={`w-6 h-6 bg-${themeColorKey}-600 text-white rounded flex items-center justify-center`}
        >
          <Plus size={14} />
        </button>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0">
          {activeView === 'today' && <TodayView date={viewingDate} events={events.filter(e => e.date === getTodayStr(viewingDate))} onEventClick={(e) => { setSelectedDate(e.date); setEditingEvent(e); setIsModalOpen(true); }} onAddEvent={() => setIsModalOpen(true)} onDateChange={setViewingDate} settings={settings} />}
          {activeView === 'calendar' && <CalendarView events={events} onDateSelect={(d) => { setViewingDate(new Date(d)); setActiveView('today'); }} onAddEvent={(d) => { setSelectedDate(d); setEditingEvent({ eventTime: '19:30', reminderMinutes: settings.defaultReminderMinutes, reminderTime: '09:00', type: settings.eventTypes[0], details: {} }); setIsModalOpen(true); }} settings={settings} />}
          {activeView === 'list' && <EventsListView events={events} onEventClick={(e) => { setSelectedDate(e.date); setEditingEvent(e); setIsModalOpen(true); }} settings={settings} />}
          {activeView === 'settings' && <div className="p-2 h-full overflow-y-auto"><SettingsView settings={settings} onUpdateSettings={setSettings} onImportData={setEvents} onClearData={() => setEvents([])} /></div>}
        </div>
      </main>

      {/* Nav קטנטן */}
      <nav className="bg-white border-t border-slate-100 flex justify-around items-center shrink-0 h-10">
        <NavButton active={activeView === 'today'} onClick={() => { setViewingDate(new Date()); setActiveView('today'); }} icon={<Home size={16} />} label="היום" themeColorKey={themeColorKey} />
        <NavButton active={activeView === 'calendar'} onClick={() => setActiveView('calendar')} icon={<Calendar size={16} />} label="לוח" themeColorKey={themeColorKey} />
        <NavButton active={activeView === 'list'} onClick={() => setActiveView('list')} icon={<List size={16} />} label="רשימה" themeColorKey={themeColorKey} />
        <NavButton active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={<Settings size={16} />} label="הגדרות" themeColorKey={themeColorKey} />
      </nav>

      <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveEvent} onDelete={handleDeleteEvent} initialEvent={editingEvent} selectedDate={selectedDate} settings={settings} />
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, themeColorKey }: any) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center justify-center ${active ? `text-${themeColorKey}-600` : 'text-slate-400'}`}>
    {icon}
    <span className="text-[8px] font-black">{label}</span>
  </button>
);

export default App;
