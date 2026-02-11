import AboutClient from "./AboutClient";
import { getKorkomData, getSharedEvents } from "@/lib/services/profile.service";

export default async function AboutPage() {
  const [korkomData, sharedEvents] = await Promise.all([
    getKorkomData(),
    getSharedEvents(),
  ]);

  return <AboutClient korkomData={korkomData} sharedEvents={sharedEvents} />;
}
