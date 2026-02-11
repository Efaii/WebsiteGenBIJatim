import {
  getCalendarEventById,
  getAllCalendarEventIds,
} from "@/lib/services/calendar.service";
import { notFound } from "next/navigation";
import EventDetailClient from "./EventDetailClient";
// import { EventItem } from "@/app/types"; // Not strictly needed if inferred, but good practice

export async function generateStaticParams() {
  return getAllCalendarEventIds();
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Find event data
  const eventData = await getCalendarEventById(id);

  if (!eventData) {
    notFound();
  }

  return <EventDetailClient eventData={eventData} />;
}
