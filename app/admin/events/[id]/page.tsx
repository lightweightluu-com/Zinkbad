import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { adminGet } from "@/lib/events";
import { EventForm } from "../event-form";

export default async function EditEvent({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const ev = await adminGet((await params).id);
  if (!ev) notFound();
  return <EventForm event={ev} />;
}
