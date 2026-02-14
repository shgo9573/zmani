
export enum EventType {
  WEDDING = 'חתונה',
  BAR_MITZVAH = 'בר מצווה',
  BAT_MITZVAH = 'בת מצווה',
  BRIT = 'ברית',
  OTHER = 'אחר'
}

export interface CalendarEvent {
  id: string; // Date string format YYYY-MM-DD
  groomName: string;
  hallName: string;
  singerName: string;
  eventType: EventType;
  additionalDetails: string;
  customDetails: string;
}

export interface HebrewDateInfo {
  day: number;
  month: number;
  year: number;
  monthName: string;
  hebrewDateStr: string;
  isRoshChodesh: boolean;
  holiday?: string;
}
