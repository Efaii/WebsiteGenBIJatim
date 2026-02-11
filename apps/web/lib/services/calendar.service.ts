import api from "@/lib/api";
import { EventItem, Event } from "@/app/types";

// Helper to convert ProkerData/API Event to EventItem
const mapToEventItem = (data: any): EventItem => {
  // Check if data is already EventItem-like or needs strict mapping
  // Assuming Backend returns mostly matching structure
  return {
    ...data,
    id: data.id.toString(),
    date: data.date,
    day: data.day || new Date(data.dateIso || new Date().toISOString()).toLocaleDateString("id-ID", { weekday: "long" }),
    month: data.month || new Date(data.dateIso || new Date().toISOString()).toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
    // Ensure all required fields are present with fallbacks
    commissariat: data.commissariat || "Wilayah",
    type: data.type || "Kegiatan",
    time: data.time || "TBA",
    location: data.location || "TBA",
    audience: data.audience || "Internal",
    dateIso: data.dateIso || new Date().toISOString(),
  } as EventItem;
};

// Group events by Month-Year
const groupEventsByMonth = (events: EventItem[]): Event[] => {
  // Sort by Date
  const sortedEvents = events.sort((a, b) =>
    new Date(a.dateIso).getTime() - new Date(b.dateIso).getTime()
  );

  const groups: Record<string, EventItem[]> = {};

  sortedEvents.forEach((event) => {
    const dateObj = new Date(event.dateIso);
    const key = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`; // YYYY-MM

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(event);
  });

  // Convert groups to Event array
  return Object.keys(groups).map((key) => {
    const [year, month] = key.split("-");
    const dateObj = new Date(parseInt(year), parseInt(month) - 1);
    const monthName = dateObj.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    
    // Simple future check (compare with today)
    const isFuture = dateObj.getTime() > new Date().getTime() - 30 * 24 * 60 * 60 * 1000; // rough check

    return {
      id: key,
      year: parseInt(year),
      month: monthName,
      isFuture: isFuture, 
      items: groups[key],
    };
  }).sort((a, b) => b.id.localeCompare(a.id)); // Sort months descending
};

export const getCalendarEvents = async (): Promise<Event[]> => {
    try {
        // Fetch flat list of events from API
        const response = await api.get<any[]>("/events");
        const rawEvents = response.data;
        
        // Map to EventItem
        const eventItems = rawEvents.map(mapToEventItem);
        
        // Group by month
        return groupEventsByMonth(eventItems);
    } catch (error) {
        console.error("Error fetching calendar events:", error);
        return [];
    }
}

export const getCalendarEventById = async (id: string): Promise<EventItem | null> => {
    try {
        const response = await api.get<any>(`/events/${id}`);
        return mapToEventItem(response.data);
    } catch (error) {
         console.error(`Error fetching event with id ${id}:`, error);
         return null;
    }
}

export const getAllCalendarEventIds = async () => {
   try {
        const response = await api.get<any[]>("/events");
        return response.data.map((e) => ({ id: e.id }));
   } catch (error) {
       console.error("Error fetching event ids:", error);
       return [];
   }
}
