
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
    const saved = localStorage.getItem('hebrew_calendar_settings_v2');
    if (saved) return JSON.parse(saved);
    
    // Default settings with only 'Wedding' and classic fields
    return {
      notificationsEnabled: false,
      defaultReminderMinutes: 60,
      themeColor: 'indigo',
      eventTypes: ['חתונה'],
      eventFields: [
        { id: 'main_name', label: 'שם החתן / בעלי השמחה', iconName: 'User' },
        { id: 'location', label: 'אולם / מיקום', iconName: 'MapPin' },
        { id: 'music', label: 'זמר / תזמורת', iconName: 'Music' },
        { id: 'notes', label: 'פרטים נוספים', iconName: 'Info' }
      ]
    };
  });

  useEffect(() => {
    localStorage.setItem('hebrew_calendar_settings_v2', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const saved = localStorage.getItem('hebrew_events_calendar_events_v2');
    if (saved) {
      try {
        setEvents(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse events", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('hebrew_events_calendar_events_v2', JSON.stringify(events));
  }, [events]);

  const handleSaveEvent = (event: CalendarEvent) => {
    setEvents(prev => {
      const idx = prev.findIndex(e => String(e.id) === String(event.id));
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = event;
        return updated;
      }
      return [...prev, event];
    });
    setIsModalOpen(false);
    setEditingEvent(undefined);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(currentEvents => currentEvents.filter(e => String(e.id) !== String(id)));
    setIsModalOpen(false);
    setEditingEvent(undefined);
  };

  const openAddModal = (dateStr: string) => {
    setSelectedDate(dateStr);
    setEditingEvent({ 
      reminderMinutes: settings.defaultReminderMinutes, 
      type: settings.eventTypes[0],
      details: {},
      id: undefined 
    });
    setIsModalOpen(true);
  };

  const openEditModal = (event: CalendarEvent) => {
    setSelectedDate(event.date);
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const handleDateSelect = (dateStr: string) => {
    setViewingDate(new Date(dateStr));
    setActiveView('today');
  };

  const handleDateChange = (newDate: Date) => {
    setViewingDate(newDate);
    setSelectedDate(getTodayStr(newDate));
  };

  const viewingDateStr = getTodayStr(viewingDate);
  const viewingEvents = events.filter(e => e.date === viewingDateStr);

  const themeColorKey = settings.themeColor || 'indigo';

  return (
    <div className="min-h-screen max-w-[512px] mx-auto bg-slate-50 flex flex-col shadow-2xl overflow-x-hidden">
      <header className="p-4 flex items-center justify-between sticky top-0 z-40 bg-slate-50/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-${themeColorKey}-600 rounded-xl flex items-center justify-center text-white shadow-lg`}>
            <Calendar size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 leading-none">לוח עברי</h1>
            <span className="text-xs text-slate-400 font-bold">ניהול אירועים אישי</span>
          </div>
        </div>
        <button 
          onClick={() => openAddModal(getTodayStr(viewingDate))}
          className={`w-10 h-10 bg-${themeColorKey}-50 text-${themeColorKey}-600 rounded-xl flex items-center justify-center hover:opacity-80 transition-opacity`}
        >
          <Plus size={24} />
        </button>
      </header>

      <main className="flex-1 px-4 overflow-y-auto">
        {activeView === 'today' && (
          <TodayView 
            date={viewingDate} 
            events={viewingEvents} 
            onEventClick={openEditModal}
            onAddEvent={() => openAddModal(viewingDateStr)} 
            onDateChange={handleDateChange}
            settings={settings}
          />
        )}
        {activeView === 'calendar' && (
          <CalendarView 
            events={events} 
            onDateSelect={handleDateSelect} 
            onAddEvent={openAddModal} 
            // Fix: Passing settings to CalendarView
            settings={settings}
          />
        )}
        {activeView === 'list' && (
          <EventsListView 
            events={events} 
            onEventClick={openEditModal} 
            settings={settings}
          />
        )}
        {activeView === 'settings' && (
           <SettingsView 
             settings={settings} 
             onUpdateSettings={setSettings} 
             onImportData={(data) => setEvents(data)}
             onClearData={() => {
                if(confirm('למחוק את כל האירועים?')) {
                  setEvents([]);
                  localStorage.removeItem('hebrew_events_calendar_events_v2');
                }
             }}
           />
        )}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[512px] bg-white border-t border-slate-100 p-3 flex justify-around items-center z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <NavButton active={activeView === 'today'} onClick={() => { setViewingDate(new Date()); setActiveView('today'); }} icon={<Home size={22} />} label="היום" theme={themeColorKey} />
        <NavButton active={activeView === 'calendar'} onClick={() => setActiveView('calendar')} icon={<Calendar size={22} />} label="לוח שנה" theme={themeColorKey} />
        <NavButton active={activeView === 'list'} onClick={() => setActiveView('list')} icon={<List size={22} />} label="אירועים" theme={themeColorKey} />
        <NavButton active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={<Settings size={22} />} label="הגדרות" theme={themeColorKey} />
      </nav>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingEvent(undefined); }}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        initialEvent={editingEvent}
        selectedDate={selectedDate}
        settings={settings}
      />
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, theme }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-all px-4 py-2 rounded-2xl ${active ? `text-${theme}-600 bg-${theme}-50` : 'text-slate-400'}`}
  >
    {icon}
    <span className="text-[10px] font-black">{label}</span>
  </button>
);

export default App;
