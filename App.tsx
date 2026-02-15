
import React, { useState, useEffect, useCallback } from 'react';
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
    return {
      notificationsEnabled: false,
      defaultReminderMinutes: 60,
      themeColor: 'indigo',
      eventTypes: ['חתונה'],
      eventFields: [
        { id: 'main_name', label: 'שם החתן', iconName: 'User' },
        { id: 'location', label: 'אולם / מיקום', iconName: 'MapPin' },
        { id: 'singer', label: 'זמר', iconName: 'Music' },
        { id: 'keyboardist', label: 'קלידן', iconName: 'Music' },
        { id: 'notes', label: 'הערות נוספות', iconName: 'Info' }
      ]
    };
  });

  useEffect(() => {
    if ('setAppBadge' in navigator) {
      const today = getTodayStr();
      const todayCount = events.filter(e => e.date === today).length;
      if (todayCount > 0) {
        (navigator as any).setAppBadge(todayCount).catch(() => {});
      } else {
        (navigator as any).clearAppBadge().catch(() => {});
      }
    }
  }, [events]);

  const checkUpcomingReminders = useCallback(() => {
    if (!settings.notificationsEnabled || !('Notification' in window) || Notification.permission !== 'granted') return;

    const todayStr = getTodayStr();
    const now = new Date();
    const currentH = now.getHours();
    const currentM = now.getMinutes();
    const currentTimeStr = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`;
    
    events.forEach(event => {
      let triggerTime = event.reminderTime || '09:00';
      let isTriggerDay = false;

      if ([15, 60, 120].includes(event.reminderMinutes) && event.date === todayStr) {
        const [h, m] = (event.eventTime || '19:30').split(':').map(Number);
        const eventDate = new Date();
        eventDate.setHours(h, m, 0, 0);
        const reminderDate = new Date(eventDate.getTime() - (event.reminderMinutes * 60000));
        triggerTime = `${reminderDate.getHours().toString().padStart(2, '0')}:${reminderDate.getMinutes().toString().padStart(2, '0')}`;
        isTriggerDay = true;
      } else if (event.reminderMinutes === 1440) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        if (event.date === getTodayStr(tomorrow)) isTriggerDay = true;
      } else if (event.reminderMinutes === 10080) {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        if (event.date === getTodayStr(nextWeek)) isTriggerDay = true;
      } else if (event.reminderMinutes === -1 && event.customReminderDate === todayStr) {
        isTriggerDay = true;
      }

      if (isTriggerDay && currentTimeStr === triggerTime) {
        const lastNotifiedKey = `notified_${event.id}_${todayStr}_${currentTimeStr}`;
        if (!localStorage.getItem(lastNotifiedKey)) {
          const mainName = event.details[settings.eventFields[0].id] || 'אירוע';
          new Notification(`תזכורת: ${event.type}`, {
            body: `${mainName} ב- ${event.eventTime || 'היום'}`,
            dir: 'rtl',
            vibrate: [200, 100, 200]
          } as any);
          localStorage.setItem(lastNotifiedKey, 'true');
        }
      }
    });
  }, [events, settings]);

  useEffect(() => {
    checkUpcomingReminders();
    const interval = setInterval(checkUpcomingReminders, 60000);
    return () => clearInterval(interval);
  }, [checkUpcomingReminders]);

  useEffect(() => {
    localStorage.setItem('hebrew_calendar_settings_v2', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const saved = localStorage.getItem('hebrew_events_calendar_events_v2');
    if (saved) setEvents(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('hebrew_events_calendar_events_v2', JSON.stringify(events));
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
    <div className="min-h-screen max-w-[512px] mx-auto bg-slate-50 flex flex-col shadow-2xl overflow-x-hidden">
      <header className="p-4 flex items-center justify-between sticky top-0 z-40 bg-slate-50/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-${themeColorKey}-600 rounded-xl flex items-center justify-center text-white shadow-lg`}>
            <Calendar size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 leading-none">לוח אירועים</h1>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Hebrew Manager</span>
          </div>
        </div>
        <button 
          onClick={() => {
            setSelectedDate(getTodayStr(viewingDate));
            setEditingEvent({ eventTime: '19:30', reminderMinutes: settings.defaultReminderMinutes, reminderTime: '09:00', type: settings.eventTypes[0], details: {} });
            setIsModalOpen(true);
          }}
          className={`w-10 h-10 bg-${themeColorKey}-50 text-${themeColorKey}-600 rounded-xl flex items-center justify-center`}
        >
          <Plus size={24} />
        </button>
      </header>

      <main className="flex-1 px-4 overflow-y-auto">
        {activeView === 'today' && <TodayView date={viewingDate} events={events.filter(e => e.date === getTodayStr(viewingDate))} onEventClick={(e) => { setSelectedDate(e.date); setEditingEvent(e); setIsModalOpen(true); }} onAddEvent={() => setIsModalOpen(true)} onDateChange={setViewingDate} settings={settings} />}
        {activeView === 'calendar' && <CalendarView events={events} onDateSelect={(d) => { setViewingDate(new Date(d)); setActiveView('today'); }} onAddEvent={(d) => { setSelectedDate(d); setEditingEvent({ eventTime: '19:30', reminderMinutes: settings.defaultReminderMinutes, reminderTime: '09:00', type: settings.eventTypes[0], details: {} }); setIsModalOpen(true); }} settings={settings} />}
        {activeView === 'list' && <EventsListView events={events} onEventClick={(e) => { setSelectedDate(e.date); setEditingEvent(e); setIsModalOpen(true); }} settings={settings} />}
        {activeView === 'settings' && <SettingsView settings={settings} onUpdateSettings={setSettings} onImportData={setEvents} onClearData={() => confirm('למחוק הכל?') && setEvents([])} />}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[512px] bg-white border-t border-slate-100 p-3 flex justify-around items-center z-50 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <NavButton active={activeView === 'today'} onClick={() => { setViewingDate(new Date()); setActiveView('today'); }} icon={<Home size={22} />} label="היום" theme={themeColorKey} />
        <NavButton active={activeView === 'calendar'} onClick={() => setActiveView('calendar')} icon={<Calendar size={22} />} label="לוח שנה" theme={themeColorKey} />
        <NavButton active={activeView === 'list'} onClick={() => setActiveView('list')} icon={<List size={22} />} label="אירועים" theme={themeColorKey} />
        <NavButton active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={<Settings size={22} />} label="הגדרות" theme={themeColorKey} />
      </nav>

      <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveEvent} onDelete={handleDeleteEvent} initialEvent={editingEvent} selectedDate={selectedDate} settings={settings} />
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, theme }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all px-4 py-2 rounded-2xl ${active ? `text-${theme}-600 bg-${theme}-50` : 'text-slate-400'}`}>
    {icon}
    <span className="text-[10px] font-black">{label}</span>
  </button>
);

export default App;
