import { z } from "zod";

export const STATUSES = ["draft", "published", "cancelled", "sold_out"] as const;
export type EventStatus = (typeof STATUSES)[number];

export const lineupEntry = z.object({
  name: z.string().trim().min(1).max(80),
  instagram_url: z.string().url().optional().or(z.literal("").transform(() => undefined)),
});

export const ticketType = z.object({
  id: z.string().trim().min(1).max(40).regex(/^[a-z0-9-]+$/),
  label: z.string().trim().min(1).max(80),
  price_chf: z.number().positive().max(10000),
  sold_out: z.boolean().default(false),
});

export type LineupEntry = z.infer<typeof lineupEntry>;
export type TicketType = z.infer<typeof ticketType>;

export interface ClubEvent {
  id: string;
  slug: string;
  title: string;
  starts_at: string; // ISO (UTC)
  ends_at: string | null;
  description: string | null;
  flyer_path: string | null;
  flyer_alt: string | null;
  flyer_ratio: number | null; // Breite/Höhe, verhindert Layout-Shift
  lineup: LineupEntry[];
  tickets: TicketType[];
  ticket_url: string | null;
  status: EventStatus;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

/** Eingabe aus dem Admin-Formular (Zeiten bereits nach UTC umgerechnet). */
export const eventInput = z
  .object({
    title: z.string().trim().min(1, "Titel fehlt").max(120),
    starts_at: z.string().datetime(),
    ends_at: z.string().datetime().nullable(),
    description: z.string().trim().max(4000).nullable(),
    flyer_alt: z.string().trim().max(200).nullable(),
    lineup: z.array(lineupEntry).max(40),
    tickets: z.array(ticketType).max(10),
    ticket_url: z.string().url().nullable(),
    status: z.enum(STATUSES),
    is_featured: z.boolean(),
  })
  .refine((v) => !v.ends_at || v.ends_at > v.starts_at, {
    message: "Ende muss nach dem Start liegen",
    path: ["ends_at"],
  });

export type EventInput = z.infer<typeof eventInput>;
