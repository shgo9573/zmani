
import { toHebrewNumeral } from './hebrewDateUtils';

export interface LearningItem {
  title: string;
  value: string;
  link: string;
  category: string;
  content?: string; // טקסט הלימוד המקומי
}

export interface LearningInfo {
  bavli: LearningItem;
  halacha: LearningItem;
  chofetzChaim: LearningItem;
}

const BAVLI_TRACTATES = [
  { name: 'ברכות', eng: 'Berakhot', pages: 64 }, { name: 'שבת', eng: 'Shabbat', pages: 157 }, { name: 'עירובין', eng: 'Eruvin', pages: 105 },
  { name: 'פסחים', eng: 'Pesachim', pages: 121 }, { name: 'שקלים', eng: 'Shekalim', pages: 22 }, { name: 'יומא', eng: 'Yoma', pages: 88 },
  { name: 'סוכה', eng: 'Sukkah', pages: 56 }, { name: 'ביצה', eng: 'Beitzah', pages: 40 }, { name: 'ראש השנה', eng: 'Rosh_Hashanah', pages: 35 },
  { name: 'תענית', eng: 'Taanit', pages: 31 }, { name: 'מגילה', eng: 'Megillah', pages: 31 }, { name: 'מועד קטן', eng: 'Moed_Katan', pages: 29 },
  { name: 'חגיגה', eng: 'Chagigah', pages: 27 }, { name: 'יבמות', eng: 'Yevamot', pages: 122 }, { name: 'כתובות', eng: 'Ketubot', pages: 112 },
  { name: 'נדרים', eng: 'Nedarim', pages: 91 }, { name: 'נזיר', eng: 'Nazir', pages: 66 }, { name: 'סוטה', eng: 'Sotah', pages: 49 },
  { name: 'גיטין', eng: 'Gittin', pages: 90 }, { name: 'קידושין', eng: 'Kiddushin', pages: 82 }, { name: 'בבא קמא', eng: 'Bava_Kama', pages: 119 },
  { name: 'בבא מציעא', eng: 'Bava_Metzia', pages: 119 }, { name: 'בבא בתרא', eng: 'Bava_Batra', pages: 176 }, { name: 'סנהדרין', eng: 'Sanhedrin', pages: 113 },
  { name: 'מכות', eng: 'Makkot', pages: 24 }, { name: 'שבועות', eng: 'Shevuot', pages: 49 }, { name: 'עבודה זרה', eng: 'Avodah_Zarah', pages: 76 },
  { name: 'הוריות', eng: 'Horayot', pages: 14 }, { name: 'זבחים', eng: 'Zevachim', pages: 120 }, { name: 'מנחות', eng: 'Menachot', pages: 110 },
  { name: 'חולין', eng: 'Chullin', pages: 142 }, { name: 'בכורות', eng: 'Bekhorot', pages: 61 }, { name: 'ערכין', eng: 'Arakhin', pages: 34 },
  { name: 'תמורה', eng: 'Temurah', pages: 34 }, { name: 'כריתות', eng: 'Keritot', pages: 28 }, { name: 'מעילה', eng: 'Meilah', pages: 22 },
  { name: 'תמיד', eng: 'Tamid', pages: 28 }, { name: 'מידות', eng: 'Middot', pages: 22 }, { name: 'קינים', eng: 'Kinnim', pages: 22 },
  { name: 'נידה', eng: 'Niddah', pages: 73 }
];

const TOTAL_BAVLI_PAGES = 2711;
const BAVLI_EPOCH = new Date(2020, 0, 5); // Start of Cycle 14

export const calculateLearning = (date: Date): LearningInfo => {
  // 1. Bavli (Daf Yomi)
  const diffTime = date.getTime() - BAVLI_EPOCH.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  let dayInCycle = ((diffDays % TOTAL_BAVLI_PAGES) + TOTAL_BAVLI_PAGES) % TOTAL_BAVLI_PAGES;
  
  let bavliStr = "";
  let bavliLink = "";
  let remainingDays = dayInCycle;
  for (const masechet of BAVLI_TRACTATES) {
    if (remainingDays < masechet.pages - 1) {
      const pageNum = remainingDays + 2;
      bavliStr = `${masechet.name} דף ${toHebrewNumeral(pageNum)}`;
      bavliLink = `https://www.sefaria.org/${masechet.eng}.${pageNum}a?lang=he`;
      break;
    }
    remainingDays -= (masechet.pages - 1);
  }

  // 2. Halacha (Mishna Berura) - Siman by day
  const halachaEpoch = new Date(2022, 9, 13);
  const hDiff = Math.floor((date.getTime() - halachaEpoch.getTime()) / (1000 * 60 * 60 * 24));
  const simanNum = (hDiff % 697) + 1;
  const halachaStr = `משנה ברורה סימן ${toHebrewNumeral(simanNum)}`;
  
  // 3. Chofetz Chaim - Annual Cycle (approx 200 portions)
  const chEpoch = new Date(2024, 0, 1);
  const chDiff = Math.floor((date.getTime() - chEpoch.getTime()) / (1000 * 60 * 60 * 24));
  const chPageNum = (chDiff % 200) + 1;
  const chStr = `חפץ חיים יום ${toHebrewNumeral(chPageNum)}`;

  // Mock content for "Local" feel
  const localContent = `
    לימוד ליום ${toHebrewNumeral(chPageNum)}: 
    הלכות לשון הרע - כלל א'. 
    דע כי איסור לשון הרע הוא מן התורה, ואין הפרש אם הוא מדבר עליו בפניו או שלא בפניו. 
    עוד למדנו היום כי השומע לשון הרע עובר גם הוא על איסור 'לא תשא שמע שוא'. 
    (זהו תוכן מקומי לדוגמה באפליקציה)
  `;

  return { 
    bavli: { 
      title: 'דף היומי בבלי', 
      value: bavliStr, 
      link: bavliLink, 
      category: 'גמרא',
      content: `סוגיית הגמרא במסכת ${bavliStr.split(' ')[0]} בדף ${bavliStr.split(' ')[2]}. ללימוד מעמיק יש לפתוח את הטקסט המלא.`
    },
    halacha: { 
      title: 'משנה ברורה', 
      value: halachaStr, 
      link: `https://www.sefaria.org/Mishnah_Berurah.${simanNum}?lang=he`, 
      category: 'הלכה',
      content: `הלכות היום במשנה ברורה עוסקות בסימן ${toHebrewNumeral(simanNum)}. ראה טקסט מלא באתר ספריא.`
    },
    chofetzChaim: { 
      title: 'חפץ חיים', 
      value: chStr, 
      link: `https://www.sefaria.org/Chofetz_Chaim?lang=he`, 
      category: 'מוסר',
      content: localContent
    }
  };
};
