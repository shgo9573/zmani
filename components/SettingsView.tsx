
import React, { useRef, useState } from 'react';
import { Bell, BellOff, Palette, Database, Trash2, Upload, Plus, X, Layers, Layout, User, MapPin, Music, Info, HelpCircle, Check, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [showHelp, setShowHelp] = useState(false);
  
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

      {/* גיבוי וניהול */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2">
        <h3 className="text-base font-black text-slate-800 mb-2 flex items-center gap-2"><Database size={18} className="text-indigo-600" /> גיבוי וניהול</h3>
        <div className="grid grid-cols-2 gap-2">
          <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImport} />
          <button onClick={() => fileInputRef.current?.click()} className="py-2 bg-emerald-50 text-emerald-700 font-black rounded-lg text-xs border border-emerald-100 active:scale-95 transition-transform">ייבוא</button>
          <button onClick={() => {
            const data = localStorage.getItem('hebrew_events_v4');
            const blob = new Blob([data || '[]'], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a'); a.href = url; a.download = `calendar_backup_${new Date().toLocaleDateString('he-IL')}.json`; a.click();
          }} className="py-2 bg-indigo-50 text-indigo-700 font-black rounded-lg text-xs border border-indigo-100 active:scale-95 transition-transform">ייצוא</button>
        </div>
        <button onClick={() => { if(confirm('האם אתה בטוח שברצונך למחוק את כל האירועים?')) onClearData(); }} className="w-full py-2 bg-red-50 text-red-600 font-black rounded-lg text-xs border border-red-100 active:scale-95 transition-transform">מחיקת כל הנתונים</button>
      </div>

      {/* עזרה ומדריך שימוש */}
      <div className="bg-indigo-900 text-white p-4 rounded-2xl shadow-lg border border-indigo-800 overflow-hidden">
        <button 
          onClick={() => setShowHelp(!showHelp)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <HelpCircle size={20} className="text-indigo-300" />
            <h3 className="text-base font-black">מדריך עזרה ושימוש</h3>
          </div>
          {showHelp ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {showHelp && (
          <div className="mt-4 space-y-4 text-indigo-100 animate-in fade-in slide-in-from-top-2 duration-300">
            <HelpSection title="📅 לוח השנה" icon={<Calendar size={14} />}>
              לחיצה קצרה על יום תעביר אתכם לתצוגת "היום". לחיצה ארוכה (חצי שנייה) על יום בלוח תפתח ישירות את טופס הוספת האירוע לאותו תאריך.
            </HelpSection>
            
            <HelpSection title="🏠 תצוגת היום" icon={<Home size={14} />}>
              כאן תוכלו לראות את התאריך העברי והלועזי המלא. השתמשו בחיצים כדי לנווט בין הימים, או לחצו על "חזור להיום" כדי להתאפס.
            </HelpSection>

            <HelpSection title="🎭 סוגי אירועים" icon={<Layers size={14} />}>
              בהגדרות תוכלו להוסיף סוגים מותאמים (כמו 'ברית' או 'דינר'). כפתור "צילצול" מאפשר להשתיק התראות לסוגים מסוימים שאתם רק רוצים לתעד ללא תזכורת.
            </HelpSection>

            <HelpSection title="📝 שדות מותאמים" icon={<Layout size={14} />}>
              ניתן להוסיף שדות כמו 'שם הזמר', 'מיקום' או 'צלם'. תוכלו לבחור שהשדה יופיע רק בסוגים מסוימים (למשל: 'קלידן' יופיע רק בחתונה ולא בבר מצווה).
            </HelpSection>

            <HelpSection title="💾 גיבוי נתונים" icon={<Database size={14} />}>
              מומלץ לבצע "ייצוא" מדי פעם. הקובץ שיישמר מכיל את כל האירועים שלכם וניתן להעלות אותו בחזרה (ייבוא) בכל מכשיר אחר.
            </HelpSection>
          </div>
        )}
      </div>
    </div>
  );
};

const HelpSection = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <div className="border-t border-indigo-700/50 pt-3">
    <div className="flex items-center gap-1.5 mb-1">
      <span className="text-indigo-300">{icon}</span>
      <h4 className="text-xs font-black">{title}</h4>
    </div>
    <p className="text-[11px] leading-relaxed opacity-90">{children}</p>
  </div>
);

// הוספת אייקונים חסרים לשימוש בתוך HelpSection
const Calendar = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const Home = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;

export default SettingsView;
