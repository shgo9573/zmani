
export interface FieldConfig {
  id: string;
  label: string;
  iconName: string;
  enabledFor: string[]; // רשימת סוגי האירועים שבהם השדה מופעל
}

export interface CalendarEvent {
  id: string;
  date: string;
  type: string;
  details: Record<string, string>;
  eventTime: string; 
  reminderMinutes: number;
  reminderTime?: string; 
  customReminderDate?: string; 
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
