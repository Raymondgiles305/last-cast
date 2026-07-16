import React, { useState, useEffect, useMemo } from "react";

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

const CHARTERS = [
  {
    id: "c1",
    captain: "Capt. Mara Doyle",
    boat: "Silver Reel",
    location: "Destin, FL",
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
    meetingPoint: "Clark Fork River Access",
    species: ["Trout"],
    type: "Fly",
    departure: inHours(30),
    duration: "8 hrs",
    spotsLeft: 1,
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

function tierFor(joinIndex) {
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

/* ---------------------------------------------------------------------
   CUSTOMER: HOME
--------------------------------------------------------------------- */
function BrowseListingCard({ c, onSelect }) {
  return (
    <button
      onClick={() => onSelect(c)}
      className="flex gap-3 rounded-2xl p-3 text-left items-center"
      style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}
    >
      <div className="w-20 h-20 rounded-xl flex-shrink-0" style={{ background: c.img }} />
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
          <Tag tone="gold">{formatDate(c.departure)}</Tag>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <PriceBlock price={c.price} originalPrice={c.originalPrice} />
        <div style={{ fontSize: 11, marginTop: 4, color: COLORS.paperDim }}>{c.spotsLeft} seats left</div>
      </div>
    </button>
  );
}

function Home({ onSelect, onCaptainPortal }) {
  const [tab, setTab] = useState("deals"); // "deals" or "browse"
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const source = tab === "deals" ? CHARTERS : STANDARD_CHARTERS;

  const filtered = useMemo(() => {
    return source.filter((c) => {
      const matchesCat = category === "All" || c.type === category;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q || c.location.toLowerCase().includes(q) || c.species.some((s) => s.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [source, category, query]);

  const urgentDeals = [...filtered].sort((a, b) => a.departure - b.departure).slice(0, 3);

  return (
    <div>
      <div className="relative px-6 pt-8 pb-8" style={{ background: `radial-gradient(120% 100% at 20% 0%, #1c3540 0%, ${COLORS.ink} 60%)` }}>
        <div className="flex items-center justify-between mb-6">
          <BrandMark />
          <button
            onClick={onCaptainPortal}
            className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5"
            style={{ border: `1px solid ${COLORS.line}`, color: COLORS.paperDim }}
          >
            ⚓ Captain login
          </button>
        </div>

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
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by location or species..."
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: COLORS.ink }}
          />
        </div>

        <div className="flex mt-5 rounded-full p-1" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
          {[
            { key: "deals", label: "⏱ Deals" },
            { key: "browse", label: "Browse All Charters" },
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
        <h2 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 19, fontWeight: 600, marginBottom: 12 }}>
          {tab === "deals" ? "All open seats" : "Upcoming charters"}
        </h2>
        <div className="flex flex-col gap-3">
          {filtered.length === 0 && (
            <div style={{ color: COLORS.paperDim, fontSize: 14 }}>
              {tab === "deals"
                ? "No open seats match that search right now — try another spot or species."
                : "No upcoming charters match that search — try another spot or species."}
            </div>
          )}
          {tab === "deals" &&
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelect(c)}
                className="flex gap-3 rounded-2xl p-3 text-left items-center"
                style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}
              >
                <div className="w-20 h-20 rounded-xl flex-shrink-0" style={{ background: c.img }} />
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
                    <Tag tone="rust">{c.spotsLeft} left</Tag>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <PriceBlock price={c.price} originalPrice={c.originalPrice} />
                  <div style={{ fontSize: 11, marginTop: 4 }}>
                    <CountdownLabel target={c.departure} />
                  </div>
                </div>
              </button>
            ))}
          {tab === "browse" && filtered.map((c) => <BrowseListingCard key={c.id} c={c} onSelect={onSelect} />)}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   CUSTOMER: DETAIL
--------------------------------------------------------------------- */
function Detail({ charter, onBack, onBook }) {
  const reviewCount = charter.reviews?.length || 0;
  return (
    <div style={{ background: COLORS.ink, minHeight: "100%" }}>
      <div className="h-56 relative" style={{ background: charter.img }}>
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: "rgba(14,27,34,0.6)", color: COLORS.paper, backdropFilter: "blur(4px)" }}
        >
          ←
        </button>
        {charter.reason && (
          <div className="absolute bottom-3 left-4">
            <Tag tone="rust">{charter.reason}</Tag>
          </div>
        )}
      </div>

      <div className="px-6 pt-5 pb-28">
        <h1 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 26, fontWeight: 600 }}>{charter.boat}</h1>
        <div style={{ color: COLORS.paperDim, fontSize: 14, marginTop: 2 }}>
          {charter.captain} · {charter.location} · ★ {charter.rating}
          {reviewCount > 0 && ` (${reviewCount} review${reviewCount > 1 ? "s" : ""})`}
        </div>

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
          {charter.groupType && (
            <Tag tone="rust">{charter.groupType === "private" ? "Private charter" : "Shared / walk-on"}</Tag>
          )}
        </div>

        <div className="mt-5 rounded-2xl p-4 flex items-center justify-between" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
          <div>
            <div style={{ color: COLORS.paperDim, fontSize: 12, fontFamily: MONO }}>DEPARTS</div>
            <div style={{ color: COLORS.paper, fontSize: 15, fontWeight: 600, marginTop: 2 }}>
              <CountdownLabel target={charter.departure} />
            </div>
          </div>
          <CastRing target={charter.departure} size={48} />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="rounded-2xl p-4" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
            <div style={{ color: COLORS.paperDim, fontSize: 12, fontFamily: MONO }}>TRIP LENGTH</div>
            <div style={{ color: COLORS.paper, fontSize: 15, fontWeight: 600, marginTop: 2 }}>{charter.duration}</div>
          </div>
          <div className="rounded-2xl p-4" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
            <div style={{ color: COLORS.paperDim, fontSize: 12, fontFamily: MONO }}>SEATS LEFT</div>
            <div style={{ color: COLORS.rust, fontSize: 15, fontWeight: 600, marginTop: 2 }}>
              {charter.spotsLeft} of {charter.totalSpots}
            </div>
          </div>
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
          {charter.reason
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
            <h3 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 16, fontWeight: 600, marginBottom: 10 }}>
              Reviews ({reviewCount})
            </h3>
            <div className="flex flex-col gap-3">
              {charter.reviews.map((r, i) => (
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
        <PriceBlock price={charter.price} originalPrice={charter.originalPrice} />
        <button onClick={onBook} className="px-6 py-3 rounded-full font-semibold text-sm" style={{ background: COLORS.rust, color: COLORS.paper }}>
          Claim this seat
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   CUSTOMER: BOOKING
--------------------------------------------------------------------- */
function Booking({ charter, onBack, onConfirm }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [spots, setSpots] = useState(1);
  const valid = name.trim().length > 1 && email.includes("@");

  return (
    <div style={{ background: COLORS.ink, minHeight: "100%" }} className="px-6 pt-6 pb-10">
      <button onClick={onBack} style={{ color: COLORS.paperDim, fontSize: 14 }} className="mb-4">
        ← Back
      </button>
      <h1 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 24, fontWeight: 600 }}>Claim your seat</h1>
      <div style={{ color: COLORS.paperDim, fontSize: 13, marginTop: 4 }}>
        {charter.boat} · <CountdownLabel target={charter.departure} />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <Field label="NAME" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
        <Field label="EMAIL" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
        <label className="flex flex-col gap-1.5">
          <span style={{ color: COLORS.paperDim, fontSize: 12, fontFamily: MONO }}>SEATS</span>
          <div className="flex items-center gap-3">
            <button onClick={() => setSpots((s) => Math.max(1, s - 1))} className="w-9 h-9 rounded-full" style={{ background: COLORS.inkSoft, color: COLORS.paper, border: `1px solid ${COLORS.line}` }}>
              −
            </button>
            <span style={{ color: COLORS.paper, fontFamily: MONO, fontSize: 16 }}>{spots}</span>
            <button onClick={() => setSpots((s) => Math.min(charter.spotsLeft, s + 1))} className="w-9 h-9 rounded-full" style={{ background: COLORS.inkSoft, color: COLORS.paper, border: `1px solid ${COLORS.line}` }}>
              +
            </button>
          </div>
        </label>

        <div className="rounded-2xl p-4 mt-2 flex items-center justify-between" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
          <span style={{ color: COLORS.paperDim, fontSize: 13 }}>Total ({spots} seat{spots > 1 ? "s" : ""})</span>
          <span style={{ color: COLORS.paper, fontFamily: MONO, fontSize: 18, fontWeight: 500 }}>${charter.price * spots}</span>
        </div>

        <PrimaryButton disabled={!valid} onClick={() => onConfirm({ name, email, spots })}>
          Confirm booking
        </PrimaryButton>
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

function Confirmed({ charter, booking, onDone }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-8" style={{ background: COLORS.ink, minHeight: "100%", paddingTop: 80, paddingBottom: 80 }}>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: `${COLORS.teal}22`, border: `1px solid ${COLORS.teal}` }}>
        <span style={{ fontSize: 26 }}>🎣</span>
      </div>
      <h1 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 24, fontWeight: 600 }}>Seat's yours, {booking.name.split(" ")[0]}.</h1>
      <p style={{ color: COLORS.paperDim, fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>
        {charter.captain} just got a text — you're confirmed for {booking.spots} seat{booking.spots > 1 ? "s" : ""} on the {charter.boat},
        departing in <span style={{ color: COLORS.gold }}><CountdownLabel target={charter.departure} /></span>.
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
  );
}

/* ---------------------------------------------------------------------
   CAPTAIN: LOGIN / REGISTER / LICENSE / PENDING
--------------------------------------------------------------------- */
function CaptainLogin({ onLogin, onNew, onBackToApp, backLabel = "← Back to app" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const valid = email.includes("@") && password.length >= 4;
  return (
    <div className="px-6 pt-8 pb-10">
      <button onClick={onBackToApp} style={{ color: COLORS.paperDim, fontSize: 14 }} className="mb-6">
        {backLabel}
      </button>
      <BrandMark />
      <div className="mt-6">
        <Header title="Fill your empty seats." sub="Post a cancellation in under a minute. Get paid, keep the trip on." />
      </div>
      <div className="flex flex-col gap-4">
        <Field label="EMAIL" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@boatmail.com" />
        <Field label="PASSWORD" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        <PrimaryButton disabled={!valid} onClick={onLogin}>Log in</PrimaryButton>
        <button onClick={onNew} style={{ color: COLORS.teal, fontSize: 13, textAlign: "center" }} className="mt-1">
          New captain? Join Last Cast →
        </button>
      </div>
    </div>
  );
}

function CaptainRegister({ onNext, onBack }) {
  const [form, setForm] = useState({ name: "", boat: "", location: "", species: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const valid = form.name && form.boat && form.location;
  return (
    <div className="px-6 pt-8 pb-10">
      <button onClick={onBack} style={{ color: COLORS.paperDim, fontSize: 14 }} className="mb-4">← Back</button>
      <Header eyebrow="STEP 1 OF 3" title="Tell us about your boat" />
      <div className="flex flex-col gap-4">
        <Field label="YOUR NAME" value={form.name} onChange={set("name")} placeholder="Capt. Jamie Rivera" />
        <Field label="BOAT NAME" value={form.boat} onChange={set("boat")} placeholder="Reel Deal" />
        <Field label="HOME PORT / LOCATION" value={form.location} onChange={set("location")} placeholder="Key West, FL" />
        <Field label="SPECIALTIES" value={form.species} onChange={set("species")} placeholder="Snapper, Grouper, Mahi" />
        <PrimaryButton disabled={!valid} onClick={() => onNext(form)}>Continue</PrimaryButton>
      </div>
    </div>
  );
}

function CaptainLicense({ onNext, onBack }) {
  const [fileName, setFileName] = useState("");
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
      <div className="mt-6">
        <PrimaryButton disabled={!fileName} onClick={onNext}>Submit for review</PrimaryButton>
      </div>
    </div>
  );
}

function CaptainPending({ onApprove }) {
  return (
    <div className="px-6 pt-16 pb-10 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: `${COLORS.gold}22`, border: `1px solid ${COLORS.gold}` }}>
        <span style={{ fontSize: 26 }}>⏳</span>
      </div>
      <h1 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 22, fontWeight: 600 }}>Application under review</h1>
      <p style={{ color: COLORS.paperDim, fontSize: 14, marginTop: 8, lineHeight: 1.6, maxWidth: 320 }}>
        We usually verify captains within 24 hours. You'll get an email the moment you're cleared to start posting seats.
      </p>
      <div className="mt-8 w-full">
        <PrimaryButton onClick={onApprove}>(Demo) Simulate approval →</PrimaryButton>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   CAPTAIN: FEE TIER + POST FORM
--------------------------------------------------------------------- */
function FeeTierCard({ joinIndex }) {
  const tier = tierFor(joinIndex);
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
      {locked ? (
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

function PostCancellation({ onCreate, onClose }) {
  const [kind, setKind] = useState("cancellation"); // "cancellation" or "open"
  const [groupType, setGroupType] = useState("shared");
  const [form, setForm] = useState({
    species: "",
    spots: "2",
    price: "",
    hours: "4",
    date: "",
    meetingPoint: "",
    included: "",
    licenseNote: "",
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const valid = kind === "cancellation"
    ? form.species && form.price && Number(form.spots) > 0 && form.hours
    : form.species && form.price && Number(form.spots) > 0 && form.date;

  return (
    <div className="fixed inset-0 flex items-end justify-center z-50" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div
        className="w-full rounded-t-3xl p-6 overflow-y-auto"
        style={{ background: COLORS.ink, maxWidth: 480, border: `1px solid ${COLORS.line}`, borderBottom: "none", maxHeight: "88vh" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 19, fontWeight: 600 }}>Post a trip</h2>
          <button onClick={onClose} style={{ color: COLORS.paperDim, fontSize: 20 }}>×</button>
        </div>

        <div className="flex mb-5 rounded-full p-1" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
          {[
            { key: "cancellation", label: "Cancellation" },
            { key: "open", label: "Open Trip" },
          ].map((t) => {
            const active = kind === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setKind(t.key)}
                className="flex-1 py-2 rounded-full text-sm font-medium transition"
                style={{ background: active ? COLORS.rust : "transparent", color: active ? COLORS.paper : COLORS.paperDim }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          <Field label="SPECIES / TRIP TYPE" value={form.species} onChange={set("species")} placeholder="Snapper, Grouper" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="OPEN SEATS" type="number" min="1" value={form.spots} onChange={set("spots")} />
            {kind === "cancellation" ? (
              <Field label="DEPARTS IN (HRS)" type="number" min="1" value={form.hours} onChange={set("hours")} />
            ) : (
              <Field label="TRIP DATE" type="date" value={form.date} onChange={set("date")} />
            )}
          </div>
          <Field label="PRICE PER SEAT ($)" type="number" min="1" value={form.price} onChange={set("price")} placeholder="145" />

          <Field label="MEETING POINT" value={form.meetingPoint} onChange={set("meetingPoint")} placeholder="Harborwalk Marina, Dock C" />

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

          <PrimaryButton disabled={!valid} onClick={() => onCreate({ ...form, kind, groupType })}>
            {kind === "cancellation" ? "Post to Last Cast" : "List this trip"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   CAPTAIN: DASHBOARD
--------------------------------------------------------------------- */
function CaptainDashboard({ captain, joinIndex, onExit }) {
  const [listings, setListings] = useState([{ id: 1, kind: "cancellation", species: "Redfish, Trout", spots: 2, price: 90, hours: 3 }]);
  const [showPost, setShowPost] = useState(false);
  const [sponsorInterest, setSponsorInterest] = useState(false);

  const stats = useMemo(() => ({ trips: 12, seatsFilled: 34, recovered: 3120 }), []);

  return (
    <div className="px-6 pt-6 pb-16">
      <button onClick={onExit} style={{ color: COLORS.paperDim, fontSize: 14 }} className="mb-4">
        ← Back to app
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div style={{ color: COLORS.paperDim, fontSize: 12, fontFamily: MONO }}>WELCOME BACK</div>
          <h1 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 22, fontWeight: 600, marginTop: 2 }}>{captain.name || "Captain"}</h1>
          <div style={{ color: COLORS.paperDim, fontSize: 13, marginTop: 1 }}>
            {captain.boat} · {captain.location}
          </div>
        </div>
        <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: COLORS.teal }}>
          <span>⚓</span>
        </div>
      </div>

      <FeeTierCard joinIndex={joinIndex} />

      <div className="grid grid-cols-3 gap-2 mt-4">
        {[["Trips run", stats.trips], ["Seats filled", stats.seatsFilled], ["Recovered", `$${stats.recovered.toLocaleString()}`]].map(([label, val]) => (
          <div key={label} className="rounded-2xl p-3 text-center" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
            <div style={{ color: COLORS.paper, fontFamily: MONO, fontSize: 16, fontWeight: 500 }}>{val}</div>
            <div style={{ color: COLORS.paperDim, fontSize: 10.5, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowPost(true)}
        className="w-full mt-5 rounded-2xl py-4 font-semibold text-sm flex items-center justify-center gap-2"
        style={{ background: COLORS.rust, color: COLORS.paper }}
      >
        + Post a cancellation
      </button>

      <div className="mt-7">
        <h2 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 17, fontWeight: 600, marginBottom: 10 }}>Your active listings</h2>
        {listings.length === 0 && (
          <p style={{ color: COLORS.paperDim, fontSize: 13 }}>Nothing posted right now — cancellations happen, seats don't have to sit empty.</p>
        )}
        <div className="flex flex-col gap-2">
          {listings.map((l) => {
            const net = (l.price * (1 - tierFor(joinIndex).pct / 100)).toFixed(0);
            return (
              <div key={l.id} className="rounded-2xl p-3.5 flex items-center justify-between" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span style={{ color: COLORS.paper, fontSize: 14, fontWeight: 500 }}>{l.species}</span>
                    <Tag tone={l.kind === "open" ? "teal" : "rust"}>{l.kind === "open" ? "Open Trip" : "Cancellation"}</Tag>
                  </div>
                  <div style={{ color: COLORS.paperDim, fontSize: 12, marginTop: 4 }}>
                    {l.spots} seats · {l.kind === "open" ? `trip on ${l.date}` : `departs in ${l.hours}h`}
                  </div>
                </div>
                <div className="text-right">
                  <div style={{ color: COLORS.paper, fontFamily: MONO, fontSize: 14 }}>${l.price}/seat</div>
                  <div style={{ color: COLORS.gold, fontSize: 11, marginTop: 2 }}>you net ${net}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-7 rounded-2xl p-4" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.teal}55` }}>
        <div style={{ color: COLORS.teal, fontSize: 12, fontFamily: MONO, letterSpacing: 0.5 }}>SPONSORED RATES</div>
        <p style={{ color: COLORS.paperDim, fontSize: 12.5, marginTop: 6, lineHeight: 1.5 }}>
          Local gear and tourism brands can subsidize your platform fee in exchange for a badge on your listings.
        </p>
        <button
          onClick={() => setSponsorInterest(true)}
          className="mt-3 px-4 py-2 rounded-full text-xs font-semibold"
          style={{ background: sponsorInterest ? COLORS.teal : "transparent", border: `1px solid ${COLORS.teal}`, color: sponsorInterest ? COLORS.ink : COLORS.teal }}
        >
          {sponsorInterest ? "Interest noted ✓" : "I'm interested"}
        </button>
      </div>

      {showPost && (
        <PostCancellation
          onClose={() => setShowPost(false)}
          onCreate={(form) => {
            setListings((prev) => [
              ...prev,
              {
                id: Date.now(),
                kind: form.kind,
                species: form.species,
                spots: Number(form.spots),
                price: Number(form.price),
                hours: form.kind === "cancellation" ? Number(form.hours) : null,
                date: form.kind === "open" ? form.date : null,
                meetingPoint: form.meetingPoint,
                groupType: form.groupType,
                included: form.included ? form.included.split(",").map((s) => s.trim()).filter(Boolean) : [],
                licenseNote: form.licenseNote,
              },
            ]);
            setShowPost(false);
          }}
        />
      )}
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

export default function LastCastApp() {
  // "customer" or "captain" side of the app — a direct link (?captain=1 or #captain)
  // drops straight into the captain portal, e.g. for texting/QR-coding to captains
  const [side, setSide] = useState(() => (wantsCaptainEntry() ? "captain" : "customer"));

  // customer-side view state
  const [customerView, setCustomerView] = useState("home");
  const [charter, setCharter] = useState(null);
  const [booking, setBooking] = useState(null);

  // captain-side view state — starts on login whether entered via the button or a direct link
  const [captainView, setCaptainView] = useState("login");
  const cameFromDirectLink = useMemo(() => wantsCaptainEntry(), []);
  const [captain, setCaptain] = useState({});
  const joinIndex = CAPTAINS_JOINED_SO_FAR + 1;

  const goCaptainPortal = () => {
    setSide("captain");
    setCaptainView("login");
  };
  const goBackToApp = () => {
    setSide("customer");
    setCustomerView("home");
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
              />
            )}
            {customerView === "detail" && charter && (
              <Detail charter={charter} onBack={() => setCustomerView("home")} onBook={() => setCustomerView("booking")} />
            )}
            {customerView === "booking" && charter && (
              <Booking
                charter={charter}
                onBack={() => setCustomerView("detail")}
                onConfirm={(b) => {
                  setBooking(b);
                  setCustomerView("confirmed");
                }}
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
                }}
              />
            )}
          </>
        )}

        {side === "captain" && (
          <>
            {captainView === "login" && (
              <CaptainLogin
                onLogin={() => setCaptainView("dashboard")}
                onNew={() => setCaptainView("register")}
                onBackToApp={goBackToApp}
                backLabel={cameFromDirectLink ? "← Looking for the angler app?" : "← Back to app"}
              />
            )}
            {captainView === "register" && (
              <CaptainRegister
                onBack={() => setCaptainView("login")}
                onNext={(form) => {
                  setCaptain(form);
                  setCaptainView("license");
                }}
              />
            )}
            {captainView === "license" && (
              <CaptainLicense onBack={() => setCaptainView("register")} onNext={() => setCaptainView("pending")} />
            )}
            {captainView === "pending" && <CaptainPending onApprove={() => setCaptainView("dashboard")} />}
            {captainView === "dashboard" && (
              <CaptainDashboard captain={captain} joinIndex={joinIndex} onExit={goBackToApp} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
