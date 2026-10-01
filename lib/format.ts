import { TZ } from "./time";

const parts = (iso: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("de-CH", { timeZone: TZ, ...o }).format(new Date(iso));

export const fmtDay = (iso: string) => parts(iso, { day: "2-digit", month: "2-digit" });
export const fmtWeekday = (iso: string) => parts(iso, { weekday: "short" }).replace(".", "");
export const fmtTime = (iso: string) => parts(iso, { hour: "2-digit", minute: "2-digit" });
export const fmtLong = (iso: string) => parts(iso, { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export const fmtDayNum = (iso: string) => parts(iso, { day: "2-digit" });
export const fmtMonthShort = (iso: string) => parts(iso, { month: "short" }).replace(".", "");
/** "Okt. 26" */
export const fmtMonthChip = (iso: string) => parts(iso, { month: "short", year: "2-digit" });
export const fmtMonthLong = (iso: string) => parts(iso, { month: "long", year: "numeric" });
