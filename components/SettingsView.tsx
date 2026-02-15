
import React, { useRef, useState } from 'react';
import { Bell, Palette, Database, Trash2, Upload, Plus, X, Layers, Layout, User, MapPin, Music, Info, HelpCircle, ShieldAlert } from 'lucide-react';
import { AppSettings, CalendarEvent, FieldConfig } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onClearData: () => void;
  onImportData: (data: CalendarEvent[]) => void;
}

const IconMap: Record<string, any> = { User, MapPin, Music, Info, HelpCircle };
const AvailableIcons = [
  { name: 'User', component: User },
  { name: 'MapPin', component: MapPin },
  { name: 'Music', component: Music },
  { name: 'Info', component: Info },
  { name: 'HelpCircle', component: HelpCircle }
];

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdateSettings, onClearData, onImportData }) => {
  const [newType, setNewType] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldIcon, setNewFieldIcon] = useState('Info');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('הדפדפן שלך אינו תומך בהתראות.');
      return;
    }
    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
    if (permission === 'granted') {
      onUpdateSettings({ ...settings, notificationsEnabled: true });
    } else {
      onUpdateSettings({ ...settings, notificationsEnabled: false });
    }
  };

  const addEventType = () => {
    if (newType.trim() && !settings.eventTypes.includes(newType.trim())) {
      onUpdateSettings({ ...settings, eventTypes: [...settings.eventTypes, newType.trim()] });
      setNewType('');
    }
  };

  const removeEventType = (type: string) => {
    if (settings.eventTypes.length <= 1) return;
    onUpdateSettings({ ...settings, eventTypes: settings.eventTypes.filter(t => t !== type) });
  };

  const addField = () => {
    if (newFieldLabel.trim()) {
      const newField: FieldConfig = {
        id: `field_${Date.now()}`,
        label: newFieldLabel.trim(),
        iconName: newFieldIcon
      };
      onUpdateSettings({ ...settings, eventFields: [...settings.eventFields, newField] });
      setNewFieldLabel('');
    }
  };

  const removeField = (id: string) => {
    if (settings.eventFields.length <= 1) return;
    onUpdateSettings({ ...settings, eventFields: settings.eventFields.filter(f => f.id !== id) });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          onImportData(data);
          alert('הנתונים יובאו בהצלחה!');
        } else {
          alert('קובץ לא תקין');
        }
      } catch (err) {
        alert('שגיאה בקריאת הקובץ');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-28 animate-in fade-in slide-in-from-left duration-300">
      {/* Event Types */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
          <Layers className="text-indigo-600" /> ניהול סוגי אירועים
        </h3>
        <div className="space-y-2 mb-4">
          {settings.eventTypes.map(type => (
            <div key={type} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-700">{type}</span>
              <button onClick={() => removeEventType(type)} className="text-red-400 hover:text-red-600 disabled:opacity-30" disabled={settings.eventTypes.length <= 1}>
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="סוג אירוע חדש..." 
            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          />
          <button onClick={addEventType} className="bg-indigo-600 text-white p-3 rounded-xl"><Plus size={24} /></button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
          <Layout className="text-indigo-600" /> ניהול שדות בטופס
        </h3>
        <div className="space-y-2 mb-4">
          {settings.eventFields.map(field => {
            const Icon = IconMap[field.iconName] || HelpCircle;
            return (
              <div key={field.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-3"><Icon size={18} className="text-slate-400" /><span className="font-bold">{field.label}</span></div>
                <button onClick={() => removeField(field.id)} className="text-red-400"><X size={18} /></button>
              </div>
            );
          })}
        </div>
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 px-1">בחר אייקון לשדה החדש:</label>
            <div className="flex gap-2">
              {AvailableIcons.map(item => {
                const Icon = item.component;
                return (
                  <button
                    key={item.name}
                    onClick={() => setNewFieldIcon(item.name)}
                    className={`flex-1 aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${newFieldIcon === item.name ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}
                  >
                    <Icon size={20} />
                  </button>
                );
              })}
            </div>
          </div>
          <input type="text" placeholder="שם שדה חדש..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold" value={newFieldLabel} onChange={(e) => setNewFieldLabel(e.target.value)} />
          <button onClick={addField} className="w-full bg-indigo-600 text-white p-3 rounded-xl font-black shadow-lg active:scale-95 transition-all">הוסף שדה</button>
        </div>
      </div>

      {/* Android Optimized Notifications */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><Bell className="text-indigo-600" /> התראות אנדרואיד</h3>
        
        {permissionStatus === 'denied' && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-bold flex items-start gap-3">
            <ShieldAlert className="shrink-0" size={18} />
            <p>ההתראות חסומות במכשיר זה. כדי לקבל תזכורות, עליך לאפשר התראות בהגדרות הדפדפן/מערכת ההפעלה.</p>
          </div>
        )}

        <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <p className="font-bold text-slate-800">התראות מערכת</p>
            <p className={`text-xs font-bold transition-colors ${settings.notificationsEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
              מצב: {settings.notificationsEnabled ? 'פעיל ✅' : 'כבוי ❌'}
            </p>
          </div>
          <button 
            onClick={requestNotificationPermission}
            className={`w-14 h-7 rounded-full transition-all relative shadow-inner ${settings.notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${settings.notificationsEnabled ? 'right-8' : 'right-1'}`} />
          </button>
        </div>
      </div>

      {/* Data */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><Database className="text-indigo-600" /> נתונים</h3>
        <div className="space-y-3">
          <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="w-full py-4 bg-emerald-50 text-emerald-700 font-black rounded-2xl text-sm flex items-center justify-center gap-2 border-2 border-emerald-100"
          >
            <Upload size={20} /> ייבוא נתונים מגיבוי
          </button>
          
          <button onClick={() => {
              const data = localStorage.getItem('hebrew_events_calendar_events_v2');
              const blob = new Blob([data || '[]'], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `backup.json`; a.click();
            }} className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm">ייצוא גיבוי</button>

          <button onClick={onClearData} className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl text-sm flex items-center justify-center gap-2">
            <Trash2 size={18} /> מחיקת נתונים
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
