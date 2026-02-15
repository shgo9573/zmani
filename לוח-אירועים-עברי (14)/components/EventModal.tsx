
import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Bell, BellOff, User, MapPin, Music, Info, HelpCircle, Calendar as CalendarIcon, Clock, Star } from 'lucide-react';
import { CalendarEvent, AppSettings } from '../types';
import { REMINDER_OPTIONS } from '../constants';
import { getHebrewDateInfo } from '../utils/hebrewDateUtils';

const IconMap: Record<string, any> = { User, MapPin, Music, Info, HelpCircle };

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete?: (id: string) => void;
  initialEvent?: Partial<CalendarEvent>;
  selectedDate: string;
  settings: AppSettings;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen, onClose, onSave, onDelete, initialEvent, selectedDate, settings
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    type: settings.eventTypes[0],
    details: {},
    eventTime: '19:30', 
    reminderMinutes: settings.defaultReminderMinutes,
    reminderTime: '09:00',
    customReminderDate: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: settings.eventTypes[0],
        details: {},
        eventTime: '19:30',
        reminderMinutes: settings.defaultReminderMinutes,
        reminderTime: '09:00',
        customReminderDate: '',
        ...initialEvent
      });
      setIsConfirmingDelete(false);
    }
  }, [isOpen, initialEvent, settings]);

  if (!isOpen) return null;

  const updateDetail = (fieldId: string, value: string) => {
    const newDetails = { ...(formData.details || {}) };
    newDetails[fieldId] = value;
    setFormData({ ...formData, details: newDetails });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      date: selectedDate,
      id: formData.id || Date.now().toString()
    } as CalendarEvent);
  };

  const visibleFields = settings.eventFields.filter(field => 
    !field.enabledFor || field.enabledFor.length === 0 || field.enabledFor.includes(formData.type || '')
  );

  const isRelative = formData.reminderMinutes === 15 || formData.reminderMinutes === 60 || formData.reminderMinutes === 120;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        {/* כותרת משופרת - תיקון החפיפה */}
        <div style={{
          padding: '16px 20px', 
          borderBottom: '1px solid #eee', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: '#4f46e5',
          color: 'white'
        }}>
          <div>
            <h3 style={{fontSize: '20px', fontWeight: '900', margin: 0}}>{formData.id ? 'עריכת אירוע' : 'הוספת אירוע'}</h3>
            <p style={{fontSize: '12px', opacity: 0.8, margin: 0}}>{getHebrewDateInfo(new Date(selectedDate))}</p>
          </div>
          <button 
            onClick={onClose} 
            style={{
              background: 'rgba(255,255,255,0.15)', 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'white'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px'}}>
          {/* סוג אירוע */}
          <div>
            <label style={{fontSize: '13px', fontWeight: '800', color: '#64748b', display: 'block', marginBottom: '8px'}}>סוג אירוע:</label>
            <div className="flex" style={{flexWrap: 'wrap', gap: '8px'}}>
              {settings.eventTypes.map((type) => (
                <button
                  key={type} type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  style={{
                    padding: '8px 16px', borderRadius: '10px', border: '2px solid', fontSize: '14px', fontWeight: 'bold',
                    borderColor: formData.type === type ? '#4f46e5' : '#e2e8f0',
                    backgroundColor: formData.type === type ? '#4f46e5' : 'white',
                    color: formData.type === type ? 'white' : '#64748b'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* שעת אירוע */}
          <div style={{background: '#f1f5f9', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <div className="flex items-center gap-2">
              <Clock size={20} style={{color: '#4f46e5'}} />
              <label style={{fontSize: '15px', fontWeight: 'bold'}}>שעת אירוע:</label>
            </div>
            <input
              type="time"
              style={{padding: '8px 12px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '18px', fontWeight: 'bold'}}
              value={formData.eventTime}
              onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
            />
          </div>

          {/* שדות קלט (שם, מקום וכו') - תיקון הפריסה */}
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {visibleFields.map((field) => {
              const Icon = IconMap[field.iconName] || HelpCircle;
              return (
                <div key={field.id} className="input-field-container">
                  <Icon className="input-icon" size={22} />
                  <input
                    type="text"
                    placeholder={field.label}
                    className="input-field"
                    value={(formData.details && formData.details[field.id]) || ''}
                    onChange={(e) => updateDetail(field.id, e.target.value)}
                  />
                </div>
              );
            })}
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
            <div className="flex flex-col">
              <label style={{fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '6px'}}>תזכורת:</label>
              <select
                style={{width: '100%', padding: '12px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '14px'}}
                value={formData.reminderMinutes || 0}
                onChange={(e) => setFormData({ ...formData, reminderMinutes: parseInt(e.target.value) })}
              >
                {REMINDER_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            {(formData.reminderMinutes !== 0 && !isRelative) && (
              <div className="flex flex-col">
                <label style={{fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '6px'}}>שעת התראה:</label>
                <input
                  type="time"
                  style={{width: '100%', padding: '12px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '14px'}}
                  value={formData.reminderTime}
                  onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3" style={{marginTop: '10px'}}>
            <div className="flex gap-2">
              <button type="submit" style={{flex: 1, background: '#4f46e5', color: 'white', padding: '16px', borderRadius: '16px', fontWeight: '900', fontSize: '16px', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'}}>
                שמירת אירוע
              </button>
              <button type="button" onClick={onClose} style={{padding: '16px 24px', background: '#f1f5f9', color: '#475569', borderRadius: '16px', fontWeight: 'bold', border: '1px solid #e2e8f0', fontSize: '16px'}}>
                ביטול
              </button>
            </div>
            
            {formData.id && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (!isConfirmingDelete) {
                    setIsConfirmingDelete(true);
                    setTimeout(() => setIsConfirmingDelete(false), 3000);
                  } else {
                    onDelete(String(formData.id));
                  }
                }}
                style={{
                  background: isConfirmingDelete ? '#dc2626' : 'transparent',
                  color: isConfirmingDelete ? 'white' : '#dc2626',
                  border: '2px solid #fee2e2', padding: '12px', borderRadius: '16px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                <Trash2 size={16} />
                {isConfirmingDelete ? 'לחץ שוב למחיקה' : 'מחיקה'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
