export interface MemberTier {
  id: "black" | "silver" | "gold";
  name: string;
  price_chf: number;
  perks: string[];
}

/** Stand: aktuelle Zinkbad-Website. Gültig 1 Jahr ab Kaufdatum. */
export const MEMBER_TIERS: MemberTier[] = [
  { id: "black", name: "Black", price_chf: 350, perks: ["Free Entry", "Special Private Events"] },
  { id: "silver", name: "Silver", price_chf: 550, perks: ["Alles aus Black", "VIP Entry", "Free Wardrobe Service"] },
  { id: "gold", name: "Gold", price_chf: 1000, perks: ["Alles aus Silver", "1 Fl. Prosecco / Event", "1 Guest", "VIP Lounge Access"] },
];
