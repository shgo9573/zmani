
import React, { useState } from 'react';
import { Search, Calendar, Filter, Bell, MapPin, User, Music, Info, HelpCircle } from 'lucide-react';
import { CalendarEvent, AppSettings } from '../types';
import { getHebrewDateInfo } from '../utils/hebrewDateUtils';

const IconMap: Record<string, any> = { User, MapPin, Music, Info, HelpCircle };

interface EventsListViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  settings: AppSettings;
}

const EventsListView: React.FC<EventsListViewProps> = ({ events, onEventClick, settings }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = events
    .filter(event => {
      const detailsString = Object.values(event.details).join(' ').toLowerCase();
      return detailsString.includes(searchTerm.toLowerCase()) || 
             event.type.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="h-full flex flex-col" style={{background: '#f8fafc'}}>
      {/* חיפוש מקובע למעלה */}
      <div style={{padding: '15px', background: 'white', borderBottom: '1px solid #e2e8f0', zIndex: 5}}>
        <div style={{position: 'relative', width: '100%'}}>
          <Search style={{position: 'absolute', right: '14px', top: '14px', color: '#94a3b8'}} size={22} />
          <input
            type="text"
            placeholder="חפש אירוע..."
            style={{width: '100%', padding: '12px 45px 12px 15px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '15px', fontSize: '16px'}}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* אזור נגלל */}
      <div className="scrollable" style={{flex: 1, padding: '15px'}}>
        {filteredEvents.length > 0 ? (
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '20px'}}>
            {filteredEvents.map((event) => {
              const name = event.details[settings.eventFields[0]?.id] || 'ללא שם';
              const location = event.details[settings.eventFields[1]?.id];
              
              return (
                <div key={event.id} onClick={() => onEventClick(event)} className="event-card" style={{cursor: 'pointer'}}>
                  <div className="flex justify-between items-start mb-2">
                    <span style={{fontSize: '11px', fontWeight: 'bold', color: '#94a3b8'}}>
                      {getHebrewDateInfo(new Date(event.date))}
                    </span>
                    <span style={{fontSize: '11px', padding: '3px 8px', background: '#eef2ff', color: '#4f46e5', borderRadius: '6px', fontWeight: '900'}}>
                      {event.type}
                    </span>
                  </div>
                  
                  <h4 style={{fontSize: '18px', fontWeight: '900', color: '#1e293b', marginBottom: '4px'}}>{name}</h4>
                  
                  {location && (
                    <div className="flex items-center gap-1" style={{color: '#64748b', fontSize: '13px'}}>
                      <MapPin size={14} />
                      <span>{location}</span>
                    </div>
                  )}
                  
                  {event.eventTime && (
                    <div style={{fontSize: '12px', color: '#94a3b8', marginTop: '5px', textAlign: 'left'}}>
                      שעה: {event.eventTime}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{textAlign: 'center', padding: '60px 20px', color: '#94a3b8'}}>
            <Filter size={50} style={{margin: '0 auto 15px', opacity: 0.2}} />
            <p style={{fontSize: '16px', fontWeight: 'bold'}}>לא נמצאו אירועים</p>
            <button onClick={() => setSearchTerm('')} style={{marginTop: '10px', color: '#4f46e5', fontSize: '14px', fontWeight: 'bold'}}>הצג הכל</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsListView;
