
/**
 * Hebrew Date Utils - Optimized for Modern Browsers with Robust Fallbacks
 */

/**
 * Calculates the Hebrew date parts using Intl.DateTimeFormat
 * Returns accurate month names and day numbers.
 */
export const getHebrewDateParts = (date: Date) => {
  try {
    const formatter = new Intl.DateTimeFormat('he-u-ca-hebrew', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const parts = formatter.formatToParts(date);
    
    const d = parseInt(parts.find(p => p.type === 'day')?.value || "1");
    const mName = parts.find(p => p.type === 'month')?.value || "תשרי";
    const y = parseInt(parts.find(p => p.type === 'year')?.value || "5785");
    
    return { day: d, monthName: mName, year: y };
  } catch (e) {
    // Fallback if Intl is not supported properly
    const months = ["תשרי", "חשוון", "כסלו", "טבת", "שבט", "אדר", "ניסן", "אייר", "סיוון", "תמוז", "אב", "אלול"];
    return { day: date.getDate(), monthName: months[date.getMonth() % 12], year: 5785 };
  }
};

export const toHebrewNumeral = (num: number): string => {
  if (num <= 0) return num.toString();
  const units = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
  const tens = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
  const hundreds = ["", "ק", "ר", "ש", "ת", "תק", "תר", "תש", "תת", "תתק"];
  
  let result = "";
  const h = Math.floor(num / 100);
  const t = Math.floor((num % 100) / 10);
  const u = num % 10;
  
  result += hundreds[h] || "";
  if (num % 100 === 15) return result + 'ט"ו';
  if (num % 100 === 16) return result + 'ט"ז';
  
  result += tens[t] || ""; 
  result += units[u] || ""; 
  
  if (result.length === 1) return result + "'";
  if (result.length > 1 && !result.includes('"')) {
    return result.slice(0, -1) + '"' + result.slice(-1);
  }
  return result;
};

export const getHebrewDateInfo = (date: Date): string => {
  const { day, monthName, year } = getHebrewDateParts(date);
  return `${toHebrewNumeral(day)} ב${monthName} ${toHebrewNumeral(year % 1000)}`;
};

export const getHebrewMonthYear = (date: Date): string => {
  const { monthName, year } = getHebrewDateParts(date);
  return `${monthName} ${toHebrewNumeral(year % 1000)}`;
};

export const getHebrewDay = (date: Date): number => {
  return getHebrewDateParts(date).day;
};

export const getGregorianMonthYear = (date: Date): string => {
  const months = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

/**
 * Finds the Gregorian date of the 1st of the Hebrew month for the given date,
 * and the number of days in that Hebrew month.
 */
export const getHebrewMonthBounds = (date: Date) => {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const targetMonthName = getHebrewDateParts(d).monthName;
  
  // Walk back to find the 1st of the Hebrew month
  let firstDay = new Date(d);
  for (let i = 0; i < 35; i++) {
    const prev = new Date(firstDay);
    prev.setDate(firstDay.getDate() - 1);
    if (getHebrewDateParts(prev).monthName !== targetMonthName) break;
    firstDay = prev;
  }

  // Count days in this Hebrew month
  let length = 0;
  let temp = new Date(firstDay);
  while (getHebrewDateParts(temp).monthName === targetMonthName && length < 32) {
    length++;
    temp.setDate(temp.getDate() + 1);
  }

  return { firstDay, length };
};
