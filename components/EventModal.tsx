
import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Bell, Check, User, MapPin, Music, Info, HelpCircle, Calendar as CalendarIcon, Clock, Star } from 'lucide-react';
import { CalendarEvent, AppSettings } from '../types';
import { REMINDER_OPTIONS } from '../constants';
import { getHebrewDateInfo } from '../utils/hebrewDateUtils';

const IconMap: Record<string, any> = {
  User, MapPin, Music, Info, HelpCircle
};

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
    setFormData(prev => ({
      ...prev,
      details: { ...(prev.details || {}), [fieldId]: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      date: selectedDate,
      id: formData.id || Date.now().toString()
    } as CalendarEvent);
  };

  const isRelativeReminder = formData.reminderMinutes && [15, 60, 120].includes(formData.reminderMinutes);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in slide-in-from-bottom duration-300">
        <div className="p-4 border-b flex items-center justify-between bg-indigo-600 text-white">
          <div>
            <h3 className="text-xl font-black">{formData.id ? 'עריכת אירוע' : 'הוספת אירוע'}</h3>
            <p className="text-xs opacity-90">{getHebrewDateInfo(new Date(selectedDate))}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* סוג אירוע */}
          <div>
            <label className="block text-sm font-black text-slate-700 mb-2">סוג האירוע</label>
            <div className="flex flex-wrap gap-2">
              {settings.eventTypes.map((type) => (
                <button
                  key={type} type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                    formData.type === type ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 text-slate-500 border-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* שעת האירוע (חופה) */}
          <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
            <label className="block text-sm font-black text-indigo-900 mb-2 flex items-center gap-2">
              <Star size={16} className="text-indigo-600 fill-indigo-600" /> שעת האירוע (חופה)
            </label>
            <div className="relative">
              <Clock className="absolute right-3 top-3 text-indigo-400" size={18} />
              <input
                type="time"
                className="w-full pr-10 pl-4 py-2.5 bg-white border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-black text-indigo-900"
                value={formData.eventTime}
                onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
              />
            </div>
          </div>

          {/* שדות דינמיים */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {settings.eventFields.map((field) => {
              const Icon = IconMap[field.iconName] || HelpCircle;
              return (
                <div key={field.id} className="space-y-1">
                  <label className="text-xs font-black text-slate-500 px-1">{field.label}</label>
                  <div className="relative">
                    <Icon className="absolute right-3 top-3 text-slate-400" size={18} />
                    <input
                      type="text"
                      className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                      value={formData.details?.[field.id] || ''}
                      onChange={(e) => updateDetail(field.id, e.target.value)}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* תזכורת */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            <div className="space-y-1">
              <label className="text-xs font-black text-slate-500 px-1">מתי להזכיר?</label>
              <div className="relative">
                <Bell className="absolute right-3 top-3 text-slate-400" size={18} />
                <select
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none appearance-none font-bold"
                  value={formData.reminderMinutes || 0}
                  onChange={(e) => setFormData({ ...formData, reminderMinutes: parseInt(e.target.value) })}
                >
                  {REMINDER_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
            </div>

            {/* שעת התראה אבסולוטית (רק אם זו לא תזכורת יחסית לשעה) */}
            {(formData.reminderMinutes !== 0 && !isRelativeReminder) && (
              <div className="space-y-1 animate-in fade-in zoom-in duration-200">
                <label className="text-xs font-black text-slate-500 px-1">באיזו שעה להזכיר?</label>
                <div className="relative">
                  <Clock className="absolute right-3 top-3 text-slate-400" size={18} />
                  <input
                    type="time"
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                    value={formData.reminderTime}
                    onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* תאריך מותאם אישית */}
            {formData.reminderMinutes === -1 && (
              <div className="col-span-1 sm:col-span-2 space-y-1 animate-in fade-in zoom-in duration-200">
                <label className="text-xs font-black text-slate-500 px-1">תאריך לתזכורת</label>
                <div className="relative">
                  <CalendarIcon className="absolute right-3 top-3 text-slate-400" size={18} />
                  <input
                    type="date"
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                    value={formData.customReminderDate}
                    onChange={(e) => setFormData({ ...formData, customReminderDate: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-6 sticky bottom-0 bg-white pb-2">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Save size={22} /> שמור אירוע
            </button>
            {formData.id && onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  if (!isConfirmingDelete) {
                    setIsConfirmingDelete(true);
                    setTimeout(() => setIsConfirmingDelete(false), 3000);
                  } else {
                    onDelete(String(formData.id));
                  }
                }}
                className={`min-w-[70px] flex flex-col items-center justify-center border-2 rounded-2xl transition-all ${isConfirmingDelete ? 'bg-red-600 border-red-600 text-white px-4' : 'bg-red-50 border-red-100 text-red-600'}`}
              >
                {isConfirmingDelete ? <span className="text-xs font-black">למחוק?</span> : <Trash2 size={24} />}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
