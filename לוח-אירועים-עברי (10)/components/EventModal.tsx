
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
        <div className="p-3 border-b flex items-center justify-between bg-primary text-white">
          <div>
            <h3 style={{fontSize: '20px', fontWeight: 'bold', margin: 0}}>{formData.id ? 'עריכת אירוע' : 'הוספת אירוע'}</h3>
            <p style={{fontSize: '13px', opacity: 0.9, margin: 0}}>{getHebrewDateInfo(new Date(selectedDate))}</p>
          </div>
          <button onClick={onClose} style={{background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '50%', color: 'white'}}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px'}}>
          {/* סוג אירוע */}
          <div>
            <label style={{fontSize: '14px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '10px'}}>סוג אירוע:</label>
            <div className="flex" style={{flexWrap: 'wrap', gap: '10px'}}>
              {settings.eventTypes.map((type) => (
                <button
                  key={type} type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  style={{
                    padding: '10px 18px', borderRadius: '12px', border: '2px solid', fontSize: '15px', fontWeight: 'bold',
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

          {/* Fix: Changed justifyBetween to justifyContent as justifyBetween is not a valid React CSS property */}
          <div style={{background: '#eef2ff', padding: '15px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #c7d2fe'}}>
            <div className="flex items-center gap-2">
              <Clock size={20} style={{color: '#4f46e5'}} />
              <label style={{fontSize: '16px', fontWeight: 'bold'}}>שעת אירוע:</label>
            </div>
            <input
              type="time"
              style={{padding: '8px 12px', background: 'white', border: '1px solid #c7d2fe', borderRadius: '10px', fontSize: '18px', fontWeight: 'bold'}}
              value={formData.eventTime}
              onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-4">
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

          <div style={{paddingTop: '15px', borderTop: '1px solid #eee', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
            <div className="flex flex-col">
              <label style={{fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '6px'}}>תזכורת:</label>
              <select
                style={{width: '100%', padding: '12px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '15px'}}
                value={formData.reminderMinutes || 0}
                onChange={(e) => setFormData({ ...formData, reminderMinutes: parseInt(e.target.value) })}
              >
                {REMINDER_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            {(formData.reminderMinutes !== 0 && !isRelative) && (
              <div className="flex flex-col">
                <label style={{fontSize: '13px', fontWeight: 'bold', color: '#64748b', marginBottom: '6px'}}>שעת התראה:</label>
                <input
                  type="time"
                  style={{width: '100%', padding: '12px', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '15px'}}
                  value={formData.reminderTime}
                  onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3" style={{marginTop: '20px'}}>
            <div className="flex gap-3">
              <button type="submit" style={{flex: 2, background: '#4f46e5', color: 'white', padding: '18px', borderRadius: '16px', fontWeight: '900', border: 'none', fontSize: '18px', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'}}>
                שמירת אירוע
              </button>
              <button type="button" onClick={onClose} style={{flex: 1, background: '#f1f5f9', color: '#475569', padding: '18px', borderRadius: '16px', fontWeight: 'bold', border: '2px solid #e2e8f0', fontSize: '18px'}}>
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
                  border: '2px solid #fee2e2', padding: '12px', borderRadius: '16px', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                <Trash2 size={18} />
                {isConfirmingDelete ? 'לחץ שוב למחיקה סופית' : 'מחיקת אירוע'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
