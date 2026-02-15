
import { ZmanimData } from '../types';

export const calculateZmanim = (date: Date, lat: number, lng: number): ZmanimData => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const declination = 23.45 * Math.sin((Math.PI / 180) * (360 / 365) * (dayOfYear - 81));
  const b = (Math.PI / 180) * (360 / 364) * (dayOfYear - 81);
  const eqTime = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);

  const lonCorr = 4 * (lng - (15 * 2)); // UTC+2 base
  const solarNoon = 12 - (lonCorr / 60) - (eqTime / 60);

  const latRad = (Math.PI / 180) * lat;
  const decRad = (Math.PI / 180) * declination;
  const cosH = -Math.tan(latRad) * Math.tan(decRad);
  
  const H = (Math.acos(Math.max(-1, Math.min(1, cosH))) * 180) / Math.PI;
  const duration = (2 * H) / 15;
  
  const sunriseHour = solarNoon - (duration / 2);
  const sunsetHour = solarNoon + (duration / 2);
  const shaahZmanit = duration / 12;
  
  const formatTime = (decimalHours: number) => {
    const currentOffset = -date.getTimezoneOffset() / 60;
    const adjusted = decimalHours + (currentOffset - 2); 
    const h = Math.floor(adjusted);
    const m = Math.round((adjusted - h) * 60);
    const finalH = ((h % 24) + 24) % 24;
    return `${finalH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  return {
    alotHashachar: formatTime(sunriseHour - 1.2), // Approx 72 min
    misheyakir: formatTime(sunriseHour - 0.75), // Approx 45 min
    sunrise: formatTime(sunriseHour),
    shemaMGA: formatTime(sunriseHour + (2.25 * shaahZmanit)),
    shemaGera: formatTime(sunriseHour + (3 * shaahZmanit)),
    tefillahMGA: formatTime(sunriseHour + (3.25 * shaahZmanit)), // Simplified MGA 4h
    tefillahGera: formatTime(sunriseHour + (4 * shaahZmanit)),
    chatzot: formatTime(solarNoon),
    minchaGedola: formatTime(solarNoon + (0.5 * shaahZmanit)),
    minchaKetana: formatTime(solarNoon + (3.5 * shaahZmanit)),
    plagHamincha: formatTime(sunriseHour + (10.75 * shaahZmanit)),
    sunset: formatTime(sunsetHour),
    tzeitHakochavim: formatTime(sunsetHour + 0.33), // Approx 20 min
  };
};
