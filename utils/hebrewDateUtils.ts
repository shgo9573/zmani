
/**
 * Using the built-in Intl API to handle Hebrew calendar logic.
 */

export const toHebrewNumeral = (n: number): string => {
  const units = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
  const tens = ["", "י", "כ", "ל"];
  
  if (n === 15) return "טו";
  if (n === 16) return "טז";
  
  const unitDigit = n % 10;
  const tenDigit = Math.floor(n / 10);
  
  return tens[tenDigit] + units[unitDigit];
};

export const getHebrewDate = (date: Date) => {
  const formatter = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  
  const parts = formatter.formatToParts(date);
  const info: any = {};
  parts.forEach(p => info[p.type] = p.value);
  
  const dayNum = parseInt(info.day, 10);
  
  return {
    day: dayNum,
    dayHebrew: toHebrewNumeral(dayNum),
    month: info.month,
    year: info.year,
    full: formatter.format(date)
  };
};

export const formatHebrewDateShort = (date: Date) => {
  const heb = getHebrewDate(date);
  return `${heb.dayHebrew} ב${heb.month}`;
};

export const getMonthDays = (year: number, month: number) => {
  const days = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

export const HEBREW_MONTHS = [
  "תשרי", "חשוון", "כסלו", "טבת", "שבט", "אדר", "אדר ב׳", 
  "ניסן", "אייר", "סיוון", "תמוז", "אב", "אלול"
];

export const DAYS_OF_WEEK = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
