import { requireAdmin } from "@/lib/auth";
import { EventForm } from "../event-form";

export default async function NewEvent() {
  await requireAdmin();
  return <EventForm />;
}
