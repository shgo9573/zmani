
/**
 * Converts a number to Hebrew numerals (Gematria).
 */
export const toHebrewNumeral = (num: number): string => {
  if (num <= 0) return num.toString();

  const units = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
  const tens = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
  const hundreds = ["", "ק", "ר", "ש", "ת", "תק", "תר", "תש", "תת", "תתק"];

  if (num === 15) return 'ט"ו';
  if (num === 16) return 'ט"ז';

  let result = "";
  
  const h = Math.floor(num / 100);
  const t = Math.floor((num % 100) / 10);
  const u = num % 10;

  result += hundreds[h] || "";
  
  // Handle 15/16 within larger numbers (e.g. 115)
  if (num % 100 === 15) {
    result += 'ט"ו';
  } else if (num % 100 === 16) {
    result += 'ט"ז';
  } else {
    result += tens[t] || "";
    result += units[u] || "";
  }

  // Add Geresh/Gershayim
  if (result.length === 1) return result + "'";
  return result.slice(0, -1) + '"' + result.slice(-1);
};

/**
 * Normalizes a date to midday (12:00) to avoid timezone/sunset issues with Intl.
 */
const normalizeDate = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d;
};

/**
 * Custom formatter to get Hebrew year in traditional letters (e.g., תשפ"ו)
 */
const formatHebrewYear = (yearNum: number): string => {
  return toHebrewNumeral(yearNum % 1000);
};

/**
 * Gets just the Hebrew day of the month as a number.
 */
export const getHebrewDay = (date: Date): number => {
  const normalized = normalizeDate(date);
  const parts = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', { day: 'numeric' }).formatToParts(normalized);
  const dayPart = parts.find(p => p.type === 'day');
  return dayPart ? parseInt(dayPart.value, 10) : normalized.getDate();
};

/**
 * Gets Hebrew date info for a specific Gregorian date, formatted in Gematria.
 */
export const getHebrewDateInfo = (date: Date): string => {
  const normalized = normalizeDate(date);
  const parts = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).formatToParts(normalized);

  const dayNum = parseInt(parts.find(p => p.type === 'day')?.value || '1');
  const month = parts.find(p => p.type === 'month')?.value;
  const year = parts.find(p => p.type === 'year')?.value;

  return `${toHebrewNumeral(dayNum)} ב${month} ${formatHebrewYear(parseInt(year || '0'))}`;
};

/**
 * Gets the Hebrew month and year name (e.g., "אדר תשפ״ו").
 */
export const getHebrewMonthYear = (date: Date): string => {
  const normalized = normalizeDate(date);
  const parts = new Intl.DateTimeFormat('he-IL-u-ca-hebrew', {
    month: 'long',
    year: 'numeric'
  }).formatToParts(normalized);

  const month = parts.find(p => p.type === 'month')?.value;
  const year = parts.find(p => p.type === 'year')?.value;

  return `${month} ${formatHebrewYear(parseInt(year || '0'))}`;
};

/**
 * Gets corresponding Gregorian month and year (e.g., "פברואר 2026").
 */
export const getGregorianMonthYear = (date: Date): string => {
  return new Intl.DateTimeFormat('he-IL', {
    month: 'long',
    year: 'numeric'
  }).format(normalizeDate(date));
};

/**
 * Finds the Gregorian date of the 1st of the Hebrew month for the given date,
 * and the number of days in that Hebrew month.
 */
export const getHebrewMonthBounds = (date: Date) => {
  const d = normalizeDate(date);
  
  const getMonthName = (dt: Date) => 
    new Intl.DateTimeFormat('he-IL-u-ca-hebrew', { month: 'long' }).format(dt);
  
  const targetMonth = getMonthName(d);
  
  let first = new Date(d);
  while (getHebrewDay(first) > 1) {
    first.setDate(first.getDate() - 1);
  }
  while (getMonthName(first) !== targetMonth) {
    first.setDate(first.getDate() + 1);
  }
  while (getHebrewDay(first) !== 1) {
    first.setDate(first.getDate() - 1);
  }

  let count = 0;
  let temp = new Date(first);
  while (getMonthName(temp) === targetMonth) {
    count++;
    temp.setDate(temp.getDate() + 1);
  }

  return { firstDay: first, length: count };
};
