
import React, { useState, useEffect } from 'react';
import { CalendarEvent, EventType } from '../types';
import { X, Save, Info, Music, MapPin, User, Tag, Trash2, AlertCircle, Sun, Sunrise, Sunset, Clock } from 'lucide-react';
import { calculateZmanim, DayZmanim } from '../utils/zmanimUtils';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
  selectedDate: Date | null;
  existingEvent?: CalendarEvent;
  hebrewDateStr: string;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  selectedDate,
  existingEvent,
  hebrewDateStr
}) => {
  const [formData, setFormData] = useState<CalendarEvent>({
    id: '',
    groomName: '',
    hallName: '',
    singerName: '',
    eventType: EventType.WEDDING,
    additionalDetails: '',
    customDetails: ''
  });

  const [zmanim, setZmanim] = useState<DayZmanim | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (isOpen && selectedDate) {
      // Get location for zmanim if possible, otherwise use Jerusalem
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const z = calculateZmanim(selectedDate, pos.coords.latitude, pos.coords.longitude);
          setZmanim(z);
        },
        () => {
          const z = calculateZmanim(selectedDate);
          setZmanim(z);
        }
      );

      if (existingEvent) {
        setFormData(existingEvent);
      } else {
        setFormData({
          id: selectedDate.toISOString().split('T')[0],
          groomName: '',
          hallName: '',
          singerName: '',
          eventType: EventType.WEDDING,
          additionalDetails: '',
          customDetails: ''
        });
      }
    }
    setShowConfirmDelete(false);
  }, [existingEvent, selectedDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleDelete = () => {
    if (existingEvent) {
      onDelete(existingEvent.id);
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in duration-300 flex flex-col max-h-[95vh]">
        
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold">{existingEvent ? 'עריכת אירוע' : 'אירוע חדש'}</h2>
            <p className="text-indigo-100 text-sm mt-1">{hebrewDateStr}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-indigo-500 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Zmanim Section */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-3 gap-y-4 gap-x-2">
            <div className="text-center">
              <p className="text-[10px] text-slate-400 font-bold mb-1">נץ החמה</p>
              <div className="flex items-center justify-center gap-1 text-indigo-600 font-black">
                <Sunrise size={14} />
                <span className="text-sm">{zmanim?.sunrise}</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400 font-bold mb-1">סוף זמן ק"ש</p>
              <div className="flex items-center justify-center gap-1 text-indigo-600 font-black">
                <Clock size={14} />
                <span className="text-sm">{zmanim?.shemaGra}</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-400 font-bold mb-1">שקיעה</p>
              <div className="flex items-center justify-center gap-1 text-indigo-600 font-black">
                <Sunset size={14} />
                <span className="text-sm">{zmanim?.sunset}</span>
              </div>
            </div>
          </div>

          {showConfirmDelete ? (
            <div className="py-8 text-center space-y-6">
              <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-red-500">
                <AlertCircle size={48} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">למחוק את האירוע?</h3>
              <div className="flex gap-3">
                <button onClick={handleDelete} className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl">מחק</button>
                <button onClick={() => setShowConfirmDelete(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-3 rounded-xl">ביטול</button>
              </div>
            </div>
          ) : (
            <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5"><Tag size={16} className="text-indigo-500" /> סוג אירוע</label>
                  <select name="eventType" value={formData.eventType} onChange={handleChange} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                    {Object.values(EventType).map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5"><User size={16} className="text-indigo-500" /> שם החתן</label>
                  <input type="text" name="groomName" value={formData.groomName} onChange={handleChange} required className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5"><MapPin size={16} className="text-indigo-500" /> אולם</label>
                  <input type="text" name="hallName" value={formData.hallName} onChange={handleChange} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5"><Music size={16} className="text-indigo-500" /> זמר</label>
                  <input type="text" name="singerName" value={formData.singerName} onChange={handleChange} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5"><Info size={16} className="text-indigo-500" /> פרטים נוספים</label>
                  <textarea name="additionalDetails" value={formData.additionalDetails} onChange={handleChange} rows={2} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl resize-none outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-1.5"><Info size={16} className="text-indigo-500" /> הגדרות נוספות</label>
                  <textarea name="customDetails" value={formData.customDetails} onChange={handleChange} rows={2} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl resize-none outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
            </form>
          )}
        </div>

        {!showConfirmDelete && (
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3 shrink-0">
            {existingEvent && (
              <button type="button" onClick={() => setShowConfirmDelete(true)} className="p-4 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors">
                <Trash2 size={24} />
              </button>
            )}
            <button form="event-form" type="submit" className="flex-1 bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">
              <Save size={22} /> {existingEvent ? 'עדכן' : 'שמור'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventModal;
