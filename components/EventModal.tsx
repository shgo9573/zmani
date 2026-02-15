
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

  // סינון השדות שיופיעו לפי סוג האירוע הנבחר
  const visibleFields = settings.eventFields.filter(field => 
    !field.enabledFor || field.enabledFor.length === 0 || field.enabledFor.includes(formData.type || '')
  );

  const isRelative = formData.reminderMinutes === 15 || formData.reminderMinutes === 60 || formData.reminderMinutes === 120;
  
  const isSelectedTypeMuted = settings.mutedEventTypes.includes(formData.type || '');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300">
        <div className="p-2 sm:p-3 border-b flex items-center justify-between bg-indigo-600 text-white">
          <div className="overflow-hidden">
            <h3 className="text-sm sm:text-base font-black truncate">{formData.id ? 'עריכת אירוע' : 'הוספת אירוע'}</h3>
            <p className="text-[9px] opacity-80 truncate">{getHebrewDateInfo(new Date(selectedDate))}</p>
          </div>
          <button onClick={onClose} className="p-1"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-4 overflow-y-auto space-y-3">
          {/* סוג אירוע */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[9px] font-black text-slate-400 block">סוג אירוע:</label>
              {isSelectedTypeMuted && (
                <span className="text-[8px] font-black text-amber-600 flex items-center gap-1">
                  <BellOff size={10} /> סוג זה ללא צילצול
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {settings.eventTypes.map((type) => {
                const isTypeMuted = settings.mutedEventTypes.includes(type);
                return (
                  <button
                    key={type} type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className={`px-2 py-1 rounded border text-[10px] font-bold transition-all flex items-center gap-1 ${
                      formData.type === type ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}
                  >
                    {type}
                    {isTypeMuted && <BellOff size={10} className={formData.type === type ? 'text-white/70' : 'text-slate-300'} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-indigo-50 p-2 rounded-lg border border-indigo-100 flex items-center justify-between">
            <label className="text-[10px] font-black text-indigo-900">שעת חופה/תחילת אירוע:</label>
            <input
              type="time"
              className="px-2 py-1 bg-white border border-indigo-200 rounded text-xs font-black"
              value={formData.eventTime}
              onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-2 transition-all">
            {visibleFields.map((field) => {
              const Icon = IconMap[field.iconName] || HelpCircle;
              return (
                <div key={field.id} className="relative animate-in fade-in slide-in-from-top-1 duration-200">
                  <Icon className="absolute right-2 top-2.5 text-slate-400" size={14} />
                  <input
                    type="text"
                    placeholder={field.label}
                    className="w-full pr-8 pl-2 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-bold focus:border-indigo-400 outline-none"
                    value={(formData.details && formData.details[field.id]) || ''}
                    onChange={(e) => updateDetail(field.id, e.target.value)}
                  />
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9px] font-black text-slate-500 block mb-0.5">תזכורת:</label>
              <select
                className="w-full px-1 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold"
                value={formData.reminderMinutes || 0}
                onChange={(e) => setFormData({ ...formData, reminderMinutes: parseInt(e.target.value) })}
              >
                {REMINDER_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>

            {(formData.reminderMinutes !== 0 && !isRelative) && (
              <div>
                <label className="text-[9px] font-black text-slate-500 block mb-0.5">שעת התראה:</label>
                <input
                  type="time"
                  className="w-full px-1 py-1.5 bg-slate-50 border border-slate-200 rounded text-[10px] font-bold"
                  value={formData.reminderTime}
                  onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                />
              </div>
            )}

            {formData.reminderMinutes === -1 && (
              <div className="col-span-2">
                <label className="text-[9px] font-black text-slate-500 block mb-0.5">תאריך לתזכורת:</label>
                <input
                  type="date"
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-bold"
                  value={formData.customReminderDate}
                  onChange={(e) => setFormData({ ...formData, customReminderDate: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2 sticky bottom-0 bg-white">
            <button type="submit" className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-black text-sm flex items-center justify-center gap-1 shadow-lg active:scale-95 transition-all">
              <Save size={16} /> שמירה
            </button>
            {formData.id && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (!isConfirmingDelete) {
                    setIsConfirmingDelete(true);
                    setTimeout(() => setIsConfirmingDelete(false), 2000);
                  } else {
                    onDelete(String(formData.id));
                  }
                }}
                className={`px-3 rounded-lg border transition-all ${isConfirmingDelete ? 'bg-red-600 text-white border-red-600' : 'bg-red-50 text-red-600 border-red-100'}`}
              >
                {isConfirmingDelete ? <span className="text-[10px] font-black">מחק?</span> : <Trash2 size={16} />}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
