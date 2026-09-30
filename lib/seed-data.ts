import { zurichLocalToIso as z } from "./time.ts";
import type { ClubEvent } from "./types.ts";

/**
 * Startdaten aus zinkbad.ch/club/ticket.php und eventfrog.ch (Stand 2026-09-30).
 * Vor dem Livegang im Admin prüfen: Daten, Preise, Sichtbarkeit.
 */
const EF = "https://eventfrog.ch";
const now = "2026-09-30T00:00:00.000Z";
type Seed = Partial<ClubEvent> & Pick<ClubEvent, "slug" | "title" | "starts_at">;

const seed = (e: Seed): ClubEvent => ({
  id: `seed-${e.slug}`, ends_at: null, description: null, flyer_path: null, flyer_alt: null,
  lineup: [], tickets: [], ticket_url: null, status: "published", is_featured: false,
  created_at: now, updated_at: now, ...e,
});

export const SEED_EVENTS: ClubEvent[] = [
  seed({ slug: "sangoma-15-years-2026-10-02", title: "15 Years Sangoma Records", starts_at: z("2026-10-02T23:00"),
    flyer_path: "/flyers/sangoma.webp", ticket_url: `${EF}/en/p/parties/goa/15-years-sangoma-records-7500222088084518042.html` }),
  seed({ slug: "mandora-move-kntrlvrlst-nyra-2026-10-03", title: "Mandora x Move infinity pres. KNTRLVRLST & NYRA", starts_at: z("2026-10-03T22:00"),
    lineup: [{ name: "KNTRLVRLST" }, { name: "NYRA" }],
    flyer_path: "/flyers/mandora-oct.webp", ticket_url: `${EF}/en/p/parties/house-techno/mandora-x-move-infinity-pres-kntrlvrlst-nyra-7470133558843028237.html` }),
  seed({ slug: "hardcore-reunion-2026-10-10", title: "Hardcore Reunion", starts_at: z("2026-10-10T21:00"),
    flyer_path: "/flyers/hardcore.webp", ticket_url: `${EF}/en/p/parties/hardstyle/hardcore-reunion-7482462830366602976.html` }),
  seed({ slug: "why-not-die-5-suende-2026-10-17", title: "Why Not – Die 5. Sünde", starts_at: z("2026-10-17T21:00"), ends_at: z("2026-10-18T08:00"),
    description: "Dresscode zwingend!",
    lineup: ["Seerosenpflücker", "Juen & Bach", "Rauschkraft", "Der Jäger", "Till Eule", "Zagara"].map((name) => ({ name })),
    tickets: [{ id: "earlybird", label: "1x EarlyBird", price_chf: 45, sold_out: false }],
    flyer_path: "/flyers/why-not.png", flyer_alt: "Why Not", is_featured: true }),
  seed({ slug: "stellarpulse-x-energetica-2026-10-24", title: "Stellarpulse × Energetica", starts_at: z("2026-10-24T22:00"), ends_at: z("2026-10-25T12:00"),
    description: "Zwei Floors: Psytrance / Progressive und Hi-Tech / Darkpsy.",
    tickets: [{ id: "phase-2", label: "1x Phase 2", price_chf: 45, sold_out: false }],
    flyer_path: "/flyers/stellarpulse.jpg", flyer_alt: "Stellarpulse × Energetica" }),
  seed({ slug: "youngkinksters-2026-10-31", title: "YoungKinksters", starts_at: z("2026-10-31T21:00"),
    description: "For kinky people aged 18 to 44.",
    flyer_path: "/flyers/kinksters.webp", ticket_url: `${EF}/en/p/parties/motto-party/youngkinksters-for-kinky-people-aged-18-to-44-7492885514799832687.html` }),
  seed({ slug: "infinity-chamber-2026-11-21", title: "Infinity Chamber", starts_at: z("2026-11-21T22:00"), ends_at: z("2026-11-22T10:00"),
    description: "Main Floor. Hi-Tech Floor folgt.",
    lineup: ["Alyshka", "Dr Fractal", "Jumpstreet", "MoLunar", "Prodelic", "Tripadvisor"].map((name) => ({ name })),
    tickets: [{ id: "earlybird", label: "1x EarlyBird", price_chf: 30, sold_out: false }, { id: "regular", label: "1x Regular", price_chf: 35, sold_out: false }],
    flyer_path: "/flyers/infinity-chamber.jpg", flyer_alt: "Infinity Chamber" }),
  seed({ slug: "anyken-non-stop-2026-11-28", title: "Anyken – Non Stop", starts_at: z("2026-11-28T15:00"),
    flyer_path: "/flyers/anyken.webp", ticket_url: `${EF}/en/p/parties/trance-ambient/anyken-non-stop-7500268660654666784.html` }),
  seed({ slug: "explicit-xxl-2026-12-12", title: "Explicit XXL", starts_at: z("2026-12-12T22:00"),
    flyer_path: "/flyers/explicit.webp", ticket_url: `${EF}/en/p/parties/lgbtiq/explicit-xxl-7490778363960766773.html` }),
  seed({ slug: "utopia-kinky-x-mas-2026-12-19", title: "Utopia – Kinky X-Mas", starts_at: z("2026-12-19T21:00"),
    flyer_path: "/flyers/utopia.webp", ticket_url: `${EF}/en/p/parties/lgbtiq/utopia-kinky-x-mas-7483537080791864124.html` }),
  seed({ slug: "silvester-white-wolf-2026-12-31", title: "Silvester Remember Oldschool White Wolf infinity Edition", starts_at: z("2026-12-31T19:00"),
    flyer_path: "/flyers/silvester.webp", ticket_url: `${EF}/en/p/parties/house-techno/silvester-remember-oldschool-white-wolf-infinity-edition-7487250229298755623.html` }),
  seed({ slug: "mandora-move-poltergst-moedze-2027-01-30", title: "Mandora x Move infinity pres. POLTERGST & MØDZE", starts_at: z("2027-01-30T22:00"),
    lineup: [{ name: "POLTERGST" }, { name: "MØDZE" }],
    flyer_path: "/flyers/poltergst.webp", ticket_url: `${EF}/en/p/parties/house-techno/mandora-x-move-infinity-pres-poltergst-moedze-7465030820014642156.html` }),
];
