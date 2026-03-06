import { parse, format } from "date-fns";

const BASE_DATE = "1970-01-01";
// dummy date because TIME has no date

// DB -> Form/UI  "09:30:00" -> "09:30"
export function dbTimeToUi(time?: string | null) {
  if (!time) return undefined;

  const date = parse(`${BASE_DATE} ${time}`, "yyyy-MM-dd HH:mm:ss", new Date());
  return format(date, "HH:mm");
}

// UI -> DB  "09:30" -> "09:30:00"
export function uiTimeToDb(time?: string | null) {
  if (!time) return null;

  const date = parse(`${BASE_DATE} ${time}`, "yyyy-MM-dd HH:mm", new Date());
  return format(date, "HH:mm:ss");
}
