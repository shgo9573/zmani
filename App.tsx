
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
      const saved = localStorage.getItem('hebrew_calendar_settings_v3');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    
    const initialTypes = ['חתונה', 'אירוסין', 'בר מצווה'];
    return {
      notificationsEnabled: false,
      defaultReminderMinutes: 60,
      themeColor: 'indigo',
      eventTypes: initialTypes,
      eventFields: [
        { id: 'main_name', label: 'שם בעל השמחה', iconName: 'User', enabledFor: initialTypes },
        { id: 'location', label: 'אולם / מיקום', iconName: 'MapPin', enabledFor: initialTypes },
        { id: 'singer', label: 'זמר', iconName: 'Music', enabledFor: ['חתונה', 'אירוסין'] },
        { id: 'keyboardist', label: 'קלידן', iconName: 'Music', enabledFor: ['חתונה'] },
        { id: 'notes', label: 'הערות', iconName: 'Info', enabledFor: initialTypes }
      ]
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('hebrew_calendar_settings_v3', JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('hebrew_events_calendar_events_v2');
      if (saved) setEvents(JSON.parse(saved));
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('hebrew_events_calendar_events_v2', JSON.stringify(events));
    } catch (e) {}
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

  const handleClearData = () => {
    if (window.confirm('למחוק את כל האירועים?')) {
      setEvents([]);
      localStorage.removeItem('hebrew_events_calendar_events_v2');
    }
  };

  const themeColorKey = settings.themeColor || 'indigo';

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col overflow-x-hidden">
      {/* כותרת עליונה - רחבה ומאוזנת */}
      <header className="w-full bg-white border-b border-slate-100 p-4 sm:p-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 bg-${themeColorKey}-600 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105`}>
            <Calendar size={26} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 leading-tight">לוח אירועים</h1>
            <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">Hebrew Manager</span>
          </div>
        </div>
        <button 
          onClick={() => {
            setSelectedDate(getTodayStr(viewingDate));
            setEditingEvent({ eventTime: '19:30', reminderMinutes: settings.defaultReminderMinutes, reminderTime: '09:00', type: settings.eventTypes[0], details: {} });
            setIsModalOpen(true);
          }}
          className={`w-11 h-11 bg-${themeColorKey}-50 text-${themeColorKey}-600 rounded-2xl flex items-center justify-center active:scale-90 transition-all shadow-sm border border-${themeColorKey}-100`}
        >
          <Plus size={28} />
        </button>
      </header>

      {/* תוכן ראשי - ללא מגבלת רוחב צרה */}
      <main className="flex-1 w-full px-0 sm:px-4 py-0 overflow-y-auto">
        <div className="w-full max-w-none">
          {activeView === 'today' && <TodayView date={viewingDate} events={events.filter(e => e.date === getTodayStr(viewingDate))} onEventClick={(e) => { setSelectedDate(e.date); setEditingEvent(e); setIsModalOpen(true); }} onAddEvent={() => setIsModalOpen(true)} onDateChange={setViewingDate} settings={settings} />}
          {activeView === 'calendar' && <CalendarView events={events} onDateSelect={(d) => { setViewingDate(new Date(d)); setActiveView('today'); }} onAddEvent={(d) => { setSelectedDate(d); setEditingEvent({ eventTime: '19:30', reminderMinutes: settings.defaultReminderMinutes, reminderTime: '09:00', type: settings.eventTypes[0], details: {} }); setIsModalOpen(true); }} settings={settings} />}
          {activeView === 'list' && <EventsListView events={events} onEventClick={(e) => { setSelectedDate(e.date); setEditingEvent(e); setIsModalOpen(true); }} settings={settings} />}
          {activeView === 'settings' && <div className="px-4 py-4"><SettingsView settings={settings} onUpdateSettings={setSettings} onImportData={setEvents} onClearData={handleClearData} /></div>}
        </div>
      </main>

      <div className="h-24"></div>

      {/* ניווט תחתון - רחב ותואם לכותרת */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-3 py-4 flex justify-around items-center z-50 rounded-t-3xl shadow-[0_-12px_45px_rgba(0,0,0,0.08)]">
        <NavButton active={activeView === 'today'} onClick={() => { setViewingDate(new Date()); setActiveView('today'); }} icon={<Home size={24} />} label="היום" themeColorKey={themeColorKey} />
        <NavButton active={activeView === 'calendar'} onClick={() => setActiveView('calendar')} icon={<Calendar size={24} />} label="לוח" themeColorKey={themeColorKey} />
        <NavButton active={activeView === 'list'} onClick={() => setActiveView('list')} icon={<List size={24} />} label="אירועים" themeColorKey={themeColorKey} />
        <NavButton active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={<Settings size={24} />} label="הגדרות" themeColorKey={themeColorKey} />
      </nav>

      <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveEvent} onDelete={handleDeleteEvent} initialEvent={editingEvent} selectedDate={selectedDate} settings={settings} />
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, themeColorKey }: any) => (
  <button onClick={onClick} className={`flex-1 flex flex-col items-center gap-1.5 transition-all py-2 rounded-2xl ${active ? `text-${themeColorKey}-600 bg-${themeColorKey}-50/50` : 'text-slate-400 hover:text-slate-600'}`}>
    {icon}
    <span className="text-xs font-black">{label}</span>
  </button>
);

export default App;
