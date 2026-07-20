import React, { useState, useEffect, useMemo, useRef } from "react";
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";

/* ---------------------------------------------------------------------
   SHARED DESIGN TOKENS
--------------------------------------------------------------------- */
const COLORS = {
  ink: "#0E1B22",
  inkSoft: "#152530",
  paper: "#F5F1E6",
  paperDim: "#E9E2D0",
  rust: "#C45A28",
  teal: "#3E7C74",
  gold: "#D69A3D",
  line: "#2A3B44",
};
const FONTS_LINK =
  "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap";
const MONO = "'IBM Plex Mono', monospace";
const SERIF = "'Fraunces', serif";

/* ---------------------------------------------------------------------
   SAMPLE DATA
--------------------------------------------------------------------- */
function inHours(h) {
  return new Date(Date.now() + h * 60 * 60 * 1000);
}
function inDays(d) {
  return new Date(Date.now() + d * 24 * 60 * 60 * 1000);
}
function formatDate(date) {
  return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function formatDateTime(date) {
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const CHARTERS = [
  {
    id: "c1",
    captain: "Capt. Mara Doyle",
    boat: "Silver Reel",
    location: "Destin, FL",
    zip: "32541",
    meetingPoint: "Harborwalk Marina, Dock C",
    species: ["Snapper", "Grouper"],
    type: "Offshore",
    departure: inHours(5.5),
    duration: "6 hrs",
    spotsLeft: 2,
    totalSpots: 6,
    price: 145,
    originalPrice: 220,
    rating: 4.9,
    reason: "Bachelor party cancelled",
    img: "linear-gradient(135deg,#1c3d4a,#0e1b22)",
    groupType: "shared",
    captainYears: 14,
    licensed: true,
    included: ["Rods & tackle", "Bait", "Ice & cooler", "Fish cleaning"],
    licenseNote: "No fishing license needed — covered by the charter",
    weatherNote: "Captain may reschedule for unsafe weather; you'll be notified as early as possible.",
    reviews: [
      { name: "Danielle R.", rating: 5, comment: "Landed a huge grouper, crew was awesome the whole trip." },
      { name: "Tom W.", rating: 5, comment: "Ran a little late getting out but worth the wait." },
    ],
  },
  {
    id: "c2",
    captain: "Capt. Ruben Ortiz",
    boat: "Tidewater",
    location: "Galveston, TX",
    zip: "77550",
    meetingPoint: "Pelican Rush Landing",
    species: ["Redfish", "Trout"],
    type: "Inshore",
    departure: inHours(2),
    duration: "4 hrs",
    spotsLeft: 1,
    totalSpots: 4,
    price: 90,
    originalPrice: 160,
    rating: 4.8,
    reason: "No-show",
    img: "linear-gradient(135deg,#274a3f,#0e1b22)",
    groupType: "shared",
    captainYears: 8,
    licensed: true,
    included: ["Rods & tackle", "Bait", "Ice & cooler"],
    licenseNote: "Texas fishing license required — sold at the marina if you don't have one",
    weatherNote: "Captain may reschedule for unsafe weather; you'll be notified as early as possible.",
    reviews: [
      { name: "Kayla M.", rating: 5, comment: "Redfish were everywhere, captain knew exactly where to go." },
    ],
  },
  {
    id: "c3",
    captain: "Capt. Elin Sorensen",
    boat: "North Star",
    location: "Green Bay, WI",
    zip: "54301",
    meetingPoint: "Bay Shore Public Launch",
    species: ["Walleye", "Perch"],
    type: "Lake",
    departure: inHours(20),
    duration: "5 hrs",
    spotsLeft: 3,
    totalSpots: 4,
    price: 110,
    originalPrice: 150,
    rating: 5.0,
    reason: "Weather rebooking",
    img: "linear-gradient(135deg,#2c3e50,#0e1b22)",
    groupType: "private",
    captainYears: 20,
    licensed: true,
    included: ["Rods & tackle", "Bait", "Ice & cooler", "Fish cleaning"],
    licenseNote: "Wisconsin fishing license required — bring your own",
    weatherNote: "Captain may reschedule for unsafe weather; you'll be notified as early as possible.",
    reviews: [
      { name: "Pete H.", rating: 5, comment: "20 years on the water shows — best walleye trip we've had." },
      { name: "Grace L.", rating: 5, comment: "Great with our kids, very patient and knowledgeable." },
    ],
  },
  {
    id: "c4",
    captain: "Capt. Joe Bellamy",
    boat: "Fly & Line",
    location: "Missoula, MT",
    zip: "59801",
    meetingPoint: "Clark Fork River Access",
    species: ["Trout"],
    type: "Fly",
    departure: inHours(30),
    duration: "8 hrs",
    spotsLeft: 0,
    totalSpots: 2,
    price: 210,
    originalPrice: 300,
    rating: 4.95,
    reason: "Party of 1 dropped",
    img: "linear-gradient(135deg,#3a4a3f,#0e1b22)",
    groupType: "private",
    captainYears: 11,
    licensed: true,
    included: ["Fly rods & flies", "Waders (if needed)", "Ice & cooler"],
    licenseNote: "Montana fishing license required — bring your own",
    weatherNote: "Captain may reschedule for unsafe weather; you'll be notified as early as possible.",
    reviews: [{ name: "Sam K.", rating: 5, comment: "Joe put me on fish all day, incredible local knowledge." }],
  },
];

const STANDARD_CHARTERS = [
  {
    id: "s1",
    captain: "Capt. Lena Osei",
    boat: "Blue Horizon",
    location: "Key West, FL",
    zip: "33040",
    meetingPoint: "Garrison Bight Marina",
    species: ["Mahi", "Tuna"],
    type: "Offshore",
    departure: inDays(6),
    duration: "7 hrs",
    spotsLeft: 4,
    totalSpots: 6,
    price: 195,
    rating: 4.85,
    img: "linear-gradient(135deg,#1c3d4a,#0e1b22)",
    groupType: "shared",
    captainYears: 9,
    licensed: true,
    included: ["Rods & tackle", "Bait", "Ice & cooler", "Fish cleaning"],
    licenseNote: "No fishing license needed — covered by the charter",
    weatherNote: "Captain may reschedule for unsafe weather; you'll be notified as early as possible.",
    reviews: [{ name: "Rachel B.", rating: 5, comment: "Mahi were biting all morning, great crew." }],
  },
  {
    id: "s2",
    captain: "Capt. Marcus Webb",
    boat: "Bayrunner",
    location: "Charleston, SC",
    zip: "29401",
    meetingPoint: "Shem Creek Dock",
    species: ["Redfish", "Flounder"],
    type: "Inshore",
    departure: inDays(3),
    duration: "4 hrs",
    spotsLeft: 3,
    totalSpots: 4,
    price: 120,
    rating: 4.7,
    img: "linear-gradient(135deg,#274a3f,#0e1b22)",
    groupType: "shared",
    captainYears: 6,
    licensed: true,
    included: ["Rods & tackle", "Bait", "Ice & cooler"],
    licenseNote: "South Carolina fishing license required — sold at the dock",
    weatherNote: "Captain may reschedule for unsafe weather; you'll be notified as early as possible.",
    reviews: [{ name: "Alex P.", rating: 4, comment: "Solid trip, caught a good number of redfish." }],
  },
  {
    id: "s3",
    captain: "Capt. Elin Sorensen",
    boat: "North Star",
    location: "Green Bay, WI",
    zip: "54301",
    meetingPoint: "Bay Shore Public Launch",
    species: ["Walleye", "Perch"],
    type: "Lake",
    departure: inDays(9),
    duration: "5 hrs",
    spotsLeft: 4,
    totalSpots: 4,
    price: 140,
    rating: 5.0,
    img: "linear-gradient(135deg,#2c3e50,#0e1b22)",
    groupType: "private",
    captainYears: 20,
    licensed: true,
    included: ["Rods & tackle", "Bait", "Ice & cooler", "Fish cleaning"],
    licenseNote: "Wisconsin fishing license required — bring your own",
    weatherNote: "Captain may reschedule for unsafe weather; you'll be notified as early as possible.",
    reviews: [{ name: "Pete H.", rating: 5, comment: "20 years on the water shows — best walleye trip we've had." }],
  },
];

// Whole-boat private charters — sold as one flat trip price with a guest cap,
// not per seat. Common for swordfishing and other dedicated-boat trips.
const PRIVATE_CHARTERS = [
  {
    id: "p1",
    saleType: "private",
    captain: "Capt. Nico Fuentes",
    boat: "Deep Drop",
    location: "Fort Lauderdale, FL",
    zip: "33301",
    meetingPoint: "Bahia Mar Marina",
    species: ["Swordfish"],
    type: "Offshore",
    departure: inDays(5),
    duration: "10 hrs (overnight)",
    maxGuests: 6,
    totalPrice: 1800,
    rating: 4.9,
    img: "linear-gradient(135deg,#1c2d3a,#0e1b22)",
    captainYears: 16,
    licensed: true,
    included: ["Rods & electric reels", "Bait & rigs", "Ice & cooler", "Fish cleaning"],
    licenseNote: "No fishing license needed — covered by the charter",
    weatherNote: "Captain may reschedule for unsafe weather; you'll be notified as early as possible.",
    reviews: [{ name: "Chris D.", rating: 5, comment: "Boated a 90lb swordfish overnight, unreal trip for the whole crew." }],
  },
  {
    id: "p2",
    saleType: "private",
    captain: "Capt. Renee Alvarez",
    boat: "Salt Life",
    location: "Islamorada, FL",
    zip: "33036",
    meetingPoint: "Whale Harbor Marina",
    species: ["Sailfish", "Mahi"],
    type: "Offshore",
    departure: inDays(11),
    duration: "8 hrs",
    maxGuests: 4,
    totalPrice: 1400,
    rating: 5.0,
    img: "linear-gradient(135deg,#2c3e50,#0e1b22)",
    captainYears: 12,
    licensed: true,
    included: ["Rods & tackle", "Bait", "Ice & cooler", "Fish cleaning"],
    licenseNote: "No fishing license needed — covered by the charter",
    weatherNote: "Captain may reschedule for unsafe weather; you'll be notified as early as possible.",
    reviews: [{ name: "Marissa T.", rating: 5, comment: "Private boat for our group was worth every penny." }],
  },
];

// Combined list across all listing types — used for cross-cutting features
// like matching a captain to their reviews regardless of listing type.
const ALL_CHARTERS = [...CHARTERS, ...STANDARD_CHARTERS, ...PRIVATE_CHARTERS];

// Rotating art for real captain-posted listings — there's no real photo
// upload for trip images yet (same limitation as the sample data's photo
// gallery), so this just gives each real listing a distinct-looking card.
const LISTING_GRADIENTS = [
  "linear-gradient(135deg,#1c3d4a,#0e1b22)",
  "linear-gradient(135deg,#274a3f,#0e1b22)",
  "linear-gradient(135deg,#2c3e50,#0e1b22)",
  "linear-gradient(135deg,#3a4a3f,#0e1b22)",
  "linear-gradient(135deg,#1c2d3a,#0e1b22)",
];
function gradientFor(id) {
  let hash = 0;
  for (let i = 0; i < (id || "").length; i++) hash = (hash * 31 + id.charCodeAt(i)) % LISTING_GRADIENTS.length;
  return LISTING_GRADIENTS[Math.abs(hash) % LISTING_GRADIENTS.length];
}

// Converts a real Firestore listing document into the same shape every
// existing card/detail/booking component already expects, so none of that
// UI needs to change to support real, captain-posted listings.
function listingToCharter(listing) {
  const isPrivate = listing.kind === "private";
  let departure;
  if (listing.kind === "cancellation" && listing.hours != null) {
    departure = new Date((listing.createdAt || Date.now()) + Number(listing.hours) * 3600000);
  } else if (listing.date) {
    departure = new Date(`${listing.date}T12:00:00`);
  } else {
    departure = new Date();
  }
  const spots = Number(listing.spots) || 1;
  const price = Number(listing.price) || 0;

  return {
    id: listing.id,
    isRealListing: true,
    captainUid: listing.captainUid,
    captain: listing.captainName,
    boat: listing.boat,
    location: listing.location,
    zip: listing.zip,
    meetingPoint: listing.meetingPoint,
    species: (listing.species || "").split(",").map((s) => s.trim()).filter(Boolean),
    type: listing.type || "Offshore",
    departure,
    duration: listing.duration || "—",
    spotsLeft: listing.spotsLeft != null ? listing.spotsLeft : spots,
    totalSpots: spots,
    maxGuests: spots,
    price: isPrivate ? undefined : price,
    totalPrice: isPrivate ? price : undefined,
    saleType: isPrivate ? "private" : undefined,
    rating: listing.rating || 5.0, // placeholder until real reviews are tied to real listings
    reason: listing.kind === "cancellation" ? "Recent cancellation" : undefined,
    groupType: listing.groupType,
    included: listing.included || [],
    licenseNote: listing.licenseNote,
    notes: listing.notes,
    img: gradientFor(listing.id),
    reviews: [],
  };
}

// Maps a known city name to a zip, so typing a city works the same way a
// zip does — an anchor point for "show me what's near this," not just an
// exact-text match. Built from the charters we actually have data for;
// a real city lookup (any city, not just ones we have listings in) needs
// a geocoding service once there's a backend.
const CITY_ZIPS = {};
ALL_CHARTERS.forEach((c) => {
  const city = c.location.split(",")[0].trim().toLowerCase();
  if (!CITY_ZIPS[city]) CITY_ZIPS[city] = c.zip;
});

// Simulated photo gallery. There's no real photo upload for trip images yet
// (that's tied to the captain photo-moderation feature, still pending), so
// this generates a few angle variants of the existing abstract art per
// charter — a real swipeable gallery UX, honestly not real photos.
function galleryFor(charter) {
  const base = charter.img;
  return [base, base.replace("135deg", "110deg"), base.replace("135deg", "160deg")];
}

const CATEGORIES = [
  { key: "All", icon: "⚓" },
  { key: "Offshore", icon: "🌊" },
  { key: "Inshore", icon: "🎣" },
  { key: "Lake", icon: "〰️" },
  { key: "Fly", icon: "🪰" },
];

const FOUNDING_CAP = 50;
const NEXT_CAP = 100;
const CAPTAINS_JOINED_SO_FAR = 41;

// Official Last Cast platform sponsors. A captain's fee discount only applies
// if the sponsor they claim is listed here — add real sponsors as deals close.
// Official Last Cast platform sponsors now live in shell state (see
// LastCastApp's `sponsors`), managed from the Admin dashboard, so real
// sponsor deals can be added without editing code.

// Founding Angler program: first 2,000 accounts get a badge + early access to
// new deals — no fee discount, so it costs nothing ongoing.
const ANGLER_FOUNDING_CAP = 2000;
const ANGLERS_JOINED_SO_FAR = 1148; // sample count for demo purposes

function tierFor(joinIndex, militaryStatus) {
  if (militaryStatus) return { pct: 5, label: "Military", locked: true };
  if (joinIndex <= FOUNDING_CAP) return { pct: 5, label: "Founding Captain" };
  if (joinIndex <= NEXT_CAP) return { pct: 10, label: "Early Captain" };
  return { pct: 15, label: "Standard" };
}

/* ---------------------------------------------------------------------
   COUNTDOWN
--------------------------------------------------------------------- */
function useCountdown(target) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000 * 30);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, target.getTime() - now);
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const urgent = diff < 1000 * 60 * 60 * 4;
  return { h, m, urgent, expired: diff <= 0 };
}

function CastRing({ target, size = 40 }) {
  const { h, m, urgent } = useCountdown(target);
  const pct = Math.max(0.06, Math.min(1, 1 - (h * 60 + m) / (48 * 60)));
  const r = size / 2 - 3;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={COLORS.line} strokeWidth="3" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={urgent ? COLORS.rust : COLORS.gold}
          strokeWidth="3"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function CountdownLabel({ target }) {
  const { h, m, urgent, expired } = useCountdown(target);
  if (expired) return <span style={{ color: COLORS.paperDim }}>Departed</span>;
  return (
    <span style={{ color: urgent ? COLORS.rust : COLORS.gold, fontWeight: 600 }}>
      {h > 0 ? `${h}h ${m}m` : `${m}m`} to cast off
    </span>
  );
}

function initials(name) {
  const clean = (name || "").replace(/^capt\.?\s*/i, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
}

function normalizeCaptainName(name) {
  return (name || "").replace(/^capt\.?\s*/i, "").trim().toLowerCase();
}

// Merges a charter's static sample reviews with any real reviews anglers
// submit during this session (stored in shell state, keyed by charter id).
function reviewsFor(charter, extraReviews) {
  return [...(charter.reviews || []), ...((extraReviews && extraReviews[charter.id]) || [])];
}

const AVATAR_PALETTE = [COLORS.rust, COLORS.teal, COLORS.gold, "#5C7C8A", "#8A5C6F"];
function avatarColorFor(name) {
  let hash = 0;
  for (let i = 0; i < (name || "").length; i++) hash = (hash * 31 + name.charCodeAt(i)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

// Shows the charter's captain persistently across every customer-facing page
// for that charter. Uses a real uploaded photo when one exists on the captain
// object (photoUrl); otherwise falls back to an initials avatar. Sample
// listings don't carry a real photo yet since captain accounts and listings
// aren't connected to a shared backend — this will pick up the real photo
// automatically once they are.
function CaptainStrip({ charter }) {
  const photoUrl = charter.captainPhoto || null;
  return (
    <div className="flex items-center gap-2.5 px-6 py-3" style={{ background: COLORS.inkSoft, borderBottom: `1px solid ${COLORS.line}` }}>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{ background: avatarColorFor(charter.captain) }}
      >
        {photoUrl ? (
          <img src={photoUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.ink, fontFamily: MONO }}>{initials(charter.captain)}</span>
        )}
      </div>
      <div className="min-w-0">
        <div className="truncate" style={{ color: COLORS.paper, fontSize: 12.5, fontWeight: 500 }}>{charter.captain}</div>
        <div className="truncate" style={{ color: COLORS.paperDim, fontSize: 10.5 }}>{charter.boat}</div>
      </div>
    </div>
  );
}

function PhotoGallery({ images, height = 224 }) {
  const [index, setIndex] = useState(0);
  const scrollerRef = useRef(null);

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setIndex(i);
  };

  return (
    <div className="relative" style={{ height }}>
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory h-full"
        style={{ scrollbarWidth: "none" }}
      >
        {images.map((bg, i) => (
          <div key={i} className="w-full flex-shrink-0 snap-start" style={{ background: bg, height }} />
        ))}
      </div>
      {images.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
          {images.map((_, i) => (
            <span
              key={i}
              className="rounded-full"
              style={{ width: i === index ? 16 : 6, height: 6, background: i === index ? COLORS.paper : "rgba(245,241,230,0.4)", transition: "width 0.2s" }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------
   SHARED BITS
--------------------------------------------------------------------- */
function Tag({ children, tone = "gold" }) {
  const bg = tone === "gold" ? COLORS.gold : tone === "rust" ? COLORS.rust : COLORS.teal;
  return (
    <span
      className="px-2 py-0.5 text-xs font-medium rounded-full"
      style={{ background: `${bg}22`, color: bg, border: `1px solid ${bg}55`, fontFamily: MONO }}
    >
      {children}
    </span>
  );
}

function PriceBlock({ price, originalPrice }) {
  const hasDiscount = originalPrice && originalPrice > price;
  const pctOff = hasDiscount ? Math.round((1 - price / originalPrice) * 100) : 0;
  return (
    <div className="flex items-baseline gap-2">
      <span style={{ fontFamily: MONO, color: COLORS.paper, fontSize: 20, fontWeight: 500 }}>${price}</span>
      {hasDiscount && (
        <>
          <span style={{ fontFamily: MONO, color: COLORS.paperDim, fontSize: 13, textDecoration: "line-through", opacity: 0.6 }}>
            ${originalPrice}
          </span>
          <span style={{ fontFamily: MONO, color: COLORS.rust, fontSize: 12, fontWeight: 600 }}>{pctOff}% off</span>
        </>
      )}
      {!hasDiscount && (
        <span style={{ fontFamily: MONO, color: COLORS.paperDim, fontSize: 12 }}>per seat</span>
      )}
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span style={{ color: COLORS.paperDim, fontSize: 12, fontFamily: MONO }}>{label}</span>
      <input
        {...props}
        className="rounded-xl px-4 py-3 text-sm outline-none"
        style={{ background: COLORS.paper, color: COLORS.ink }}
      />
    </label>
  );
}

function PrimaryButton({ children, disabled, ...props }) {
  return (
    <button
      disabled={disabled}
      {...props}
      className="rounded-full py-3.5 font-semibold text-sm w-full"
      style={{
        background: disabled ? COLORS.line : COLORS.rust,
        color: disabled ? COLORS.paperDim : COLORS.paper,
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {children}
    </button>
  );
}

function Header({ eyebrow, title, sub }) {
  return (
    <div className="mb-6">
      {eyebrow && (
        <div style={{ color: COLORS.gold, fontSize: 11, fontFamily: MONO, letterSpacing: 1, marginBottom: 6 }}>
          {eyebrow}
        </div>
      )}
      <h1 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 26, fontWeight: 600 }}>{title}</h1>
      {sub && <p style={{ color: COLORS.paperDim, fontSize: 14, marginTop: 6, lineHeight: 1.5 }}>{sub}</p>}
    </div>
  );
}

function BrandMark({ small }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="rounded-full flex items-center justify-center"
        style={{ width: small ? 28 : 32, height: small ? 28 : 32, background: COLORS.rust }}
      >
        <span style={{ fontSize: small ? 12 : 14 }}>⚓</span>
      </div>
      <span style={{ fontFamily: MONO, color: COLORS.paperDim, fontSize: 12, letterSpacing: 1 }}>LAST CAST</span>
    </div>
  );
}

// Shared by both anglers and captains — shown right after sign-up, or on
// login if the account still hasn't verified its email. Uses Firebase's
// real email verification, not a simulated one.
function EmailVerifyScreen({ email, onVerified, onBack }) {
  const [sent, setSent] = useState(true); // Firebase already sent one on signup/login
  const [checking, setChecking] = useState(false);
  const [notYet, setNotYet] = useState(false);

  const handleResend = async () => {
    try {
      if (auth.currentUser) await sendEmailVerification(auth.currentUser);
      setSent(true);
      setNotYet(false);
    } catch (err) {
      console.error("Failed to resend verification email:", err);
    }
  };

  const handleCheck = async () => {
    setChecking(true);
    setNotYet(false);
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        onVerified();
      } else {
        setNotYet(true);
      }
    } catch (err) {
      console.error("Failed to check verification status:", err);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="px-6 pt-10 pb-10 flex flex-col items-center text-center">
      <button onClick={onBack} style={{ color: COLORS.paperDim, fontSize: 14, alignSelf: "flex-start" }} className="mb-6">
        ← Back
      </button>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: `${COLORS.gold}22`, border: `1px solid ${COLORS.gold}` }}>
        <span style={{ fontSize: 26 }}>✉️</span>
      </div>
      <h1 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 22, fontWeight: 600 }}>Verify your email</h1>
      <p style={{ color: COLORS.paperDim, fontSize: 14, marginTop: 8, lineHeight: 1.6, maxWidth: 320 }}>
        We sent a real verification link to <b style={{ color: COLORS.paper }}>{email}</b>. Click it, then come back
        here.
      </p>
      {notYet && (
        <p style={{ color: COLORS.rust, fontSize: 12.5, marginTop: 10 }}>
          Still not verified — check your inbox (and spam folder), then try again.
        </p>
      )}
      <div className="mt-8 w-full flex flex-col gap-3">
        <PrimaryButton disabled={checking} onClick={handleCheck}>
          {checking ? "Checking..." : "I've verified — continue →"}
        </PrimaryButton>
        <button onClick={handleResend} style={{ color: COLORS.teal, fontSize: 13 }}>
          {sent ? "Resend verification email" : "Send verification email"}
        </button>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-11 h-6 rounded-full flex-shrink-0 relative transition"
      style={{ background: checked ? COLORS.teal : COLORS.line }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full transition"
        style={{ left: checked ? 22 : 2, background: COLORS.paper }}
      />
    </button>
  );
}

function AvatarUpload({ photoUrl, onChange, fallback, size = 88 }) {
  const inputRef = useRef(null);
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  };
  return (
    <div className="flex items-center gap-4">
      <div
        onClick={() => inputRef.current?.click()}
        className="rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer relative overflow-hidden"
        style={{ width: size, height: size, background: COLORS.inkSoft, border: `1.5px dashed ${COLORS.line}` }}
      >
        {photoUrl ? (
          <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span style={{ fontSize: size * 0.4 }}>{fallback}</span>
        )}
      </div>
      <div>
        <button
          onClick={() => inputRef.current?.click()}
          className="px-3.5 py-2 rounded-full text-xs font-semibold"
          style={{ background: COLORS.teal, color: COLORS.ink }}
        >
          {photoUrl ? "Change photo" : "Upload photo"}
        </button>
        <p style={{ color: COLORS.paperDim, fontSize: 11, marginTop: 6, lineHeight: 1.4 }}>JPG or PNG, saved on this device.</p>
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </div>
  );
}

// Simulated ID.me verification. A real integration redirects to ID.me's own
// OAuth flow and requires a backend to receive and store the verified
// credential — that doesn't exist yet, so this mimics the outcome (picking a
// status, confirming) without a real identity check behind it.
function VeteranVerification({ status, onVerify, onRemove }) {
  const [picking, setPicking] = useState(false);
  const [choice, setChoice] = useState("veteran");

  if (status) {
    const label = { active: "Active Duty", reserve: "Reserve", veteran: "Veteran" }[status];
    return (
      <div className="rounded-2xl p-4" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.gold}55` }}>
        <div className="flex items-center justify-between">
          <span style={{ color: COLORS.gold, fontSize: 12, fontFamily: MONO, letterSpacing: 0.5 }}>✓ VERIFIED · {label.toUpperCase()}</span>
          <button onClick={onRemove} style={{ color: COLORS.paperDim, fontSize: 11.5 }}>Remove</button>
        </div>
        <p style={{ color: COLORS.paperDim, fontSize: 12, marginTop: 6, lineHeight: 1.4 }}>Verified with ID.me.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
      <div style={{ color: COLORS.paperDim, fontSize: 12, fontFamily: MONO, letterSpacing: 0.5 }}>MILITARY VERIFICATION</div>
      <p style={{ color: COLORS.paperDim, fontSize: 12, marginTop: 6, lineHeight: 1.4 }}>
        Verify with ID.me as active duty, reserve, or a veteran to get a "Thank you for your service" badge on your
        home screen.
      </p>

      {!picking ? (
        <button
          onClick={() => setPicking(true)}
          className="mt-3 px-4 py-2 rounded-full text-xs font-semibold"
          style={{ background: COLORS.gold, color: COLORS.ink }}
        >
          Verify with ID.me
        </button>
      ) : (
        <div className="mt-3">
          <div className="flex rounded-full p-1 mb-3" style={{ background: COLORS.ink, border: `1px solid ${COLORS.line}` }}>
            {[
              { key: "active", label: "Active Duty" },
              { key: "reserve", label: "Reserve" },
              { key: "veteran", label: "Veteran" },
            ].map((o) => {
              const active = choice === o.key;
              return (
                <button
                  key={o.key}
                  onClick={() => setChoice(o.key)}
                  className="flex-1 py-2 rounded-full text-xs font-medium transition"
                  style={{ background: active ? COLORS.gold : "transparent", color: active ? COLORS.ink : COLORS.paperDim }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
          <p style={{ color: COLORS.paperDim, fontSize: 11, marginBottom: 8, opacity: 0.75, lineHeight: 1.4 }}>
            Simulated for this prototype — a real integration hands off to ID.me's own verification flow.
          </p>
          <button
            onClick={() => onVerify(choice)}
            className="w-full py-2.5 rounded-full text-xs font-semibold"
            style={{ background: COLORS.gold, color: COLORS.ink }}
          >
            Confirm verification
          </button>
        </div>
      )}
    </div>
  );
}

function ServiceBanner() {
  return (
    <div
      className="rounded-2xl px-4 py-3 flex items-center gap-2.5 mb-5"
      style={{ background: `${COLORS.gold}18`, border: `1px solid ${COLORS.gold}55` }}
    >
      <span style={{ fontSize: 18 }}>🎖️</span>
      <span style={{ color: COLORS.gold, fontSize: 13, fontWeight: 600 }}>Thank you for your service.</span>
    </div>
  );
}

/* ---------------------------------------------------------------------
   SHARED: SETTINGS (used by both anglers and captains)
--------------------------------------------------------------------- */
function SettingsScreen({ title, fields, onSave, onLogout, onBack, onDeleteAccount, deleteLabel, showLicense, licenseFileName, onUploadLicense }) {
  const [tab, setTab] = useState("profile"); // "profile" or "privacy"
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((f) => [f.key, f.value || ""])));
  const [saved, setSaved] = useState(false);
  const set = (k) => (e) => {
    setValues({ ...values, [k]: e.target.value });
    setSaved(false);
  };

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwSaved, setPwSaved] = useState(false);
  const setPwField = (k) => (e) => {
    setPw({ ...pw, [k]: e.target.value });
    setPwSaved(false);
  };
  const pwValid = pw.current.length >= 4 && pw.next.length >= 4 && pw.next === pw.confirm;

  const [emailUpdates, setEmailUpdates] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);

  return (
    <div className="px-6 pt-6 pb-14">
      <button onClick={onBack} style={{ color: COLORS.paperDim, fontSize: 14 }} className="mb-4">
        ← Back
      </button>
      <Header title={title} />

      <div className="flex mb-6 rounded-full p-1" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
        {[
          { key: "profile", label: "Profile" },
          { key: "privacy", label: "Privacy" },
        ].map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex-1 py-2 rounded-full text-sm font-medium transition"
              style={{ background: active ? COLORS.rust : "transparent", color: active ? COLORS.paper : COLORS.paperDim }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "profile" && (
        <div className="flex flex-col gap-4">
          {fields.map((f) => (
            <Field key={f.key} label={f.label} value={values[f.key]} onChange={set(f.key)} />
          ))}
          <PrimaryButton
            onClick={() => {
              onSave(values);
              setSaved(true);
            }}
          >
            {saved ? "Saved ✓" : "Save changes"}
          </PrimaryButton>

          {showLicense && (
            <div className="mt-3">
              <h3 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Fishing license</h3>
              <p style={{ color: COLORS.paperDim, fontSize: 11.5, marginBottom: 10, lineHeight: 1.4 }}>
                Optional, but it's automatically attached at checkout on any charter you pay for — whether or not
                that charter requires proof, so there's nothing to dig up at the dock.
              </p>
              <div
                className="rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-2 cursor-pointer"
                style={{ background: COLORS.inkSoft, border: `1.5px dashed ${COLORS.line}` }}
                onClick={() => onUploadLicense("fishing_license_scan.pdf")}
              >
                <span style={{ fontSize: 20 }}>📄</span>
                <span style={{ color: COLORS.paper, fontSize: 13.5, fontWeight: 500 }}>
                  {licenseFileName ? licenseFileName : "Tap to upload or update your license"}
                </span>
                <span style={{ color: COLORS.paperDim, fontSize: 11.5 }}>PDF or photo, under 10MB</span>
                {licenseFileName && <span style={{ color: COLORS.teal, fontSize: 11.5, marginTop: 2 }}>✓ On file</span>}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "privacy" && (
        <div>
          <h3 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Change password</h3>
          <div className="flex flex-col gap-4 mb-7">
            <Field label="CURRENT PASSWORD" type="password" value={pw.current} onChange={setPwField("current")} placeholder="••••••••" />
            <Field label="NEW PASSWORD" type="password" value={pw.next} onChange={setPwField("next")} placeholder="••••••••" />
            <Field label="CONFIRM NEW PASSWORD" type="password" value={pw.confirm} onChange={setPwField("confirm")} placeholder="••••••••" />
            <PrimaryButton disabled={!pwValid} onClick={() => setPwSaved(true)}>
              {pwSaved ? "Password updated ✓" : "Update password"}
            </PrimaryButton>
          </div>

          <h3 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Notifications</h3>
          <div className="flex flex-col gap-3 mb-7">
            <div className="flex items-center justify-between rounded-2xl p-3.5" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
              <div>
                <div style={{ color: COLORS.paper, fontSize: 13.5 }}>Email updates</div>
                <div style={{ color: COLORS.paperDim, fontSize: 11.5, marginTop: 1 }}>Booking confirmations and receipts</div>
              </div>
              <Toggle checked={emailUpdates} onChange={setEmailUpdates} />
            </div>
            <div className="flex items-center justify-between rounded-2xl p-3.5" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
              <div>
                <div style={{ color: COLORS.paper, fontSize: 13.5 }}>Text alerts</div>
                <div style={{ color: COLORS.paperDim, fontSize: 11.5, marginTop: 1 }}>Last-minute deals and booking activity</div>
              </div>
              <Toggle checked={smsAlerts} onChange={setSmsAlerts} />
            </div>
            <p style={{ color: COLORS.paperDim, fontSize: 11, opacity: 0.7, lineHeight: 1.4 }}>
              Password changes and preferences are saved on this device only — real security and delivery go live
              once the backend is connected.
            </p>
          </div>

          <button onClick={onLogout} className="w-full py-3 rounded-full text-sm font-medium mb-3" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.paperDim }}>
            Log out
          </button>
          {onDeleteAccount && (
            <button
              onClick={() => {
                if (window.confirm("Delete your account? This can't be undone.")) onDeleteAccount();
              }}
              className="w-full py-3 rounded-full text-sm font-medium"
              style={{ border: `1px solid ${COLORS.rust}`, color: COLORS.rust }}
            >
              {deleteLabel || "Delete account"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------
   CUSTOMER: HOME
--------------------------------------------------------------------- */
function FavHeart({ active, onToggle, size = 15 }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: "rgba(14,27,34,0.55)" }}
    >
      <span style={{ color: active ? COLORS.rust : COLORS.paper, fontSize: size }}>{active ? "♥" : "♡"}</span>
    </button>
  );
}

function BrowseListingCard({ c, onSelect, isFavorited, onToggleFavorite }) {
  return (
    <button
      onClick={() => onSelect(c)}
      className="flex gap-3 rounded-2xl p-3 text-left items-center"
      style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}
    >
      <div className="w-20 h-20 rounded-xl flex-shrink-0 relative" style={{ background: c.img }}>
        <div className="absolute top-1.5 right-1.5">
          <FavHeart active={isFavorited} onToggle={onToggleFavorite} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span style={{ color: COLORS.paper, fontWeight: 600, fontSize: 14 }}>{c.boat}</span>
          <span style={{ color: COLORS.gold, fontSize: 12 }}>★ {c.rating}</span>
        </div>
        <div style={{ color: COLORS.paperDim, fontSize: 12, marginTop: 1 }}>
          {c.captain} · {c.location}
        </div>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {c.species.map((s) => (
            <Tag key={s} tone="teal">{s}</Tag>
          ))}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <PriceBlock price={c.price} originalPrice={c.originalPrice} />
        <div style={{ fontSize: 11, marginTop: 4, color: COLORS.gold, fontFamily: MONO }}>{formatDateTime(c.departure)}</div>
        <div style={{ fontSize: 10.5, marginTop: 2, color: COLORS.paperDim }}>{c.spotsLeft} seats left</div>
      </div>
    </button>
  );
}

function PrivateCharterCard({ c, onSelect, isFavorited, onToggleFavorite }) {
  return (
    <button
      onClick={() => onSelect(c)}
      className="flex flex-col gap-3 rounded-2xl p-3 text-left"
      style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}
    >
      <div className="flex gap-3">
        <div className="w-16 h-16 rounded-xl flex-shrink-0 relative" style={{ background: c.img }}>
          <div className="absolute top-1 right-1">
            <FavHeart active={isFavorited} onToggle={onToggleFavorite} size={13} />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate" style={{ color: COLORS.paper, fontWeight: 600, fontSize: 14 }}>{c.boat}</span>
            <span className="flex-shrink-0" style={{ color: COLORS.gold, fontSize: 12 }}>★ {c.rating}</span>
          </div>
          <div className="truncate" style={{ color: COLORS.paperDim, fontSize: 12, marginTop: 1 }}>
            {c.captain} · {c.location}
          </div>
          <div className="flex gap-1 mt-1.5 flex-wrap">
            {c.species.map((s) => (
              <Tag key={s} tone="teal">{s}</Tag>
            ))}
            <Tag tone="gold">Up to {c.maxGuests} guests</Tag>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-2" style={{ borderTop: `1px solid ${COLORS.line}` }}>
        <div>
          <span style={{ fontFamily: MONO, color: COLORS.paper, fontSize: 18, fontWeight: 500 }}>${c.totalPrice}</span>
          <span style={{ color: COLORS.paperDim, fontSize: 11, marginLeft: 5 }}>total trip</span>
        </div>
        <span style={{ fontSize: 11.5, color: COLORS.gold, fontFamily: MONO }}>{formatDateTime(c.departure)}</span>
      </div>
    </button>
  );
}

function Home({ onSelect, onCaptainPortal, onAccount, angler, favoriteIds, onToggleFavorite, onSearch, realCharters }) {
  const [tab, setTab] = useState("deals"); // "deals" | "browse" | "private" | "saved"
  const [category, setCategory] = useState("All");
  const [searchDraft, setSearchDraft] = useState("");
  const [nearMe, setNearMe] = useState(false);
  const [sortMode, setSortMode] = useState("default"); // "default" | "priceLow" | "priceHigh"

  // Real, captain-posted listings merge right in alongside the sample data —
  // a real cancellation shows up on Deals, a real open trip on Browse, a
  // real whole-boat charter on Private, same as the demo listings always did.
  const realCancellations = realCharters.filter((c) => c.reason);
  const realOpenTrips = realCharters.filter((c) => !c.reason && c.saleType !== "private");
  const realPrivateCharters = realCharters.filter((c) => c.saleType === "private");
  const allCombined = [...CHARTERS, ...realCancellations, ...STANDARD_CHARTERS, ...realOpenTrips, ...PRIVATE_CHARTERS, ...realPrivateCharters];

  const source =
    tab === "deals" ? [...CHARTERS, ...realCancellations]
    : tab === "browse" ? [...STANDARD_CHARTERS, ...realOpenTrips]
    : tab === "private" ? [...PRIVATE_CHARTERS, ...realPrivateCharters]
    : allCombined.filter((c) => favoriteIds.includes(c.id));

  // Category still filters the current tab live. Text search does NOT —
  // it only takes effect on Enter, jumping to a separate results page, so
  // typing never changes what's shown on the Home tab itself.
  const filtered = useMemo(() => {
    return source.filter((c) => category === "All" || c.type === category);
  }, [source, category]);

  const priceOf = (c) => (c.saleType === "private" ? c.totalPrice : c.price);

  const sortedFiltered = useMemo(() => {
    let list = filtered;
    if (nearMe && angler?.zip) {
      list = [...list].sort(
        (a, b) => Math.abs(Number(a.zip) - Number(angler.zip)) - Math.abs(Number(b.zip) - Number(angler.zip))
      );
    }
    if (sortMode === "priceLow") list = [...list].sort((a, b) => priceOf(a) - priceOf(b));
    if (sortMode === "priceHigh") list = [...list].sort((a, b) => priceOf(b) - priceOf(a));
    return list;
  }, [filtered, nearMe, angler?.zip, sortMode]);

  const urgentDeals = [...filtered].sort((a, b) => a.departure - b.departure).slice(0, 3);

  return (
    <div>
      <div className="relative px-6 pt-8 pb-8" style={{ background: `radial-gradient(120% 100% at 20% 0%, #1c3540 0%, ${COLORS.ink} 60%)` }}>
        <div className="flex items-center justify-between mb-6">
          <BrandMark />
          <div className="flex items-center gap-2">
            <button
              onClick={onAccount}
              className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5"
              style={{ border: `1px solid ${COLORS.line}`, color: COLORS.paperDim }}
            >
              {angler?.photoUrl ? (
                <img src={angler.photoUrl} alt="" className="w-4 h-4 rounded-full object-cover" />
              ) : angler ? (
                <span>{angler.joinIndex <= ANGLER_FOUNDING_CAP ? "⭐" : "👤"}</span>
              ) : (
                <span>👤</span>
              )}
              {angler ? angler.name.split(" ")[0] : "Account"}
            </button>
            <button
              onClick={onCaptainPortal}
              className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5"
              style={{ border: `1px solid ${COLORS.line}`, color: COLORS.paperDim }}
            >
              ⚓ Captain login
            </button>
          </div>
        </div>

        {angler?.militaryStatus && <ServiceBanner />}

        <h1 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 38, lineHeight: 1.05, color: COLORS.paper, letterSpacing: -0.5 }}>
          Somebody's seat
          <br />
          just opened up.
        </h1>
        <p style={{ color: COLORS.paperDim, marginTop: 10, fontSize: 15 }}>
          Real captains, real cancellations, seats at half price — before the clock runs out.
        </p>

        <div className="mt-6 flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: COLORS.paper }}>
          <span style={{ opacity: 0.5 }}>⌕</span>
          <input
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchDraft.trim()) {
                onSearch(searchDraft.trim());
              }
            }}
            placeholder="Search by location or species... (press Enter)"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: COLORS.ink }}
          />
        </div>

        <div className="flex gap-1.5 mt-5 overflow-x-auto pb-0.5">
          {[
            { key: "deals", label: "⏱ Deals" },
            { key: "browse", label: "Browse" },
            { key: "private", label: "Private" },
            { key: "saved", label: `♥ Saved${favoriteIds.length ? ` (${favoriteIds.length})` : ""}` },
          ].map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="px-3.5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition"
                style={{
                  background: active ? COLORS.rust : COLORS.inkSoft,
                  border: `1px solid ${active ? COLORS.rust : COLORS.line}`,
                  color: active ? COLORS.paper : COLORS.paperDim,
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => {
            const active = category === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className="px-3.5 py-2 rounded-full text-sm whitespace-nowrap flex items-center gap-1.5 transition"
                style={{
                  background: active ? COLORS.rust : "transparent",
                  border: `1px solid ${active ? COLORS.rust : COLORS.line}`,
                  color: active ? COLORS.paper : COLORS.paperDim,
                }}
              >
                <span>{c.icon}</span>
                {c.key}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 mt-3 flex-wrap">
          {angler?.zip && (
            <button
              onClick={() => setNearMe((v) => !v)}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5"
              style={{
                background: nearMe ? COLORS.teal : "transparent",
                border: `1px solid ${nearMe ? COLORS.teal : COLORS.line}`,
                color: nearMe ? COLORS.ink : COLORS.paperDim,
              }}
            >
              📍 {nearMe ? "Sorted near you" : "Sort near me"}
            </button>
          )}
        </div>
      </div>

      {tab === "deals" && (
        <div className="px-6 pt-6" style={{ background: COLORS.ink }}>
          <div className="flex items-center justify-between mb-3">
            <h2 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 19, fontWeight: 600 }}>Casting off soonest</h2>
            <span style={{ fontFamily: MONO, fontSize: 11, color: COLORS.paperDim }}>
              {urgentDeals.length} deal{urgentDeals.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 -mx-6 px-6">
            {urgentDeals.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(c)}
                className="min-w-[230px] text-left rounded-2xl overflow-hidden flex-shrink-0"
                style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}
              >
                <div className="h-24 relative" style={{ background: c.img }}>
                  <div className="absolute top-2 left-2">
                    <Tag tone="rust">{c.reason}</Tag>
                  </div>
                  <div className="absolute top-2 right-2">
                    <CastRing target={c.departure} size={34} />
                  </div>
                </div>
                <div className="p-3">
                  <div style={{ color: COLORS.paper, fontWeight: 600, fontSize: 14 }}>{c.boat}</div>
                  <div style={{ color: COLORS.paperDim, fontSize: 12, marginTop: 2 }}>{c.location}</div>
                  <div className="mt-2 text-xs">
                    <CountdownLabel target={c.departure} />
                  </div>
                  <div style={{ fontSize: 10.5, color: COLORS.paperDim, marginTop: 2, fontFamily: MONO }}>
                    {formatDateTime(c.departure)}
                  </div>
                  <div className="mt-2">
                    <PriceBlock price={c.price} originalPrice={c.originalPrice} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="px-6 pt-2 pb-10" style={{ background: COLORS.ink }}>
        <h2 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 19, fontWeight: 600, marginBottom: 8 }}>
          {tab === "deals" ? "All open seats" : tab === "browse" ? "Upcoming charters" : tab === "private" ? "Whole-boat charters" : "Your saved charters"}
        </h2>
        <select
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value)}
          className="px-3 py-1.5 rounded-full text-xs font-medium outline-none mb-3"
          style={{ background: "transparent", border: `1px solid ${COLORS.line}`, color: COLORS.paperDim }}
        >
          <option value="default" style={{ color: COLORS.ink }}>Sort: Default</option>
          <option value="priceLow" style={{ color: COLORS.ink }}>Price: Low to High</option>
          <option value="priceHigh" style={{ color: COLORS.ink }}>Price: High to Low</option>
        </select>
        <div className="flex flex-col gap-3">
          {sortedFiltered.length === 0 && (
            <div style={{ color: COLORS.paperDim, fontSize: 14 }}>
              {tab === "deals"
                ? "No open seats match that search right now — try another spot or species."
                : tab === "browse"
                ? "No upcoming charters match that search — try another spot or species."
                : tab === "private"
                ? "No private charters match that search — try another spot or species."
                : "Nothing saved yet — tap the ♥ on any charter to add it here."}
            </div>
          )}
          {tab === "deals" &&
            sortedFiltered.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(c)}
                className="flex gap-3 rounded-2xl p-3 text-left items-center"
                style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}
              >
                <div className="w-20 h-20 rounded-xl flex-shrink-0 relative" style={{ background: c.img }}>
                  <div className="absolute top-1.5 right-1.5">
                    <FavHeart active={favoriteIds.includes(c.id)} onToggle={() => onToggleFavorite(c.id)} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span style={{ color: COLORS.paper, fontWeight: 600, fontSize: 14 }}>{c.boat}</span>
                    <span style={{ color: COLORS.gold, fontSize: 12 }}>★ {c.rating}</span>
                  </div>
                  <div style={{ color: COLORS.paperDim, fontSize: 12, marginTop: 1 }}>
                    {c.captain} · {c.location}
                  </div>
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {c.species.map((s) => (
                      <Tag key={s} tone="teal">{s}</Tag>
                    ))}
                    <Tag tone="rust">{c.spotsLeft > 0 ? `${c.spotsLeft} left` : "Sold out"}</Tag>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <PriceBlock price={c.price} originalPrice={c.originalPrice} />
                  <div style={{ fontSize: 11, marginTop: 4 }}>
                    <CountdownLabel target={c.departure} />
                  </div>
                  <div style={{ fontSize: 10.5, marginTop: 2, color: COLORS.paperDim, fontFamily: MONO }}>
                    {formatDateTime(c.departure)}
                  </div>
                </div>
              </button>
            ))}
          {tab === "browse" &&
            sortedFiltered.map((c) => (
              <BrowseListingCard key={c.id} c={c} onSelect={onSelect} isFavorited={favoriteIds.includes(c.id)} onToggleFavorite={() => onToggleFavorite(c.id)} />
            ))}
          {tab === "private" &&
            sortedFiltered.map((c) => (
              <PrivateCharterCard key={c.id} c={c} onSelect={onSelect} isFavorited={favoriteIds.includes(c.id)} onToggleFavorite={() => onToggleFavorite(c.id)} />
            ))}
          {tab === "saved" &&
            sortedFiltered.map((c) =>
              c.saleType === "private" ? (
                <PrivateCharterCard key={c.id} c={c} onSelect={onSelect} isFavorited onToggleFavorite={() => onToggleFavorite(c.id)} />
              ) : (
                <BrowseListingCard key={c.id} c={c} onSelect={onSelect} isFavorited onToggleFavorite={() => onToggleFavorite(c.id)} />
              )
            )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   CUSTOMER: SEARCH RESULTS (separate page, only reached by pressing Enter)
--------------------------------------------------------------------- */
const RADIUS_OPTIONS = [
  { key: "any", label: "Any distance", maxZipDiff: Infinity },
  { key: "10", label: "Within 10 miles", maxZipDiff: 15 },
  { key: "25", label: "Within 25 miles", maxZipDiff: 40 },
  { key: "50", label: "Within 50 miles", maxZipDiff: 80 },
  { key: "100", label: "Within 100 miles", maxZipDiff: 150 },
  { key: "250", label: "Within 250 miles", maxZipDiff: 400 },
];

function SearchResultsPage({ initialQuery, onSelect, onBack, favoriteIds, onToggleFavorite, angler, realCharters }) {
  const [query, setQuery] = useState(initialQuery);
  const [submitted, setSubmitted] = useState(initialQuery);
  const [radius, setRadius] = useState("any");
  const searchPool = useMemo(() => [...ALL_CHARTERS, ...realCharters], [realCharters]);

  // A typed 5-digit zip, or a recognized city name, becomes the distance
  // anchor; otherwise fall back to the logged-in angler's own zip, if any.
  const q = submitted.trim().toLowerCase();
  const isZipQuery = /^\d{5}$/.test(submitted.trim());
  const matchedCity = !isZipQuery && q ? Object.keys(CITY_ZIPS).find((city) => city.includes(q) || q.includes(city)) : null;
  const isProximityQuery = isZipQuery || Boolean(matchedCity);
  const baseZip = isZipQuery ? submitted.trim() : matchedCity ? CITY_ZIPS[matchedCity] : angler?.zip;

  // A zip or recognized-city search looks at every charter by proximity,
  // not by text match — it's "find what's near this," not a substring search.
  const candidatePool = useMemo(() => {
    if (isProximityQuery) return searchPool;
    if (!q) return [];
    return searchPool.filter(
      (c) =>
        c.location.toLowerCase().includes(q) ||
        c.species.some((s) => s.toLowerCase().includes(q)) ||
        c.boat.toLowerCase().includes(q)
    );
  }, [submitted, isProximityQuery, searchPool]);

  const results = useMemo(() => {
    let list = candidatePool;
    if (baseZip) {
      // sort nearest-first whenever we have a zip to anchor on
      list = [...list].sort(
        (a, b) => Math.abs(Number(a.zip) - Number(baseZip)) - Math.abs(Number(b.zip) - Number(baseZip))
      );
      const opt = RADIUS_OPTIONS.find((r) => r.key === radius);
      if (opt && opt.key !== "any") {
        list = list.filter((c) => c.zip && Math.abs(Number(c.zip) - Number(baseZip)) <= opt.maxZipDiff);
      }
    }
    return list;
  }, [candidatePool, radius, baseZip]);

  return (
    <div className="px-6 pt-6 pb-14" style={{ background: COLORS.ink, minHeight: "100%" }}>
      <button onClick={onBack} style={{ color: COLORS.paperDim, fontSize: 14 }} className="mb-4">
        ← Back to app
      </button>

      <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-2" style={{ background: COLORS.paper }}>
        <span style={{ opacity: 0.5 }}>⌕</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && query.trim()) setSubmitted(query.trim());
          }}
          placeholder="Search by location, species, boat, or zip..."
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: COLORS.ink }}
          autoFocus
        />
      </div>

      <select
        value={radius}
        onChange={(e) => setRadius(e.target.value)}
        disabled={!baseZip}
        className="px-3 py-1.5 rounded-full text-xs font-medium outline-none mb-2"
        style={{ background: "transparent", border: `1px solid ${COLORS.line}`, color: baseZip ? COLORS.paperDim : `${COLORS.paperDim}66` }}
      >
        {RADIUS_OPTIONS.map((r) => (
          <option key={r.key} value={r.key} style={{ color: COLORS.ink }}>
            {r.label}
          </option>
        ))}
      </select>
      {!baseZip && (
        <p style={{ color: COLORS.paperDim, fontSize: 10.5, marginBottom: 10, opacity: 0.7 }}>
          Search a zip code or city, or log in with a zip on file, to filter by distance.
        </p>
      )}
      {baseZip && (
        <p style={{ color: COLORS.paperDim, fontSize: 10.5, marginBottom: 10, opacity: 0.7 }}>
          Distance from {isZipQuery ? baseZip : matchedCity ? submitted : "your zip"} is an estimate based on zip codes, not exact mileage.
        </p>
      )}

      <p style={{ color: COLORS.paperDim, fontSize: 12, marginBottom: 16 }}>
        {results.length} result{results.length !== 1 ? "s" : ""} for "{submitted}"
      </p>

      <div className="flex flex-col gap-3">
        {results.length === 0 && (
          <p style={{ color: COLORS.paperDim, fontSize: 14 }}>No charters match that search — try a different spot, species, boat name, or zip.</p>
        )}
        {results.map((c) =>
          c.saleType === "private" ? (
            <PrivateCharterCard key={c.id} c={c} onSelect={onSelect} isFavorited={favoriteIds.includes(c.id)} onToggleFavorite={() => onToggleFavorite(c.id)} />
          ) : (
            <BrowseListingCard key={c.id} c={c} onSelect={onSelect} isFavorited={favoriteIds.includes(c.id)} onToggleFavorite={() => onToggleFavorite(c.id)} />
          )
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   CUSTOMER: DETAIL
--------------------------------------------------------------------- */
function Detail({ charter, onBack, onBook, onViewReviews, extraReviews, isFavorited, onToggleFavorite }) {
  const allReviews = reviewsFor(charter, extraReviews);
  const reviewCount = allReviews.length;
  const [selectedDeparture, setSelectedDeparture] = useState(charter.departure);
  const hasCalendar = !charter.reason; // deals are single-instance urgent slots, no calendar needed
  const dateOptions = hasCalendar
    ? [0, 7, 14, 21].map((d) => new Date(charter.departure.getTime() + d * 24 * 60 * 60 * 1000))
    : [];
  return (
    <div style={{ background: COLORS.ink, minHeight: "100%" }}>
      <div className="relative">
        <PhotoGallery images={galleryFor(charter)} height={224} />
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(14,27,34,0.6)", color: COLORS.paper, backdropFilter: "blur(4px)" }}
        >
          ←
        </button>
        <button
          onClick={onToggleFavorite}
          className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(14,27,34,0.6)", backdropFilter: "blur(4px)" }}
        >
          <span style={{ color: isFavorited ? COLORS.rust : COLORS.paper, fontSize: 16 }}>{isFavorited ? "♥" : "♡"}</span>
        </button>
        {charter.reason && (
          <div className="absolute top-4 left-16">
            <Tag tone="rust">{charter.reason}</Tag>
          </div>
        )}
      </div>
      <CaptainStrip charter={charter} />

      <div className="px-6 pt-5 pb-28">
        <h1 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 26, fontWeight: 600 }}>{charter.boat}</h1>
        {reviewCount > 0 ? (
          <button onClick={onViewReviews} className="flex items-center gap-1" style={{ marginTop: 2 }}>
            <span style={{ color: COLORS.paperDim, fontSize: 14 }}>
              {charter.captain} · {charter.location} · ★ {charter.rating}
            </span>
            <span style={{ color: COLORS.teal, fontSize: 14, textDecoration: "underline" }}>
              ({reviewCount} review{reviewCount > 1 ? "s" : ""})
            </span>
          </button>
        ) : (
          <div style={{ color: COLORS.paperDim, fontSize: 14, marginTop: 2 }}>
            {charter.captain} · {charter.location} · ★ {charter.rating}
          </div>
        )}

        {(charter.captainYears || charter.licensed) && (
          <div style={{ color: COLORS.gold, fontSize: 12.5, marginTop: 4, fontFamily: MONO }}>
            {charter.licensed ? "✓ USCG Licensed" : ""}
            {charter.licensed && charter.captainYears ? " · " : ""}
            {charter.captainYears ? `${charter.captainYears} years experience` : ""}
          </div>
        )}

        <div className="flex gap-2 mt-3 flex-wrap">
          {charter.species.map((s) => (
            <Tag key={s} tone="teal">{s}</Tag>
          ))}
          <Tag tone="gold">{charter.type}</Tag>
          {charter.saleType === "private" && <Tag tone="rust">Whole boat · up to {charter.maxGuests} guests</Tag>}
          {charter.groupType && (
            <Tag tone="rust">{charter.groupType === "private" ? "Private charter" : "Shared / walk-on"}</Tag>
          )}
        </div>

        <div className="mt-5 rounded-2xl p-4 flex items-center justify-between" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
          <div>
            <div style={{ color: COLORS.paperDim, fontSize: 12, fontFamily: MONO }}>DEPARTS</div>
            {charter.reason ? (
              <>
                <div style={{ color: COLORS.paper, fontSize: 15, fontWeight: 600, marginTop: 2 }}>
                  <CountdownLabel target={charter.departure} />
                </div>
                <div style={{ color: COLORS.paperDim, fontSize: 12, marginTop: 2 }}>{formatDateTime(charter.departure)}</div>
              </>
            ) : (
              <div style={{ color: COLORS.paper, fontSize: 15, fontWeight: 600, marginTop: 2 }}>
                {formatDateTime(selectedDeparture)}
              </div>
            )}
          </div>
          {charter.reason && <CastRing target={charter.departure} size={48} />}
        </div>

        {hasCalendar && (
          <div className="mt-3">
            <div style={{ color: COLORS.paperDim, fontSize: 11, fontFamily: MONO, marginBottom: 6 }}>AVAILABLE DATES</div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {dateOptions.map((d, i) => {
                const active = d.getTime() === selectedDeparture.getTime();
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedDeparture(d)}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex-shrink-0"
                    style={{
                      background: active ? COLORS.gold : COLORS.inkSoft,
                      border: `1px solid ${active ? COLORS.gold : COLORS.line}`,
                      color: active ? COLORS.ink : COLORS.paperDim,
                    }}
                  >
                    {formatDate(d)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="rounded-2xl p-4" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
            <div style={{ color: COLORS.paperDim, fontSize: 12, fontFamily: MONO }}>TRIP LENGTH</div>
            <div style={{ color: COLORS.paper, fontSize: 15, fontWeight: 600, marginTop: 2 }}>{charter.duration}</div>
          </div>
          {charter.saleType === "private" ? (
            <div className="rounded-2xl p-4" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
              <div style={{ color: COLORS.paperDim, fontSize: 12, fontFamily: MONO }}>MAX GUESTS</div>
              <div style={{ color: COLORS.gold, fontSize: 15, fontWeight: 600, marginTop: 2 }}>Up to {charter.maxGuests}</div>
            </div>
          ) : (
            <div className="rounded-2xl p-4" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
              <div style={{ color: COLORS.paperDim, fontSize: 12, fontFamily: MONO }}>SEATS LEFT</div>
              <div style={{ color: COLORS.rust, fontSize: 15, fontWeight: 600, marginTop: 2 }}>
                {charter.spotsLeft} of {charter.totalSpots}
              </div>
            </div>
          )}
        </div>

        {charter.meetingPoint && (
          <div className="mt-3 rounded-2xl p-4" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
            <div style={{ color: COLORS.paperDim, fontSize: 12, fontFamily: MONO }}>MEETING POINT</div>
            <div style={{ color: COLORS.paper, fontSize: 15, fontWeight: 600, marginTop: 2 }}>{charter.meetingPoint}</div>
          </div>
        )}

        {charter.included?.length > 0 && (
          <div className="mt-5">
            <h3 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 16, fontWeight: 600, marginBottom: 8 }}>What's included</h3>
            <div className="flex flex-col gap-1.5">
              {charter.included.map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span style={{ color: COLORS.teal, fontSize: 13 }}>✓</span>
                  <span style={{ color: COLORS.paperDim, fontSize: 13.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {charter.licenseNote && (
          <p style={{ color: COLORS.paperDim, fontSize: 13, lineHeight: 1.5, marginTop: 14 }}>
            <span style={{ color: COLORS.gold }}>License: </span>
            {charter.licenseNote}
          </p>
        )}

        <p style={{ color: COLORS.paperDim, fontSize: 14, lineHeight: 1.6, marginTop: 18 }}>
          {charter.saleType === "private"
            ? `Book the whole boat with ${charter.captain} — up to ${charter.maxGuests} guests, one flat price, no strangers aboard. Bring your own crew.`
            : charter.reason
            ? `${charter.captain.split(" ")[1]} opened this trip up after a cancellation — everything's still on: gear, bait, and a boat that already knows where the fish are. First come, first reeled.`
            : `A regular trip with ${charter.captain}, departing ${formatDate(charter.departure)} — gear and bait included, just bring yourself.`}
        </p>

        {charter.weatherNote && (
          <p style={{ color: COLORS.paperDim, fontSize: 12, lineHeight: 1.5, marginTop: 10, opacity: 0.8, fontStyle: "italic" }}>
            {charter.weatherNote}
          </p>
        )}

        {reviewCount > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 16, fontWeight: 600 }}>Reviews ({reviewCount})</h3>
              <button onClick={onViewReviews} style={{ color: COLORS.teal, fontSize: 12.5 }}>See all →</button>
            </div>
            <div className="flex flex-col gap-3">
              {allReviews.slice(0, 2).map((r, i) => (
                <div key={i} className="rounded-2xl p-3.5" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
                  <div className="flex items-center justify-between">
                    <span style={{ color: COLORS.paper, fontSize: 13.5, fontWeight: 500 }}>{r.name}</span>
                    <span style={{ color: COLORS.gold, fontSize: 12.5 }}>{"★".repeat(r.rating)}</span>
                  </div>
                  <p style={{ color: COLORS.paperDim, fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 px-6 py-4 flex items-center justify-between"
        style={{ background: COLORS.ink, borderTop: `1px solid ${COLORS.line}`, maxWidth: 480, margin: "0 auto" }}
      >
        {charter.saleType === "private" ? (
          <>
            <div>
              <span style={{ fontFamily: MONO, color: COLORS.paper, fontSize: 20, fontWeight: 500 }}>${charter.totalPrice}</span>
              <div style={{ fontSize: 11, color: COLORS.paperDim }}>total trip · up to {charter.maxGuests} guests</div>
            </div>
            <button onClick={() => onBook(selectedDeparture)} className="px-6 py-3 rounded-full font-semibold text-sm" style={{ background: COLORS.rust, color: COLORS.paper }}>
              Book this charter
            </button>
          </>
        ) : charter.spotsLeft > 0 ? (
          <>
            <PriceBlock price={charter.price} originalPrice={charter.originalPrice} />
            <button onClick={() => onBook(selectedDeparture)} className="px-6 py-3 rounded-full font-semibold text-sm" style={{ background: COLORS.rust, color: COLORS.paper }}>
              Claim this seat
            </button>
          </>
        ) : (
          <>
            <span style={{ color: COLORS.paperDim, fontSize: 13 }}>Sold out</span>
            <button onClick={() => onBook(selectedDeparture)} className="px-6 py-3 rounded-full font-semibold text-sm" style={{ background: COLORS.teal, color: COLORS.ink }}>
              Join waitlist
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   CUSTOMER: CHARTER REVIEWS PAGE
--------------------------------------------------------------------- */
function CharterReviewsPage({ charter, replies, extraReviews, onBack }) {
  const reviews = reviewsFor(charter, extraReviews);
  return (
    <div className="px-6 pt-6 pb-14">
      <button onClick={onBack} style={{ color: COLORS.paperDim, fontSize: 14 }} className="mb-4">
        ← Back
      </button>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-xl flex-shrink-0" style={{ background: charter.img }} />
        <div className="min-w-0">
          <h1 className="truncate" style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 19, fontWeight: 600 }}>{charter.boat}</h1>
          <div className="truncate" style={{ color: COLORS.paperDim, fontSize: 12.5 }}>{charter.captain} · {charter.location}</div>
        </div>
      </div>
      <div style={{ color: COLORS.gold, fontSize: 14, marginBottom: 6 }}>
        ★ {charter.rating} · {reviews.length} review{reviews.length !== 1 ? "s" : ""}
      </div>

      <div className="flex flex-col gap-3 mt-4">
        {reviews.map((r, i) => {
          const key = `${charter.id}-${i}`;
          const reply = replies?.[key];
          return (
            <div key={key} className="rounded-2xl p-3.5" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
              <div className="flex items-center justify-between">
                <span style={{ color: COLORS.paper, fontSize: 13.5, fontWeight: 500 }}>{r.name}</span>
                <span style={{ color: COLORS.gold, fontSize: 12.5 }}>{"★".repeat(r.rating)}</span>
              </div>
              <p style={{ color: COLORS.paperDim, fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{r.comment}</p>
              {reply && (
                <div className="mt-2.5 pt-2.5 pl-3" style={{ borderTop: `1px solid ${COLORS.line}`, borderLeft: `2px solid ${COLORS.teal}` }}>
                  <div style={{ color: COLORS.teal, fontSize: 11, fontFamily: MONO }}>
                    REPLY FROM {charter.captain?.toUpperCase()}
                  </div>
                  <p style={{ color: COLORS.paperDim, fontSize: 12.5, marginTop: 2, lineHeight: 1.4 }}>{reply}</p>
                </div>
              )}
            </div>
          );
        })}
        {reviews.length === 0 && <p style={{ color: COLORS.paperDim, fontSize: 14 }}>No reviews yet for this charter.</p>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   CUSTOMER: BOOKING
--------------------------------------------------------------------- */
function Booking({ charter, angler, onBack, onNext }) {
  const [name, setName] = useState(angler?.name || "");
  const [email, setEmail] = useState(angler?.email || "");
  const [spots, setSpots] = useState(1);
  const isPrivate = charter.saleType === "private";
  const isWaitlist = !isPrivate && charter.spotsLeft <= 0;
  const valid = name.trim().length > 1 && email.includes("@");
  const total = isPrivate ? charter.totalPrice : charter.price * spots;
  const licenseRequired = Boolean(charter.licenseNote) && !/no .*license needed/i.test(charter.licenseNote || "");

  return (
    <div style={{ background: COLORS.ink, minHeight: "100%" }}>
      <CaptainStrip charter={charter} />
      <div className="px-6 pt-6 pb-10">
      <button onClick={onBack} style={{ color: COLORS.paperDim, fontSize: 14 }} className="mb-4">
        ← Back
      </button>
      <h1 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 24, fontWeight: 600 }}>
        {isPrivate ? "Book this charter" : isWaitlist ? "Join the waitlist" : "Claim your seat"}
      </h1>
      <div style={{ color: COLORS.paperDim, fontSize: 13, marginTop: 4 }}>
        {charter.boat} · {isPrivate ? formatDateTime(charter.departure) : isWaitlist ? "Sold out — we'll text you if a seat opens up" : <CountdownLabel target={charter.departure} />}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <Field label="NAME" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
        <Field label="EMAIL" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
        {!isWaitlist && (
          <label className="flex flex-col gap-1.5">
            <span style={{ color: COLORS.paperDim, fontSize: 12, fontFamily: MONO }}>
              {isPrivate ? `GUESTS (UP TO ${charter.maxGuests})` : "SEATS"}
            </span>
            <div className="flex items-center gap-3">
              <button onClick={() => setSpots((s) => Math.max(1, s - 1))} className="w-9 h-9 rounded-full" style={{ background: COLORS.inkSoft, color: COLORS.paper, border: `1px solid ${COLORS.line}` }}>
                −
              </button>
              <span style={{ color: COLORS.paper, fontFamily: MONO, fontSize: 16 }}>{spots}</span>
              <button
                onClick={() => setSpots((s) => Math.min(isPrivate ? charter.maxGuests : charter.spotsLeft, s + 1))}
                className="w-9 h-9 rounded-full"
                style={{ background: COLORS.inkSoft, color: COLORS.paper, border: `1px solid ${COLORS.line}` }}
              >
                +
              </button>
            </div>
          </label>
        )}

        {isWaitlist ? (
          <p style={{ color: COLORS.paperDim, fontSize: 12.5, lineHeight: 1.5 }}>
            No charge to join the waitlist. If a seat opens up, you'll be the first one notified — first come,
            first reeled.
          </p>
        ) : (
          <div className="rounded-2xl p-4 mt-2 flex items-center justify-between" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
            <span style={{ color: COLORS.paperDim, fontSize: 13 }}>
              {isPrivate ? `Total trip · ${spots} guest${spots > 1 ? "s" : ""}` : `Total (${spots} seat${spots > 1 ? "s" : ""})`}
            </span>
            <span style={{ color: COLORS.paper, fontFamily: MONO, fontSize: 18, fontWeight: 500 }}>${total}</span>
          </div>
        )}

        {!isWaitlist && (
          <div
            className="rounded-2xl p-3.5"
            style={{
              background: COLORS.inkSoft,
              border: `1px solid ${licenseRequired && !angler?.licenseFileName ? COLORS.rust : COLORS.line}`,
            }}
          >
            <div style={{ color: COLORS.paperDim, fontSize: 11, fontFamily: MONO, marginBottom: 4 }}>FISHING LICENSE</div>
            {angler?.licenseFileName ? (
              <p style={{ color: COLORS.teal, fontSize: 12.5, lineHeight: 1.4 }}>
                ✓ {angler.licenseFileName} will be shared with {charter.captain} automatically.
              </p>
            ) : licenseRequired ? (
              <p style={{ color: COLORS.rust, fontSize: 12.5, lineHeight: 1.4 }}>
                {charter.licenseNote} — you don't have one on file yet. Add it anytime in Account → Settings, or
                bring it with you.
              </p>
            ) : (
              <p style={{ color: COLORS.paperDim, fontSize: 12.5, lineHeight: 1.4 }}>
                {charter.licenseNote || "No license required for this charter."} You don't have one on file — optional,
                but you can add one anytime in Account → Settings so it's ready for charters that do need it.
              </p>
            )}
          </div>
        )}

        <PrimaryButton disabled={!valid} onClick={() => onNext({ name, email, spots: isWaitlist ? 0 : spots, waitlist: isWaitlist })}>
          {isWaitlist ? "Join waitlist" : "Review booking"}
        </PrimaryButton>
      </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   CUSTOMER: CONFIRMED
--------------------------------------------------------------------- */
function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${COLORS.line}` }}>
      <span style={{ color: COLORS.paperDim, fontSize: 12, fontFamily: MONO }}>{label}</span>
      <span style={{ color: COLORS.paper, fontSize: 13 }}>{value}</span>
    </div>
  );
}

function ReviewBooking({ charter, draft, angler, onBack, onConfirm }) {
  const isPrivate = charter.saleType === "private";
  const total = isPrivate ? charter.totalPrice : charter.price * draft.spots;

  return (
    <div style={{ background: COLORS.ink, minHeight: "100%" }}>
      <CaptainStrip charter={charter} />
      <div className="px-6 pt-6 pb-28">
      <button onClick={onBack} style={{ color: COLORS.paperDim, fontSize: 14 }} className="mb-4">
        ← Back
      </button>
      <Header eyebrow="REVIEW BOOKING" title="Everything look right?" />

      <div className="rounded-2xl p-4" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl flex-shrink-0" style={{ background: charter.img }} />
          <div className="min-w-0">
            <div style={{ color: COLORS.paper, fontWeight: 600, fontSize: 15 }}>{charter.boat}</div>
            <div style={{ color: COLORS.paperDim, fontSize: 12, marginTop: 1 }}>
              {charter.captain} · {charter.location}
            </div>
          </div>
        </div>
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {charter.species.map((s) => (
            <Tag key={s} tone="teal">{s}</Tag>
          ))}
          <Tag tone="gold">{charter.type}</Tag>
          {isPrivate && <Tag tone="rust">Whole boat · up to {charter.maxGuests}</Tag>}
        </div>
      </div>

      <div className="rounded-2xl p-4 mt-3" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
        <Row label="Departs" value={formatDateTime(charter.departure)} />
        <Row label="Trip length" value={charter.duration} />
        <Row label="Meeting point" value={charter.meetingPoint || charter.location} />
        <Row label={isPrivate ? "Guests" : "Seats"} value={draft.spots} />
        <Row label="Booking name" value={draft.name} />
        <Row label="Email" value={draft.email} />
        {charter.licenseNote && <Row label="License" value={charter.licenseNote} />}
      </div>

      {charter.included?.length > 0 && (
        <div className="mt-5">
          <h3 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 15, fontWeight: 600, marginBottom: 8 }}>What's included</h3>
          <div className="flex flex-col gap-1.5">
            {charter.included.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <span style={{ color: COLORS.teal, fontSize: 13 }}>✓</span>
                <span style={{ color: COLORS.paperDim, fontSize: 13.5 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        className="rounded-2xl p-3.5 mt-5"
        style={{ background: COLORS.inkSoft, border: `1px solid ${angler?.licenseFileName ? COLORS.line : COLORS.gold + "55"}` }}
      >
        <div style={{ color: COLORS.paperDim, fontSize: 11, fontFamily: MONO, marginBottom: 4 }}>FISHING LICENSE</div>
        <p style={{ color: angler?.licenseFileName ? COLORS.teal : COLORS.paperDim, fontSize: 12.5, lineHeight: 1.4 }}>
          {angler?.licenseFileName
            ? `✓ ${angler.licenseFileName} will be shared with ${charter.captain} automatically.`
            : "No license on file — add one anytime in Account → Settings."}
        </p>
      </div>

      {charter.weatherNote && (
        <p style={{ color: COLORS.paperDim, fontSize: 11.5, lineHeight: 1.5, marginTop: 14, opacity: 0.8, fontStyle: "italic" }}>
          {charter.weatherNote}
        </p>
      )}

      <div
        className="fixed bottom-0 left-0 right-0 px-6 py-4 flex items-center justify-between"
        style={{ background: COLORS.ink, borderTop: `1px solid ${COLORS.line}`, maxWidth: 480, margin: "0 auto" }}
      >
        <div>
          <span style={{ fontFamily: MONO, color: COLORS.paper, fontSize: 20, fontWeight: 500 }}>${total}</span>
          <div style={{ fontSize: 11, color: COLORS.paperDim }}>{isPrivate ? "total trip" : `${draft.spots} seat${draft.spots > 1 ? "s" : ""}`}</div>
        </div>
        <button
          onClick={() => onConfirm(draft)}
          className="px-6 py-3 rounded-full font-semibold text-sm"
          style={{ background: COLORS.rust, color: COLORS.paper }}
        >
          Confirm booking
        </button>
      </div>
      </div>
    </div>
  );
}

function Confirmed({ charter, booking, onDone }) {
  return (
    <div style={{ background: COLORS.ink, minHeight: "100%" }}>
      <CaptainStrip charter={charter} />
      <div className="flex flex-col items-center justify-center text-center px-8" style={{ paddingTop: 56, paddingBottom: 80 }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: `${COLORS.teal}22`, border: `1px solid ${COLORS.teal}` }}>
        <span style={{ fontSize: 26 }}>🎣</span>
      </div>
      <h1 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 24, fontWeight: 600 }}>
        {charter.saleType === "private"
          ? `Boat's yours, ${booking.name.split(" ")[0]}.`
          : booking.waitlist
          ? `You're on the list, ${booking.name.split(" ")[0]}.`
          : `Seat's yours, ${booking.name.split(" ")[0]}.`}
      </h1>
      <p style={{ color: COLORS.paperDim, fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>
        {charter.saleType === "private" ? (
          <>
            {charter.captain} just got a text — you've got the whole boat for up to {charter.maxGuests} guests on the{" "}
            {charter.boat}, departing {formatDateTime(charter.departure)}.
          </>
        ) : booking.waitlist ? (
          <>
            We'll text you the second a seat opens up on the {charter.boat}. No charge unless you confirm.
          </>
        ) : (
          <>
            {charter.captain} just got a text — you're confirmed for {booking.spots} seat{booking.spots > 1 ? "s" : ""} on the {charter.boat},
            departing in <span style={{ color: COLORS.gold }}><CountdownLabel target={charter.departure} /></span>.
          </>
        )}
      </p>

      <div className="w-full mt-8 rounded-2xl p-4 text-left" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
        <Row label="Boat" value={charter.boat} />
        <Row label="Meet at" value={charter.location} />
        <Row label="Duration" value={charter.duration} />
        <Row label="Confirmation sent to" value={booking.email} />
      </div>

      <button onClick={onDone} className="mt-8 px-6 py-3 rounded-full font-semibold text-sm" style={{ background: COLORS.rust, color: COLORS.paper }}>
        Back to open seats
      </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   ANGLER: LOGIN / REGISTER / ACCOUNT / TRIP HISTORY / MESSAGING
--------------------------------------------------------------------- */
function AnglerLogin({ onLogin, onNew, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const valid = email.includes("@") && password.length >= 4;

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (!cred.user.emailVerified) {
        try {
          await sendEmailVerification(cred.user);
        } catch (sendErr) {
          console.error("Failed to send verification email on login:", sendErr);
        }
      }
      onLogin({ email: cred.user.email, uid: cred.user.uid, emailVerified: cred.user.emailVerified });
    } catch (err) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("That email and password don't match an account.");
      } else if (err.code === "auth/invalid-email") {
        setError("That doesn't look like a valid email.");
      } else {
        setError("Couldn't log in — please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 pt-8 pb-10">
      <button onClick={onBack} style={{ color: COLORS.paperDim, fontSize: 14 }} className="mb-6">
        ← Back to app
      </button>
      <BrandMark />
      <div className="mt-6">
        <Header title="Your trips, in one place." sub="Log in to see past and upcoming charters, and message your captain." />
      </div>
      <div className="flex flex-col gap-4">
        <Field label="EMAIL" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
        <Field label="PASSWORD" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        {error && <p style={{ color: COLORS.rust, fontSize: 12.5 }}>{error}</p>}
        <PrimaryButton disabled={!valid || loading} onClick={handleLogin}>
          {loading ? "Logging in..." : "Log in"}
        </PrimaryButton>
        <button onClick={onNew} style={{ color: COLORS.teal, fontSize: 13, textAlign: "center" }} className="mt-1">
          New here? Create an account →
        </button>
      </div>
    </div>
  );
}

function AnglerRegister({ onCreate, onBack }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", zip: "", password: "" });
  const [licenseFileName, setLicenseFileName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const valid =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.phone.trim().length >= 7 &&
    form.email.includes("@") &&
    /^\d{5}$/.test(form.zip.trim()) &&
    form.password.length >= 6;

  const handleCreate = async () => {
    setError("");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
      try {
        await sendEmailVerification(cred.user);
      } catch (verifyErr) {
        console.error("Failed to send verification email:", verifyErr);
      }
      onCreate({
        uid: cred.user.uid,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        phone: form.phone.trim(),
        email: form.email.trim(),
        zip: form.zip.trim(),
        licenseFileName,
      });
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("An account already exists with that email — try logging in instead.");
      } else if (err.code === "auth/weak-password") {
        setError("Password needs to be at least 6 characters.");
      } else if (err.code === "auth/invalid-email") {
        setError("That doesn't look like a valid email.");
      } else {
        setError("Couldn't create your account — please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 pt-8 pb-10">
      <button onClick={onBack} style={{ color: COLORS.paperDim, fontSize: 14 }} className="mb-4">← Back</button>
      <Header title="Create your account" />
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="FIRST NAME" value={form.firstName} onChange={set("firstName")} placeholder="Jamie" />
          <Field label="LAST NAME" value={form.lastName} onChange={set("lastName")} placeholder="Rivera" />
        </div>
        <Field label="PHONE NUMBER" type="tel" value={form.phone} onChange={set("phone")} placeholder="(555) 123-4567" />
        <Field label="EMAIL" type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" />
        <Field label="CURRENT ZIP CODE" value={form.zip} onChange={set("zip")} placeholder="33040" maxLength={5} />
        <Field label="PASSWORD" type="password" value={form.password} onChange={set("password")} placeholder="•••••••• (6+ characters)" />

        <label className="flex flex-col gap-1.5">
          <span style={{ color: COLORS.paperDim, fontSize: 12, fontFamily: MONO }}>FISHING LICENSE (OPTIONAL)</span>
          <div
            className="rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer"
            style={{ background: COLORS.inkSoft, border: `1.5px dashed ${COLORS.line}` }}
            onClick={() => setLicenseFileName("fishing_license_scan.pdf")}
          >
            <span style={{ fontSize: 18 }}>📄</span>
            <span style={{ color: COLORS.paper, fontSize: 13, fontWeight: 500 }}>
              {licenseFileName ? licenseFileName : "Tap to upload — have it ready for charters that require one"}
            </span>
            {licenseFileName && <span style={{ color: COLORS.teal, fontSize: 11.5 }}>✓ On file</span>}
          </div>
        </label>

        {error && <p style={{ color: COLORS.rust, fontSize: 12.5 }}>{error}</p>}
        <PrimaryButton disabled={!valid || loading} onClick={handleCreate}>
          {loading ? "Creating account..." : "Create account"}
        </PrimaryButton>
      </div>
    </div>
  );
}

function TripCard({ b, onOpen }) {
  return (
    <button
      onClick={() => onOpen(b)}
      className="w-full text-left rounded-2xl p-3.5 flex items-center justify-between"
      style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}
    >
      <div>
        <div className="flex items-center gap-1.5">
          <span style={{ color: COLORS.paper, fontSize: 14, fontWeight: 500 }}>{b.charter.boat}</span>
          {b.waitlist && <Tag tone="teal">Waitlisted</Tag>}
          {b.status === "cancelled" && <Tag tone="rust">Cancelled</Tag>}
        </div>
        <div style={{ color: COLORS.paperDim, fontSize: 12, marginTop: 3 }}>
          {b.charter.captain} · {b.charter.location}
        </div>
        <div style={{ color: COLORS.paperDim, fontSize: 11.5, marginTop: 2, opacity: 0.8 }}>
          {b.status === "upcoming" ? <CountdownLabel target={b.charter.departure} /> : formatDate(b.charter.departure)}
        </div>
      </div>
      <span style={{ color: COLORS.paperDim, fontSize: 18 }}>›</span>
    </button>
  );
}

function AnglerAccount({ angler, bookings, onOpenTrip, onLogout, onBack, onSettings, onPhotoChange, onVerifyMilitary, onRemoveMilitary }) {
  const upcoming = bookings.filter((b) => b.status === "upcoming");
  const past = bookings.filter((b) => b.status === "past");
  const cancelled = bookings.filter((b) => b.status === "cancelled");

  return (
    <div className="px-6 pt-6 pb-16">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} style={{ color: COLORS.paperDim, fontSize: 14 }}>
          ← Back to app
        </button>
        <button onClick={onSettings} style={{ color: COLORS.paperDim, fontSize: 18 }}>
          ⚙
        </button>
      </div>

      <div className="mb-6">
        <AvatarUpload photoUrl={angler.photoUrl} onChange={onPhotoChange} fallback="👤" size={80} />
      </div>

      {angler.militaryStatus && <ServiceBanner />}

      <div className="mb-7">
        <div style={{ color: COLORS.paperDim, fontSize: 12, fontFamily: MONO }}>YOUR ACCOUNT</div>
        <h1 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 22, fontWeight: 600, marginTop: 2 }}>{angler.name}</h1>
        <div style={{ color: COLORS.paperDim, fontSize: 13, marginTop: 1 }}>{angler.email}</div>
      </div>

      <div className="mb-6">
        <VeteranVerification status={angler.militaryStatus} onVerify={onVerifyMilitary} onRemove={onRemoveMilitary} />
      </div>

      {angler.joinIndex && <FoundingAnglerCard joinIndex={angler.joinIndex} />}

      <h2 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 17, fontWeight: 600, marginBottom: 10 }}>Upcoming trips</h2>
      <div className="flex flex-col gap-2 mb-7">
        {upcoming.length === 0 && (
          <p style={{ color: COLORS.paperDim, fontSize: 13 }}>No upcoming trips yet — go find a seat.</p>
        )}
        {upcoming.map((b) => (
          <TripCard key={b.id} b={b} onOpen={onOpenTrip} />
        ))}
      </div>

      <h2 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 17, fontWeight: 600, marginBottom: 10 }}>Past trips</h2>
      <div className="flex flex-col gap-2 mb-7">
        {past.length === 0 && (
          <p style={{ color: COLORS.paperDim, fontSize: 13 }}>Your completed trips will show up here.</p>
        )}
        {past.map((b) => (
          <TripCard key={b.id} b={b} onOpen={onOpenTrip} />
        ))}
      </div>

      {cancelled.length > 0 && (
        <>
          <h2 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 17, fontWeight: 600, marginBottom: 10 }}>Cancelled</h2>
          <div className="flex flex-col gap-2">
            {cancelled.map((b) => (
              <TripCard key={b.id} b={b} onOpen={onOpenTrip} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TripMessages({ booking, onBack, onSend }) {
  const [draft, setDraft] = useState("");
  const messages = booking.messages || [];

  return (
    <div className="px-6 pt-6 pb-10" style={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <button onClick={onBack} style={{ color: COLORS.paperDim, fontSize: 14 }} className="mb-4">
        ← Back to trip
      </button>
      <div className="flex items-center justify-between mb-1">
        <h1 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 20, fontWeight: 600 }}>{booking.charter.captain}</h1>
        <span style={{ color: COLORS.paperDim, fontSize: 10.5, fontFamily: MONO }}>PREVIEW</span>
      </div>
      <p style={{ color: COLORS.paperDim, fontSize: 12, marginBottom: 5 }}>
        {booking.charter.boat} · {formatDate(booking.charter.departure)}
      </p>
      <p style={{ color: COLORS.paperDim, fontSize: 11, marginBottom: 5, opacity: 0.7, lineHeight: 1.4 }}>
        Messages here stay on this device for now — real delivery to the captain goes live once the backend is connected.
      </p>

      <div className="flex-1 flex flex-col gap-2 mt-4 mb-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className="max-w-[80%] rounded-2xl px-3.5 py-2.5"
            style={{
              alignSelf: m.from === "angler" ? "flex-end" : "flex-start",
              background: m.from === "angler" ? COLORS.rust : COLORS.inkSoft,
              border: m.from === "angler" ? "none" : `1px solid ${COLORS.line}`,
              color: COLORS.paper,
              fontSize: 13.5,
            }}
          >
            {m.text}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message your captain..."
          className="flex-1 rounded-full px-4 py-3 text-sm outline-none"
          style={{ background: COLORS.paper, color: COLORS.ink }}
        />
        <button
          disabled={!draft.trim()}
          onClick={() => {
            onSend(draft.trim());
            setDraft("");
          }}
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: draft.trim() ? COLORS.rust : COLORS.line, color: COLORS.paper }}
        >
          →
        </button>
      </div>
    </div>
  );
}

function TripDetail({ booking, onBack, onMessage, onCancel, onSubmitReview }) {
  const { charter, status } = booking;
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  const statusTone = status === "cancelled" ? "rust" : status === "upcoming" ? "gold" : "teal";
  const statusLabel = status === "cancelled" ? "Cancelled" : status === "upcoming" ? "Upcoming" : "Completed";

  return (
    <div className="px-6 pt-6 pb-10">
      <button onClick={onBack} style={{ color: COLORS.paperDim, fontSize: 14 }} className="mb-4">
        ← Back to account
      </button>
      <div className="flex items-center gap-1.5">
        <Tag tone={statusTone}>{statusLabel}</Tag>
        {booking.waitlist && <Tag tone="teal">Waitlisted</Tag>}
      </div>
      <h1 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 24, fontWeight: 600, marginTop: 8 }}>{charter.boat}</h1>
      <div style={{ color: COLORS.paperDim, fontSize: 14, marginTop: 2 }}>
        {charter.captain} · {charter.location}
      </div>

      <div className="mt-5 rounded-2xl p-4" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
        <Row label="Date" value={formatDate(charter.departure)} />
        <Row label="Meeting point" value={charter.meetingPoint || charter.location} />
        <Row label={charter.saleType === "private" ? "Guests" : "Seats"} value={booking.spots} />
        <Row
          label="Total paid"
          value={`$${charter.saleType === "private" ? charter.totalPrice : charter.price * (booking.spots || 1)}`}
        />
      </div>

      {status !== "cancelled" && (
        <button
          onClick={() => onMessage(booking)}
          className="w-full mt-5 py-3.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2"
          style={{ background: COLORS.teal, color: COLORS.ink }}
        >
          💬 Message {charter.captain.split(" ")[1] || "captain"}
        </button>
      )}

      {status === "upcoming" && (
        <button
          onClick={() => {
            if (window.confirm(booking.waitlist ? "Leave the waitlist for this trip?" : "Cancel this booking? This can't be undone.")) {
              onCancel(booking.id);
            }
          }}
          className="w-full mt-3 py-3 rounded-full text-sm font-medium"
          style={{ border: `1px solid ${COLORS.rust}`, color: COLORS.rust }}
        >
          {booking.waitlist ? "Leave waitlist" : "Cancel booking"}
        </button>
      )}

      {status === "past" && !booking.reviewed && (
        <div className="mt-6 rounded-2xl p-4" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.gold}55` }}>
          {!showReviewForm ? (
            <>
              <div style={{ color: COLORS.gold, fontSize: 13, fontWeight: 600 }}>How was the trip?</div>
              <p style={{ color: COLORS.paperDim, fontSize: 12, marginTop: 4, lineHeight: 1.4 }}>
                Leave a review for {charter.captain} — it'll show up on their reviews page.
              </p>
              <button
                onClick={() => setShowReviewForm(true)}
                className="mt-3 px-4 py-2 rounded-full text-xs font-semibold"
                style={{ background: COLORS.gold, color: COLORS.ink }}
              >
                Leave a review
              </button>
            </>
          ) : (
            <>
              <div style={{ color: COLORS.paperDim, fontSize: 11, fontFamily: MONO, marginBottom: 6 }}>YOUR RATING</div>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} onClick={() => setReviewRating(n)} style={{ fontSize: 22, opacity: n <= reviewRating ? 1 : 0.3 }}>
                    ★
                  </button>
                ))}
              </div>
              <Field
                label="COMMENT"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="How'd the trip go?"
              />
              <PrimaryButton
                disabled={!reviewComment.trim()}
                onClick={() => onSubmitReview(booking, { rating: reviewRating, comment: reviewComment.trim() })}
              >
                Submit review
              </PrimaryButton>
            </>
          )}
        </div>
      )}
      {status === "past" && booking.reviewed && (
        <p style={{ color: COLORS.teal, fontSize: 12.5, marginTop: 14, textAlign: "center" }}>✓ You reviewed this trip</p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------
   CAPTAIN: LOGIN / REGISTER / LICENSE / PENDING
--------------------------------------------------------------------- */
function CaptainLogin({ onLogin, onNew, onBackToApp, backLabel = "← Back to app" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const valid = email.includes("@") && password.length >= 4;

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (!cred.user.emailVerified) {
        try {
          await sendEmailVerification(cred.user);
        } catch (sendErr) {
          console.error("Failed to send verification email on login:", sendErr);
        }
      }
      onLogin({ email: cred.user.email, uid: cred.user.uid, emailVerified: cred.user.emailVerified });
    } catch (err) {
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        setError("That email and password don't match an account.");
      } else if (err.code === "auth/invalid-email") {
        setError("That doesn't look like a valid email.");
      } else {
        setError("Couldn't log in — please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 pt-8 pb-10">
      <button onClick={onBackToApp} style={{ color: COLORS.paperDim, fontSize: 14 }} className="mb-6">
        {backLabel}
      </button>
      <BrandMark />
      <div className="mt-6">
        <Header title="Fill your empty seats." sub="Post a last-minute cancellation or list an open trip — either way, in under a minute." />
      </div>
      <div className="flex flex-col gap-4">
        <Field label="EMAIL" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@boatmail.com" />
        <Field label="PASSWORD" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        {error && <p style={{ color: COLORS.rust, fontSize: 12.5 }}>{error}</p>}
        <PrimaryButton disabled={!valid || loading} onClick={handleLogin}>
          {loading ? "Logging in..." : "Log in"}
        </PrimaryButton>
        <button onClick={onNew} style={{ color: COLORS.teal, fontSize: 13, textAlign: "center" }} className="mt-1">
          New captain? Join Last Cast →
        </button>
      </div>
    </div>
  );
}

function CaptainRegister({ onNext, onBack }) {
  const [form, setForm] = useState({ name: "", boat: "", location: "", zip: "", species: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const valid = form.name && form.boat && form.location && (form.email || "").includes("@") && /^\d{5}$/.test(form.zip.trim()) && form.password.length >= 6;

  const handleNext = async () => {
    setError("");
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email.trim(), form.password);
      try {
        await sendEmailVerification(cred.user);
      } catch (verifyErr) {
        console.error("Failed to send verification email:", verifyErr);
      }
      onNext({ ...form, uid: cred.user.uid });
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        setError("An account already exists with that email — try logging in instead.");
      } else if (err.code === "auth/weak-password") {
        setError("Password needs to be at least 6 characters.");
      } else if (err.code === "auth/invalid-email") {
        setError("Add a valid email above so we can create your login.");
      } else {
        setError("Couldn't create your account — please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 pt-8 pb-10">
      <button onClick={onBack} style={{ color: COLORS.paperDim, fontSize: 14 }} className="mb-4">← Back</button>
      <Header eyebrow="STEP 1 OF 3" title="Tell us about your boat" />
      <div className="flex flex-col gap-4">
        <Field label="YOUR NAME" value={form.name} onChange={set("name")} placeholder="Capt. Jamie Rivera" />
        <Field label="EMAIL" type="email" value={form.email || ""} onChange={set("email")} placeholder="you@boatmail.com" />
        <Field label="BOAT NAME" value={form.boat} onChange={set("boat")} placeholder="Reel Deal" />
        <Field label="HOME PORT / LOCATION" value={form.location} onChange={set("location")} placeholder="Key West, FL" />
        <Field label="ZIP CODE" value={form.zip} onChange={set("zip")} placeholder="33040" maxLength={5} />
        <Field label="SPECIALTIES" value={form.species} onChange={set("species")} placeholder="Snapper, Grouper, Mahi" />
        <Field label="PASSWORD" type="password" value={form.password} onChange={set("password")} placeholder="•••••••• (6+ characters)" />
        {error && <p style={{ color: COLORS.rust, fontSize: 12.5 }}>{error}</p>}
        <PrimaryButton disabled={!valid || loading} onClick={handleNext}>
          {loading ? "Creating account..." : "Continue"}
        </PrimaryButton>
      </div>
    </div>
  );
}

// For a captain who's already logged in (real Firebase Auth account exists)
// but has no saved profile — happens if they never finished sign-up, or an
// earlier save silently failed. This only writes to Firestore, it never
// touches Firebase Auth, so it can't hit "email already in use."
function CaptainCompleteProfile({ email, onNext, onBack }) {
  const [form, setForm] = useState({ name: "", boat: "", location: "", zip: "", species: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const valid = form.name && form.boat && form.location && /^\d{5}$/.test(form.zip.trim());

  return (
    <div className="px-6 pt-8 pb-10">
      <button onClick={onBack} style={{ color: COLORS.paperDim, fontSize: 14 }} className="mb-4">← Back</button>
      <Header
        eyebrow="ONE MORE STEP"
        title="Finish your captain profile"
        sub={`You're logged in as ${email}, but we don't have your boat info on file yet — let's finish it now.`}
      />
      <div className="flex flex-col gap-4">
        <Field label="YOUR NAME" value={form.name} onChange={set("name")} placeholder="Capt. Jamie Rivera" />
        <Field label="BOAT NAME" value={form.boat} onChange={set("boat")} placeholder="Reel Deal" />
        <Field label="HOME PORT / LOCATION" value={form.location} onChange={set("location")} placeholder="Key West, FL" />
        <Field label="ZIP CODE" value={form.zip} onChange={set("zip")} placeholder="33040" maxLength={5} />
        <Field label="SPECIALTIES" value={form.species} onChange={set("species")} placeholder="Snapper, Grouper, Mahi" />
        <PrimaryButton disabled={!valid} onClick={() => onNext(form)}>Continue</PrimaryButton>
      </div>
    </div>
  );
}

function CaptainLicense({ onNext, onBack }) {
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      await onNext(fileName);
    } catch (err) {
      setError(`Couldn't submit your application: ${err.message || "unknown error"}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 pt-8 pb-10">
      <button onClick={onBack} style={{ color: COLORS.paperDim, fontSize: 14 }} className="mb-4">← Back</button>
      <Header eyebrow="STEP 2 OF 3" title="Verify your license" sub="We check every captain's USCG license and insurance before you can post a trip — it's what makes the deals trustworthy." />
      <div
        className="rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 cursor-pointer"
        style={{ background: COLORS.inkSoft, border: `1.5px dashed ${COLORS.line}` }}
        onClick={() => setFileName("USCG_license_scan.pdf")}
      >
        <span style={{ fontSize: 22 }}>📄</span>
        <span style={{ color: COLORS.paper, fontSize: 14, fontWeight: 500 }}>{fileName ? fileName : "Tap to upload license & insurance"}</span>
        <span style={{ color: COLORS.paperDim, fontSize: 12 }}>PDF or photo, under 10MB</span>
      </div>
      {error && <p style={{ color: COLORS.rust, fontSize: 12.5, marginTop: 12 }}>{error}</p>}
      <div className="mt-6">
        <PrimaryButton disabled={!fileName || loading} onClick={handleSubmit}>
          {loading ? "Submitting..." : "Submit for review"}
        </PrimaryButton>
      </div>
    </div>
  );
}

function CaptainPending({ isApproved, onContinue, onGoAdmin }) {
  return (
    <div className="px-6 pt-16 pb-10 flex flex-col items-center text-center">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
        style={{ background: isApproved ? `${COLORS.teal}22` : `${COLORS.gold}22`, border: `1px solid ${isApproved ? COLORS.teal : COLORS.gold}` }}
      >
        <span style={{ fontSize: 26 }}>{isApproved ? "✓" : "⏳"}</span>
      </div>
      <h1 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 22, fontWeight: 600 }}>
        {isApproved ? "You're verified!" : "Application under review"}
      </h1>
      <p style={{ color: COLORS.paperDim, fontSize: 14, marginTop: 8, lineHeight: 1.6, maxWidth: 320 }}>
        {isApproved
          ? "An admin reviewed your license and cleared you to start posting seats."
          : "We usually verify captains within 24 hours. You'll get an email the moment you're cleared to start posting seats."}
      </p>
      {!isApproved && (
        <button onClick={onGoAdmin} className="mt-3 px-4 py-2 rounded-full text-xs font-medium" style={{ border: `1px solid ${COLORS.line}`, color: COLORS.paperDim }}>
          Testing this yourself? Switch to admin view →
        </button>
      )}
      <div className="mt-8 w-full">
        <PrimaryButton disabled={!isApproved} onClick={onContinue}>
          {isApproved ? "Continue to dashboard →" : "Waiting for approval..."}
        </PrimaryButton>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   CAPTAIN: FEE TIER + POST FORM
--------------------------------------------------------------------- */
function FeeTierCard({ joinIndex, militaryStatus }) {
  const tier = tierFor(joinIndex, militaryStatus);
  const cap = joinIndex <= FOUNDING_CAP ? FOUNDING_CAP : NEXT_CAP;
  const remaining = cap - joinIndex;
  const pctFull = Math.min(1, joinIndex / cap);
  const locked = tier.pct < 15;

  return (
    <div className="rounded-2xl p-4" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.gold}55` }}>
      <div className="flex items-center justify-between">
        <span style={{ color: COLORS.gold, fontSize: 12, fontFamily: MONO, letterSpacing: 0.5 }}>{tier.label.toUpperCase()}</span>
        <span style={{ color: COLORS.paper, fontFamily: MONO, fontSize: 18, fontWeight: 500 }}>{tier.pct}% fee</span>
      </div>
      {tier.label === "Military" ? (
        <p style={{ color: COLORS.paperDim, fontSize: 12.5, marginTop: 6, lineHeight: 1.5 }}>
          🎖️ Locked in for life at 5% — thank you for your service.
        </p>
      ) : locked ? (
        <>
          <p style={{ color: COLORS.paperDim, fontSize: 12.5, marginTop: 6, lineHeight: 1.5 }}>
            Locked in for life — you're captain #{joinIndex}. Only {remaining} spot{remaining !== 1 ? "s" : ""} left at this rate before it rises.
          </p>
          <div className="w-full h-1.5 rounded-full mt-3" style={{ background: COLORS.line }}>
            <div className="h-1.5 rounded-full" style={{ width: `${pctFull * 100}%`, background: COLORS.gold }} />
          </div>
        </>
      ) : (
        <p style={{ color: COLORS.paperDim, fontSize: 12.5, marginTop: 6, lineHeight: 1.5 }}>
          Standard platform rate. Ask about sponsor-subsidized rates below.
        </p>
      )}
    </div>
  );
}

function FoundingAnglerCard({ joinIndex }) {
  const isFounding = joinIndex <= ANGLER_FOUNDING_CAP;
  const remaining = ANGLER_FOUNDING_CAP - joinIndex;
  const pctFull = Math.min(1, joinIndex / ANGLER_FOUNDING_CAP);

  if (!isFounding) return null;

  return (
    <div className="rounded-2xl p-4 mb-5" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.gold}55` }}>
      <div className="flex items-center justify-between">
        <span style={{ color: COLORS.gold, fontSize: 12, fontFamily: MONO, letterSpacing: 0.5 }}>⭐ FOUNDING ANGLER</span>
        <span style={{ color: COLORS.paper, fontFamily: MONO, fontSize: 12 }}>#{joinIndex}</span>
      </div>
      <p style={{ color: COLORS.paperDim, fontSize: 12.5, marginTop: 6, lineHeight: 1.5 }}>
        You're one of the first {ANGLER_FOUNDING_CAP.toLocaleString()} anglers on Last Cast — you get first look at
        new deals before anyone else sees them. Only {remaining.toLocaleString()} founding spot{remaining !== 1 ? "s" : ""} left.
      </p>
      <div className="w-full h-1.5 rounded-full mt-3" style={{ background: COLORS.line }}>
        <div className="h-1.5 rounded-full" style={{ width: `${pctFull * 100}%`, background: COLORS.gold }} />
      </div>
    </div>
  );
}

function SponsorClaim({ sponsors }) {
  const [selected, setSelected] = useState(sponsors[0]?.id || "");
  const [proof, setProof] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const activeSponsor = sponsors.find((s) => s.id === selected);

  if (submitted) {
    return (
      <div className="mt-3 rounded-xl p-3" style={{ background: `${COLORS.teal}18`, border: `1px solid ${COLORS.teal}55` }}>
        <p style={{ color: COLORS.paper, fontSize: 12.5, lineHeight: 1.5 }}>
          Claim submitted for <span style={{ color: COLORS.teal }}>{activeSponsor?.name}</span> — {activeSponsor?.discountPct}% off
          your platform fee once verified.
        </p>
      </div>
    );
  }

  return (
    <>
      <p style={{ color: COLORS.paperDim, fontSize: 12.5, marginTop: 6, lineHeight: 1.5 }}>
        If a brand sponsoring you is also an official Last Cast sponsor, link it below for a discounted fee.
      </p>
      <label className="flex flex-col gap-1.5 mt-3">
        <span style={{ color: COLORS.paperDim, fontSize: 11, fontFamily: MONO }}>OFFICIAL SPONSOR</span>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="rounded-xl px-3 py-2.5 text-sm outline-none"
          style={{ background: COLORS.paper, color: COLORS.ink }}
        >
          {sponsors.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {s.discountPct}% off
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 mt-3">
        <span style={{ color: COLORS.paperDim, fontSize: 11, fontFamily: MONO }}>PROOF YOU'RE SPONSORED (email, code, or link)</span>
        <input
          value={proof}
          onChange={(e) => setProof(e.target.value)}
          placeholder="e.g. your rep's email or sponsorship code"
          className="rounded-xl px-3 py-2.5 text-sm outline-none"
          style={{ background: COLORS.paper, color: COLORS.ink }}
        />
      </label>
      <button
        disabled={!proof.trim()}
        onClick={() => setSubmitted(true)}
        className="mt-3 px-4 py-2 rounded-full text-xs font-semibold"
        style={{
          background: proof.trim() ? COLORS.teal : "transparent",
          border: `1px solid ${COLORS.teal}`,
          color: proof.trim() ? COLORS.ink : COLORS.paperDim,
          opacity: proof.trim() ? 1 : 0.6,
        }}
      >
        Submit for verification
      </button>
    </>
  );
}

function PostCancellation({ onSave, onClose, initialValues }) {
  const isEdit = Boolean(initialValues);
  const [kind, setKind] = useState(initialValues?.kind || "cancellation");
  const [groupType, setGroupType] = useState(initialValues?.groupType || "shared");
  const [form, setForm] = useState({
    species: initialValues?.species || "",
    type: initialValues?.type || "Offshore",
    duration: initialValues?.duration || "4 hrs",
    spots: initialValues ? String(initialValues.spots) : "2",
    price: initialValues ? String(initialValues.price) : "",
    hours: initialValues?.hours ? String(initialValues.hours) : "4",
    date: initialValues?.date || "",
    meetingPoint: initialValues?.meetingPoint || "",
    included: initialValues?.included?.join(", ") || "",
    licenseNote: initialValues?.licenseNote || "",
    notes: initialValues?.notes || "",
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const isPrivate = kind === "private";
  const valid = isPrivate
    ? form.species && form.duration && form.price && Number(form.spots) > 0 && form.date
    : kind === "cancellation"
    ? form.species && form.duration && form.price && Number(form.spots) > 0 && form.hours
    : form.species && form.duration && form.price && Number(form.spots) > 0 && form.date;

  return (
    <div className="fixed inset-0 flex items-end justify-center z-50" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div
        className="w-full rounded-t-3xl p-6 overflow-y-auto"
        style={{ background: COLORS.ink, maxWidth: 480, border: `1px solid ${COLORS.line}`, borderBottom: "none", maxHeight: "88vh" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 19, fontWeight: 600 }}>
            {isEdit ? "Edit trip" : "Post a trip"}
          </h2>
          <button onClick={onClose} style={{ color: COLORS.paperDim, fontSize: 20 }}>×</button>
        </div>

        <div className="flex mb-5 rounded-full p-1" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
          {[
            { key: "cancellation", label: "Cancellation" },
            { key: "open", label: "Open Trip" },
            { key: "private", label: "Private Charter" },
          ].map((t) => {
            const active = kind === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setKind(t.key)}
                className="flex-1 py-2 rounded-full text-xs font-medium transition"
                style={{ background: active ? COLORS.rust : "transparent", color: active ? COLORS.paper : COLORS.paperDim }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {isPrivate && (
          <p style={{ color: COLORS.paperDim, fontSize: 11.5, marginBottom: 14, lineHeight: 1.4 }}>
            Sell the whole boat as one trip, like a swordfishing charter — a flat price for everyone you bring, not
            per seat.
          </p>
        )}

        <div className="flex flex-col gap-4">
          <Field
            label={isPrivate ? "SPECIES / TRIP TYPE" : "SPECIES / TRIP TYPE"}
            value={form.species}
            onChange={set("species")}
            placeholder={isPrivate ? "Swordfish" : "Snapper, Grouper"}
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span style={{ color: COLORS.paperDim, fontSize: 12, fontFamily: MONO }}>CATEGORY</span>
              <select
                value={form.type}
                onChange={set("type")}
                className="rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: COLORS.paper, color: COLORS.ink }}
              >
                {CATEGORIES.filter((c) => c.key !== "All").map((c) => (
                  <option key={c.key} value={c.key}>{c.key}</option>
                ))}
              </select>
            </label>
            <Field label="TRIP LENGTH *" value={form.duration} onChange={set("duration")} placeholder="4 hrs" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field
              label={isPrivate ? "MAX GUESTS" : "OPEN SEATS"}
              type="number"
              min="1"
              value={form.spots}
              onChange={set("spots")}
            />
            {kind === "cancellation" ? (
              <Field label="DEPARTS IN (HRS)" type="number" min="1" value={form.hours} onChange={set("hours")} />
            ) : (
              <Field label="TRIP DATE" type="date" value={form.date} onChange={set("date")} />
            )}
          </div>
          <Field
            label={isPrivate ? "TOTAL TRIP PRICE ($)" : "PRICE PER SEAT ($)"}
            type="number"
            min="1"
            value={form.price}
            onChange={set("price")}
            placeholder={isPrivate ? "1800" : "145"}
          />

          <Field label="MEETING POINT" value={form.meetingPoint} onChange={set("meetingPoint")} placeholder="Harborwalk Marina, Dock C" />

          {!isPrivate && (
            <label className="flex flex-col gap-1.5">
              <span style={{ color: COLORS.paperDim, fontSize: 12, fontFamily: MONO }}>GROUP TYPE</span>
              <div className="flex rounded-full p-1" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
                {[
                  { key: "shared", label: "Shared / walk-on" },
                  { key: "private", label: "Private charter" },
                ].map((g) => {
                  const active = groupType === g.key;
                  return (
                    <button
                      key={g.key}
                      onClick={() => setGroupType(g.key)}
                      className="flex-1 py-2 rounded-full text-xs font-medium transition"
                      style={{ background: active ? COLORS.teal : "transparent", color: active ? COLORS.ink : COLORS.paperDim }}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </label>
          )}

          <Field
            label="WHAT'S INCLUDED (comma separated)"
            value={form.included}
            onChange={set("included")}
            placeholder="Rods & tackle, Bait, Ice & cooler"
          />
          <Field
            label="LICENSE NOTE"
            value={form.licenseNote}
            onChange={set("licenseNote")}
            placeholder="e.g. No license needed — covered by the charter"
          />
          <Field
            label="NOTES FOR BOOKED ANGLERS (optional)"
            value={form.notes}
            onChange={set("notes")}
            placeholder="e.g. Meet at the north dock, not the main one"
          />

          <PrimaryButton
            onClick={() => {
              if (!valid) {
                const missing = [];
                if (!form.species) missing.push("Species / trip type");
                if (!form.duration) missing.push("Trip length");
                if (!form.price) missing.push("Price");
                if (!(Number(form.spots) > 0)) missing.push(isPrivate ? "Max guests" : "Open seats");
                if (kind === "cancellation" && !form.hours) missing.push("Departs in (hrs)");
                if ((kind === "open" || kind === "private") && !form.date) missing.push("Trip date");
                alert(`Please fill in: ${missing.join(", ")}`);
                return;
              }
              onSave({ ...form, kind, groupType: isPrivate ? "private" : groupType }, initialValues?.id);
            }}
          >
            {isEdit ? "Save changes" : isPrivate ? "List charter" : kind === "cancellation" ? "Post to Last Cast" : "List this trip"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   CAPTAIN: DASHBOARD
--------------------------------------------------------------------- */
function listingWhen(l) {
  if ((l.kind === "open" || l.kind === "private") && l.date) return new Date(l.date).getTime();
  if (l.kind === "cancellation" && l.hours != null) return Date.now() + l.hours * 3600000;
  return Infinity;
}

function CaptainDashboard({ captain, joinIndex, bookings, realListings, realBookings, onExit, onSettings, onPhotoChange, onOpenBooking, reviewReplies, onReplyReview, onVerifyMilitary, onRemoveMilitary, sponsors, extraReviews }) {
  const listings = realListings || [];
  const [showPost, setShowPost] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [repostSeed, setRepostSeed] = useState(null);
  const [sponsorInterest, setSponsorInterest] = useState(false);

  const stats = useMemo(
    () => ({
      trips: realBookings?.filter((b) => !b.waitlist).length || 0,
      seatsFilled: realBookings?.filter((b) => !b.waitlist).reduce((s, b) => s + (b.spots || 0), 0) || 0,
      recovered: realBookings
        ?.filter((b) => !b.waitlist)
        .reduce((s, b) => s + (b.charter?.saleType === "private" ? b.charter.totalPrice || 0 : (b.charter?.price || 0) * (b.spots || 0)), 0) || 0,
    }),
    [realBookings]
  );
  const sortedListings = useMemo(() => [...listings].sort((a, b) => listingWhen(a) - listingWhen(b)), [listings]);
  // Real bookings on this captain's real listings (matched by real account),
  // plus any sample-charter bookings still matched by name for the demo data.
  const myPassengers = useMemo(() => {
    const nameMatched = (bookings || []).filter((b) => normalizeCaptainName(b.charter?.captain) === normalizeCaptainName(captain.name));
    return [...(realBookings || []), ...nameMatched];
  }, [bookings, realBookings, captain.name]);
  const myReviews = useMemo(() => {
    const out = [];
    ALL_CHARTERS.filter((c) => normalizeCaptainName(c.captain) === normalizeCaptainName(captain.name)).forEach((charter) => {
      reviewsFor(charter, extraReviews).forEach((review, idx) => {
        out.push({ key: `${charter.id}-${idx}`, charter, review });
      });
    });
    return out;
  }, [captain.name, extraReviews]);

  const closeForm = () => {
    setShowPost(false);
    setEditingListing(null);
    setRepostSeed(null);
  };

  const buildListingFromForm = (form) => ({
    kind: form.kind,
    species: form.species,
    type: form.type,
    duration: form.duration,
    spots: Number(form.spots),
    spotsLeft: Number(form.spots),
    price: Number(form.price),
    hours: form.kind === "cancellation" ? Number(form.hours) : null,
    date: (form.kind === "open" || form.kind === "private") ? form.date : null,
    meetingPoint: form.meetingPoint,
    groupType: form.groupType,
    included: form.included ? form.included.split(",").map((s) => s.trim()).filter(Boolean) : [],
    licenseNote: form.licenseNote,
    notes: form.notes,
    captainUid: captain.uid || null,
    captainName: captain.name || "Captain",
    boat: captain.boat || "",
    location: captain.location || "",
    zip: captain.zip || "",
  });

  const formOpen = showPost || editingListing || repostSeed;

  return (
    <div className="px-6 pt-6 pb-16">
      <div className="flex items-center justify-between mb-4">
        <button onClick={onExit} style={{ color: COLORS.paperDim, fontSize: 14 }}>
          ← Back to app
        </button>
        <button onClick={onSettings} style={{ color: COLORS.paperDim, fontSize: 18 }}>
          ⚙
        </button>
      </div>

      <div className="mb-5">
        <AvatarUpload photoUrl={captain.photoUrl} onChange={onPhotoChange} fallback="⚓" size={80} />
      </div>

      {captain.militaryStatus && <ServiceBanner />}

      <div className="mb-6">
        <div style={{ color: COLORS.paperDim, fontSize: 12, fontFamily: MONO }}>WELCOME BACK</div>
        <h1 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 22, fontWeight: 600, marginTop: 2 }}>{captain.name || "Captain"}</h1>
        <div style={{ color: COLORS.paperDim, fontSize: 13, marginTop: 1 }}>
          {captain.boat} · {captain.location}
        </div>
      </div>

      <div className="mb-6">
        <VeteranVerification status={captain.militaryStatus} onVerify={onVerifyMilitary} onRemove={onRemoveMilitary} />
      </div>

      <FeeTierCard joinIndex={joinIndex} militaryStatus={captain.militaryStatus} />

      <div className="grid grid-cols-3 gap-2 mt-4">
        {[["Trips run", stats.trips], ["Seats filled", stats.seatsFilled], ["Recovered", `$${stats.recovered.toLocaleString()}`]].map(([label, val]) => (
          <div key={label} className="rounded-2xl p-3 text-center" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
            <div style={{ color: COLORS.paper, fontFamily: MONO, fontSize: 16, fontWeight: 500 }}>{val}</div>
            <div style={{ color: COLORS.paperDim, fontSize: 10.5, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-7">
        <h2 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 17, fontWeight: 600, marginBottom: 4 }}>Booked passengers</h2>
        <p style={{ color: COLORS.paperDim, fontSize: 11.5, marginBottom: 10, lineHeight: 1.4, opacity: 0.85 }}>
          Everyone who's booked a trip under your captain name — so you know who you're looking for at the dock.
        </p>
        {myPassengers.length === 0 && (
          <p style={{ color: COLORS.paperDim, fontSize: 13 }}>
            No passengers yet — once someone books a trip under your captain name, they'll show up here with their
            photo.
          </p>
        )}
        <div className="flex flex-col gap-2">
          {myPassengers.map((b) => (
            <button
              key={b.id}
              onClick={() => onOpenBooking(b)}
              className="w-full flex items-center gap-3 rounded-2xl p-3 text-left"
              style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
                style={{ background: avatarColorFor(b.name) }}
              >
                {b.photoUrl ? (
                  <img src={b.photoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.ink, fontFamily: MONO }}>{initials(b.name)}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="truncate" style={{ color: COLORS.paper, fontSize: 14, fontWeight: 500 }}>{b.name}</span>
                  {b.waitlist && <Tag tone="teal">Waitlisted</Tag>}
                </div>
                <div className="truncate" style={{ color: COLORS.paperDim, fontSize: 11.5, marginTop: 1 }}>
                  {b.charter.boat} · {b.spots} {b.charter.saleType === "private" ? "guests" : "seats"} · {formatDateTime(b.charter.departure)}
                </div>
              </div>
              <span style={{ color: COLORS.paperDim, fontSize: 14 }}>›</span>
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setShowPost(true)}
        className="w-full mt-5 rounded-2xl py-4 font-semibold text-sm flex items-center justify-center gap-2"
        style={{ background: COLORS.rust, color: COLORS.paper }}
      >
        + Post a trip
      </button>

      {/* Recent activity — built from real bookings matched to this captain by name.
          Tap any entry to see the full booking. Instant push/email/SMS alerts still
          need the backend — this shows the data, not live delivery, yet. */}
      <div className="mt-7">
        <h2 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 17, fontWeight: 600, marginBottom: 10 }}>Recent activity</h2>
        {myPassengers.length === 0 && (
          <p style={{ color: COLORS.paperDim, fontSize: 13 }}>
            Nothing yet — bookings made under your captain name will show up here.
          </p>
        )}
        <div className="flex flex-col gap-2">
          {[...myPassengers]
            .sort((a, b) => (b.id > a.id ? 1 : -1))
            .map((b) => (
              <button
                key={b.id}
                onClick={() => onOpenBooking(b)}
                className="w-full text-left rounded-xl px-3.5 py-2.5 flex items-center justify-between"
                style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}
              >
                <span style={{ color: COLORS.paperDim, fontSize: 12.5 }}>
                  {b.name} {b.waitlist ? "joined the waitlist for" : "booked"} {b.spots}{" "}
                  {b.charter.saleType === "private" ? "guests on" : "seat" + (b.spots > 1 ? "s" : "") + " on"} {b.charter.boat}
                </span>
                <span style={{ color: COLORS.paperDim, fontSize: 14 }}>›</span>
              </button>
            ))}
        </div>
      </div>

      <div className="mt-7">
        <h2 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 17, fontWeight: 600, marginBottom: 10 }}>Your active listings</h2>
        <p style={{ color: COLORS.paperDim, fontSize: 11, marginTop: -6, marginBottom: 10, opacity: 0.7 }}>Sorted soonest first</p>
        {sortedListings.length === 0 && (
          <p style={{ color: COLORS.paperDim, fontSize: 13 }}>Nothing posted right now — cancellations happen, seats don't have to sit empty.</p>
        )}
        <div className="flex flex-col gap-2">
          {sortedListings.map((l) => {
            const net = (l.price * (1 - tierFor(joinIndex, captain.militaryStatus).pct / 100)).toFixed(0);
            return (
              <div key={l.id} className="rounded-2xl p-3.5" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span style={{ color: COLORS.paper, fontSize: 14, fontWeight: 500 }}>{l.species}</span>
                      <Tag tone={l.kind === "open" ? "teal" : l.kind === "private" ? "gold" : "rust"}>
                        {l.kind === "open" ? "Open Trip" : l.kind === "private" ? "Private Charter" : "Cancellation"}
                      </Tag>
                    </div>
                    <div style={{ color: COLORS.paperDim, fontSize: 12, marginTop: 4 }}>
                      {l.kind === "private"
                        ? `up to ${l.spots} guests · trip on ${l.date}`
                        : `${l.spots} seats · ${l.kind === "open" ? `trip on ${l.date}` : `departs in ${l.hours}h`}`}
                    </div>
                    {l.notes && (
                      <div style={{ color: COLORS.gold, fontSize: 11.5, marginTop: 4, fontStyle: "italic" }}>note: {l.notes}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div style={{ color: COLORS.paper, fontFamily: MONO, fontSize: 14 }}>
                      ${l.price}{l.kind === "private" ? " total" : "/seat"}
                    </div>
                    <div style={{ color: COLORS.gold, fontSize: 11, marginTop: 2 }}>you net ${net}</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${COLORS.line}` }}>
                  <button
                    onClick={() => setEditingListing(l)}
                    className="flex-1 py-1.5 rounded-full text-xs font-medium"
                    style={{ border: `1px solid ${COLORS.line}`, color: COLORS.paperDim }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setRepostSeed(l)}
                    className="flex-1 py-1.5 rounded-full text-xs font-medium"
                    style={{ border: `1px solid ${COLORS.teal}`, color: COLORS.teal }}
                  >
                    Repost
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Remove this listing? Anglers will no longer see it.")) {
                        deleteDoc(doc(db, "listings", l.id)).catch((err) => console.error("Failed to delete listing:", err));
                      }
                    }}
                    className="flex-1 py-1.5 rounded-full text-xs font-medium"
                    style={{ border: `1px solid ${COLORS.rust}`, color: COLORS.rust }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CaptainReviews myReviews={myReviews} replies={reviewReplies} onReply={onReplyReview} />

      <div className="mt-7 rounded-2xl p-4" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.teal}55` }}>
        <div style={{ color: COLORS.teal, fontSize: 12, fontFamily: MONO, letterSpacing: 0.5 }}>SPONSORED RATES</div>

        {sponsors.length === 0 ? (
          <>
            <p style={{ color: COLORS.paperDim, fontSize: 12.5, marginTop: 6, lineHeight: 1.5 }}>
              Last Cast doesn't have any official sponsors yet. Once a brand signs on as a platform sponsor, you'll
              be able to link your matching sponsorship here for a discounted fee.
            </p>
            <button
              onClick={() => setSponsorInterest(true)}
              className="mt-3 px-4 py-2 rounded-full text-xs font-semibold"
              style={{ background: sponsorInterest ? COLORS.teal : "transparent", border: `1px solid ${COLORS.teal}`, color: sponsorInterest ? COLORS.ink : COLORS.teal }}
            >
              {sponsorInterest ? "We'll notify you ✓" : "Notify me when sponsors are added"}
            </button>
          </>
        ) : (
          <SponsorClaim sponsors={sponsors} />
        )}
      </div>

      {/* Coming soon — honestly labeled, no fake data. These need Stripe/backend to be real. */}
      <div className="mt-7 rounded-2xl p-4" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
        <div style={{ color: COLORS.paperDim, fontSize: 12, fontFamily: MONO, letterSpacing: 0.5 }}>COMING SOON</div>
        <div className="flex flex-col gap-2.5 mt-3">
          {[
            ["Payout history", "See exactly what you've earned and what's on the way, once real payments are live."],
            ["Multi-boat support", "Run more than one boat? List and manage each separately."],
            ["Captain referral program", "Bring another captain onto Last Cast, earn a fee break."],
          ].map(([title, desc]) => (
            <div key={title}>
              <div style={{ color: COLORS.paper, fontSize: 13, fontWeight: 500 }}>{title}</div>
              <div style={{ color: COLORS.paperDim, fontSize: 12, marginTop: 1, lineHeight: 1.4 }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {formOpen && (
        <PostCancellation
          onClose={closeForm}
          initialValues={editingListing || (repostSeed ? { ...repostSeed, id: undefined } : null)}
          onSave={async (form, id) => {
            if (!captain.uid) {
              alert("Your captain account is missing its login ID — please log out and log back in, then try posting again.");
              return;
            }
            try {
              if (editingListing) {
                await updateDoc(doc(db, "listings", id), buildListingFromForm(form));
              } else {
                await addDoc(collection(db, "listings"), { ...buildListingFromForm(form), createdAt: Date.now() });
              }
              closeForm();
            } catch (err) {
              console.error("Failed to save listing:", err);
              alert(`Couldn't save this listing: ${err.message || "unknown error"}. Please try again.`);
            }
          }}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------
   CAPTAIN: BOOKING DETAIL (opened from Recent activity / Booked passengers)
--------------------------------------------------------------------- */
function CaptainBookingDetail({ booking, onBack }) {
  const c = booking.charter;
  return (
    <div className="px-6 pt-6 pb-14">
      <button onClick={onBack} style={{ color: COLORS.paperDim, fontSize: 14 }} className="mb-4">
        ← Back
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ background: avatarColorFor(booking.name) }}
        >
          {booking.photoUrl ? (
            <img src={booking.photoUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span style={{ fontSize: 18, fontWeight: 700, color: COLORS.ink, fontFamily: MONO }}>{initials(booking.name)}</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className="truncate" style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 20, fontWeight: 600 }}>{booking.name}</h1>
            {booking.waitlist && <Tag tone="teal">Waitlisted</Tag>}
            {!booking.waitlist && <Tag tone={booking.status === "upcoming" ? "gold" : "teal"}>{booking.status === "upcoming" ? "Upcoming" : "Completed"}</Tag>}
          </div>
          <div className="truncate" style={{ color: COLORS.paperDim, fontSize: 12.5, marginTop: 2 }}>{booking.email}</div>
        </div>
      </div>

      <div className="rounded-2xl p-4" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
        <Row label="Trip" value={c.boat} />
        <Row label={c.saleType === "private" ? "Guests" : "Seats"} value={booking.spots} />
        <Row label="Departs" value={formatDateTime(c.departure)} />
        <Row label="Meeting point" value={c.meetingPoint || c.location} />
        <Row
          label="Total"
          value={`$${c.saleType === "private" ? c.totalPrice : c.price * booking.spots}`}
        />
      </div>

      <p style={{ color: COLORS.paperDim, fontSize: 11, marginTop: 10, opacity: 0.7, lineHeight: 1.4 }}>
        This is the full detail behind that Recent activity entry — everything you'd need to know before the trip.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------
   CAPTAIN: REVIEWS (read + reply)
--------------------------------------------------------------------- */
function CaptainReviews({ myReviews, replies, onReply }) {
  const [openKey, setOpenKey] = useState(null);
  const [draft, setDraft] = useState("");

  return (
    <div className="mt-7">
      <h2 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 17, fontWeight: 600, marginBottom: 4 }}>Reviews</h2>
      <p style={{ color: COLORS.paperDim, fontSize: 11.5, marginBottom: 10, lineHeight: 1.4, opacity: 0.85 }}>
        Tap a review to read the full comment and reply.
      </p>
      {myReviews.length === 0 && (
        <p style={{ color: COLORS.paperDim, fontSize: 13 }}>No reviews yet for trips under your captain name.</p>
      )}
      <div className="flex flex-col gap-2">
        {myReviews.map(({ key, charter, review }) => {
          const isOpen = openKey === key;
          const existingReply = replies[key];
          return (
            <div key={key} className="rounded-2xl p-3.5" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
              <button
                className="w-full text-left"
                onClick={() => {
                  setOpenKey(isOpen ? null : key);
                  setDraft(existingReply || "");
                }}
              >
                <div className="flex items-center justify-between">
                  <span style={{ color: COLORS.paper, fontSize: 13.5, fontWeight: 500 }}>{review.name}</span>
                  <span style={{ color: COLORS.gold, fontSize: 12.5 }}>{"★".repeat(review.rating)}</span>
                </div>
                <div style={{ color: COLORS.paperDim, fontSize: 11, marginTop: 1 }}>{charter.boat}</div>
                <p style={{ color: COLORS.paperDim, fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>{review.comment}</p>
              </button>

              {existingReply && !isOpen && (
                <div className="mt-2 pt-2 pl-3" style={{ borderTop: `1px solid ${COLORS.line}`, borderLeft: `2px solid ${COLORS.teal}` }}>
                  <div style={{ color: COLORS.teal, fontSize: 11, fontFamily: MONO }}>YOUR REPLY</div>
                  <p style={{ color: COLORS.paperDim, fontSize: 12.5, marginTop: 2, lineHeight: 1.4 }}>{existingReply}</p>
                </div>
              )}

              {isOpen && (
                <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${COLORS.line}` }}>
                  <Field
                    label="YOUR REPLY"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Thanks for coming out with us..."
                  />
                  <PrimaryButton
                    disabled={!draft.trim()}
                    onClick={() => {
                      onReply(key, draft.trim());
                      setOpenKey(null);
                    }}
                  >
                    {existingReply ? "Update reply" : "Post reply"}
                  </PrimaryButton>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   ADMIN: LOGIN + DASHBOARD (real captain approval, sponsors, platform stats)
--------------------------------------------------------------------- */
function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const valid = email.includes("@") && password.length >= 4;
  return (
    <div className="px-6 pt-10 pb-10">
      <BrandMark />
      <div className="mt-6">
        <Header eyebrow="ADMIN" title="Last Cast platform admin" sub="Approve captains, manage sponsors, and see how the platform's doing." />
      </div>
      <div className="flex flex-col gap-4">
        <Field label="EMAIL" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@lastcast.app" />
        <Field label="PASSWORD" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        <PrimaryButton disabled={!valid} onClick={onLogin}>Log in</PrimaryButton>
        <p style={{ color: COLORS.paperDim, fontSize: 11, marginTop: 4, opacity: 0.7, lineHeight: 1.4 }}>
          This login doesn't check anything real yet — same as the rest of the app until the backend exists. Anyone
          who knows the ?admin=1 link can reach this screen for now.
        </p>
      </div>
    </div>
  );
}

function AdminCaptainAppCard({ app, onApprove, onReject }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
      <button onClick={() => setOpen((v) => !v)} className="w-full text-left p-3.5">
        <div className="flex items-center justify-between">
          <span style={{ color: COLORS.paper, fontSize: 14, fontWeight: 500 }}>{app.name}</span>
          <span style={{ color: COLORS.paperDim, fontSize: 14 }}>{open ? "▾" : "▸"}</span>
        </div>
        <div style={{ color: COLORS.paperDim, fontSize: 12, marginTop: 2 }}>
          {app.boat} · {app.location}
        </div>
      </button>

      {open && (
        <div className="px-3.5 pb-3.5">
          <div className="rounded-xl p-3 mb-3" style={{ background: COLORS.ink, border: `1px solid ${COLORS.line}` }}>
            <Row label="Captain" value={app.name} />
            <Row label="Email" value={app.email} />
            <Row label="Boat" value={app.boat} />
            <Row label="Home port" value={app.location} />
            <Row label="Zip" value={app.zip} />
            <Row label="Specialties" value={app.species} />
            <Row label="Submitted" value={app.createdAt ? formatDateTime(new Date(app.createdAt)) : "—"} />
          </div>

          <div className="rounded-xl p-3 mb-3" style={{ background: `${COLORS.gold}14`, border: `1px solid ${COLORS.gold}55` }}>
            <div style={{ color: COLORS.gold, fontSize: 11, fontFamily: MONO, marginBottom: 2 }}>LICENSE ON FILE</div>
            <div style={{ color: COLORS.paper, fontSize: 13 }}>📄 {app.licenseFileName || "None uploaded"}</div>
            <p style={{ color: COLORS.paperDim, fontSize: 10.5, marginTop: 6, lineHeight: 1.4, opacity: 0.8 }}>
              This confirms a file was uploaded, not a preview of the document itself — viewing the actual scan
              needs real file storage (Firebase Storage), which isn't connected yet.
            </p>
          </div>

          <div className="flex gap-2">
            <button onClick={onApprove} className="flex-1 py-1.5 rounded-full text-xs font-semibold" style={{ background: COLORS.teal, color: COLORS.ink }}>
              Approve
            </button>
            <button onClick={onReject} className="flex-1 py-1.5 rounded-full text-xs font-medium" style={{ border: `1px solid ${COLORS.rust}`, color: COLORS.rust }}>
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminDashboard({ pendingCaptains, onApproveCaptain, onRejectCaptain, sponsors, onAddSponsor, onRemoveSponsor, bookings, onBack }) {
  const [sponsorName, setSponsorName] = useState("");
  const [sponsorPct, setSponsorPct] = useState("10");

  const totalBookings = bookings.filter((b) => !b.waitlist).length;
  const totalWaitlist = bookings.filter((b) => b.waitlist).length;
  const totalRevenue = bookings
    .filter((b) => !b.waitlist)
    .reduce((sum, b) => sum + (b.charter.saleType === "private" ? b.charter.totalPrice : b.charter.price * b.spots), 0);

  return (
    <div className="px-6 pt-8 pb-16">
      <button onClick={onBack} style={{ color: COLORS.paperDim, fontSize: 14 }} className="mb-4">
        ← Back to app
      </button>
      <BrandMark />
      <h1 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 22, fontWeight: 600, marginTop: 16 }}>Admin dashboard</h1>

      <div className="grid grid-cols-3 gap-2 mt-4">
        {[["Bookings", totalBookings], ["Waitlisted", totalWaitlist], ["Revenue", `$${totalRevenue.toLocaleString()}`]].map(([label, val]) => (
          <div key={label} className="rounded-2xl p-3 text-center" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
            <div style={{ color: COLORS.paper, fontFamily: MONO, fontSize: 16, fontWeight: 500 }}>{val}</div>
            <div style={{ color: COLORS.paperDim, fontSize: 10.5, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-7">
        <h2 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 17, fontWeight: 600, marginBottom: 4 }}>
          Pending captain applications
        </h2>
        <p style={{ color: COLORS.paperDim, fontSize: 11.5, marginBottom: 10, lineHeight: 1.4, opacity: 0.85 }}>
          Review the license before approving — this is the actual gate that makes "verified captain" mean
          something.
        </p>
        {pendingCaptains.length === 0 && (
          <p style={{ color: COLORS.paperDim, fontSize: 13 }}>No applications waiting on you right now.</p>
        )}
        <div className="flex flex-col gap-2">
          {pendingCaptains.map((app) => (
            <AdminCaptainAppCard key={app.id} app={app} onApprove={() => onApproveCaptain(app.id)} onReject={() => onRejectCaptain(app.id)} />
          ))}
        </div>
      </div>

      <div className="mt-7">
        <h2 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 17, fontWeight: 600, marginBottom: 10 }}>Platform sponsors</h2>
        <div className="flex flex-col gap-2 mb-4">
          {sponsors.length === 0 && <p style={{ color: COLORS.paperDim, fontSize: 13 }}>No sponsors added yet.</p>}
          {sponsors.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl px-3.5 py-2.5" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
              <span style={{ color: COLORS.paper, fontSize: 13 }}>{s.name} — {s.discountPct}% off</span>
              <button onClick={() => onRemoveSponsor(s.id)} style={{ color: COLORS.rust, fontSize: 12 }}>Remove</button>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <Field label="SPONSOR NAME" value={sponsorName} onChange={(e) => setSponsorName(e.target.value)} placeholder="Yeti Coolers" />
          </div>
          <Field label="DISCOUNT %" type="number" min="1" max="100" value={sponsorPct} onChange={(e) => setSponsorPct(e.target.value)} />
        </div>
        <button
          disabled={!sponsorName.trim()}
          onClick={() => {
            onAddSponsor({ name: sponsorName.trim(), discountPct: Number(sponsorPct) });
            setSponsorName("");
          }}
          className="w-full mt-3 py-2.5 rounded-full text-xs font-semibold"
          style={{ background: sponsorName.trim() ? COLORS.gold : COLORS.line, color: COLORS.ink }}
        >
          + Add sponsor
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   APP SHELL — unifies customer app + captain portal with shared nav
--------------------------------------------------------------------- */
function wantsCaptainEntry() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("captain") === "1" || window.location.hash === "#captain";
}
function wantsAdminEntry() {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  return params.get("admin") === "1" || window.location.hash === "#admin";
}

export default function LastCastApp() {
  // "customer", "captain", or "admin" side of the app — direct links
  // (?captain=1 / ?admin=1) drop straight into that portal
  const [side, setSide] = useState(() => {
    if (wantsAdminEntry()) return "admin";
    if (wantsCaptainEntry()) return "captain";
    return "customer";
  });
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  // customer-side view state
  const [customerView, setCustomerView] = useState("home");
  const [charter, setCharter] = useState(null);
  const [booking, setBooking] = useState(null);
  const [bookingDraft, setBookingDraft] = useState(null);

  // angler account state — separate from the guest-checkout booking flow above
  const [angler, setAngler] = useState(null);
  const [anglerBookings, setAnglerBookings] = useState([
    {
      id: "seed-1",
      charter: CHARTERS[1],
      spots: 2,
      status: "past",
      waitlist: false,
      name: "Danielle Reyes",
      email: "danielle@example.com",
      photoUrl: null,
      messages: [
        { from: "captain", text: "Thanks for booking — see you at the dock!" },
        { from: "angler", text: "Looking forward to it!" },
      ],
    },
  ]);
  const [activeTripId, setActiveTripId] = useState(null);
  const activeTrip = anglerBookings.find((b) => b.id === activeTripId) || null;

  // captain-side view state — starts on login whether entered via the button or a direct link
  const [captainView, setCaptainView] = useState("login");
  const cameFromDirectLink = useMemo(() => wantsCaptainEntry(), []);
  const [captain, setCaptain] = useState({});
  const [captainPostVerifyView, setCaptainPostVerifyView] = useState("license");
  const joinIndex = CAPTAINS_JOINED_SO_FAR + 1;
  const [reviewReplies, setReviewReplies] = useState({});
  const [activeCaptainBookingId, setActiveCaptainBookingId] = useState(null);
  const activeCaptainBooking = anglerBookings.find((b) => b.id === activeCaptainBookingId) || null;

  // Real captain applications now live in Firestore's "captains" collection —
  // this listener keeps pendingCaptains in sync live, across any tab or
  // device, instead of resetting every time the page reloads.
  const [pendingCaptains, setPendingCaptains] = useState([]);
  const [captainApprovalStatus, setCaptainApprovalStatus] = useState(null); // null | "pending" | "approved" | "rejected"
  const [sponsors, setSponsors] = useState([]);
  const [extraReviews, setExtraReviews] = useState({});
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [pendingAnglerProfile, setPendingAnglerProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const toggleFavorite = (id) =>
    setFavoriteIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // Live list of every captain application still pending review — any admin,
  // in any tab or on any device, sees the same real data from Firestore.
  useEffect(() => {
    const q = query(collection(db, "captains"), where("status", "==", "pending"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingCaptains(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  // Live status for whichever captain is currently logged in on this device —
  // updates automatically the moment an admin approves them, no refresh needed.
  useEffect(() => {
    if (!captain.uid) {
      setCaptainApprovalStatus(null);
      return;
    }
    const unsubscribe = onSnapshot(doc(db, "captains", captain.uid), (snap) => {
      setCaptainApprovalStatus(snap.exists() ? snap.data().status : null);
    });
    return () => unsubscribe();
  }, [captain.uid]);

  // Every real, captain-posted listing across the whole platform — this is
  // what makes Browse/Deals/Private actually show real trips, not just the
  // sample data. Converted to the same shape the UI already expects.
  const [realListingDocs, setRealListingDocs] = useState([]);
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "listings"), (snapshot) => {
      setRealListingDocs(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);
  const realCharters = useMemo(() => realListingDocs.map(listingToCharter), [realListingDocs]);

  // Real bookings made against THIS captain's real listings, matched by their
  // actual account (captainUid) — a real relational link, not name-guessing.
  const [realCaptainBookings, setRealCaptainBookings] = useState([]);
  useEffect(() => {
    if (!captain.uid) {
      setRealCaptainBookings([]);
      return;
    }
    const q = query(collection(db, "bookings"), where("captainUid", "==", captain.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRealCaptainBookings(
        snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            charter: realListingDocs.find((l) => l.id === data.listingId) ? listingToCharter(realListingDocs.find((l) => l.id === data.listingId)) : data.charterSnapshot,
          };
        })
      );
    });
    return () => unsubscribe();
  }, [captain.uid, realListingDocs]);

  const goCaptainPortal = () => {
    setSide("captain");
    // Only send them to the login screen if there's no logged-in captain
    // this session — otherwise this was wiping out an active dashboard
    // session every time someone tapped "Back to app" and then came back.
    if (!captain.uid) {
      setCaptainView("login");
    }
  };
  const goBackToApp = () => {
    setSide("customer");
    setCustomerView("home");
  };
  const goAccount = () => {
    setCustomerView(angler ? "account" : "anglerLogin");
  };

  // Updates local profile state AND persists the change to Firestore in one
  // step, so photo uploads, settings edits, license changes, and military
  // verification all actually stick around after logging back in.
  const updateAnglerProfile = async (updates) => {
    setAngler((prev) => ({ ...prev, ...updates }));
    if (angler?.uid) {
      try {
        await setDoc(doc(db, "anglers", angler.uid), updates, { merge: true });
      } catch (err) {
        console.error("Failed to save angler profile update:", err);
        alert(`This change didn't actually save: ${err.message || "unknown error"}. Please try again.`);
      }
    } else {
      console.error("updateAnglerProfile called with no angler.uid — nothing was saved to Firestore.");
      alert("Couldn't save — your account isn't fully logged in. Please log out and back in, then try again.");
    }
  };
  const updateCaptainProfile = async (updates) => {
    setCaptain((prev) => ({ ...prev, ...updates }));
    if (captain?.uid) {
      try {
        await setDoc(doc(db, "captains", captain.uid), updates, { merge: true });
      } catch (err) {
        console.error("Failed to save captain profile update:", err);
        alert(`This change didn't actually save: ${err.message || "unknown error"}. Please try again.`);
      }
    } else {
      console.error("updateCaptainProfile called with no captain.uid — nothing was saved to Firestore.");
      alert("Couldn't save — your account isn't fully logged in. Please log out and back in, then try again.");
    }
  };

  const finalizeBooking = (draft) => {
    setBooking(draft);
    setCustomerView("confirmed");
    setAnglerBookings((prev) => [
      ...prev,
      {
        id: `b-${Date.now()}`,
        charter,
        spots: draft.spots,
        status: "upcoming",
        waitlist: Boolean(draft.waitlist),
        name: draft.name,
        email: draft.email,
        photoUrl: angler?.photoUrl || null,
        messages: draft.waitlist
          ? []
          : [{ from: "captain", text: `Confirmed! Meet at ${charter.meetingPoint || charter.location}.` }],
      },
    ]);

    // If this is a real, captain-posted listing, save the booking for real —
    // this is what lets the captain see it on their own account, matched by
    // a real relational link instead of guessing from a matching name.
    if (charter.isRealListing) {
      (async () => {
        try {
          await addDoc(collection(db, "bookings"), {
            listingId: charter.id,
            captainUid: charter.captainUid,
            anglerUid: angler?.uid || null,
            name: draft.name,
            email: draft.email,
            photoUrl: angler?.photoUrl || null,
            spots: draft.spots,
            status: "upcoming",
            waitlist: Boolean(draft.waitlist),
            charterSnapshot: charter,
            createdAt: Date.now(),
          });
          if (!draft.waitlist) {
            const listingDoc = realListingDocs.find((l) => l.id === charter.id);
            if (listingDoc) {
              await updateDoc(doc(db, "listings", charter.id), {
                spotsLeft: Math.max(0, (listingDoc.spotsLeft != null ? listingDoc.spotsLeft : listingDoc.spots) - draft.spots),
              });
            }
          }
        } catch (err) {
          console.error("Failed to save real booking:", err);
        }
      })();
    }
  };

  return (
    <div className="w-full flex items-center justify-center" style={{ background: "#000", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <link rel="stylesheet" href={FONTS_LINK} />
      <div className="relative w-full" style={{ maxWidth: 480, minHeight: "100vh", background: COLORS.ink, overflowX: "hidden" }}>
        {side === "customer" && (
          <>
            {customerView === "home" && (
              <Home
                onSelect={(c) => {
                  setCharter(c);
                  setCustomerView("detail");
                }}
                onCaptainPortal={goCaptainPortal}
                onAccount={goAccount}
                angler={angler}
                favoriteIds={favoriteIds}
                onToggleFavorite={toggleFavorite}
                onSearch={(q) => {
                  setSearchQuery(q);
                  setCustomerView("search");
                }}
                realCharters={realCharters}
              />
            )}
            {customerView === "search" && (
              <SearchResultsPage
                initialQuery={searchQuery}
                onSelect={(c) => {
                  setCharter(c);
                  setCustomerView("detail");
                }}
                onBack={() => setCustomerView("home")}
                favoriteIds={favoriteIds}
                onToggleFavorite={toggleFavorite}
                angler={angler}
                realCharters={realCharters}
              />
            )}
            {customerView === "detail" && charter && (
              <Detail
                charter={charter}
                onBack={() => setCustomerView("home")}
                onBook={(selectedDeparture) => {
                  if (selectedDeparture && selectedDeparture.getTime() !== charter.departure.getTime()) {
                    setCharter({ ...charter, departure: selectedDeparture });
                  }
                  setCustomerView("booking");
                }}
                onViewReviews={() => setCustomerView("charterReviews")}
                isFavorited={favoriteIds.includes(charter.id)}
                onToggleFavorite={() => toggleFavorite(charter.id)}
                extraReviews={extraReviews}
              />
            )}
            {customerView === "charterReviews" && charter && (
              <CharterReviewsPage charter={charter} replies={reviewReplies} extraReviews={extraReviews} onBack={() => setCustomerView("detail")} />
            )}
            {customerView === "booking" && charter && (
              <Booking
                charter={charter}
                angler={angler}
                onBack={() => setCustomerView("detail")}
                onNext={(draft) => {
                  if (draft.waitlist) {
                    finalizeBooking(draft);
                  } else {
                    setBookingDraft(draft);
                    setCustomerView("reviewBooking");
                  }
                }}
              />
            )}
            {customerView === "reviewBooking" && charter && bookingDraft && (
              <ReviewBooking
                charter={charter}
                draft={bookingDraft}
                angler={angler}
                onBack={() => setCustomerView("booking")}
                onConfirm={(draft) => finalizeBooking(draft)}
              />
            )}
            {customerView === "confirmed" && charter && booking && (
              <Confirmed
                charter={charter}
                booking={booking}
                onDone={() => {
                  setCustomerView("home");
                  setCharter(null);
                  setBooking(null);
                  setBookingDraft(null);
                }}
              />
            )}

            {customerView === "anglerLogin" && (
              <AnglerLogin
                onBack={() => setCustomerView("home")}
                onNew={() => setCustomerView("anglerRegister")}
                onLogin={async (a) => {
                  let profile = { name: a.email.split("@")[0], email: a.email, uid: a.uid, joinIndex: ANGLERS_JOINED_SO_FAR + 1 };
                  try {
                    const snap = await getDoc(doc(db, "anglers", a.uid));
                    if (snap.exists()) profile = { uid: a.uid, ...snap.data() };
                  } catch (err) {
                    console.error("Failed to load angler profile:", err);
                  }
                  if (!a.emailVerified) {
                    setPendingAnglerProfile(profile);
                    setCustomerView("anglerVerifyEmail");
                    return;
                  }
                  setAngler(profile);
                  setCustomerView("account");
                }}
              />
            )}
            {customerView === "anglerRegister" && (
              <AnglerRegister
                onBack={() => setCustomerView("anglerLogin")}
                onCreate={async (a) => {
                  const profile = { ...a, joinIndex: ANGLERS_JOINED_SO_FAR + 1 };
                  try {
                    await setDoc(doc(db, "anglers", a.uid), profile);
                  } catch (err) {
                    console.error("Failed to save angler profile:", err);
                  }
                  setPendingAnglerProfile(profile);
                  setCustomerView("anglerVerifyEmail");
                }}
              />
            )}
            {customerView === "anglerVerifyEmail" && pendingAnglerProfile && (
              <EmailVerifyScreen
                email={pendingAnglerProfile.email}
                onBack={() => setCustomerView("home")}
                onVerified={() => {
                  setAngler(pendingAnglerProfile);
                  setPendingAnglerProfile(null);
                  setCustomerView("account");
                }}
              />
            )}
            {customerView === "account" && angler && (
              <AnglerAccount
                angler={angler}
                bookings={anglerBookings}
                onBack={() => setCustomerView("home")}
                onLogout={() => {
                  setAngler(null);
                  setCustomerView("home");
                }}
                onOpenTrip={(b) => {
                  setActiveTripId(b.id);
                  setCustomerView("tripDetail");
                }}
                onSettings={() => setCustomerView("anglerSettings")}
                onPhotoChange={(dataUrl) => updateAnglerProfile({ photoUrl: dataUrl })}
                onVerifyMilitary={(status) => updateAnglerProfile({ militaryStatus: status })}
                onRemoveMilitary={() => updateAnglerProfile({ militaryStatus: null })}
              />
            )}
            {customerView === "anglerSettings" && angler && (
              <SettingsScreen
                title="Account settings"
                fields={[
                  { key: "firstName", label: "FIRST NAME", value: angler.firstName },
                  { key: "lastName", label: "LAST NAME", value: angler.lastName },
                  { key: "phone", label: "PHONE NUMBER", value: angler.phone },
                  { key: "email", label: "EMAIL", value: angler.email },
                  { key: "zip", label: "CURRENT ZIP CODE", value: angler.zip },
                ]}
                onBack={() => setCustomerView("account")}
                onSave={(values) => updateAnglerProfile({ ...values, name: `${values.firstName} ${values.lastName}` })}
                onLogout={() => {
                  setAngler(null);
                  setCustomerView("home");
                }}
                onDeleteAccount={() => {
                  setAngler(null);
                  setAnglerBookings([]);
                  setCustomerView("home");
                }}
                showLicense
                licenseFileName={angler.licenseFileName}
                onUploadLicense={(fileName) => updateAnglerProfile({ licenseFileName: fileName })}
              />
            )}
            {customerView === "tripDetail" && activeTrip && (
              <TripDetail
                booking={activeTrip}
                onBack={() => setCustomerView("account")}
                onMessage={() => setCustomerView("tripMessages")}
                onCancel={(bookingId) => {
                  setAnglerBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b)));
                }}
                onSubmitReview={(booking, { rating, comment }) => {
                  setExtraReviews((prev) => ({
                    ...prev,
                    [booking.charter.id]: [...(prev[booking.charter.id] || []), { name: angler?.name || booking.name, rating, comment }],
                  }));
                  setAnglerBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, reviewed: true } : b)));
                }}
              />
            )}
            {customerView === "tripMessages" && activeTrip && (
              <TripMessages
                booking={activeTrip}
                onBack={() => setCustomerView("tripDetail")}
                onSend={(text) => {
                  setAnglerBookings((prev) =>
                    prev.map((b) =>
                      b.id === activeTrip.id ? { ...b, messages: [...(b.messages || []), { from: "angler", text }] } : b
                    )
                  );
                }}
              />
            )}
          </>
        )}

        {side === "captain" && (
          <>
            {captainView === "login" && (
              <CaptainLogin
                onLogin={async (c) => {
                  let profile = { email: c.email, uid: c.uid };
                  let nextView = "completeProfile"; // real account exists, just no profile on file yet
                  try {
                    const snap = await getDoc(doc(db, "captains", c.uid));
                    if (snap.exists()) {
                      profile = { uid: c.uid, ...snap.data() };
                      nextView = profile.status === "approved" ? "dashboard" : "pending";
                    }
                  } catch (err) {
                    console.error("Failed to load captain profile:", err);
                    alert("Couldn't check your captain profile — please check your connection and try logging in again.");
                    return;
                  }
                  if (!c.emailVerified) {
                    setCaptain(profile);
                    setCaptainPostVerifyView(nextView);
                    setCaptainView("verifyEmail");
                    return;
                  }
                  setCaptain(profile);
                  setCaptainView(nextView);
                }}
                onNew={() => setCaptainView("register")}
                onBackToApp={goBackToApp}
                backLabel={cameFromDirectLink ? "← Looking for the angler app?" : "← Back to app"}
              />
            )}
            {captainView === "register" && (
              <CaptainRegister
                onBack={() => setCaptainView("login")}
                onNext={(form) => {
                  const { password, ...safeForm } = form;
                  setCaptain(safeForm);
                  setCaptainPostVerifyView("license");
                  setCaptainView("verifyEmail");
                }}
              />
            )}
            {captainView === "completeProfile" && (
              <CaptainCompleteProfile
                email={captain.email}
                onBack={() => setCaptainView("login")}
                onNext={(form) => {
                  setCaptain({ ...captain, ...form });
                  setCaptainView("license");
                }}
              />
            )}
            {captainView === "verifyEmail" && (
              <EmailVerifyScreen
                email={captain.email}
                onBack={() => setCaptainView("login")}
                onVerified={() => setCaptainView(captainPostVerifyView || "license")}
              />
            )}
            {captainView === "license" && (
              <CaptainLicense
                onBack={() => setCaptainView("register")}
                onNext={async (licenseFileName) => {
                  const { password, ...safeCaptain } = captain;
                  const profile = { ...safeCaptain, licenseFileName, status: "pending", createdAt: Date.now() };
                  await setDoc(doc(db, "captains", captain.uid), profile);
                  setCaptain(profile);
                  setCaptainView("pending");
                }}
              />
            )}
            {captainView === "pending" && (
              <CaptainPending
                isApproved={captainApprovalStatus === "approved"}
                onContinue={() => setCaptainView("dashboard")}
                onGoAdmin={() => setSide("admin")}
              />
            )}
            {captainView === "dashboard" && (
              <CaptainDashboard
                captain={captain}
                joinIndex={joinIndex}
                bookings={anglerBookings}
                realListings={realListingDocs.filter((l) => l.captainUid === captain.uid)}
                realBookings={realCaptainBookings}
                onExit={goBackToApp}
                onSettings={() => setCaptainView("settings")}
                onPhotoChange={(dataUrl) => updateCaptainProfile({ photoUrl: dataUrl })}
                reviewReplies={reviewReplies}
                onReplyReview={(key, text) => setReviewReplies((prev) => ({ ...prev, [key]: text }))}
                onOpenBooking={(b) => {
                  setActiveCaptainBookingId(b.id);
                  setCaptainView("bookingDetail");
                }}
                onVerifyMilitary={(status) => updateCaptainProfile({ militaryStatus: status })}
                onRemoveMilitary={() => updateCaptainProfile({ militaryStatus: null })}
                sponsors={sponsors}
                extraReviews={extraReviews}
              />
            )}
            {captainView === "bookingDetail" && activeCaptainBooking && (
              <CaptainBookingDetail booking={activeCaptainBooking} onBack={() => setCaptainView("dashboard")} />
            )}
            {captainView === "settings" && (
              <SettingsScreen
                title="Captain settings"
                fields={[
                  { key: "name", label: "YOUR NAME", value: captain.name },
                  { key: "boat", label: "BOAT NAME", value: captain.boat },
                  { key: "location", label: "HOME PORT / LOCATION", value: captain.location },
                  { key: "zip", label: "ZIP CODE", value: captain.zip },
                  { key: "species", label: "SPECIALTIES", value: captain.species },
                ]}
                onBack={() => setCaptainView("dashboard")}
                onSave={(values) => updateCaptainProfile(values)}
                onLogout={() => {
                  setCaptain({});
                  setCaptainView("login");
                }}
                onDeleteAccount={() => {
                  setCaptain({});
                  setCaptainView("login");
                }}
                deleteLabel="Delete captain account"
              />
            )}
          </>
        )}

        {side === "admin" && (
          <>
            {!adminLoggedIn ? (
              <AdminLogin onLogin={() => setAdminLoggedIn(true)} />
            ) : (
              <AdminDashboard
                pendingCaptains={pendingCaptains}
                onApproveCaptain={async (id) => {
                  try {
                    await updateDoc(doc(db, "captains", id), { status: "approved" });
                  } catch (err) {
                    console.error("Failed to approve captain:", err);
                  }
                }}
                onRejectCaptain={async (id) => {
                  try {
                    await updateDoc(doc(db, "captains", id), { status: "rejected" });
                  } catch (err) {
                    console.error("Failed to reject captain:", err);
                  }
                }}
                sponsors={sponsors}
                onAddSponsor={(s) => setSponsors((prev) => [...prev, { ...s, id: `sp-${Date.now()}` }])}
                onRemoveSponsor={(id) => setSponsors((prev) => prev.filter((s) => s.id !== id))}
                bookings={anglerBookings}
                onBack={() => setSide("captain")}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
