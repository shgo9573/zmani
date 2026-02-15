
export interface FieldConfig {
  id: string;
  label: string;
  iconName: string;
}

export interface CalendarEvent {
  id: string;
  date: string;
  type: string;
  details: Record<string, string>;
  eventTime: string; // שעת האירוע / חופה (HH:mm)
  reminderMinutes: number;
  reminderTime?: string; // שעת התראה עבור תזכורות יום/שבוע לפני (HH:mm)
  customReminderDate?: string; // תאריך תזכורת ספציפי (YYYY-MM-DD)
}

export interface AppSettings {
  notificationsEnabled: boolean;
  defaultReminderMinutes: number;
  themeColor: string;
  eventTypes: string[];
  eventFields: FieldConfig[];
}

export type ViewType = 'calendar' | 'today' | 'list' | 'settings';

export interface ZmanimData {
  alotHashachar: string;
  misheyakir: string;
  sunrise: string;
  shemaMGA: string;
  shemaGera: string;
  tefillahMGA: string;
  tefillahGera: string;
  chatzot: string;
  minchaGedola: string;
  minchaKetana: string;
  plagHamincha: string;
  sunset: string;
  tzeitHakochavim: string;
}
