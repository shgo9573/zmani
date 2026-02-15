
import React, { useState } from 'react';
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
        enabledFor: [] 
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
    <div className="view-container" style={{padding: '16px 16px 120px'}}>
      {/* סוגי אירועים */}
      <div style={{background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '20px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px'}}>
          <Layers size={20} style={{color: '#4f46e5'}} />
          <h3 style={{fontSize: '17px', fontWeight: '900', color: '#1e293b'}}>סוגי אירועים</h3>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px'}}>
          {settings.eventTypes.map(type => {
            const isMuted = settings.mutedEventTypes.includes(type);
            return (
              <div key={type} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%'}}>
                <span style={{fontSize: '15px', fontWeight: 'bold', color: '#334155'}}>{type}</span>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <button 
                    onClick={() => toggleMuteType(type)} 
                    style={{
                      background: isMuted ? '#f1f5f9' : '#eef2ff', 
                      color: isMuted ? '#64748b' : '#4f46e5',
                      padding: '6px 12px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      border: 'none'
                    }}
                  >
                    {isMuted ? <BellOff size={14} /> : <Bell size={14} />}
                    {isMuted ? 'שקט' : 'פעיל'}
                  </button>
                  <button 
                    onClick={() => removeEventType(type)} 
                    style={{
                      color: '#ef4444', 
                      padding: '6px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      background: '#fff1f2',
                      borderRadius: '8px',
                      border: 'none'
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{display: 'flex', gap: '8px'}}>
          <input 
            type="text" 
            placeholder="סוג חדש..." 
            value={newType} 
            onChange={(e) => setNewType(e.target.value)} 
            style={{flex: 1, padding: '12px 14px', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '15px', color: '#1e293b'}} 
          />
          <button 
            onClick={addEventType} 
            style={{background: '#4f46e5', color: 'white', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none'}}
          >
            <Plus size={22} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* שדות בטופס */}
      <div style={{background: 'white', borderRadius: '20px', padding: '20px', border: '1px solid #e2e8f0', marginBottom: '20px'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px'}}>
          <Layout size={20} style={{color: '#4f46e5'}} />
          <h3 style={{fontSize: '17px', fontWeight: '900', color: '#1e293b'}}>שדות בטופס</h3>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px'}}>
          {settings.eventFields.map(field => {
            const Icon = IconMap[field.iconName] || HelpCircle;
            return (
              <div key={field.id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%'}}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <div style={{background: '#eef2ff', color: '#4f46e5', padding: '8px', borderRadius: '10px'}}><Icon size={18} /></div>
                  <span style={{fontWeight: 'bold', fontSize: '15px', color: '#334155'}}>{field.label}</span>
                </div>
                <button 
                  onClick={() => removeField(field.id)} 
                  style={{
                    color: '#ef4444', 
                    padding: '8px', 
                    background: '#fff1f2', 
                    borderRadius: '8px', 
                    border: 'none', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>

        {/* הוספת שדה חדש */}
        <div style={{background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1.5px dashed #cbd5e1'}}>
           <p style={{fontSize: '12px', fontWeight: '900', color: '#64748b', marginBottom: '10px'}}>הוספת שדה חדש:</p>
           <input 
             type="text" 
             placeholder="שם שדה (למשל: צלם)..." 
             value={newFieldLabel} 
             onChange={(e) => setNewFieldLabel(e.target.value)} 
             style={{width: '100%', padding: '12px 14px', marginBottom: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '15px', color: '#1e293b'}} 
           />
           
           <div style={{display: 'flex', gap: '8px', marginBottom: '12px', overflowX: 'auto', paddingBottom: '4px'}}>
             {AvailableIcons.map(iconObj => {
               const IconComp = iconObj.component;
               const isSelected = newFieldIcon === iconObj.name;
               return (
                 <button 
                   key={iconObj.name}
                   onClick={() => setNewFieldIcon(iconObj.name)}
                   style={{
                     flex: '0 0 auto', padding: '8px 12px', borderRadius: '10px', border: '2px solid',
                     borderColor: isSelected ? '#4f46e5' : 'transparent',
                     background: isSelected ? '#eef2ff' : 'white',
                     color: isSelected ? '#4f46e5' : '#94a3b8',
                     display: 'flex',
                     flexDirection: 'column',
                     alignItems: 'center',
                     gap: '2px',
                     minWidth: '55px'
                   }}
                 >
                   <IconComp size={18} />
                   <span style={{fontSize: '9px', fontWeight: 'bold'}}>{iconObj.label}</span>
                 </button>
               );
             })}
           </div>

           <button 
             onClick={addField} 
             style={{
               width: '100%', 
               background: '#4f46e5', 
               color: 'white', 
               padding: '14px', 
               borderRadius: '12px', 
               fontWeight: '900', 
               fontSize: '15px',
               border: 'none'
             }}
           >
             + הוסף שדה למערכת
           </button>
        </div>
      </div>

      {/* מדריך שימוש קצר */}
      <div style={{background: '#1e293b', color: 'white', borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155'}}>
        <button 
          onClick={() => setShowHelp(!showHelp)} 
          style={{
            width: '100%', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            color: 'white', 
            background: 'none', 
            border: 'none', 
            padding: '16px',
            textAlign: 'right'
          }}
        >
           <span style={{fontWeight: '900', fontSize: '15px'}}>מדריך שימוש קצר</span>
           <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
             {showHelp ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
           </div>
        </button>
        {showHelp && (
          <div style={{padding: '0 16px 16px', fontSize: '13px', lineHeight: '1.6', color: 'rgba(255,255,255,0.8)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px'}}>
            <div style={{marginBottom: '6px'}}>• <b>הוספת אירוע:</b> לחיצה ארוכה על יום בלוח או כפתור ה-<b>+</b> למעלה.</div>
            <div style={{marginBottom: '6px'}}>• <b>שדות מותאמים:</b> ניתן להוסיף שדות כמו 'צלם' או 'מוזיקה' שיופיעו בכל אירוע.</div>
            <div>• <b>פרטיות:</b> כל המידע נשמר על המכשיר שלך בלבד ולא בענן.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsView;
