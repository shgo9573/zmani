
import React, { useRef, useState } from 'react';
import { Bell, BellOff, Trash2, Plus, X, Layers, Layout, User, MapPin, Music, Info, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { AppSettings, CalendarEvent, FieldConfig } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onClearData: () => void;
  onImportData: (data: CalendarEvent[]) => void;
}

const IconMap: Record<string, any> = { User, MapPin, Music, Info, HelpCircle };
const AvailableIcons = [
  { name: 'User', component: User, label: 'שם' },
  { name: 'MapPin', component: MapPin, label: 'מיקום' },
  { name: 'Music', component: Music, label: 'מוזיקה' },
  { name: 'Info', component: Info, label: 'מידע' },
  { name: 'HelpCircle', component: HelpCircle, label: 'אחר' }
];

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdateSettings, onClearData, onImportData }) => {
  const [newType, setNewType] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldIcon, setNewFieldIcon] = useState('Info');
  const [showHelp, setShowHelp] = useState(false);
  
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
    onUpdateSettings({ ...settings, eventTypes: newTypes, mutedEventTypes: newMuted });
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
        enabledFor: [] // מופעל לכל הסוגים כברירת מחדל
      };
      onUpdateSettings({ ...settings, eventFields: [...settings.eventFields, newField] });
      setNewFieldLabel('');
      setNewFieldIcon('Info');
    }
  };

  const removeField = (id: string) => {
    if (settings.eventFields.length <= 1) return;
    onUpdateSettings({ ...settings, eventFields: settings.eventFields.filter(f => f.id !== id) });
  };

  return (
    <div className="scrollable h-full" style={{padding: '15px', paddingBottom: '100px'}}>
      {/* סוגי אירועים */}
      <div className="card" style={{padding: '16px', marginBottom: '16px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0'}}>
        <div className="flex items-center gap-2 mb-4">
          <Layers size={22} style={{color: '#4f46e5'}} />
          <h3 style={{fontSize: '18px', fontWeight: 'bold'}}>סוגי אירועים</h3>
        </div>
        <div className="flex flex-col gap-3 mb-4">
          {settings.eventTypes.map(type => {
            const isMuted = settings.mutedEventTypes.includes(type);
            return (
              <div key={type} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border-2 border-slate-100">
                <span style={{fontSize: '16px', fontWeight: 'bold'}}>{type}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleMuteType(type)} style={{fontSize: '12px', color: isMuted ? '#94a3b8' : '#4f46e5', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', background: isMuted ? '#f1f5f9' : '#eef2ff', borderRadius: '8px', fontWeight: 'bold', border: 'none'}}>
                    {isMuted ? <BellOff size={16} /> : <Bell size={16} />}
                    {isMuted ? 'ללא צילצול' : 'עם צילצול'}
                  </button>
                  <button onClick={() => removeEventType(type)} style={{color: '#ef4444', padding: '5px', border: 'none'}}><X size={22} /></button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <input type="text" placeholder="סוג חדש (למשל: ברית)" className="input-field" value={newType} onChange={(e) => setNewType(e.target.value)} style={{flex: 1, padding: '12px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px'}} />
          <button onClick={addEventType} style={{background: '#4f46e5', color: 'white', padding: '0 15px', borderRadius: '12px', border: 'none'}}><Plus size={24} /></button>
        </div>
      </div>

      {/* שדות בטופס */}
      <div className="card" style={{padding: '16px', marginBottom: '16px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0'}}>
        <div className="flex items-center gap-2 mb-4">
          <Layout size={22} style={{color: '#4f46e5'}} />
          <h3 style={{fontSize: '18px', fontWeight: 'bold'}}>שדות בטופס (ניהול אייקונים)</h3>
        </div>
        <div className="flex flex-col gap-3 mb-5">
          {settings.eventFields.map(field => {
            const Icon = IconMap[field.iconName] || HelpCircle;
            return (
              <div key={field.id} className="p-3 bg-slate-50 border-2 border-slate-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div style={{background: '#eef2ff', padding: '8px', borderRadius: '10px'}}>
                    <Icon size={20} style={{color: '#4f46e5'}} />
                  </div>
                  <span style={{fontSize: '15px', fontWeight: 'bold'}}>{field.label}</span>
                </div>
                <button onClick={() => removeField(field.id)} style={{color: '#ef4444', padding: '5px', border: 'none'}}><Trash2 size={18} /></button>
              </div>
            );
          })}
        </div>

        {/* טופס הוספת שדה חדש עם בחירת אייקון */}
        <div style={{background: '#f8fafc', padding: '15px', borderRadius: '16px', border: '2px dashed #cbd5e1'}}>
           <p style={{fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#475569'}}>הוספת שדה חדש:</p>
           
           <input 
             type="text" 
             placeholder="שם השדה (למשל: צלם, תקליטן)" 
             className="input-field" 
             value={newFieldLabel} 
             onChange={(e) => setNewFieldLabel(e.target.value)} 
             style={{marginBottom: '12px', background: 'white', width: '100%', padding: '12px', border: '2px solid #e2e8f0', borderRadius: '12px'}} 
           />

           <p style={{fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#64748b'}}>בחר אייקון שיופיע ליד השדה:</p>
           <div className="flex gap-2 mb-4" style={{justifyContent: 'space-between'}}>
             {AvailableIcons.map(iconObj => {
               const IconComp = iconObj.component;
               const isSelected = newFieldIcon === iconObj.name;
               return (
                 <button 
                   key={iconObj.name}
                   onClick={() => setNewFieldIcon(iconObj.name)}
                   type="button"
                   style={{
                     flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', padding: '10px 5px',
                     borderRadius: '12px', border: '2px solid',
                     borderColor: isSelected ? '#4f46e5' : '#e2e8f0',
                     background: isSelected ? '#eef2ff' : 'white',
                     color: isSelected ? '#4f46e5' : '#94a3b8'
                   }}
                 >
                   <IconComp size={22} />
                   <span style={{fontSize: '10px', fontWeight: 'bold'}}>{iconObj.label}</span>
                 </button>
               );
             })}
           </div>

           <button onClick={addField} type="button" style={{width: '100%', background: '#4f46e5', color: 'white', padding: '12px', borderRadius: '12px', fontWeight: 'bold', border: 'none', fontSize: '16px'}}>+ הוסף שדה למערכת</button>
        </div>
      </div>

      {/* עזרה */}
      <div style={{background: '#1e293b', color: 'white', padding: '15px', borderRadius: '16px'}}>
        <button onClick={() => setShowHelp(!showHelp)} style={{width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', background: 'none', border: 'none', cursor: 'pointer'}}>
           <span style={{fontWeight: 'bold', fontSize: '15px'}}>מדריך שימוש קצר</span>
           {showHelp ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
        </button>
        {showHelp && (
          <div style={{marginTop: '15px', fontSize: '14px', opacity: 0.9, lineHeight: '1.6', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px'}}>
            <p>• <b>הוספת אירוע:</b> לחיצה ארוכה על תאריך בלוח או כפתור ה- + למעלה.</p>
            <p>• <b>התאמה אישית:</b> כאן בהגדרות תוכלו להוסיף שדות כמו 'צלם' או 'זמר' שיסונכרנו לכל האירועים שלכם.</p>
            <p>• <b>התראות:</b> תוכלו להגדיר תזכורת לכל אירוע (שעה לפני, יום לפני וכו').</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsView;
