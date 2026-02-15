
import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Bell, Check, User, MapPin, Music, Info, HelpCircle, Calendar as CalendarIcon } from 'lucide-react';
import { CalendarEvent, AppSettings } from '../types';
import { REMINDER_OPTIONS } from '../constants';
import { getHebrewDateInfo } from '../utils/hebrewDateUtils';

// Helper to map icon names to components
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
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialEvent,
  selectedDate,
  settings
}) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [formData, setFormData] = useState<Partial<CalendarEvent>>({
    type: settings.eventTypes[0],
    details: {},
    reminderMinutes: settings.defaultReminderMinutes,
    customReminderDate: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        type: settings.eventTypes[0],
        details: {},
        reminderMinutes: settings.defaultReminderMinutes,
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
      details: {
        ...(prev.details || {}),
        [fieldId]: value
      }
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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isConfirmingDelete) {
      setIsConfirmingDelete(true);
      setTimeout(() => setIsConfirmingDelete(false), 3000);
      return;
    }
    if (formData.id && onDelete) {
      onDelete(String(formData.id));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300">
        <div className="p-4 border-b flex items-center justify-between bg-indigo-600 text-white">
          <div>
            <h3 className="text-xl font-bold">{formData.id ? 'עריכת אירוע' : 'הוספת אירוע'}</h3>
            <p className="text-sm opacity-80">{getHebrewDateInfo(new Date(selectedDate))}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          {/* Event Type Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">סוג אירוע</label>
            <div className="flex flex-wrap gap-2">
              {settings.eventTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, type })}
                  className={`px-4 py-2 rounded-xl border-2 text-sm font-bold transition-all ${
                    formData.type === type
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                      : 'bg-white text-slate-600 border-slate-100 hover:border-indigo-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {settings.eventFields.map((field) => {
              const Icon = IconMap[field.iconName] || HelpCircle;
              return (
                <div key={field.id} className="flex flex-col gap-1">
                  <label className="text-sm font-bold text-slate-700">{field.label}</label>
                  <div className="relative">
                    <Icon className="absolute right-3 top-3.5 text-slate-400" size={18} />
                    <input
                      type="text"
                      className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                      value={formData.details?.[field.id] || ''}
                      onChange={(e) => updateDetail(field.id, e.target.value)}
                      placeholder={`הזן ${field.label}...`}
                    />
                  </div>
                </div>
              );
            })}
            
            {/* Reminder Selection */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-bold text-slate-700">תזכורת</label>
              <div className="relative">
                <Bell className="absolute right-3 top-3.5 text-slate-400" size={18} />
                <select
                  className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-bold"
                  value={formData.reminderMinutes || 0}
                  onChange={(e) => setFormData({ ...formData, reminderMinutes: parseInt(e.target.value) })}
                >
                  {REMINDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Date Input (shown only if Custom is selected) */}
            {formData.reminderMinutes === -1 && (
              <div className="flex flex-col gap-1 animate-in slide-in-from-top-2 duration-200">
                <label className="text-sm font-bold text-slate-700">תאריך תזכורת</label>
                <div className="relative">
                  <CalendarIcon className="absolute right-3 top-3.5 text-slate-400" size={18} />
                  <input
                    type="date"
                    required
                    className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                    value={formData.customReminderDate || ''}
                    onChange={(e) => setFormData({ ...formData, customReminderDate: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-6 border-t mt-4 sticky bottom-0 bg-white">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
            >
              <Save size={22} />
              שמירה
            </button>
            
            {formData.id && onDelete && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className={`min-w-[70px] flex flex-col items-center justify-center border-2 rounded-2xl transition-all duration-300 ${
                  isConfirmingDelete 
                    ? 'bg-red-600 border-red-600 text-white px-6' 
                    : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100'
                }`}
              >
                {isConfirmingDelete ? (
                  <div className="flex flex-col items-center">
                    <Check size={20} className="animate-bounce" />
                    <span className="text-[10px] font-black">בטוח?</span>
                  </div>
                ) : (
                  <Trash2 size={24} />
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal;
