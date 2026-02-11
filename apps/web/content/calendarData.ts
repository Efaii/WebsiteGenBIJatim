import { Event, EventItem, ProkerData } from "@/app/types";
import { COMMISSARIAT_DATA } from "@/content/commissariatData";
import { SHARED_EVENTS } from "@/content/sharedEvents";

// Helper to convert ProkerData to EventItem
const mapProkerToEventItem = (proker: ProkerData): EventItem => {
  const dateObj = new Date(proker.dateIso);
  const day = dateObj.toLocaleDateString("id-ID", { weekday: "long" });
  const dateStr = dateObj.getDate().toString().padStart(2, "0");
  
  return {
    ...proker,
    id: proker.id.toString(), // Ensure ID is string
    date: dateStr,
    day: day,
    month: dateObj.toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
    title: proker.title,
    commissariat: proker.commissariat || "Wilayah (Jatim)",
    type: proker.type || "Kegiatan",
    time: proker.time || "TBA",
    location: proker.location || (proker.format === "Online" ? "Online" : "TBA"),
    audience: proker.audience,
    link: proker.link,
    dateIso: proker.dateIso, // Required for filtering
  };
};

// Aggregate all events
const getAllEvents = (): ProkerData[] => {
  const commissariatEvents = Object.values(COMMISSARIAT_DATA).flatMap(
    (c) => c.proker
  );
  return [...SHARED_EVENTS, ...commissariatEvents];
};

// Group events by Month-Year
const generateCalendarData = (): Event[] => {
  const allEvents = getAllEvents();
  
  // Sort by Date
  const sortedEvents = allEvents.sort((a, b) => 
    new Date(a.dateIso).getTime() - new Date(b.dateIso).getTime()
  );

  const groups: Record<string, EventItem[]> = {};

  sortedEvents.forEach((proker) => {
    const dateObj = new Date(proker.dateIso);
    const key = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`; // YYYY-MM
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(mapProkerToEventItem(proker));
  });

  // Convert groups to Event array
  return Object.keys(groups).map((key) => {
    const [year, month] = key.split("-");
    const dateObj = new Date(parseInt(year), parseInt(month) - 1);
    const monthName = dateObj.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    const isFuture = dateObj.getTime() > new Date().getTime();

    return {
      id: key,
      year: parseInt(year),
      month: monthName,
      isFuture: true, // Simplified logic, can be refined
      items: groups[key],
    };
  }).sort((a, b) => b.id.localeCompare(a.id)); // Sort months descending (latest first)
};

export const CALENDAR_DATA: Event[] = generateCalendarData();
