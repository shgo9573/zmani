
import React, { useRef, useState } from 'react';
import { Bell, Palette, Database, Trash2, Upload, Plus, X, Layers, Layout, User, MapPin, Music, Info, HelpCircle } from 'lucide-react';
import { AppSettings, CalendarEvent, FieldConfig } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onClearData: () => void;
  onImportData: (data: CalendarEvent[]) => void;
}

const IconMap: Record<string, any> = { User, MapPin, Music, Info, HelpCircle };

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdateSettings, onClearData, onImportData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newType, setNewType] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldIcon, setNewFieldIcon] = useState('Info');

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

  return (
    <div className="space-y-6 pb-28 animate-in fade-in slide-in-from-left duration-300">
      {/* Event Types Management */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
          <Layers className="text-indigo-600" /> ניהול סוגי אירועים
        </h3>
        <p className="text-xs text-slate-400 mb-4">הגדר אילו סוגי אירועים תרצה לנהל (למשל: חתונה, ברית וכו')</p>
        
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
            onKeyPress={(e) => e.key === 'Enter' && addEventType()}
          />
          <button onClick={addEventType} className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all">
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* Form Fields Management */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
          <Layout className="text-indigo-600" /> ניהול שדות בטופס
        </h3>
        <p className="text-xs text-slate-400 mb-4">בחר אילו פרטים תרצה למלא עבור כל אירוע (למשל: צלם, תקליטן)</p>

        <div className="space-y-2 mb-4">
          {settings.eventFields.map(field => {
            const Icon = IconMap[field.iconName] || HelpCircle;
            return (
              <div key={field.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <Icon size={18} className="text-slate-400" />
                  <span className="font-bold text-slate-700">{field.label}</span>
                </div>
                <button onClick={() => removeField(field.id)} className="text-red-400 hover:text-red-600 disabled:opacity-30" disabled={settings.eventFields.length <= 1}>
                  <X size={18} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
             <select 
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                value={newFieldIcon}
                onChange={(e) => setNewFieldIcon(e.target.value)}
             >
                <option value="User">👤</option>
                <option value="MapPin">📍</option>
                <option value="Music">🎵</option>
                <option value="Info">ℹ️</option>
                <option value="HelpCircle">❓</option>
             </select>
            <input 
              type="text" 
              placeholder="שם שדה חדש (למשל: צלם)..." 
              className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              value={newFieldLabel}
              onChange={(e) => setNewFieldLabel(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addField()}
            />
          </div>
          <button onClick={addField} className="w-full bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 font-black">
            <Plus size={20} /> הוסף שדה לטופס
          </button>
        </div>
      </div>

      {/* Improved Notifications Section */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><Bell className="text-indigo-600" /> התראות</h3>
        <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <p className="font-bold text-slate-800">התראות פעילות</p>
            <p className={`text-xs font-bold transition-colors ${settings.notificationsEnabled ? 'text-emerald-600' : 'text-slate-400'}`}>
              מצב נוכחי: {settings.notificationsEnabled ? 'פעיל ✅' : 'כבוי ❌'}
            </p>
          </div>
          <button 
            onClick={() => onUpdateSettings({...settings, notificationsEnabled: !settings.notificationsEnabled})}
            className={`w-14 h-7 rounded-full transition-all relative shadow-inner ${settings.notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${settings.notificationsEnabled ? 'right-8' : 'right-1'}`} />
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><Palette className="text-indigo-600" /> מראה</h3>
        <div className="grid grid-cols-4 gap-2">
          {['indigo', 'rose', 'amber', 'emerald'].map(c => (
            <button key={c} onClick={() => onUpdateSettings({...settings, themeColor: c})} className={`p-4 rounded-2xl border-2 ${settings.themeColor === c ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100'}`}>
              <div className={`w-full aspect-square rounded-full bg-${c}-600`} />
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2"><Database className="text-indigo-600" /> נתונים</h3>
        <div className="space-y-3">
          <button onClick={() => {
              const data = localStorage.getItem('hebrew_events_calendar_events_v2');
              const blob = new Blob([data || '[]'], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = `backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
            }} className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl">ייצוא גיבוי</button>
          <button onClick={onClearData} className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl flex items-center justify-center gap-2">
            <Trash2 size={18} /> מחיקת נתונים
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
