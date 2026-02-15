
import React, { useRef, useState } from 'react';
import { Bell, BellOff, Palette, Database, Trash2, Upload, Plus, X, Layers, Layout, User, MapPin, Music, Info, HelpCircle, Check } from 'lucide-react';
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
  const [selectedTypesForNewField, setSelectedTypesForNewField] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addEventType = () => {
    if (newType.trim() && !settings.eventTypes.includes(newType.trim())) {
      onUpdateSettings({ ...settings, eventTypes: [...settings.eventTypes, newType.trim()] });
      setNewType('');
    }
  };

  const removeEventType = (type: string) => {
    if (settings.eventTypes.length <= 1) return;
    const newTypes = settings.eventTypes.filter(t => t !== type);
    const newMuted = settings.mutedEventTypes.filter(t => t !== type);
    // עדכון כל השדות שהכילו את הסוג הזה
    const newFields = settings.eventFields.map(f => ({
      ...f,
      enabledFor: f.enabledFor.filter(t => t !== type)
    }));
    onUpdateSettings({ ...settings, eventTypes: newTypes, eventFields: newFields, mutedEventTypes: newMuted });
  };

  const toggleMuteType = (type: string) => {
    const isMuted = settings.mutedEventTypes.includes(type);
    const newMuted = isMuted 
      ? settings.mutedEventTypes.filter(t => t !== type)
      : [...settings.mutedEventTypes, type];
    onUpdateSettings({ ...settings, mutedEventTypes: newMuted });
  };

  const addField = () => {
    if (newFieldLabel.trim()) {
      const newField: FieldConfig = {
        id: `field_${Date.now()}`,
        label: newFieldLabel.trim(),
        iconName: newFieldIcon,
        enabledFor: selectedTypesForNewField.length > 0 ? selectedTypesForNewField : settings.eventTypes
      };
      onUpdateSettings({ ...settings, eventFields: [...settings.eventFields, newField] });
      setNewFieldLabel('');
      setSelectedTypesForNewField([]);
    }
  };

  const toggleTypeForField = (type: string) => {
    setSelectedTypesForNewField(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
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
        }
      } catch (err) { alert('קובץ לא תקין'); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* סוגי אירועים */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">
          <Layers size={18} className="text-indigo-600" /> סוגי אירועים
        </h3>
        <div className="flex flex-col gap-1.5 mb-3">
          {settings.eventTypes.map(type => {
            const isMuted = settings.mutedEventTypes.includes(type);
            return (
              <div key={type} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 group transition-all">
                <span className="font-bold text-xs text-slate-700">{type}</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleMuteType(type)} 
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black transition-all ${isMuted ? 'bg-slate-200 text-slate-400' : 'bg-indigo-100 text-indigo-600'}`}
                    title={isMuted ? "ללא צילצול" : "עם צילצול"}
                  >
                    {isMuted ? <BellOff size={12} /> : <Bell size={12} />}
                    {isMuted ? 'ללא צילצול' : 'עם צילצול'}
                  </button>
                  <button onClick={() => removeEventType(type)} className="text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="סוג חדש (למשל: ברית)" 
            className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-xs font-bold"
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
          />
          <button onClick={addEventType} className="bg-indigo-600 text-white p-2 rounded-lg"><Plus size={18} /></button>
        </div>
      </div>

      {/* שדות בטופס */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-base font-black text-slate-800 mb-3 flex items-center gap-2">
          <Layout size={18} className="text-indigo-600" /> שדות בטופס
        </h3>
        <div className="space-y-2 mb-4">
          {settings.eventFields.map(field => {
            const Icon = IconMap[field.iconName] || HelpCircle;
            return (
              <div key={field.id} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Icon size={14} className="text-indigo-500" />
                    <span className="font-bold text-xs">{field.label}</span>
                  </div>
                  <button onClick={() => removeField(field.id)} className="text-red-400">
                    <X size={14} />
                  </button>
                </div>
                <div className="text-[9px] text-slate-400 font-bold">
                  יופיע ב: {field.enabledFor.join(', ')}
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3">
          <p className="text-[10px] font-black text-indigo-900">הוספת שדה מותאם:</p>
          <div className="flex gap-1.5">
            {AvailableIcons.map(item => {
              const Icon = item.component;
              return (
                <button
                  key={item.name}
                  onClick={() => setNewFieldIcon(item.name)}
                  className={`flex-1 aspect-square rounded-lg border-2 flex items-center justify-center transition-all ${newFieldIcon === item.name ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-slate-100 text-slate-400'}`}
                >
                  <Icon size={14} />
                </button>
              );
            })}
          </div>
          
          <input 
            type="text" 
            placeholder="שם השדה (למשל: צלם)" 
            className="w-full p-2 bg-white border border-slate-200 rounded-lg font-bold text-xs" 
            value={newFieldLabel} 
            onChange={(e) => setNewFieldLabel(e.target.value)} 
          />

          <div>
            <p className="text-[9px] font-black text-slate-500 mb-1">יופיע בסוגי אירועים:</p>
            <div className="flex flex-wrap gap-1">
              {settings.eventTypes.map(type => (
                <button
                  key={type}
                  onClick={() => toggleTypeForField(type)}
                  className={`px-2 py-0.5 rounded text-[9px] font-black transition-all flex items-center gap-1 ${selectedTypesForNewField.includes(type) ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}
                >
                  {selectedTypesForNewField.includes(type) && <Check size={8} />}
                  {type}
                </button>
              ))}
            </div>
          </div>

          <button onClick={addField} className="w-full bg-indigo-600 text-white py-2 rounded-lg font-black text-xs flex items-center justify-center gap-1 shadow-sm">
            <Plus size={14} /> הוסף שדה
          </button>
        </div>
      </div>

      {/* שאר ההגדרות */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2">
        <h3 className="text-base font-black text-slate-800 mb-2 flex items-center gap-2"><Database size={18} className="text-indigo-600" /> גיבוי וניהול</h3>
        <div className="grid grid-cols-2 gap-2">
          <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
          <button onClick={() => fileInputRef.current?.click()} className="py-2 bg-emerald-50 text-emerald-700 font-black rounded-lg text-xs border border-emerald-100">ייבוא</button>
          <button onClick={() => {
            const data = localStorage.getItem('hebrew_events_calendar_events_v2');
            const blob = new Blob([data || '[]'], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `backup.json`; a.click();
          }} className="py-2 bg-indigo-50 text-indigo-700 font-black rounded-lg text-xs border border-indigo-100">ייצוא</button>
        </div>
        <button onClick={onClearData} className="w-full py-2 bg-red-50 text-red-600 font-black rounded-lg text-xs border border-red-100">מחיקת כל הנתונים</button>
      </div>
    </div>
  );
};

export default SettingsView;
