
import { ZmanimCalendar, GeoLocation } from 'kosher-zmanim';

export interface DayZmanim {
  sunrise: string;
  sunset: string;
  shemaGra: string;
  shemaMga: string;
  tefillah: string;
  chatzot: string;
}

export const calculateZmanim = (date: Date, latitude: number = 31.7683, longitude: number = 35.2137): DayZmanim => {
  // Default to Jerusalem if no location provided
  const location = new GeoLocation("User Location", latitude, longitude, 0, "Asia/Jerusalem");
  const zmanimCalendar = new ZmanimCalendar(location);
  zmanimCalendar.setDate(date);

  const format = (date: Date | null) => {
    if (!date) return "--:--";
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  return {
    sunrise: format(zmanimCalendar.getSunrise()),
    sunset: format(zmanimCalendar.getSunset()),
    shemaGra: format(zmanimCalendar.getSofZmanShmaGRA()),
    shemaMga: format(zmanimCalendar.getSofZmanShmaMGA()),
    tefillah: format(zmanimCalendar.getSofZmanTfilaGRA()),
    chatzot: format(zmanimCalendar.getChatzos()),
  };
};

export const isAfterSunset = (date: Date, latitude: number = 31.7683, longitude: number = 35.2137): boolean => {
  const location = new GeoLocation("User Location", latitude, longitude, 0, "Asia/Jerusalem");
  const zmanimCalendar = new ZmanimCalendar(location);
  zmanimCalendar.setDate(date);
  const sunset = zmanimCalendar.getSunset();
  return sunset ? date > sunset : false;
};
