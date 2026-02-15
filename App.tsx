
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
    return {
      notificationsEnabled: false,
      defaultReminderMinutes: 60,
      themeColor: 'indigo',
      eventTypes: ['חתונה', 'אירוסין', 'בר מצווה'],
      mutedEventTypes: [],
      eventFields: [
        { id: 'main_name', label: 'שם', iconName: 'User', enabledFor: [] },
        { id: 'location', label: 'מקום', iconName: 'MapPin', enabledFor: [] }
      ]
    };
  });

  // שמירת הגדרות בכל שינוי
  useEffect(() => {
    localStorage.setItem('hebrew_calendar_settings_v4', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const saved = localStorage.getItem('hebrew_events_v4');
    if (saved) setEvents(JSON.parse(saved));
  }, []);

  const openAddModal = () => {
    setSelectedDate(getTodayStr(viewingDate));
    setEditingEvent({ 
      eventTime: '19:30', 
      reminderMinutes: settings.defaultReminderMinutes, 
      reminderTime: '09:00', 
      type: settings.eventTypes[0], 
      details: {} 
    });
    setIsModalOpen(true);
  };

  return (
    <div id="root">
      <header className="app-header">
        <h1 style={{fontSize: '18px', fontWeight: '800', color: '#1e293b'}}>לוח אירועים</h1>
        <button 
          onClick={openAddModal}
          style={{
            background: '#4f46e5', 
            color: 'white', 
            width: '36px', 
            height: '36px', 
            borderRadius: '10px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)'
          }}
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </header>

      <main>
        {activeView === 'today' && <TodayView date={viewingDate} events={events.filter(e => e.date === getTodayStr(viewingDate))} onEventClick={(e) => { setSelectedDate(e.date); setEditingEvent(e); setIsModalOpen(true); }} onAddEvent={openAddModal} onDateChange={setViewingDate} settings={settings} />}
        {activeView === 'calendar' && <CalendarView events={events} onDateSelect={(d) => { setViewingDate(new Date(d)); setActiveView('today'); }} onAddEvent={(d) => { setSelectedDate(d); setEditingEvent({ eventTime: '19:30', reminderMinutes: settings.defaultReminderMinutes, reminderTime: '09:00', type: settings.eventTypes[0], details: {} }); setIsModalOpen(true); }} settings={settings} />}
        {activeView === 'list' && <EventsListView events={events} onEventClick={(e) => { setSelectedDate(e.date); setEditingEvent(e); setIsModalOpen(true); }} settings={settings} />}
        {activeView === 'settings' && <SettingsView settings={settings} onUpdateSettings={setSettings} onImportData={setEvents} onClearData={() => setEvents([])} />}
      </main>

      <nav className="app-nav">
        <NavBtn active={activeView === 'today'} onClick={() => { setViewingDate(new Date()); setActiveView('today'); }} icon={<Home size={24} />} label="היום" />
        <NavBtn active={activeView === 'calendar'} onClick={() => setActiveView('calendar')} icon={<Calendar size={24} />} label="לוח" />
        <NavBtn active={activeView === 'list'} onClick={() => setActiveView('list')} icon={<List size={24} />} label="רשימה" />
        <NavBtn active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={<Settings size={24} />} label="הגדרות" />
      </nav>

      <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={(e) => {
        setEvents(prev => {
          const idx = prev.findIndex(ev => ev.id === e.id);
          const updated = idx > -1 ? prev.map((ev, i) => i === idx ? e : ev) : [...prev, e];
          localStorage.setItem('hebrew_events_v4', JSON.stringify(updated));
          return updated;
        });
        setIsModalOpen(false);
      }} onDelete={(id) => {
        setEvents(prev => {
          const updated = prev.filter(e => e.id !== id);
          localStorage.setItem('hebrew_events_v4', JSON.stringify(updated));
          return updated;
        });
        setIsModalOpen(false);
      }} initialEvent={editingEvent} selectedDate={selectedDate} settings={settings} />
    </div>
  );
};

const NavBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`nav-btn ${active ? 'active' : ''}`}>
    {icon}
    <span className="nav-text">{label}</span>
  </button>
);

export default App;
