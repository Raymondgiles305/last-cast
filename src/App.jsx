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

// Official Last Cast platform sponsors. A captain's fee discount only applies
// if the sponsor they claim is listed here — add real sponsors as deals close.
const SPONSORS = [];

// Founding Angler program: first 2,000 accounts get a badge + early access to
// new deals — no fee discount, so it costs nothing ongoing.
const ANGLER_FOUNDING_CAP = 2000;
const ANGLERS_JOINED_SO_FAR = 1148; // sample count for demo purposes

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

/* ---------------------------------------------------------------------
   SHARED: SETTINGS (used by both anglers and captains)
--------------------------------------------------------------------- */
function SettingsScreen({ title, fields, onSave, onLogout, onBack, onDeleteAccount, deleteLabel, showLicense, licenseFileName, onUploadLicense }) {
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((f) => [f.key, f.value || ""])));
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [saved, setSaved] = useState(false);
  const set = (k) => (e) => {
    setValues({ ...values, [k]: e.target.value });
    setSaved(false);
  };

  return (
    <div className="px-6 pt-6 pb-14">
      <button onClick={onBack} style={{ color: COLORS.paperDim, fontSize: 14 }} className="mb-4">
        ← Back
      </button>
      <Header title={title} />

      <h3 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Profile</h3>
      <div className="flex flex-col gap-4 mb-7">
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
      </div>

      {showLicense && (
        <>
          <h3 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Fishing license</h3>
          <p style={{ color: COLORS.paperDim, fontSize: 11.5, marginBottom: 10, lineHeight: 1.4 }}>
            Optional — only needed where the charter's license note says you'll need your own. Have it on file so
            there's nothing to dig up at the dock.
          </p>
          <div className="mb-7">
            <div
              className="rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-2 cursor-pointer"
              style={{ background: COLORS.inkSoft, border: `1.5px dashed ${COLORS.line}` }}
              onClick={() => onUploadLicense("fishing_license_scan.pdf")}
            >
              <span style={{ fontSize: 20 }}>📄</span>
              <span style={{ color: COLORS.paper, fontSize: 13.5, fontWeight: 500 }}>
                {licenseFileName ? licenseFileName : "Tap to upload your license"}
              </span>
              <span style={{ color: COLORS.paperDim, fontSize: 11.5 }}>PDF or photo, under 10MB</span>
              {licenseFileName && <span style={{ color: COLORS.teal, fontSize: 11.5, marginTop: 2 }}>✓ On file</span>}
            </div>
          </div>
        </>
      )}

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
          These preferences are saved on this device only — real delivery goes live once the backend is connected.
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

function Home({ onSelect, onCaptainPortal, onAccount, angler }) {
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
          <div className="flex items-center gap-2">
            <button
              onClick={onAccount}
              className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5"
              style={{ border: `1px solid ${COLORS.line}`, color: COLORS.paperDim }}
            >
              {angler ? `${angler.joinIndex <= ANGLER_FOUNDING_CAP ? "⭐ " : "👤 "}${angler.name.split(" ")[0]}` : "👤 Account"}
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
                    <Tag tone="rust">{c.spotsLeft > 0 ? `${c.spotsLeft} left` : "Sold out"}</Tag>
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
        {charter.spotsLeft > 0 ? (
          <>
            <PriceBlock price={charter.price} originalPrice={charter.originalPrice} />
            <button onClick={onBook} className="px-6 py-3 rounded-full font-semibold text-sm" style={{ background: COLORS.rust, color: COLORS.paper }}>
              Claim this seat
            </button>
          </>
        ) : (
          <>
            <span style={{ color: COLORS.paperDim, fontSize: 13 }}>Sold out</span>
            <button onClick={onBook} className="px-6 py-3 rounded-full font-semibold text-sm" style={{ background: COLORS.teal, color: COLORS.ink }}>
              Join waitlist
            </button>
          </>
        )}
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
  const isWaitlist = charter.spotsLeft <= 0;
  const valid = name.trim().length > 1 && email.includes("@");

  return (
    <div style={{ background: COLORS.ink, minHeight: "100%" }} className="px-6 pt-6 pb-10">
      <button onClick={onBack} style={{ color: COLORS.paperDim, fontSize: 14 }} className="mb-4">
        ← Back
      </button>
      <h1 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 24, fontWeight: 600 }}>
        {isWaitlist ? "Join the waitlist" : "Claim your seat"}
      </h1>
      <div style={{ color: COLORS.paperDim, fontSize: 13, marginTop: 4 }}>
        {charter.boat} · {isWaitlist ? "Sold out — we'll text you if a seat opens up" : <CountdownLabel target={charter.departure} />}
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <Field label="NAME" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
        <Field label="EMAIL" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
        {!isWaitlist && (
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
        )}

        {isWaitlist ? (
          <p style={{ color: COLORS.paperDim, fontSize: 12.5, lineHeight: 1.5 }}>
            No charge to join the waitlist. If a seat opens up, you'll be the first one notified — first come,
            first reeled.
          </p>
        ) : (
          <div className="rounded-2xl p-4 mt-2 flex items-center justify-between" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
            <span style={{ color: COLORS.paperDim, fontSize: 13 }}>Total ({spots} seat{spots > 1 ? "s" : ""})</span>
            <span style={{ color: COLORS.paper, fontFamily: MONO, fontSize: 18, fontWeight: 500 }}>${charter.price * spots}</span>
          </div>
        )}

        <PrimaryButton disabled={!valid} onClick={() => onConfirm({ name, email, spots: isWaitlist ? 0 : spots, waitlist: isWaitlist })}>
          {isWaitlist ? "Join waitlist" : "Confirm booking"}
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
      <h1 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 24, fontWeight: 600 }}>
        {booking.waitlist ? `You're on the list, ${booking.name.split(" ")[0]}.` : `Seat's yours, ${booking.name.split(" ")[0]}.`}
      </h1>
      <p style={{ color: COLORS.paperDim, fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>
        {booking.waitlist ? (
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
  );
}

/* ---------------------------------------------------------------------
   ANGLER: LOGIN / REGISTER / ACCOUNT / TRIP HISTORY / MESSAGING
--------------------------------------------------------------------- */
function AnglerLogin({ onLogin, onNew, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const valid = email.includes("@") && password.length >= 4;
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
        <PrimaryButton disabled={!valid} onClick={() => onLogin({ email })}>Log in</PrimaryButton>
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
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const valid =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.phone.trim().length >= 7 &&
    form.email.includes("@") &&
    /^\d{5}$/.test(form.zip.trim()) &&
    form.password.length >= 4;

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
        <Field label="PASSWORD" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" />

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

        <PrimaryButton
          disabled={!valid}
          onClick={() =>
            onCreate({
              firstName: form.firstName.trim(),
              lastName: form.lastName.trim(),
              name: `${form.firstName.trim()} ${form.lastName.trim()}`,
              phone: form.phone.trim(),
              email: form.email.trim(),
              zip: form.zip.trim(),
              licenseFileName,
            })
          }
        >
          Create account
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

function AnglerAccount({ angler, bookings, onOpenTrip, onLogout, onBack, onSettings }) {
  const upcoming = bookings.filter((b) => b.status === "upcoming");
  const past = bookings.filter((b) => b.status === "past");

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

      <div className="flex items-center justify-between mb-7">
        <div>
          <div style={{ color: COLORS.paperDim, fontSize: 12, fontFamily: MONO }}>YOUR ACCOUNT</div>
          <h1 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 22, fontWeight: 600, marginTop: 2 }}>{angler.name}</h1>
          <div style={{ color: COLORS.paperDim, fontSize: 13, marginTop: 1 }}>{angler.email}</div>
        </div>
        <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: COLORS.rust }}>
          <span>👤</span>
        </div>
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
      <div className="flex flex-col gap-2">
        {past.length === 0 && (
          <p style={{ color: COLORS.paperDim, fontSize: 13 }}>Your completed trips will show up here.</p>
        )}
        {past.map((b) => (
          <TripCard key={b.id} b={b} onOpen={onOpenTrip} />
        ))}
      </div>
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

function TripDetail({ booking, onBack, onMessage }) {
  const { charter, status } = booking;
  return (
    <div className="px-6 pt-6 pb-10">
      <button onClick={onBack} style={{ color: COLORS.paperDim, fontSize: 14 }} className="mb-4">
        ← Back to account
      </button>
      <Tag tone={status === "upcoming" ? "gold" : "teal"}>{status === "upcoming" ? "Upcoming" : "Completed"}</Tag>
      <h1 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 24, fontWeight: 600, marginTop: 8 }}>{charter.boat}</h1>
      <div style={{ color: COLORS.paperDim, fontSize: 14, marginTop: 2 }}>
        {charter.captain} · {charter.location}
      </div>

      <div className="mt-5 rounded-2xl p-4" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
        <Row label="Date" value={formatDate(charter.departure)} />
        <Row label="Meeting point" value={charter.meetingPoint || charter.location} />
        <Row label="Seats booked" value={booking.spots} />
        <Row label="Total paid" value={`$${charter.price * (booking.spots || 1)}`} />
      </div>

      <button
        onClick={() => onMessage(booking)}
        className="w-full mt-5 py-3.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2"
        style={{ background: COLORS.teal, color: COLORS.ink }}
      >
        💬 Message {charter.captain.split(" ")[1] || "captain"}
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
        <Header title="Fill your empty seats." sub="Post a last-minute cancellation or list an open trip — either way, in under a minute." />
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

function SponsorClaim() {
  const [selected, setSelected] = useState(SPONSORS[0]?.id || "");
  const [proof, setProof] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const activeSponsor = SPONSORS.find((s) => s.id === selected);

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
          {SPONSORS.map((s) => (
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
          <h2 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 19, fontWeight: 600 }}>
            {isEdit ? "Edit trip" : "Post a trip"}
          </h2>
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
          <Field
            label="NOTES FOR BOOKED ANGLERS (optional)"
            value={form.notes}
            onChange={set("notes")}
            placeholder="e.g. Meet at the north dock, not the main one"
          />

          <PrimaryButton disabled={!valid} onClick={() => onSave({ ...form, kind, groupType }, initialValues?.id)}>
            {isEdit ? "Save changes" : kind === "cancellation" ? "Post to Last Cast" : "List this trip"}
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
  if (l.kind === "open" && l.date) return new Date(l.date).getTime();
  if (l.kind === "cancellation" && l.hours != null) return Date.now() + l.hours * 3600000;
  return Infinity;
}

function CaptainDashboard({ captain, joinIndex, onExit, onSettings }) {
  const [listings, setListings] = useState([
    { id: 1, kind: "cancellation", species: "Redfish, Trout", spots: 2, price: 90, hours: 3, notes: "" },
  ]);
  const [showPost, setShowPost] = useState(false);
  const [editingListing, setEditingListing] = useState(null);
  const [repostSeed, setRepostSeed] = useState(null);
  const [sponsorInterest, setSponsorInterest] = useState(false);

  const stats = useMemo(() => ({ trips: 12, seatsFilled: 34, recovered: 3120 }), []);
  const sortedListings = useMemo(() => [...listings].sort((a, b) => listingWhen(a) - listingWhen(b)), [listings]);

  const closeForm = () => {
    setShowPost(false);
    setEditingListing(null);
    setRepostSeed(null);
  };

  const buildListingFromForm = (form, id) => ({
    id: id ?? Date.now(),
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
    notes: form.notes,
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
        + Post a trip
      </button>

      {/* Recent activity — a preview of what real-time booking alerts will look like.
          This list is static sample data; real notifications need the backend (Firebase) to exist. */}
      <div className="mt-7">
        <div className="flex items-center justify-between mb-2">
          <h2 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 17, fontWeight: 600 }}>Recent activity</h2>
          <span style={{ color: COLORS.paperDim, fontSize: 10.5, fontFamily: MONO }}>PREVIEW</span>
        </div>
        <div className="flex flex-col gap-2">
          {[
            { text: "Danielle R. booked 2 seats on Silver Reel", when: "2h ago" },
            { text: "Tom W. left a 5★ review", when: "1d ago" },
          ].map((a, i) => (
            <div key={i} className="rounded-xl px-3.5 py-2.5 flex items-center justify-between" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
              <span style={{ color: COLORS.paperDim, fontSize: 12.5 }}>{a.text}</span>
              <span style={{ color: COLORS.paperDim, fontSize: 11, fontFamily: MONO, opacity: 0.7 }}>{a.when}</span>
            </div>
          ))}
        </div>
        <p style={{ color: COLORS.paperDim, fontSize: 11, marginTop: 6, opacity: 0.7, lineHeight: 1.4 }}>
          Real booking alerts (email/text the moment a seat sells) go live once the backend is connected.
        </p>
      </div>

      <div className="mt-7">
        <h2 style={{ fontFamily: SERIF, color: COLORS.paper, fontSize: 17, fontWeight: 600, marginBottom: 10 }}>Your active listings</h2>
        <p style={{ color: COLORS.paperDim, fontSize: 11, marginTop: -6, marginBottom: 10, opacity: 0.7 }}>Sorted soonest first</p>
        {sortedListings.length === 0 && (
          <p style={{ color: COLORS.paperDim, fontSize: 13 }}>Nothing posted right now — cancellations happen, seats don't have to sit empty.</p>
        )}
        <div className="flex flex-col gap-2">
          {sortedListings.map((l) => {
            const net = (l.price * (1 - tierFor(joinIndex).pct / 100)).toFixed(0);
            return (
              <div key={l.id} className="rounded-2xl p-3.5" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.line}` }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span style={{ color: COLORS.paper, fontSize: 14, fontWeight: 500 }}>{l.species}</span>
                      <Tag tone={l.kind === "open" ? "teal" : "rust"}>{l.kind === "open" ? "Open Trip" : "Cancellation"}</Tag>
                    </div>
                    <div style={{ color: COLORS.paperDim, fontSize: 12, marginTop: 4 }}>
                      {l.spots} seats · {l.kind === "open" ? `trip on ${l.date}` : `departs in ${l.hours}h`}
                    </div>
                    {l.notes && (
                      <div style={{ color: COLORS.gold, fontSize: 11.5, marginTop: 4, fontStyle: "italic" }}>note: {l.notes}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div style={{ color: COLORS.paper, fontFamily: MONO, fontSize: 14 }}>${l.price}/seat</div>
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
                        setListings((prev) => prev.filter((x) => x.id !== l.id));
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

      <div className="mt-7 rounded-2xl p-4" style={{ background: COLORS.inkSoft, border: `1px solid ${COLORS.teal}55` }}>
        <div style={{ color: COLORS.teal, fontSize: 12, fontFamily: MONO, letterSpacing: 0.5 }}>SPONSORED RATES</div>

        {SPONSORS.length === 0 ? (
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
          <SponsorClaim />
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
          onSave={(form, id) => {
            if (editingListing) {
              setListings((prev) => prev.map((x) => (x.id === id ? buildListingFromForm(form, id) : x)));
            } else {
              setListings((prev) => [...prev, buildListingFromForm(form)]);
            }
            closeForm();
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

  // angler account state — separate from the guest-checkout booking flow above
  const [angler, setAngler] = useState(null);
  const [anglerBookings, setAnglerBookings] = useState([
    {
      id: "seed-1",
      charter: CHARTERS[1],
      spots: 2,
      status: "past",
      waitlist: false,
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
  const joinIndex = CAPTAINS_JOINED_SO_FAR + 1;

  const goCaptainPortal = () => {
    setSide("captain");
    setCaptainView("login");
  };
  const goBackToApp = () => {
    setSide("customer");
    setCustomerView("home");
  };
  const goAccount = () => {
    setCustomerView(angler ? "account" : "anglerLogin");
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
                  setAnglerBookings((prev) => [
                    ...prev,
                    {
                      id: `b-${Date.now()}`,
                      charter,
                      spots: b.spots,
                      status: "upcoming",
                      waitlist: Boolean(b.waitlist),
                      messages: b.waitlist
                        ? []
                        : [{ from: "captain", text: `Confirmed! Meet at ${charter.meetingPoint || charter.location}.` }],
                    },
                  ]);
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

            {customerView === "anglerLogin" && (
              <AnglerLogin
                onBack={() => setCustomerView("home")}
                onNew={() => setCustomerView("anglerRegister")}
                onLogin={(a) => {
                  setAngler({ name: a.email.split("@")[0], email: a.email, joinIndex: ANGLERS_JOINED_SO_FAR + 1 });
                  setCustomerView("account");
                }}
              />
            )}
            {customerView === "anglerRegister" && (
              <AnglerRegister
                onBack={() => setCustomerView("anglerLogin")}
                onCreate={(a) => {
                  setAngler({ ...a, joinIndex: ANGLERS_JOINED_SO_FAR + 1 });
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
                onSave={(values) =>
                  setAngler({ ...angler, ...values, name: `${values.firstName} ${values.lastName}` })
                }
                onLogout={() => {
                  setAngler(null);
                  setCustomerView("home");
                }}
                onDeleteAccount={() => {
                  setAngler(null);
                  setAnglerBookings([]);
                  setCustomerView("home");
                }}
              />
            )}
            {customerView === "tripDetail" && activeTrip && (
              <TripDetail
                booking={activeTrip}
                onBack={() => setCustomerView("account")}
                onMessage={() => setCustomerView("tripMessages")}
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
              <CaptainDashboard
                captain={captain}
                joinIndex={joinIndex}
                onExit={goBackToApp}
                onSettings={() => setCaptainView("settings")}
              />
            )}
            {captainView === "settings" && (
              <SettingsScreen
                title="Captain settings"
                fields={[
                  { key: "name", label: "YOUR NAME", value: captain.name },
                  { key: "boat", label: "BOAT NAME", value: captain.boat },
                  { key: "location", label: "HOME PORT / LOCATION", value: captain.location },
                  { key: "species", label: "SPECIALTIES", value: captain.species },
                ]}
                onBack={() => setCaptainView("dashboard")}
                onSave={(values) => setCaptain({ ...captain, ...values })}
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
      </div>
    </div>
  );
}
