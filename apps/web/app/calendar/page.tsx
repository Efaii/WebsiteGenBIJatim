import { getCalendarEvents } from "@/lib/services/calendar.service";
import CalendarClient from "./CalendarClient";

export default async function CalendarPage() {
  const events = await getCalendarEvents();
  return <CalendarClient initialEvents={events} />;
}
