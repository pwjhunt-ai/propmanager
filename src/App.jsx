import { useState, useEffect } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://syqkwicldxjlwjngfqyw.supabase.co";
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5cWt3aWNsZHhqbHdqbmdmcXl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyODQwOTYsImV4cCI6MjA4ODg2MDA5Nn0.kUnkO1HnXIRJQ9t0p-4T3z4k9S3lZdVd7QKPAoupl4Y";

const db = {
  async get(table) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&order=id`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    return res.json();
  },
  async insert(table, row) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(row)
    });
    const data = await res.json();
    return Array.isArray(data) ? data[0] : data;
  },
  async update(table, id, row) {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(row)
    });
  },
  async delete(table, id) {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
  }
};

// Map DB row → app object
const mapProperty = r => ({ id: r.id, name: r.name, address: r.address, type: r.type, floors: +r.floors||0, sqft: +r.sqft||0, occupancy: +r.occupancy||0, monthlyRent: +r.monthly_rent||0, assetValue: +r.asset_value||0, status: r.status, estate: r.estate, entity: r.entity, lat: +r.lat||37.7, lng: +r.lng||-96, leaseEscalationPct: +r.lease_escalation_pct||0, leaseEscalationDate: r.lease_escalation_date||"" });
const mapLoan = r => ({ id: r.id, propertyId: r.property_id, lender: r.lender, originalAmount: +r.original_amount||0, balance: +r.balance||0, interestRate: +r.interest_rate||0, monthlyPayment: +r.monthly_payment||0, startDate: r.start_date, maturityDate: r.maturity_date, type: r.type, status: r.status });
const mapTenant = r => ({ id: r.id, propertyId: r.property_id, name: r.name, unit: r.unit, leaseStart: r.lease_start, leaseEnd: r.lease_end, monthlyRent: +r.monthly_rent||0, contact: r.contact });
const mapMaintenance = r => ({ id: r.id, propertyId: r.property_id, title: r.title, priority: r.priority, status: r.status, date: r.date, cost: +r.cost||0, assignee: r.assignee });
const mapTax = r => ({ id: r.id, propertyId: r.property_id, taxYear: r.tax_year, annualAmount: +r.annual_amount||0, amountPaid: +r.amount_paid||0, dueDate: r.due_date||"", datePaid: r.date_paid||"", status: r.status||"due", notes: r.notes||"" });
const mapExpense = r => ({ id: r.id, propertyId: r.property_id, category: r.category, description: r.description||"", amount: +r.amount||0, frequency: r.frequency||"monthly", date: r.date||"", notes: r.notes||"" });

const initialProperties = [];
const initialLoans = [];
const initialTenants = [];
const initialMaintenance = [];

const TYPE_COLORS = { Office: "#3B82F6", Retail: "#F59E0B", Industrial: "#6B7280", Medical: "#10B981" };
const STATUS_STYLES = { active: { bg: "#D1FAE5", color: "#065F46", label: "Active" }, partial: { bg: "#FEF3C7", color: "#92400E", label: "Partial" }, vacant: { bg: "#FEE2E2", color: "#991B1B", label: "Vacant" } };
const ESTATE_STYLES = { "in-estate": { bg: "#EEF2FF", color: "#4338CA", label: "In Estate" }, "out-of-estate": { bg: "#F3F4F6", color: "#374151", label: "Out of Estate" } };
const PRIORITY_STYLES = { high: { bg: "#FEE2E2", color: "#991B1B" }, medium: { bg: "#FEF3C7", color: "#92400E" }, low: { bg: "#DBEAFE", color: "#1E40AF" } };
const MAINT_STATUS_STYLES = { open: { bg: "#FEE2E2", color: "#991B1B" }, "in-progress": { bg: "#FEF3C7", color: "#92400E" }, scheduled: { bg: "#DBEAFE", color: "#1E40AF" }, completed: { bg: "#D1FAE5", color: "#065F46" } };
const LOAN_STATUS_STYLES = { current: { bg: "#D1FAE5", color: "#065F46" }, watch: { bg: "#FEF3C7", color: "#92400E" }, default: { bg: "#FEE2E2", color: "#991B1B" } };


function MetricCard({ label, value, sub, accent }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 24px", borderTop: `4px solid ${accent}`, minWidth: 0 }}>
      <div style={{ fontSize: 13, color: "#6B7280", fontWeight: 500, marginBottom: 6, letterSpacing: "0.03em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#111827", fontFamily: "'DM Serif Display', serif", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function OccupancyBar({ pct, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: "#F3F4F6", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color || "#3B82F6", borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: 12, color: "#374151", fontWeight: 600, minWidth: 32, textAlign: "right" }}>{pct}%</span>
    </div>
  );
}

function Badge({ label, bg, color }) {
  return <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, whiteSpace: "nowrap" }}>{label}</span>;
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 560, maxWidth: "95vw", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: "#111827" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, color: "#6B7280", cursor: "pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", options, step }) {
  const s = { width: "100%", padding: "9px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#FAFAFA" };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</label>
      {options ? <select value={value} onChange={e => onChange(e.target.value)} style={s}>{options.map(o => <option key={o.v ?? o} value={o.v ?? o}>{o.l ?? o}</option>)}</select>
        : <input type={type} value={value} step={type === "number" ? (step ?? "any") : undefined} onChange={e => onChange(e.target.value)} style={s} />}
    </div>
  );
}

function LoanBar({ balance, original }) {
  const pct = Math.round((balance / original) * 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
      <div style={{ flex: 1, height: 5, background: "#F3F4F6", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "#EF4444", borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: 10, color: "#9CA3AF", minWidth: 28, textAlign: "right" }}>{pct}%</span>
    </div>
  );
}


// Accurate US state outlines using Albers USA-like projection scaled to 960x600 viewBox
// Paths sourced from standard geographic data, simplified for SVG rendering
const STATE_PATHS = {
  AL:"M 556 354 L 560 354 L 573 355 L 574 401 L 551 400 L 549 371 Z",
  AK:"M 100 450 L 100 500 L 165 500 L 180 480 L 165 455 L 140 445 Z",
  AZ:"M 183 310 L 243 316 L 249 379 L 209 379 L 185 352 Z",
  AR:"M 503 318 L 552 315 L 552 353 L 504 355 Z",
  CA:"M 120 194 L 155 172 L 179 184 L 183 310 L 139 333 L 109 290 L 112 241 Z",
  CO:"M 290 253 L 393 248 L 393 308 L 290 311 Z",
  CT:"M 718 178 L 739 174 L 742 192 L 720 196 Z",
  DE:"M 701 210 L 713 207 L 715 228 L 702 230 Z",
  FL:"M 560 354 L 617 350 L 635 395 L 615 430 L 570 430 L 556 395 Z",
  GA:"M 560 354 L 617 350 L 618 398 L 573 401 L 560 395 Z",
  HI:"M 220 490 L 280 485 L 278 510 L 218 512 Z",
  ID:"M 179 133 L 233 121 L 243 193 L 229 243 L 183 240 L 183 183 Z",
  IL:"M 530 237 L 566 234 L 567 306 L 530 308 Z",
  IN:"M 566 234 L 598 232 L 598 291 L 566 293 Z",
  IA:"M 460 212 L 530 207 L 532 253 L 461 256 Z",
  KS:"M 368 282 L 464 278 L 464 318 L 368 320 Z",
  KY:"M 566 293 L 659 287 L 662 316 L 567 318 Z",
  LA:"M 487 383 L 549 380 L 551 415 L 523 430 L 487 420 Z",
  ME:"M 748 118 L 774 108 L 776 148 L 748 152 Z",
  MD:"M 680 220 L 718 212 L 718 235 L 700 245 L 680 240 Z",
  MA:"M 718 163 L 764 155 L 766 175 L 718 178 Z",
  MI:"M 566 168 L 616 158 L 626 193 L 598 210 L 566 205 Z",
  MN:"M 432 143 L 499 136 L 501 207 L 461 210 L 432 188 Z",
  MS:"M 519 318 L 556 316 L 556 383 L 519 384 Z",
  MO:"M 464 256 L 552 252 L 552 318 L 504 318 L 464 318 Z",
  MT:"M 211 111 L 363 98 L 365 172 L 291 178 L 243 193 L 233 121 Z",
  NE:"M 368 231 L 460 226 L 461 280 L 368 283 Z",
  NV:"M 155 172 L 207 163 L 229 243 L 183 240 L 183 310 L 155 288 Z",
  NH:"M 720 143 L 740 139 L 742 174 L 718 178 L 718 163 Z",
  NJ:"M 700 193 L 716 188 L 718 212 L 700 218 Z",
  NM:"M 243 316 L 319 313 L 319 380 L 249 381 Z",
  NY:"M 640 155 L 718 140 L 720 178 L 702 193 L 662 193 L 641 178 Z",
  NC:"M 609 288 L 718 276 L 718 305 L 609 315 Z",
  ND:"M 363 131 L 462 122 L 463 174 L 363 177 Z",
  OH:"M 598 210 L 645 205 L 647 260 L 598 264 Z",
  OK:"M 319 313 L 464 307 L 464 345 L 503 345 L 503 355 L 319 357 Z",
  OR:"M 123 142 L 207 132 L 207 163 L 155 172 L 120 194 Z",
  PA:"M 645 193 L 718 185 L 718 212 L 700 218 L 645 220 Z",
  RI:"M 742 172 L 754 170 L 755 184 L 742 186 Z",
  SC:"M 614 315 L 660 307 L 663 343 L 617 348 Z",
  SD:"M 363 177 L 463 170 L 464 225 L 364 230 Z",
  TN:"M 532 316 L 659 308 L 660 337 L 533 341 Z",
  TX:"M 319 313 L 464 307 L 464 383 L 430 435 L 360 450 L 295 420 L 275 368 L 286 326 Z",
  UT:"M 207 232 L 291 227 L 291 313 L 243 316 L 207 310 Z",
  VT:"M 718 140 L 737 136 L 740 165 L 718 168 Z",
  VA:"M 638 253 L 718 240 L 718 273 L 660 285 L 637 278 Z",
  WA:"M 123 100 L 207 90 L 207 132 L 123 142 Z",
  WV:"M 638 232 L 680 225 L 682 268 L 640 272 Z",
  WI:"M 499 160 L 551 152 L 551 210 L 532 225 L 499 222 Z",
  WY:"M 243 193 L 363 183 L 365 253 L 291 257 L 229 258 Z",
  DC:"M 694 237 L 701 232 L 703 240 L 696 243 Z",
};

// State label center positions [x, y]
const STATE_LABELS = {
  AL:[563,375],AK:[132,475],AZ:[213,345],AR:[527,335],CA:[140,265],
  CO:[341,280],CT:[729,185],DE:[707,218],FL:[590,395],GA:[588,375],
  HI:[248,500],ID:[205,188],IL:[547,270],IN:[581,262],IA:[495,232],
  KS:[415,300],KY:[613,302],LA:[518,400],ME:[760,130],MD:[698,228],
  MA:[740,165],MI:[593,182],MN:[465,173],MS:[537,350],MO:[507,285],
  MT:[288,140],NE:[413,255],NV:[188,218],NH:[729,158],NJ:[707,202],
  NM:[281,347],NY:[678,165],NC:[662,295],ND:[412,152],OH:[621,232],
  OK:[390,328],OR:[161,155],PA:[680,202],RI:[748,177],SC:[637,328],
  SD:[412,200],TN:[594,325],TX:[380,383],UT:[248,270],VT:[727,151],
  VA:[676,258],WA:[162,115],WV:[658,248],WI:[523,188],WY:[302,220],DC:[697,237],
};

function MapView({ properties, loans, onSelect, TYPE_COLORS, ESTATE_STYLES, STATUS_STYLES }) {
  const [tooltip, setTooltip] = useState(null);
  const [hoverId, setHoverId] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [filterEstate, setFilterEstate] = useState("all");
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const visibleProps = properties.filter(p => {
    if (filterType !== "all" && p.type !== filterType) return false;
    if (filterEstate !== "all" && p.estate !== filterEstate) return false;
    return true;
  });

  // Project lat/lng onto the 960x580 SVG viewBox.
  // State paths were hand-drawn using approximate screen coordinates, so we
  // use the known pixel positions of two anchor points to derive the transform:
  // Seattle WA  (47.6, -122.3) → approx SVG (165, 115)
  // Miami FL    (25.8, -80.2)  → approx SVG (590, 392)
  // Solve: x = (lng - lngMin) * xScale + xOffset
  //        y = (latMax - lat) * yScale + yOffset
  const xScale = (590 - 165) / (-80.2 - (-122.3));   // px per degree lng
  const yScale = (392 - 115) / (47.6 - 25.8);         // px per degree lat
  const project = (lat, lng) => ({
    x: Math.max(30, Math.min(930, (lng - (-122.3)) * xScale + 165)),
    y: Math.max(30, Math.min(555, (47.6 - lat) * yScale + 115)),
  });

  const statePropCount = {};
  visibleProps.forEach(p => {
    const stateAbbr = p.address.match(/,\s*([A-Z]{2})\s+\d{5}/)?.[1];
    if (stateAbbr) statePropCount[stateAbbr] = (statePropCount[stateAbbr] || 0) + 1;
  });

  const totalRevShown = visibleProps.reduce((s, p) => s + p.monthlyRent, 0);
  const avgOccShown = visibleProps.length ? Math.round(visibleProps.reduce((s, p) => s + p.occupancy, 0) / visibleProps.length) : 0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 310px", gap: 16, height: "calc(100vh - 170px)" }}>

      {/* ── MAP PANEL ── */}
      <div style={{ background: "#0D1117", borderRadius: 16, position: "relative", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.5)" }}>

        {/* Top filter bar */}
        <div style={{ position: "absolute", top: 14, left: 14, zIndex: 20, display: "flex", gap: 5, flexWrap: "wrap", maxWidth: "55%" }}>
          {["all","Office","Retail","Industrial","Medical"].map(t => (
            <button key={t} onClick={() => setFilterType(t)} style={{
              padding: "4px 10px", borderRadius: 20, border: "1px solid",
              borderColor: filterType === t ? "transparent" : "rgba(255,255,255,0.15)",
              fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              background: filterType === t ? (TYPE_COLORS[t] || "#4F46E5") : "rgba(255,255,255,0.06)",
              color: "#fff", transition: "all 0.15s",
            }}>{t === "all" ? "All" : t}</button>
          ))}
          <div style={{ width: 1, background: "rgba(255,255,255,0.15)", margin: "0 2px" }} />
          {[["all","All Estate"],["in-estate","In Estate"],["out-of-estate","Out of Estate"]].map(([e,l]) => (
            <button key={e} onClick={() => setFilterEstate(e)} style={{
              padding: "4px 10px", borderRadius: 20, border: "1px solid",
              borderColor: filterEstate === e ? "transparent" : "rgba(255,255,255,0.15)",
              fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
              background: filterEstate === e ? "#4F46E5" : "rgba(255,255,255,0.06)",
              color: "#fff", transition: "all 0.15s",
            }}>{l}</button>
          ))}
        </div>

        {/* Top-right stats */}
        <div style={{ position: "absolute", top: 14, right: 14, zIndex: 20, display: "flex", gap: 8 }}>
          {[
            ["Properties", visibleProps.length],
            ["Revenue", "$" + Math.round(totalRevShown ).toLocaleString()],
            ["Avg Occ.", avgOccShown + "%"],
          ].map(([l, v]) => (
            <div key={l} style={{ background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "6px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#F9FAFB", fontFamily: "'DM Serif Display',serif", lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* SVG */}
        <svg viewBox="0 0 960 580" style={{ width: "100%", height: "100%", display: "block" }} preserveAspectRatio="xMidYMid meet"
          onMouseMove={e => { if (tooltip) setTooltipPos({ x: e.clientX, y: e.clientY }); }}>
          <defs>
            <radialGradient id="mapbg" cx="40%" cy="45%">
              <stop offset="0%" stopColor="#161B27" />
              <stop offset="100%" stopColor="#0D1117" />
            </radialGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="softglow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <rect width="960" height="580" fill="url(#mapbg)" />

          {/* Subtle grid */}
          {[160, 320, 480, 640, 800].map(x => <line key={"gx"+x} x1={x} y1={0} x2={x} y2={580} stroke="rgba(255,255,255,0.02)" strokeWidth="1" />)}
          {[120, 240, 360, 480].map(y => <line key={"gy"+y} x1={0} y1={y} x2={960} y2={y} stroke="rgba(255,255,255,0.02)" strokeWidth="1" />)}

          {/* State fills — highlight states with properties */}
          {Object.entries(STATE_PATHS).map(([abbr, d]) => {
            const hasProps = statePropCount[abbr] > 0;
            return (
              <path key={abbr} d={d}
                // States with properties glow in indigo; empty states are subtly visible
                fill={hasProps ? "rgba(79,70,229,0.22)" : "rgba(255,255,255,0.05)"}
                stroke={hasProps ? "rgba(129,140,248,0.7)" : "rgba(255,255,255,0.14)"}
                strokeWidth={hasProps ? 1.4 : 0.7}
                style={{ transition: "fill 0.2s" }}
              />
            );
          })}

          {/* State abbreviation labels — brighter for readability */}
          {Object.entries(STATE_LABELS).map(([abbr, [lx, ly]]) => {
            const skip = ["CT","DE","RI","DC","MD","NJ","NH","VT","MA"].includes(abbr);
            if (skip) return null;
            const hasProps = statePropCount[abbr] > 0;
            return (
              <text key={"lbl"+abbr} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                fontSize={hasProps ? "9" : "8"}
                fill={hasProps ? "rgba(199,210,254,0.85)" : "rgba(148,163,184,0.4)"}
                fontFamily="'DM Sans',sans-serif" fontWeight={hasProps ? "700" : "500"}
                style={{ pointerEvents: "none", userSelect: "none" }}>
                {abbr}
              </text>
            );
          })}

          {/* Property markers */}
          {visibleProps.map(p => {
            const { x, y } = project(p.lat, p.lng);
            const rev = p.monthlyRent;
            const r = Math.max(9, Math.sqrt(rev / 1800) + 4);
            const hovered = hoverId === p.id;
            const occColor = p.occupancy === 0 ? "#EF4444" : p.occupancy < 75 ? "#F59E0B" : "#10B981";
            const baseColor = TYPE_COLORS[p.type] || "#6B7280";
            const circ = 2 * Math.PI * (r + 4);
            const dashLen = (p.occupancy / 100) * circ;

            return (
              <g key={p.id} style={{ cursor: "pointer" }}
                onClick={() => onSelect(p)}
                onMouseEnter={e => { setHoverId(p.id); setTooltip(p); setTooltipPos({ x: e.clientX, y: e.clientY }); }}
                onMouseLeave={() => { setHoverId(null); setTooltip(null); }}>

                {/* Vacant pulsing alert */}
                {p.status === "vacant" && (
                  <circle cx={x} cy={y} r={r + 8} fill="none" stroke="#EF4444" strokeWidth="1.5" opacity="0.5">
                    <animate attributeName="r" values={`${r+6};${r+16};${r+6}`} dur="2.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="2.2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Hover glow halo */}
                {hovered && (
                  <circle cx={x} cy={y} r={r + 14} fill={baseColor} opacity="0.12" filter="url(#glow)" />
                )}

                {/* Drop shadow */}
                <circle cx={x} cy={y + 3} r={r} fill="rgba(0,0,0,0.5)" />

                {/* Main dot */}
                <circle cx={x} cy={y} r={r}
                  fill={baseColor}
                  opacity={hovered ? 1 : 0.9}
                  filter={hovered ? "url(#softglow)" : ""}
                />

                {/* Inner highlight */}
                <circle cx={x - r * 0.25} cy={y - r * 0.25} r={r * 0.35}
                  fill="rgba(255,255,255,0.2)" />

                {/* Occupancy arc ring */}
                <circle cx={x} cy={y} r={r + 4}
                  fill="none" stroke={occColor} strokeWidth="2.5"
                  strokeDasharray={`${dashLen} ${circ - dashLen}`}
                  strokeLinecap="round" opacity={hovered ? 1 : 0.8}
                  transform={`rotate(-90 ${x} ${y})`} />

                {/* Estate outer ring */}
                <circle cx={x} cy={y} r={r + 7}
                  fill="none"
                  stroke={p.estate === "in-estate" ? "rgba(255,255,255,0.6)" : "#FCD34D"}
                  strokeWidth={hovered ? 2 : 1.2}
                  strokeDasharray={p.estate === "out-of-estate" ? "4 3" : "none"}
                  opacity={hovered ? 0.9 : 0.45} />

                {/* Type initial */}
                <text x={x} y={y + 0.5} textAnchor="middle" dominantBaseline="middle"
                  fontSize={r > 12 ? "9" : "7"} fontWeight="800" fill="rgba(255,255,255,0.95)"
                  fontFamily="'DM Sans',sans-serif" style={{ pointerEvents: "none" }}>
                  {p.type[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div style={{
          position: "absolute", bottom: 14, left: 14,
          background: "rgba(13,17,23,0.88)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 10, padding: "8px 14px",
          display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center"
        }}>
          {Object.entries(TYPE_COLORS).map(([t, c]) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans',sans-serif" }}>{t}</span>
            </div>
          ))}
          <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.12)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="13" height="13"><circle cx="6.5" cy="6.5" r="5" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" /></svg>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans',sans-serif" }}>In Estate</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="13" height="13"><circle cx="6.5" cy="6.5" r="5" fill="none" stroke="#FCD34D" strokeWidth="1.5" strokeDasharray="3 2" /></svg>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans',sans-serif" }}>Out of Estate</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width="13" height="13"><circle cx="6.5" cy="6.5" r="5" fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="10 5" transform="rotate(-90 6.5 6.5)" /></svg>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans',sans-serif" }}>Arc = occupancy</span>
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 14, right: 14, fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "'DM Sans',sans-serif" }}>
          Hover for details · size = revenue
        </div>

        {/* Floating tooltip */}
        {tooltip && (
          <div style={{
            position: "fixed", left: tooltipPos.x + 18, top: tooltipPos.y - 80,
            zIndex: 9999, pointerEvents: "none",
            background: "rgba(15,20,30,0.97)", backdropFilter: "blur(16px)",
            border: "1px solid rgba(99,102,241,0.4)",
            borderRadius: 12, padding: "12px 16px",
            boxShadow: "0 16px 48px rgba(0,0,0,0.6)", minWidth: 210,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700, color: "#F9FAFB", fontSize: 13, lineHeight: 1.3 }}>{tooltip.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{tooltip.address}</div>
              </div>
              <span style={{ background: TYPE_COLORS[tooltip.type] + "33", color: TYPE_COLORS[tooltip.type], fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, marginLeft: 8, whiteSpace: "nowrap" }}>{tooltip.type}</span>
            </div>
            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 8 }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
              {[
                ["Monthly Rent", tooltip.monthlyRent > 0 ? "$" + tooltip.monthlyRent.toLocaleString() : "Vacant"],
                ["Occupancy", tooltip.occupancy + "%"],
                ["Status", STATUS_STYLES[tooltip.status]?.label || tooltip.status],
                ["Estate", ESTATE_STYLES[tooltip.estate]?.label || tooltip.estate],
                ["Sq Ft", tooltip.sqft.toLocaleString()],
                ["Entity", tooltip.entity],
              ].map(([l, v]) => (
                <div key={l}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 1 }}>{l}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#F9FAFB", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>{v}</div>
                </div>
              ))}
            </div>
            {(() => {
              const loan = loans.find(l => l.propertyId === tooltip.id);
              return loan ? (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>Loan — {loan.lender}</div>
                  <div style={{ display: "flex", gap: 16 }}>
                    <div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Balance</div><div style={{ fontSize: 12, fontWeight: 600, color: "#EF4444" }}>${Math.round(loan.balance ).toLocaleString()}</div></div>
                    <div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Rate</div><div style={{ fontSize: 12, fontWeight: 600, color: "#F9FAFB" }}>{loan.interestRate}%</div></div>
                    <div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>Monthly</div><div style={{ fontSize: 12, fontWeight: 600, color: "#F9FAFB" }}>${loan.monthlyPayment.toLocaleString()}</div></div>
                  </div>
                </div>
              ) : null;
            })()}
            <div style={{ marginTop: 8, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 10, color: "rgba(255,255,255,0.3)", fontStyle: "italic" }}>Click to open full details</div>
          </div>
        )}
      </div>

      {/* ── SIDEBAR ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, overflow: "hidden" }}>

        {/* Summary grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { label: "Showing", value: visibleProps.length, color: "#4F46E5" },
            { label: "Vacant", value: visibleProps.filter(p => p.status === "vacant").length, color: "#EF4444" },
            { label: "In Estate", value: visibleProps.filter(p => p.estate === "in-estate").length, color: "#4338CA" },
            { label: "Out of Estate", value: visibleProps.filter(p => p.estate === "out-of-estate").length, color: "#9CA3AF" },
          ].map(c => (
            <div key={c.label} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 14px", borderLeft: "4px solid " + c.color }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", fontFamily: "'DM Serif Display',serif", lineHeight: 1 }}>{c.value}</div>
              <div style={{ fontSize: 11, color: "#6B7280", marginTop: 3 }}>{c.label}</div>
            </div>
          ))}
        </div>

        {/* Property list */}
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, flex: 1, overflow: "auto", minHeight: 0 }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{visibleProps.length} Properties</span>
            <span style={{ fontSize: 11, color: "#9CA3AF" }}>${Math.round(totalRevShown ).toLocaleString()} / mo</span>
          </div>
          {visibleProps.map(p => {
            const loan = loans.find(l => l.propertyId === p.id);
            const occColor = p.occupancy === 0 ? "#EF4444" : p.occupancy < 75 ? "#F59E0B" : "#10B981";
            return (
              <div key={p.id} onClick={() => onSelect(p)}
                onMouseEnter={e => { setHoverId(p.id); e.currentTarget.style.background = "#F9FAFB"; }}
                onMouseLeave={e => { setHoverId(null); e.currentTarget.style.background = ""; }}
                style={{ padding: "11px 16px", borderBottom: "1px solid #F3F4F6", cursor: "pointer", transition: "background 0.1s" }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                  <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.entity}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                    <span style={{ background: TYPE_COLORS[p.type] + "22", color: TYPE_COLORS[p.type], fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 99 }}>{p.type}</span>
                    <span style={{ background: ESTATE_STYLES[p.estate]?.bg, color: ESTATE_STYLES[p.estate]?.color, fontSize: 9, fontWeight: 600, padding: "1px 6px", borderRadius: 99 }}>{ESTATE_STYLES[p.estate]?.label}</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontSize: 10, color: "#9CA3AF" }}>{p.address.split(",").slice(-2).join(",").trim()}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: p.monthlyRent > 0 ? "#111827" : "#EF4444", flexShrink: 0, marginLeft: 4 }}>
                    {p.monthlyRent > 0 ? "$" + (p.monthlyRent / 1000).toFixed(0) + "K" : "Vacant"}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ flex: 1, height: 4, background: "#F3F4F6", borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ width: p.occupancy + "%", height: "100%", background: occColor, borderRadius: 99, transition: "width 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: occColor, minWidth: 28, textAlign: "right" }}>{p.occupancy}%</span>
                  {loan && <span style={{ fontSize: 9, color: "#D1D5DB", flexShrink: 0 }}>🏦 {Math.round(loan.balance ).toLocaleString()}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
const FILE_ICONS = {
  pdf: { icon: "📄", color: "#EF4444", bg: "#FEF2F2" },
  doc: { icon: "📝", color: "#3B82F6", bg: "#EFF6FF" },
  docx: { icon: "📝", color: "#3B82F6", bg: "#EFF6FF" },
  xls: { icon: "📊", color: "#10B981", bg: "#F0FDF4" },
  xlsx: { icon: "📊", color: "#10B981", bg: "#F0FDF4" },
  jpg: { icon: "🖼️", color: "#F59E0B", bg: "#FFFBEB" },
  jpeg: { icon: "🖼️", color: "#F59E0B", bg: "#FFFBEB" },
  png: { icon: "🖼️", color: "#F59E0B", bg: "#FFFBEB" },
  default: { icon: "📎", color: "#6B7280", bg: "#F3F4F6" },
};

function getFileIcon(name) {
  const ext = name.split(".").pop().toLowerCase();
  return FILE_ICONS[ext] || FILE_ICONS.default;
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function PropertyFiles({ files, setFiles }) {
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (fileList) => {
    Array.from(fileList).forEach(f => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newFile = {
          id: Date.now() + Math.random(),
          name: f.name,
          size: f.size,
          uploadedAt: new Date().toLocaleDateString(),
          dataUrl: e.target.result,
        };
        setFiles(prev => [...prev, newFile]);
      };
      reader.readAsDataURL(f);
    });
  };

  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));

  const downloadFile = (file) => {
    if (!file.dataUrl) return;
    const a = document.createElement("a");
    a.href = file.dataUrl;
    a.download = file.name;
    a.click();
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h4 style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: 0 }}>Files & Documents</h4>
        <span style={{ fontSize: 11, color: "#9CA3AF" }}>{files.length} file{files.length !== 1 ? "s" : ""}</span>
      </div>
      <label
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 6, padding: "18px 16px", border: `2px dashed ${dragOver ? "#4F46E5" : "#D1D5DB"}`,
          borderRadius: 10, background: dragOver ? "#EEF2FF" : "#FAFAFA",
          cursor: "pointer", transition: "all 0.15s", marginBottom: 12,
        }}>
        <input type="file" multiple style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />
        <div style={{ fontSize: 22 }}>{dragOver ? "📂" : "☁️"}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: dragOver ? "#4F46E5" : "#374151" }}>
          {dragOver ? "Drop to upload" : "Drag & drop files here"}
        </div>
        <div style={{ fontSize: 11, color: "#9CA3AF" }}>or click to browse — PDFs, images, spreadsheets, docs</div>
      </label>
      {files.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {files.map(f => {
            const { icon, bg } = getFileIcon(f.name);
            return (
              <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 12px" }}>
                <div style={{ width: 32, height: 32, borderRadius: 7, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>{formatBytes(f.size)} · {f.uploadedAt}</div>
                </div>
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <button onClick={() => downloadFile(f)} style={{ padding: "4px 8px", background: "#EEF2FF", border: "none", borderRadius: 6, color: "#4F46E5", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>↓</button>
                  <button onClick={() => removeFile(f.id)} style={{ padding: "4px 8px", background: "#FEF2F2", border: "none", borderRadius: 6, color: "#EF4444", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>×</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Loan math helpers
function calcFixedPayment(principal, annualRate, startDate, maturityDate) {
  const P = parseFloat(principal);
  const rate = parseFloat(annualRate);
  if (!P || !rate || !startDate || !maturityDate) return null;
  // Monthly interest rate — divide annual % by 100 then by 12
  // e.g. 3.8% → 0.038 / 12 = 0.003167
  const r = rate / 100 / 12;
  // Parse dates with T00:00:00 to avoid UTC timezone shift
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(maturityDate + "T00:00:00");
  // n = total number of monthly payments
  const n = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (n <= 0 || r === 0) return null;
  // Standard amortization: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const factor = Math.pow(1 + r, n);
  const payment = P * (r * factor) / (factor - 1);
  // Current balance: simulate amortization month-by-month from start to today
  const now = new Date();
  const monthsElapsed = Math.max(0,
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth())
  );
  let balance = P;
  for (let i = 0; i < Math.min(monthsElapsed, n); i++) {
    const interestThisMonth = balance * r;
    const principalThisMonth = payment - interestThisMonth;
    balance -= principalThisMonth;
    if (balance < 0) { balance = 0; break; }
  }
  return { payment: Math.round(payment), balance: Math.round(balance), totalMonths: n };
}

function calcInterestOnlyPayment(principal, annualRate) {
  const P = parseFloat(principal);
  const rate = parseFloat(annualRate);
  if (!P || !rate) return { payment: 0, balance: P || 0 };
  // Simple: monthly payment = P * (annualRate% / 12), balance never changes
  return { payment: Math.round(P * (rate / 100) / 12), balance: P };
}

function LoanForm({ loan, setLoan, propOpts, showPropertyField, onSave, saveLabel }) {
  const LOAN_TYPES = ["Fixed", "Variable", "Interest Only", "Bridge", "Construction"];

  // Re-run calculation whenever any input changes for Fixed or Interest Only loans
  const handleCalc = (updated) => {
    const p = parseFloat(updated.originalAmount);
    const r = parseFloat(updated.interestRate);
    if (updated.type === "Interest Only" && p > 0 && r > 0) {
      const { payment, balance } = calcInterestOnlyPayment(p, r);
      setLoan({ ...updated, monthlyPayment: String(payment), balance: String(balance) });
    } else if (updated.type === "Fixed" && p > 0 && r > 0 && updated.startDate && updated.maturityDate) {
      const result = calcFixedPayment(p, r, updated.startDate, updated.maturityDate);
      if (result) {
        setLoan({ ...updated, monthlyPayment: String(result.payment), balance: String(result.balance) });
      } else {
        setLoan(updated);
      }
    } else {
      setLoan(updated);
    }
  };

  const isInterestOnly = loan.type === "Interest Only";
  const isFixed = loan.type === "Fixed";

  // For fixed/IO, show calculated results as read-only highlighted fields
  const showCalcBox = (isFixed || isInterestOnly) && +loan.monthlyPayment > 0;

  return (
    <div>
      {showPropertyField && <Field label="Property" value={loan.propertyId} onChange={v=>handleCalc({...loan,propertyId:v})} options={propOpts} />}
      <Field label="Lender" value={loan.lender} onChange={v=>setLoan({...loan,lender:v})} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Loan Type" value={loan.type} onChange={v=>handleCalc({...loan,type:v})} options={LOAN_TYPES} />
        <Field label="Status" value={loan.status} onChange={v=>setLoan({...loan,status:v})} options={["current","watch","default"]} />
        <Field label="Original Amount ($)" value={loan.originalAmount} onChange={v=>handleCalc({...loan,originalAmount:v})} type="number" />
        <Field label="Interest Rate (%)" value={loan.interestRate} onChange={v=>handleCalc({...loan,interestRate:v})} type="number" />
        <Field label="Start Date" value={loan.startDate||""} onChange={v=>handleCalc({...loan,startDate:v})} type="date" />
        <Field label="Maturity Date" value={loan.maturityDate||""} onChange={v=>handleCalc({...loan,maturityDate:v})} type="date" />
      </div>

      {/* Auto-calculated results */}
      {showCalcBox && (
        <div style={{ background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 10, padding: "14px 16px", margin: "14px 0" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#4338CA", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            ✓ {isInterestOnly ? "Interest Only Calculation" : "Amortization Calculation"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: "#6366F1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Monthly Payment</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>${Math.round(+loan.monthlyPayment).toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#6366F1", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>{isInterestOnly ? "Balance (never changes)" : "Current Balance"}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>${Math.round(+loan.balance).toLocaleString()}</div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: "#6366F1", marginTop: 8 }}>
            {isInterestOnly
              ? "Monthly payment = original amount × annual rate ÷ 12. Balance is always equal to original amount."
              : "Monthly payment and current balance auto-calculated from your inputs. Updates live as you change fields above."}
          </div>
        </div>
      )}

      {/* Show hint if Fixed but missing fields */}
      {isFixed && !showCalcBox && (+loan.originalAmount > 0 || +loan.interestRate > 0) && (
        <div style={{ background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 8, padding: "10px 14px", margin: "12px 0", fontSize: 12, color: "#92400E" }}>
          Fill in Original Amount, Interest Rate, Start Date, and Maturity Date to auto-calculate payment and balance.
        </div>
      )}

      {/* Manual override fields for Variable/Bridge/Construction */}
      {!isFixed && !isInterestOnly && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 4 }}>
          <Field label="Current Balance ($)" value={loan.balance} onChange={v=>setLoan({...loan,balance:v})} type="number" />
          <Field label="Monthly Payment ($)" value={loan.monthlyPayment} onChange={v=>setLoan({...loan,monthlyPayment:v})} type="number" />
        </div>
      )}

      <button onClick={onSave}
        style={{ width:"100%",padding:"12px",background:"#4F46E5",color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginTop:12 }}>
        {saveLabel}
      </button>
    </div>
  );
}

export default function App() {
  const [properties, setProperties] = useState(initialProperties);
  const [loans, setLoans] = useState(initialLoans);
  const [tenants, setTenants] = useState(initialTenants);
  const [maintenance, setMaintenance] = useState(initialMaintenance);
  const [loggedIn, setLoggedIn] = useState(() => sessionStorage.getItem("pm_auth") === "true");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [sel, setSel] = useState(null);
  const [showAddProp, setShowAddProp] = useState(false);
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [showAddMaint, setShowAddMaint] = useState(false);
  const [showAddLoan, setShowAddLoan] = useState(false);
  const [fStatus, setFStatus] = useState("all");
  const [fType, setFType] = useState("all");
  const [fEstate, setFEstate] = useState("all");
  const [search, setSearch] = useState("");
  const [fView, setFView] = useState("overview");
  const [newP, setNewP] = useState({ name: "", address: "", type: "Office", floors: "", sqft: "", monthlyRent: "", assetValue: "", status: "active", estate: "in-estate", entity: "", leaseEscalationPct: "", leaseEscalationDate: "" });
  const [newT, setNewT] = useState({ propertyId: "", name: "", unit: "", leaseStart: "", leaseEnd: "", monthlyRent: "", contact: "" });
  const [newM, setNewM] = useState({ propertyId: "", title: "", priority: "medium", assignee: "", cost: "", date: "" });
  const [newL, setNewL] = useState({ propertyId: "", lender: "", originalAmount: "", balance: "", interestRate: "", monthlyPayment: "", startDate: "", maturityDate: "", type: "Fixed", status: "current" });
  const [propertyFiles, setPropertyFiles] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [editP, setEditP] = useState(null);
  const [showEditLoan, setShowEditLoan] = useState(false);
  const [editL, setEditL] = useState(null);
  const [showEditMaint, setShowEditMaint] = useState(false);
  const [editMaint, setEditMaint] = useState(null);
  const [taxes, setTaxes] = useState([]);
  const [showAddTax, setShowAddTax] = useState(false);
  const [showEditTax, setShowEditTax] = useState(false);
  const [editTax, setEditTax] = useState(null);
  const [newTax, setNewTax] = useState({ propertyId: "", taxYear: new Date().getFullYear().toString(), annualAmount: "", amountPaid: "", dueDate: "", datePaid: "", status: "due", notes: "" });
  const [expenses, setExpenses] = useState([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [newExpense, setNewExpense] = useState({ propertyId: "", category: "Insurance", description: "", amount: "", frequency: "monthly", date: "", notes: "" });

  const [loading, setLoading] = useState(true);

  // Load from Supabase on mount
  useEffect(() => {
    (async () => {
      try {
        const [p, l, t, m, tx, ex] = await Promise.all([
          db.get("properties").catch(()=>[]),
          db.get("loans").catch(()=>[]),
          db.get("tenants").catch(()=>[]),
          db.get("maintenance").catch(()=>[]),
          db.get("property_taxes").catch(()=>[]),
          db.get("expenses").catch(()=>[])
        ]);
        setProperties(Array.isArray(p)?p.map(mapProperty):[]);
        setLoans(Array.isArray(l)?l.map(mapLoan):[]);
        setTenants(Array.isArray(t)?t.map(mapTenant):[]);
        setMaintenance(Array.isArray(m)?m.map(mapMaintenance):[]);
        setTaxes(Array.isArray(tx)?tx.map(mapTax):[]);
        setExpenses(Array.isArray(ex)?ex.map(mapExpense):[]);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, []);

  // Supabase CRUD helpers
  const addTax = async (tx) => {
    const row = await db.insert("property_taxes", { property_id: +tx.propertyId, tax_year: tx.taxYear, annual_amount: +tx.annualAmount||0, amount_paid: +tx.amountPaid||0, due_date: tx.dueDate||null, date_paid: tx.datePaid||null, status: tx.status, notes: tx.notes||"" });
    setTaxes(prev => [...prev, mapTax(row)]);
  };
  const updateTax = async (tx) => {
    await db.update("property_taxes", tx.id, { tax_year: tx.taxYear, annual_amount: +tx.annualAmount||0, amount_paid: +tx.amountPaid||0, due_date: tx.dueDate||null, date_paid: tx.datePaid||null, status: tx.status, notes: tx.notes||"" });
    setTaxes(prev => prev.map(x => x.id === tx.id ? {...x, ...tx, annualAmount: +tx.annualAmount, amountPaid: +tx.amountPaid} : x));
  };
  const deleteTax = async (id) => {
    await db.delete("property_taxes", id);
    setTaxes(prev => prev.filter(x => x.id !== id));
  };
  const addExpense = async (e) => {
    const row = await db.insert("expenses", { property_id: +e.propertyId, category: e.category, description: e.description||"", amount: +e.amount||0, frequency: e.frequency, date: e.date||null, notes: e.notes||"" });
    setExpenses(prev => [...prev, mapExpense(row)]);
  };
  const updateExpense = async (e) => {
    await db.update("expenses", e.id, { category: e.category, description: e.description||"", amount: +e.amount||0, frequency: e.frequency, date: e.date||null, notes: e.notes||"" });
    setExpenses(prev => prev.map(x => x.id === e.id ? {...x, ...e, amount: +e.amount} : x));
  };
  const deleteExpense = async (id) => {
    await db.delete("expenses", id);
    setExpenses(prev => prev.filter(x => x.id !== id));
  };
  const addProperty = async (p) => {
    const row = await db.insert("properties", { name: p.name, address: p.address, type: p.type, floors: +p.floors, sqft: +p.sqft, occupancy: p.status==="vacant"?0:+p.occupancy||80, monthly_rent: +p.monthlyRent, asset_value: +p.assetValue, status: p.status, estate: p.estate, entity: p.entity, lat: 37.7, lng: -96, lease_escalation_pct: +p.leaseEscalationPct||0, lease_escalation_date: p.leaseEscalationDate||null });
    setProperties(prev => [...prev, mapProperty(row)]);
  };
  const updateProperty = async (p) => {
    await db.update("properties", p.id, { name: p.name, address: p.address, type: p.type, floors: +p.floors, sqft: +p.sqft, occupancy: +p.occupancy, monthly_rent: +p.monthlyRent, asset_value: +p.assetValue, status: p.status, estate: p.estate, entity: p.entity, lease_escalation_pct: +p.leaseEscalationPct||0, lease_escalation_date: p.leaseEscalationDate||null });
    setProperties(prev => prev.map(x => x.id === p.id ? {...x, ...p} : x));
  };
  const deleteProperty = async (id) => {
    await db.delete("properties", id);
    setProperties(prev => prev.filter(x => x.id !== id));
  };
  const addLoan = async (l) => {
    const row = await db.insert("loans", { property_id: +l.propertyId, lender: l.lender, original_amount: +l.originalAmount, balance: +l.balance, interest_rate: +l.interestRate, monthly_payment: +l.monthlyPayment, start_date: l.startDate, maturity_date: l.maturityDate, type: l.type, status: l.status });
    setLoans(prev => [...prev, mapLoan(row)]);
  };
  const updateLoan = async (l) => {
    await db.update("loans", l.id, { lender: l.lender, original_amount: +l.originalAmount, balance: +l.balance, interest_rate: +l.interestRate, monthly_payment: +l.monthlyPayment, start_date: l.startDate, maturity_date: l.maturityDate, type: l.type, status: l.status });
    setLoans(prev => prev.map(x => x.id === l.id ? {...x, ...l} : x));
  };
  const addTenant = async (t) => {
    const row = await db.insert("tenants", { property_id: +t.propertyId, name: t.name, unit: t.unit, lease_start: t.leaseStart, lease_end: t.leaseEnd, monthly_rent: +t.monthlyRent, contact: t.contact });
    setTenants(prev => [...prev, mapTenant(row)]);
  };
  const deleteTenant = async (id) => {
    await db.delete("tenants", id);
    setTenants(prev => prev.filter(x => x.id !== id));
  };
  const addMaintenance = async (m) => {
    const row = await db.insert("maintenance", { property_id: +m.propertyId, title: m.title, priority: m.priority, status: "open", date: m.date, cost: +m.cost, assignee: m.assignee });
    setMaintenance(prev => [...prev, mapMaintenance(row)]);
  };
  const updateMaintenanceStatus = async (id, status) => {
    await db.update("maintenance", id, { status });
    setMaintenance(prev => prev.map(x => x.id === id ? {...x, status} : x));
  };
  const updateMaintenance = async (m) => {
    await db.update("maintenance", m.id, { title: m.title, priority: m.priority, status: m.status, date: m.date, cost: +m.cost||0, assignee: m.assignee });
    setMaintenance(prev => prev.map(x => x.id === m.id ? {...x, ...m, cost: +m.cost||0} : x));
  };
  const deleteMaintenance = async (id) => {
    await db.delete("maintenance", id);
    setMaintenance(prev => prev.filter(x => x.id !== id));
  };

  const totalRevenue = properties.reduce((s, p) => s + (parseFloat(p.monthlyRent) || 0), 0);
  const totalAssetValue = properties.reduce((s, p) => s + (parseFloat(p.assetValue) || 0), 0);
  const avgOccupancy = Math.round(properties.reduce((s, p) => s + (parseFloat(p.occupancy) || 0), 0) / (properties.length || 1));
  // Force parseFloat on balance/payment to prevent string concatenation from Supabase string returns
  const totalDebt = loans.reduce((s, l) => s + (parseFloat(l.balance) || 0), 0);
  const totalDebtService = loans.reduce((s, l) => s + (parseFloat(l.monthlyPayment) || 0), 0);

  // Monthly expense helper: monthly = amount, one-time = 0 for ongoing NOI calc
  const monthlyExpensesForProp = (propId) =>
    expenses.filter(e => e.propertyId === propId && e.frequency === "monthly")
            .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const totalMonthlyExpenses = expenses.filter(e => e.frequency === "monthly")
    .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  // NOI = Revenue - monthly expenses (operating expenses, not debt service)
  const totalNOI = totalRevenue - totalMonthlyExpenses;

  // Category colours for expenses
  const EXPENSE_CATEGORY_COLORS = {
    "Insurance":            { bg: "#DBEAFE", color: "#1E40AF" },
    "Property Management":  { bg: "#EDE9FE", color: "#5B21B6" },
    "Repairs & Maintenance":{ bg: "#FEF3C7", color: "#92400E" },
    "Property Tax":         { bg: "#FEE2E2", color: "#991B1B" },
    "Utilities":            { bg: "#D1FAE5", color: "#065F46" },
    "Other":                { bg: "#F3F4F6", color: "#374151" },
  };
  const EXPENSE_CATEGORIES = Object.keys(EXPENSE_CATEGORY_COLORS);
  const netOperatingIncome = totalRevenue - totalDebtService;
  const openMaint = maintenance.filter(m => m.status !== "completed").length;

  const filtered = properties.filter(p => {
    if (fStatus !== "all" && p.status !== fStatus) return false;
    if (fType !== "all" && p.type !== fType) return false;
    if (fEstate !== "all" && p.estate !== fEstate) return false;
    if (search && ![p.name, p.address, p.entity || ""].some(s => s.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const propOpts = [{ v: "", l: "Select property..." }, ...properties.map(p => ({ v: String(p.id), l: p.name }))];

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "⬛" },
    { id: "properties", label: "Properties", icon: "🏢" },
    { id: "tenants", label: "Tenants", icon: "👥" },
    { id: "maintenance", label: "Maintenance", icon: "🔧" },
    { id: "expenses", label: "Expenses", icon: "📋" },
    { id: "finances", label: "Finances", icon: "💰" },
    { id: "taxes", label: "Property Tax", icon: "🏛" },
    { id: "map", label: "Map", icon: "📍" },
  ];

  const btnStyle = { padding: "9px 18px", background: "#fff", border: "1.5px solid #4F46E5", color: "#4F46E5", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" };

  const handleLogin = () => {
    const validEmail = import.meta.env.VITE_LOGIN_EMAIL || "richard@stonecrusherdev.com";
    const validPassword = import.meta.env.VITE_LOGIN_PASSWORD || "Electric1";
    if (loginEmail.trim() === validEmail && loginPassword === validPassword) {
      sessionStorage.setItem("pm_auth", "true");
      setLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Incorrect email or password.");
    }
  };

  if (!loggedIn) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'DM Sans', sans-serif; background: #F8F9FA; }
        `}</style>
        <div style={{ minHeight: "100vh", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "48px 40px", width: 400, boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#111827", marginBottom: 6 }}>PropManager</div>
              <div style={{ fontSize: 13, color: "#9CA3AF" }}>Sign in to your portfolio</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="you@example.com"
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #D1D5DB", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif" }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Password</label>
              <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="••••••••"
                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #D1D5DB", borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif" }} />
            </div>
            {loginError && <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#DC2626", marginBottom: 16 }}>{loginError}</div>}
            <button onClick={handleLogin} style={{ width: "100%", padding: "13px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Sign In</button>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>
        <div style={{ minHeight: "100vh", background: "#0F172A", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#F9FAFB" }}>PropManager</div>
          <div style={{ fontSize: 14, color: "#6B7280" }}>Loading your portfolio...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 99px; }
        .nav-btn { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:8px; border:none; background:transparent; color:#9CA3AF; font-size:14px; cursor:pointer; text-align:left; font-family:'DM Sans',sans-serif; width:100%; transition:all 0.15s; }
        .nav-btn:hover, .nav-btn.active { background:#EEF2FF; color:#4F46E5; font-weight:600; }
        .row:hover { background:#F9FAFB; cursor:pointer; }
        .fpill { cursor:pointer; padding:7px 14px; border-radius:8px; border:1.5px solid #E5E7EB; background:#fff; font-size:12px; font-weight:500; color:#374151; font-family:'DM Sans',sans-serif; }
        .fpill.on { border-color:#4F46E5; background:#EEF2FF; color:#4F46E5; font-weight:700; }
        .sub-btn { cursor:pointer; padding:7px 16px; border-radius:8px; border:1.5px solid #E5E7EB; background:#fff; font-size:13px; font-weight:500; color:#374151; font-family:'DM Sans',sans-serif; }
        .sub-btn.on { border-color:#4F46E5; background:#EEF2FF; color:#4F46E5; font-weight:700; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", background: "#F8F9FA", overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: 220, background: "#111827", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "28px 20px 20px", borderBottom: "1px solid #1F2937" }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#F9FAFB" }}>PropManager</div>
            <div style={{ fontSize: 11, color: "#6B7280", marginTop: 3, letterSpacing: "0.06em", textTransform: "uppercase" }}>Commercial Portfolio</div>
          </div>
          <nav style={{ flex: 1, padding: "12px", display: "flex", flexDirection: "column", gap: 2 }}>
            {navItems.map(n => (
              <button key={n.id} className={`nav-btn${tab === n.id ? " active" : ""}`} onClick={() => setTab(n.id)}>
                <span>{n.icon}</span>{n.label}
              </button>
            ))}
          </nav>
          <div style={{ padding: "16px 20px", borderTop: "1px solid #1F2937" }}>
            <div style={{ fontSize: 12, color: "#6B7280" }}>{properties.length} Properties</div>
            <div style={{ fontSize: 12, color: "#10B981", fontWeight: 600, marginTop: 2 }}>${totalRevenue.toLocaleString()} / month</div>
            <button onClick={() => { sessionStorage.removeItem("pm_auth"); setLoggedIn(false); }}
              style={{ marginTop: 10, width: "100%", padding: "7px", background: "transparent", border: "1px solid #374151", color: "#6B7280", borderRadius: 6, fontSize: 12, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              Sign Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: "#111827" }}>{navItems.find(n => n.id === tab)?.label}</h1>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }}>March 2026</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {tab === "properties" && <button style={btnStyle} onClick={() => setShowAddProp(true)}>+ Add Property</button>}
              {tab === "tenants" && <button style={btnStyle} onClick={() => setShowAddTenant(true)}>+ Add Tenant</button>}
              {tab === "maintenance" && <button style={btnStyle} onClick={() => setShowAddMaint(true)}>+ Log Request</button>}
              {tab === "expenses" && <button style={btnStyle} onClick={() => setShowAddExpense(true)}>+ Add Expense</button>}
              {tab === "finances" && fView === "loans" && <button style={btnStyle} onClick={() => setShowAddLoan(true)}>+ Add Loan</button>}
              {tab === "taxes" && <button style={btnStyle} onClick={() => setShowAddTax(true)}>+ Add Tax Record</button>}
            </div>
          </div>

          <div style={{ flex: 1, overflow: "auto", padding: "28px 32px" }}>

            {/* DASHBOARD */}
            {tab === "dashboard" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 16, marginBottom: 28 }}>
                  <MetricCard label="Portfolio Value" value={totalAssetValue>0?`$${Math.round(totalAssetValue).toLocaleString()}`:"—"} sub="Total asset value" accent="#7C3AED" />
                  <MetricCard label="Monthly Revenue" value={`$${Math.round(totalRevenue).toLocaleString()}`} sub="All properties" accent="#4F46E5" />
                  <MetricCard label="Avg Occupancy" value={`${avgOccupancy}%`} sub={`${properties.filter(p=>p.status==="active").length} fully leased`} accent="#10B981" />
                  <MetricCard label="Total Debt" value={`$${Math.round(totalDebt).toLocaleString()}`} sub={`${loans.length} loans`} accent="#EF4444" />
                  <MetricCard label="Open Work Orders" value={openMaint} sub="Maintenance" accent="#F59E0B" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
                  <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 18 }}>Occupancy by Property</h3>
                    {properties.slice(0, 10).map(p => (
                      <div key={p.id} style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 13, color: "#374151", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{p.name}</span>
                          <Badge label={p.type} bg={TYPE_COLORS[p.type]+"22"} color={TYPE_COLORS[p.type]} />
                        </div>
                        <OccupancyBar pct={p.occupancy} color={p.occupancy===0?"#EF4444":p.occupancy<75?"#F59E0B":"#10B981"} />
                      </div>
                    ))}
                  </div>
                  <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 18 }}>Revenue by Type</h3>
                    {Object.entries(TYPE_COLORS).map(([type, color]) => {
                      const rev = properties.filter(p=>p.type===type).reduce((s,p)=>s+p.monthlyRent,0);
                      return (
                        <div key={type} style={{ marginBottom: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{type}</span>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>${Math.round(rev).toLocaleString()}</span>
                          </div>
                          <OccupancyBar pct={totalRevenue>0?Math.round((rev/totalRevenue)*100):0} color={color} />
                        </div>
                      );
                    })}
                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #F3F4F6" }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 10 }}>Urgent Maintenance</h4>
                      {maintenance.filter(m=>m.priority==="high"&&m.status!=="completed").slice(0,3).map(m => (
                        <div key={m.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{m.title}</div>
                            <div style={{ fontSize: 11, color: "#9CA3AF" }}>{properties.find(p=>p.id===m.propertyId)?.name}</div>
                          </div>
                          <Badge label={m.status} bg={MAINT_STATUS_STYLES[m.status].bg} color={MAINT_STATUS_STYLES[m.status].color} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PROPERTIES */}
            {tab === "properties" && (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                  <input placeholder="Search name, address, entity..." value={search} onChange={e=>setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 200, padding: "9px 14px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff" }} />
                  {["all","active","partial","vacant"].map(s=>(
                    <button key={s} className={`fpill${fStatus===s?" on":""}`} onClick={()=>setFStatus(s)}>{s==="all"?"All Status":STATUS_STYLES[s]?.label}</button>
                  ))}
                  {["all","in-estate","out-of-estate"].map(e=>(
                    <button key={e} className={`fpill${fEstate===e?" on":""}`} onClick={()=>setFEstate(e)}>{e==="all"?"All Estate":ESTATE_STYLES[e].label}</button>
                  ))}
                  {["all","Office","Retail","Industrial","Medical"].map(t=>(
                    <button key={t} className={`fpill${fType===t?" on":""}`} onClick={()=>setFType(t)}>{t==="all"?"All Types":t}</button>
                  ))}
                </div>
                <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                        {["Property","Type","Owning Entity","Estate","Sq Ft","Occupancy","Asset Value","Monthly Rent","Status",""].map(h=>(
                          <th key={h} style={{ padding: "12px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(p=>(
                        <tr key={p.id} className="row" style={{ borderBottom: "1px solid #F3F4F6" }} onClick={()=>setSel(p)}>
                          <td style={{ padding: "13px 12px" }}>
                            <div style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: "#9CA3AF" }}>{p.floors} floors</div>
                          </td>
                          <td style={{ padding: "13px 12px" }}><Badge label={p.type} bg={TYPE_COLORS[p.type]+"20"} color={TYPE_COLORS[p.type]} /></td>
                          <td style={{ padding: "13px 12px", fontSize: 12, color: "#374151", maxWidth: 140 }}>
                            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.entity||"—"}</div>
                          </td>
                          <td style={{ padding: "13px 12px" }}><Badge label={ESTATE_STYLES[p.estate]?.label||p.estate} bg={ESTATE_STYLES[p.estate]?.bg||"#F3F4F6"} color={ESTATE_STYLES[p.estate]?.color||"#374151"} /></td>
                          <td style={{ padding: "13px 12px", fontSize: 12, color: "#374151", whiteSpace: "nowrap" }}>{p.sqft.toLocaleString()}</td>
                          <td style={{ padding: "13px 12px", minWidth: 110 }}><OccupancyBar pct={p.occupancy} color={p.occupancy===0?"#EF4444":p.occupancy<75?"#F59E0B":"#10B981"} /></td>
                          <td style={{ padding: "13px 12px", fontSize: 13, fontWeight: 700, color: "#7C3AED", whiteSpace: "nowrap" }}>{p.assetValue>0?`$${Math.round(p.assetValue).toLocaleString()}`:"—"}</td>
                          <td style={{ padding: "13px 12px", fontSize: 13, fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }}>{p.monthlyRent>0?`$${p.monthlyRent.toLocaleString()}`:"—"}</td>
                          <td style={{ padding: "13px 12px" }}><Badge label={STATUS_STYLES[p.status].label} bg={STATUS_STYLES[p.status].bg} color={STATUS_STYLES[p.status].color} /></td>
                          <td style={{ padding: "13px 12px" }}>
                            <button onClick={e=>{e.stopPropagation();setSel(p);}} style={{ fontSize: 12, color: "#4F46E5", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Details →</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TENANTS */}
            {tab === "tenants" && (
              <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                      {["Tenant","Property","Unit","Lease Period","Monthly Rent","Status","Contact",""].map(h=>(
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map(t=>{
                      const prop = properties.find(p=>p.id===t.propertyId);
                      const days = Math.ceil((new Date(t.leaseEnd)-new Date())/86400000);
                      return (
                        <tr key={t.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                          <td style={{ padding: "14px 16px", fontWeight: 600, color: "#111827", fontSize: 14 }}>{t.name}</td>
                          <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151" }}>{prop?.name||"—"}</td>
                          <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151" }}>{t.unit}</td>
                          <td style={{ padding: "14px 16px", fontSize: 12, color: "#6B7280" }}>
                            <div>{t.leaseStart} → {t.leaseEnd}</div>
                            <div style={{ color: days<90?"#EF4444":"#9CA3AF", fontWeight: days<90?600:400 }}>{days>0?`${days} days left`:"Expired"}</div>
                          </td>
                          <td style={{ padding: "14px 16px", fontWeight: 700, color: "#111827" }}>${t.monthlyRent.toLocaleString()}</td>
                          <td style={{ padding: "14px 16px" }}><Badge label={days<90?"Expiring Soon":"Current"} bg={days<90?"#FEE2E2":"#D1FAE5"} color={days<90?"#991B1B":"#065F46"} /></td>
                          <td style={{ padding: "14px 16px", fontSize: 12, color: "#4F46E5" }}>{t.contact}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <button onClick={()=>{if(window.confirm(`Remove "${t.name}"?`)) deleteTenant(t.id);}}
                              style={{ fontSize: 12, color: "#EF4444", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Remove</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* MAINTENANCE */}
            {tab === "maintenance" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
                  {["open","in-progress","scheduled","completed"].map(s=>(
                    <div key={s} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "16px 20px", textAlign: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", fontFamily: "'DM Serif Display', serif" }}>{maintenance.filter(m=>m.status===s).length}</div>
                      <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2, textTransform: "capitalize" }}>{s.replace("-"," ")}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                        {["Request","Property","Priority","Assignee","Est. Cost","Status","Update",""].map(h=>(
                          <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {maintenance.map(m=>{
                        const prop = properties.find(p=>p.id===m.propertyId);
                        return (
                          <tr key={m.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>{m.title}</div>
                              <div style={{ fontSize: 11, color: "#9CA3AF" }}>{m.date}</div>
                            </td>
                            <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151" }}>{prop?.name||"—"}</td>
                            <td style={{ padding: "14px 16px" }}><Badge label={m.priority} bg={PRIORITY_STYLES[m.priority].bg} color={PRIORITY_STYLES[m.priority].color} /></td>
                            <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151" }}>{m.assignee}</td>
                            <td style={{ padding: "14px 16px", fontWeight: 600, color: "#111827" }}>{m.cost>0?`$${m.cost.toLocaleString()}`:"TBD"}</td>
                            <td style={{ padding: "14px 16px" }}><Badge label={m.status.replace("-"," ")} bg={MAINT_STATUS_STYLES[m.status].bg} color={MAINT_STATUS_STYLES[m.status].color} /></td>
                            <td style={{ padding: "14px 16px" }}>
                              <select value={m.status} onChange={e=>updateMaintenanceStatus(m.id, e.target.value)}
                                style={{ fontSize: 12, padding: "5px 8px", border: "1px solid #D1D5DB", borderRadius: 6, outline: "none", cursor: "pointer", background: "#fff" }}>
                                {["open","in-progress","scheduled","completed"].map(s=><option key={s} value={s}>{s}</option>)}
                              </select>
                            </td>
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={()=>{ setEditMaint({...m, cost: String(m.cost), propertyId: String(m.propertyId)}); setShowEditMaint(true); }}
                                  style={{ fontSize: 12, color: "#4F46E5", background: "#EEF2FF", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
                                  ✏️ Edit
                                </button>
                                <button onClick={()=>{ if(window.confirm(`Delete "${m.title}"?`)) deleteMaintenance(m.id); }}
                                  style={{ fontSize: 12, color: "#EF4444", background: "#FEF2F2", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
                                  🗑
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* FINANCES */}
            {tab === "expenses" && (
              <div>
                {/* Summary cards */}
                {(() => {
                  const monthlyTotal = expenses.filter(e=>e.frequency==="monthly").reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
                  const oneTimeTotal = expenses.filter(e=>e.frequency==="one-time").reduce((s,e)=>s+(parseFloat(e.amount)||0),0);
                  const byCategory = EXPENSE_CATEGORIES.map(cat => ({
                    cat,
                    monthly: expenses.filter(e=>e.category===cat&&e.frequency==="monthly").reduce((s,e)=>s+(parseFloat(e.amount)||0),0)
                  })).filter(x=>x.monthly>0);
                  return (
                    <>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
                        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 24px", borderTop: "4px solid #EF4444" }}>
                          <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Monthly Expenses</div>
                          <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'DM Serif Display',serif", color: "#EF4444" }}>${monthlyTotal.toLocaleString()}</div>
                          <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>Recurring / month</div>
                        </div>
                        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 24px", borderTop: "4px solid #10B981" }}>
                          <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Monthly Revenue</div>
                          <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'DM Serif Display',serif", color: "#10B981" }}>${totalRevenue.toLocaleString()}</div>
                          <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>Gross rent</div>
                        </div>
                        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 24px", borderTop: `4px solid ${totalNOI>=0?"#4F46E5":"#EF4444"}` }}>
                          <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Monthly NOI</div>
                          <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'DM Serif Display',serif", color: totalNOI>=0?"#4F46E5":"#EF4444" }}>${totalNOI.toLocaleString()}</div>
                          <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>Revenue − expenses</div>
                        </div>
                        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 24px", borderTop: "4px solid #F59E0B" }}>
                          <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>One-Time Expenses</div>
                          <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'DM Serif Display',serif", color: "#F59E0B" }}>${oneTimeTotal.toLocaleString()}</div>
                          <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>{expenses.filter(e=>e.frequency==="one-time").length} entries</div>
                        </div>
                      </div>

                      {/* Category breakdown bar */}
                      {byCategory.length > 0 && (
                        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "18px 24px", marginBottom: 20 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 14 }}>Monthly Expense Breakdown by Category</div>
                          {byCategory.map(({cat, monthly}) => (
                            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                              <div style={{ width: 180, fontSize: 12, fontWeight: 600, color: "#374151" }}>{cat}</div>
                              <div style={{ flex: 1, height: 16, background: "#F3F4F6", borderRadius: 4, overflow: "hidden" }}>
                                <div style={{ width: `${monthlyTotal>0?(monthly/monthlyTotal)*100:0}%`, height: "100%", background: EXPENSE_CATEGORY_COLORS[cat]?.color||"#6B7280", borderRadius: 4, minWidth: monthly>0?4:0 }} />
                              </div>
                              <div style={{ width: 110, textAlign: "right", fontSize: 13, fontWeight: 700, color: "#111827" }}>${monthly.toLocaleString()}/mo</div>
                              <Badge label={`${monthlyTotal>0?Math.round((monthly/monthlyTotal)*100):0}%`} bg={EXPENSE_CATEGORY_COLORS[cat]?.bg||"#F3F4F6"} color={EXPENSE_CATEGORY_COLORS[cat]?.color||"#374151"} />
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}

                {/* NOI by property */}
                <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "18px 24px", marginBottom: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 14 }}>NOI by Property (Revenue − Monthly Expenses)</div>
                  {properties.length === 0
                    ? <div style={{ fontSize: 13, color: "#9CA3AF" }}>No properties yet.</div>
                    : [...properties].sort((a,b)=>b.monthlyRent-a.monthlyRent).map(p => {
                        const propExp = monthlyExpensesForProp(p.id);
                        const noi = p.monthlyRent - propExp;
                        const maxRev = Math.max(...properties.map(x=>x.monthlyRent), 1);
                        return (
                          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                            <div style={{ width: 180, minWidth: 180 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                              <div style={{ fontSize: 10, color: "#9CA3AF" }}>{p.entity||p.type}</div>
                            </div>
                            <div style={{ flex: 1, position: "relative", height: 20 }}>
                              <div style={{ height: "100%", background: "#F3F4F6", borderRadius: 4, overflow: "hidden" }}>
                                <div style={{ width: `${(p.monthlyRent/maxRev)*100}%`, height: "100%", background: TYPE_COLORS[p.type]+"BB", borderRadius: 4 }} />
                              </div>
                              {propExp > 0 && <div style={{ position: "absolute", top: 0, left: 0, width: `${(propExp/maxRev)*100}%`, height: "100%", background: "rgba(239,68,68,0.25)", borderRadius: 4, borderRight: "2px solid #EF4444" }} />}
                            </div>
                            <div style={{ width: 140, textAlign: "right" }}>
                              <div style={{ fontSize: 12, color: "#6B7280" }}>Rev: ${p.monthlyRent.toLocaleString()}</div>
                              <div style={{ fontSize: 12, color: "#EF4444" }}>Exp: ${propExp.toLocaleString()}</div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: noi>=0?"#10B981":"#EF4444" }}>NOI: ${noi.toLocaleString()}</div>
                            </div>
                          </div>
                        );
                      })
                  }
                </div>

                {/* Expenses table */}
                <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                        {["Property","Category","Description","Amount","Frequency","Date","Notes",""].map(h=>(
                          <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.length === 0
                        ? <tr><td colSpan={8} style={{ padding: 32, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>No expenses yet. Click + Add Expense to get started.</td></tr>
                        : [...expenses].sort((a,b)=>a.propertyId-b.propertyId).map(e => {
                            const prop = properties.find(p=>p.id===e.propertyId);
                            const cs = EXPENSE_CATEGORY_COLORS[e.category]||{bg:"#F3F4F6",color:"#374151"};
                            return (
                              <tr key={e.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                                <td style={{ padding: "12px 14px", fontWeight: 600, color: "#111827", fontSize: 13 }}>{prop?.name||"—"}</td>
                                <td style={{ padding: "12px 14px" }}><Badge label={e.category} bg={cs.bg} color={cs.color} /></td>
                                <td style={{ padding: "12px 14px", fontSize: 13, color: "#374151" }}>{e.description||"—"}</td>
                                <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "#EF4444" }}>${(parseFloat(e.amount)||0).toLocaleString()}</td>
                                <td style={{ padding: "12px 14px" }}>
                                  <Badge label={e.frequency==="monthly"?"Monthly":"One-Time"} bg={e.frequency==="monthly"?"#DBEAFE":"#FEF3C7"} color={e.frequency==="monthly"?"#1E40AF":"#92400E"} />
                                </td>
                                <td style={{ padding: "12px 14px", fontSize: 12, color: "#6B7280" }}>{e.date||"—"}</td>
                                <td style={{ padding: "12px 14px", fontSize: 12, color: "#6B7280", maxWidth: 140 }}>
                                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.notes||"—"}</div>
                                </td>
                                <td style={{ padding: "12px 14px" }}>
                                  <div style={{ display: "flex", gap: 6 }}>
                                    <button onClick={()=>{ setEditExpense({...e, amount: String(e.amount), propertyId: String(e.propertyId)}); setShowEditExpense(true); }}
                                      style={{ fontSize: 12, color: "#4F46E5", background: "#EEF2FF", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>✏️ Edit</button>
                                    <button onClick={()=>{ if(window.confirm("Delete this expense?")) deleteExpense(e.id); }}
                                      style={{ fontSize: 12, color: "#EF4444", background: "#FEF2F2", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>🗑</button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "finances" && (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                  {[["overview","Overview"],["loans","Loans"],["revenue","Revenue"]].map(([v,l])=>(
                    <button key={v} className={`sub-btn${fView===v?" on":""}`} onClick={()=>setFView(v)}>{l}</button>
                  ))}
                </div>

                {fView === "overview" && (
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
                      <MetricCard label="Portfolio Value" value={totalAssetValue>0?`$${Math.round(totalAssetValue).toLocaleString()}`:"—"} sub="Total asset value" accent="#7C3AED" />
                      <MetricCard label="Monthly Revenue" value={`$${Math.round(totalRevenue).toLocaleString()}`} sub="Gross rent all properties" accent="#10B981" />
                      <MetricCard label="Monthly Expenses" value={`$${Math.round(totalMonthlyExpenses).toLocaleString()}`} sub="Recurring operating costs" accent="#EF4444" />
                      <MetricCard label="Monthly NOI" value={`$${Math.round(totalNOI).toLocaleString()}`} sub="Revenue minus expenses" accent="#4F46E5" />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
                      <MetricCard label="Annual NOI" value={`$${Math.round(totalNOI*12).toLocaleString()}`} sub="Run rate" accent="#3B82F6" />
                      <MetricCard label="Total Debt Outstanding" value={`$${Math.round(totalDebt).toLocaleString()}`} sub="All loans" accent="#F59E0B" />
                      <MetricCard label="Monthly Debt Service" value={`$${Math.round(totalDebtService).toLocaleString()}`} sub={`${loans.length} loans`} accent="#6B7280" />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      {["in-estate","out-of-estate"].map(estate=>{
                        const eProps = properties.filter(p=>p.estate===estate);
                        const eRev = eProps.reduce((s,p)=>s+(parseFloat(p.monthlyRent)||0),0);
                        const eExp = eProps.reduce((s,p)=>s+monthlyExpensesForProp(p.id),0);
                        const eNOI = eRev - eExp;
                        const eDebt = loans.filter(l=>eProps.find(p=>p.id===l.propertyId)).reduce((s,l)=>s+(parseFloat(l.balance)||0),0);
                        const eValue = eProps.reduce((s,p)=>s+(parseFloat(p.assetValue)||0),0);
                        return (
                          <div key={estate} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 22 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                              <Badge label={ESTATE_STYLES[estate].label} bg={ESTATE_STYLES[estate].bg} color={ESTATE_STYLES[estate].color} />
                              <span style={{ fontSize: 13, color: "#6B7280" }}>{eProps.length} properties</span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10 }}>
                              {[["Asset Value",eValue>0?`$${Math.round(eValue).toLocaleString()}`:"—"],["Monthly Revenue",`$${Math.round(eRev).toLocaleString()}`],["Monthly NOI",`$${Math.round(eNOI).toLocaleString()}`],["Debt Outstanding",`$${Math.round(eDebt).toLocaleString()}`],["Avg Occupancy",`${eProps.length?Math.round(eProps.reduce((s,p)=>s+(parseFloat(p.occupancy)||0),0)/eProps.length):0}%`]].map(([l,v])=>(
                                <div key={l}>
                                  <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>{l}</div>
                                  <div style={{ fontSize: 16, fontWeight: 700, color: l==="Asset Value"?"#7C3AED":l==="Monthly NOI"?"#4F46E5":"#111827", fontFamily: "'DM Serif Display', serif" }}>{v}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {fView === "loans" && (
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
                      <MetricCard label="Total Loans" value={loans.length} sub="Across portfolio" accent="#4F46E5" />
                      <MetricCard label="Total Balance" value={`$${Math.round(totalDebt).toLocaleString()}`} sub="Outstanding principal" accent="#EF4444" />
                      <MetricCard label="Monthly Service" value={`$${Math.round(totalDebtService).toLocaleString()}`} sub="Combined payments" accent="#F59E0B" />
                      <MetricCard label="Watch / Default" value={loans.filter(l=>l.status!=="current").length} sub="Needs attention" accent="#EF4444" />
                    </div>
                    <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                            {["Property / Entity","Lender","Type","Balance / Original","Paid Down","Rate","Monthly Pmt","Maturity","Status"].map(h=>(
                              <th key={h} style={{ padding: "12px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {loans.map(l=>{
                            const prop = properties.find(p=>p.id===l.propertyId);
                            const paidDown = Math.round(((l.originalAmount-l.balance)/l.originalAmount)*100);
                            const daysLeft = Math.ceil((new Date(l.maturityDate)-new Date())/86400000);
                            return (
                              <tr key={l.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                                <td style={{ padding: "13px 12px" }}>
                                  <div style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{prop?.name||"—"}</div>
                                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>{prop?.entity||""}</div>
                                </td>
                                <td style={{ padding: "13px 12px", fontSize: 12, color: "#374151" }}>{l.lender}</td>
                                <td style={{ padding: "13px 12px" }}><Badge label={l.type} bg={l.type==="Fixed"?"#DBEAFE":l.type==="Variable"?"#FEF3C7":"#FEE2E2"} color={l.type==="Fixed"?"#1E40AF":l.type==="Variable"?"#92400E":"#991B1B"} /></td>
                                <td style={{ padding: "13px 12px", minWidth: 150 }}>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>${Math.round(l.balance).toLocaleString()}</div>
                                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>of ${Math.round(l.originalAmount).toLocaleString()}</div>
                                  <LoanBar balance={l.balance} original={l.originalAmount} />
                                </td>
                                <td style={{ padding: "13px 12px", fontSize: 13, color: "#10B981", fontWeight: 600 }}>{paidDown}%</td>
                                <td style={{ padding: "13px 12px", fontSize: 13, fontWeight: 600, color: "#374151" }}>{l.interestRate}%</td>
                                <td style={{ padding: "13px 12px", fontSize: 13, fontWeight: 700, color: "#111827" }}>{l.monthlyPayment>0?`$${l.monthlyPayment.toLocaleString()}`:"—"}</td>
                                <td style={{ padding: "13px 12px", fontSize: 12, color: daysLeft<365?"#EF4444":"#6B7280", fontWeight: daysLeft<365?600:400 }}>
                                  <div>{l.maturityDate}</div>
                                  <div>{daysLeft>0?`${(daysLeft/365).toFixed(1)}y`:"Matured"}</div>
                                </td>
                                <td style={{ padding: "13px 12px" }}><Badge label={l.status} bg={LOAN_STATUS_STYLES[l.status]?.bg||"#F3F4F6"} color={LOAN_STATUS_STYLES[l.status]?.color||"#374151"} /></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {fView === "revenue" && (
                  <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 18 }}>NOI by Property (Revenue − Operating Expenses)</h3>
                    {[...properties].sort((a,b)=>b.monthlyRent-a.monthlyRent).map(p=>{
                      const propExp = monthlyExpensesForProp(p.id);
                      const noi = p.monthlyRent - propExp;
                      const maxRev = Math.max(...properties.map(x=>x.monthlyRent),1);
                      return (
                        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                          <div style={{ width: 190, minWidth: 190 }}>
                            <div style={{ fontSize: 12, color: "#374151", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                            <div style={{ fontSize: 10, color: "#9CA3AF" }}>{p.entity}</div>
                          </div>
                          <div style={{ flex: 1, position: "relative" }}>
                            <div style={{ height: 20, background: "#F3F4F6", borderRadius: 4, overflow: "hidden" }}>
                              <div style={{ width: `${(p.monthlyRent/maxRev)*100}%`, height: "100%", background: TYPE_COLORS[p.type]+"BB", borderRadius: 4, minWidth: p.monthlyRent>0?4:0 }} />
                            </div>
                            {propExp>0&&<div style={{ position:"absolute",top:0,left:0,width:`${(propExp/maxRev)*100}%`,height:"100%",background:"rgba(239,68,68,0.3)",borderRadius:4,borderRight:"2px solid #EF4444" }} />}
                          </div>
                          <div style={{ width: 150, textAlign: "right" }}>
                            <div style={{ fontSize: 12, color: "#6B7280" }}>Rev: {p.monthlyRent>0?`$${p.monthlyRent.toLocaleString()}`:"Vacant"}</div>
                            <div style={{ fontSize: 12, color: "#EF4444" }}>Exp: ${propExp.toLocaleString()}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: noi>=0?"#10B981":"#EF4444" }}>NOI: ${noi.toLocaleString()}</div>
                          </div>
                          <div style={{ width: 90 }}><Badge label={ESTATE_STYLES[p.estate]?.label} bg={ESTATE_STYLES[p.estate]?.bg} color={ESTATE_STYLES[p.estate]?.color} /></div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* MAP */}
            {tab === "taxes" && (
              <div>
                {/* Summary cards */}
                {(() => {
                  const currentYear = new Date().getFullYear().toString();
                  const thisYearTaxes = taxes.filter(t => t.taxYear === currentYear);
                  const totalDue = thisYearTaxes.reduce((s, t) => s + t.annualAmount, 0);
                  const totalPaid = thisYearTaxes.reduce((s, t) => s + t.amountPaid, 0);
                  const totalBalance = totalDue - totalPaid;
                  const overdue = taxes.filter(t => t.status === "overdue").length;
                  return (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
                      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 24px", borderTop: "4px solid #4F46E5" }}>
                        <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>{currentYear} Total Due</div>
                        <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'DM Serif Display',serif", color: "#111827" }}>${totalDue.toLocaleString()}</div>
                      </div>
                      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 24px", borderTop: "4px solid #10B981" }}>
                        <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>{currentYear} Paid</div>
                        <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'DM Serif Display',serif", color: "#10B981" }}>${totalPaid.toLocaleString()}</div>
                      </div>
                      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 24px", borderTop: "4px solid #F59E0B" }}>
                        <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>{currentYear} Balance</div>
                        <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'DM Serif Display',serif", color: totalBalance > 0 ? "#F59E0B" : "#10B981" }}>${totalBalance.toLocaleString()}</div>
                      </div>
                      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 24px", borderTop: "4px solid #EF4444" }}>
                        <div style={{ fontSize: 12, color: "#6B7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>Overdue</div>
                        <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'DM Serif Display',serif", color: overdue > 0 ? "#EF4444" : "#111827" }}>{overdue}</div>
                      </div>
                    </div>
                  );
                })()}

                {/* Tax records table */}
                <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                        {["Property","Tax Year","Annual Amount","Amount Paid","Balance","Due Date","Date Paid","Status","Notes",""].map(h => (
                          <th key={h} style={{ padding: "12px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {taxes.length === 0 ? (
                        <tr><td colSpan={10} style={{ padding: 32, textAlign: "center", color: "#9CA3AF", fontSize: 14 }}>No tax records yet. Click + Add Tax Record to get started.</td></tr>
                      ) : [...taxes].sort((a, b) => b.taxYear - a.taxYear || a.propertyId - b.propertyId).map(tx => {
                        const prop = properties.find(p => p.id === tx.propertyId);
                        const balance = tx.annualAmount - tx.amountPaid;
                        const TAX_STATUS = {
                          paid: { bg: "#D1FAE5", color: "#065F46", label: "Paid" },
                          partial: { bg: "#FEF3C7", color: "#92400E", label: "Partial" },
                          due: { bg: "#DBEAFE", color: "#1E40AF", label: "Due" },
                          overdue: { bg: "#FEE2E2", color: "#991B1B", label: "Overdue" },
                        };
                        const s = TAX_STATUS[tx.status] || TAX_STATUS.due;
                        return (
                          <tr key={tx.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                            <td style={{ padding: "13px 14px", fontWeight: 600, color: "#111827", fontSize: 13 }}>{prop?.name || "—"}</td>
                            <td style={{ padding: "13px 14px", fontSize: 13, color: "#374151", fontWeight: 600 }}>{tx.taxYear}</td>
                            <td style={{ padding: "13px 14px", fontSize: 13, fontWeight: 700, color: "#111827" }}>${tx.annualAmount.toLocaleString()}</td>
                            <td style={{ padding: "13px 14px", fontSize: 13, color: "#10B981", fontWeight: 600 }}>${tx.amountPaid.toLocaleString()}</td>
                            <td style={{ padding: "13px 14px", fontSize: 13, fontWeight: 700, color: balance > 0 ? "#F59E0B" : "#10B981" }}>${balance.toLocaleString()}</td>
                            <td style={{ padding: "13px 14px", fontSize: 12, color: "#6B7280" }}>{tx.dueDate || "—"}</td>
                            <td style={{ padding: "13px 14px", fontSize: 12, color: "#6B7280" }}>{tx.datePaid || "—"}</td>
                            <td style={{ padding: "13px 14px" }}><Badge label={s.label} bg={s.bg} color={s.color} /></td>
                            <td style={{ padding: "13px 14px", fontSize: 12, color: "#6B7280", maxWidth: 160 }}>
                              <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tx.notes || "—"}</div>
                            </td>
                            <td style={{ padding: "13px 14px" }}>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={() => { setEditTax({...tx, annualAmount: String(tx.annualAmount), amountPaid: String(tx.amountPaid), propertyId: String(tx.propertyId) }); setShowEditTax(true); }}
                                  style={{ fontSize: 12, color: "#4F46E5", background: "#EEF2FF", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
                                  ✏️ Edit
                                </button>
                                <button onClick={() => { if (window.confirm("Delete this tax record?")) deleteTax(tx.id); }}
                                  style={{ fontSize: 12, color: "#EF4444", background: "#FEF2F2", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
                                  🗑
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {tab === "map" && (
              <MapView properties={properties} loans={loans} onSelect={setSel} TYPE_COLORS={TYPE_COLORS} ESTATE_STYLES={ESTATE_STYLES} STATUS_STYLES={STATUS_STYLES} />
            )}
          </div>
        </div>
      </div>

      {/* PROPERTY DETAIL MODAL */}
      {sel && (
        <Modal title={editMode ? `Edit — ${sel.name}` : sel.name} onClose={()=>{setSel(null);setEditMode(false);setEditP(null);}}>
          {!editMode ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                {[
                  ["Type", <Badge label={sel.type} bg={TYPE_COLORS[sel.type]+"20"} color={TYPE_COLORS[sel.type]} />],
                  ["Status", <Badge label={STATUS_STYLES[sel.status].label} bg={STATUS_STYLES[sel.status].bg} color={STATUS_STYLES[sel.status].color} />],
                  ["Estate", <Badge label={ESTATE_STYLES[sel.estate]?.label} bg={ESTATE_STYLES[sel.estate]?.bg} color={ESTATE_STYLES[sel.estate]?.color} />],
                  ["Owning Entity", sel.entity||"—"],
                  ["Size", `${sel.sqft.toLocaleString()} sqft`],
                  ["Floors", sel.floors],
                  ["Occupancy", `${sel.occupancy}%`],
                  ["Monthly Rent", sel.monthlyRent>0?`$${sel.monthlyRent.toLocaleString()}`:"Vacant"],
                  ["Monthly Expenses", `$${monthlyExpensesForProp(sel.id).toLocaleString()}`],
                  ["Monthly NOI", `$${(sel.monthlyRent - monthlyExpensesForProp(sel.id)).toLocaleString()}`],
                  ["Lease Escalation", sel.leaseEscalationPct>0?`${sel.leaseEscalationPct}% on ${sel.leaseEscalationDate||"TBD"}`:"—"],
                  ...(sel.leaseEscalationPct>0&&sel.monthlyRent>0?[["Escalated Rent", `$${Math.round(sel.monthlyRent*(1+sel.leaseEscalationPct/100)).toLocaleString()}/mo`]]:[] ),
                ].map(([label,val])=>(
                  <div key={label} style={{ background: "#F9FAFB", borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{val}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>📍 {sel.address}</div>

              {(() => {
                const loan = loans.find(l=>l.propertyId===sel.id);
                return loan ? (
                  <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#92400E", textTransform: "uppercase", letterSpacing: "0.04em" }}>Loan — {loan.lender}</div>
                      <button onClick={()=>{ setEditL({...loan, originalAmount: String(loan.originalAmount), balance: String(loan.balance), interestRate: String(loan.interestRate), monthlyPayment: String(loan.monthlyPayment) }); setShowEditLoan(true); }}
                        style={{ fontSize: 12, color: "#92400E", background: "#FEF3C7", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
                        ✏️ Edit Loan
                      </button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, fontSize: 13 }}>
                      {[["Balance",`$${Math.round(loan.balance).toLocaleString()}`],["Original",`$${Math.round(loan.originalAmount).toLocaleString()}`],["Rate",`${loan.interestRate}% ${loan.type}`],["Monthly Pmt",`$${loan.monthlyPayment.toLocaleString()}`],["Maturity",loan.maturityDate],["Status",<Badge label={loan.status} bg={LOAN_STATUS_STYLES[loan.status]?.bg} color={LOAN_STATUS_STYLES[loan.status]?.color} />]].map(([l,v])=>(
                        <div key={l}><div style={{ fontSize: 10, color: "#9CA3AF", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.04em" }}>{l}</div><div style={{ fontWeight: 700 }}>{v}</div></div>
                      ))}
                    </div>
                  </div>
                ) : <div style={{ background: "#F9FAFB", borderRadius: 8, padding: "10px 14px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "#9CA3AF" }}>No loan on record.</span>
                    <button onClick={()=>{ setNewL(l=>({...l, propertyId: String(sel.id)})); setShowAddLoan(true); }}
                      style={{ fontSize: 12, color: "#4F46E5", background: "#EEF2FF", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>
                      + Add Loan
                    </button>
                  </div>;
              })()}

              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 10 }}>Tenants</h4>
                {tenants.filter(t=>t.propertyId===sel.id).length===0
                  ? <div style={{ fontSize: 13, color: "#9CA3AF" }}>No tenants on record.</div>
                  : tenants.filter(t=>t.propertyId===sel.id).map(t=>(
                    <div key={t.id} style={{ background: "#F9FAFB", borderRadius: 8, padding: "10px 14px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{t.name} · {t.unit}</div>
                        <div style={{ color: "#6B7280", fontSize: 12, marginTop: 2 }}>{t.leaseStart} → {t.leaseEnd} · ${t.monthlyRent.toLocaleString()}/mo</div>
                      </div>
                      <button onClick={()=>{if(window.confirm(`Remove "${t.name}"?`)) deleteTenant(t.id);}}
                        style={{ fontSize: 12, color: "#EF4444", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Remove</button>
                    </div>
                  ))}
              </div>

              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 10 }}>Maintenance</h4>
                {maintenance.filter(m=>m.propertyId===sel.id).length===0
                  ? <div style={{ fontSize: 13, color: "#9CA3AF" }}>No maintenance requests.</div>
                  : maintenance.filter(m=>m.propertyId===sel.id).map(m=>(
                    <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F3F4F6" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{m.title}</div>
                        <div style={{ fontSize: 11, color: "#9CA3AF" }}>${m.cost.toLocaleString()} · {m.assignee}</div>
                      </div>
                      <Badge label={m.status} bg={MAINT_STATUS_STYLES[m.status].bg} color={MAINT_STATUS_STYLES[m.status].color} />
                    </div>
                  ))}
              </div>

              <PropertyFiles
                files={propertyFiles[sel.id] || []}
                setFiles={updater => setPropertyFiles(prev => {
                  const cur = prev[sel.id] || [];
                  const next = typeof updater === "function" ? updater(cur) : updater;
                  return { ...prev, [sel.id]: next };
                })}
              />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, paddingTop: 20, borderTop: "1px solid #F3F4F6" }}>
                <button onClick={()=>{ setEditP({...sel, floors: String(sel.floors), sqft: String(sel.sqft), monthlyRent: String(sel.monthlyRent), assetValue: String(sel.assetValue||""), occupancy: String(sel.occupancy) }); setEditMode(true); }}
                  style={{ padding: "11px", background: "#EEF2FF", border: "1.5px solid #C7D2FE", color: "#4F46E5", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  ✏️ Edit Property
                </button>
                <button onClick={()=>{if(window.confirm(`Permanently remove "${sel.name}"?`)){deleteProperty(sel.id);setSel(null);}}}
                  style={{ padding: "11px", background: "#FEF2F2", border: "1.5px solid #FECACA", color: "#DC2626", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  🗑 Remove Property
                </button>
              </div>
            </>
          ) : (
            <>
              <Field label="Property Name" value={editP.name} onChange={v=>setEditP(p=>({...p,name:v}))} />
              <Field label="Address" value={editP.address} onChange={v=>setEditP(p=>({...p,address:v}))} />
              <Field label="Owning Entity" value={editP.entity} onChange={v=>setEditP(p=>({...p,entity:v}))} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Type" value={editP.type} onChange={v=>setEditP(p=>({...p,type:v}))} options={["Office","Retail","Industrial","Medical"]} />
                <Field label="Status" value={editP.status} onChange={v=>setEditP(p=>({...p,status:v}))} options={["active","partial","vacant"]} />
                <Field label="Estate" value={editP.estate} onChange={v=>setEditP(p=>({...p,estate:v}))} options={[{v:"in-estate",l:"In Estate"},{v:"out-of-estate",l:"Out of Estate"}]} />
                <Field label="Occupancy (%)" value={editP.occupancy} onChange={v=>setEditP(p=>({...p,occupancy:v}))} type="number" />
                <Field label="Monthly Rent ($)" value={editP.monthlyRent} onChange={v=>setEditP(p=>({...p,monthlyRent:v}))} type="number" />
                <Field label="Asset Value ($)" value={editP.assetValue} onChange={v=>setEditP(p=>({...p,assetValue:v}))} type="number" />
                <Field label="Floors" value={editP.floors} onChange={v=>setEditP(p=>({...p,floors:v}))} type="number" />
                <Field label="Sq Ft" value={editP.sqft} onChange={v=>setEditP(p=>({...p,sqft:v}))} type="number" />
                <Field label="Lease Escalation %" value={editP.leaseEscalationPct||""} onChange={v=>setEditP(p=>({...p,leaseEscalationPct:v}))} type="number" />
                <Field label="Next Escalation Date" value={editP.leaseEscalationDate||""} onChange={v=>setEditP(p=>({...p,leaseEscalationDate:v}))} type="date" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
                <button onClick={()=>{setEditMode(false);setEditP(null);}}
                  style={{ padding: "11px", background: "#F9FAFB", border: "1.5px solid #E5E7EB", color: "#374151", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  Cancel
                </button>
                <button onClick={async ()=>{
                  const updated = {...editP, floors: +editP.floors, sqft: +editP.sqft, monthlyRent: +editP.monthlyRent, assetValue: +editP.assetValue, occupancy: +editP.occupancy, leaseEscalationPct: +editP.leaseEscalationPct||0, leaseEscalationDate: editP.leaseEscalationDate||""};
                  await updateProperty(updated);
                  setSel(updated);
                  setEditMode(false);
                  setEditP(null);
                }}
                  style={{ padding: "11px", background: "#4F46E5", border: "none", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  Save Changes
                </button>
              </div>
            </>
          )}
        </Modal>
      )}

      {/* ADD PROPERTY */}
      {showAddProp && (
        <Modal title="Add New Property" onClose={()=>setShowAddProp(false)}>
          <Field label="Property Name" value={newP.name} onChange={v=>setNewP(p=>({...p,name:v}))} />
          <Field label="Address" value={newP.address} onChange={v=>setNewP(p=>({...p,address:v}))} />
          <Field label="Owning Entity" value={newP.entity} onChange={v=>setNewP(p=>({...p,entity:v}))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Type" value={newP.type} onChange={v=>setNewP(p=>({...p,type:v}))} options={["Office","Retail","Industrial","Medical"]} />
            <Field label="Status" value={newP.status} onChange={v=>setNewP(p=>({...p,status:v}))} options={["active","partial","vacant"]} />
            <Field label="Estate" value={newP.estate} onChange={v=>setNewP(p=>({...p,estate:v}))} options={[{v:"in-estate",l:"In Estate"},{v:"out-of-estate",l:"Out of Estate"}]} />
            <Field label="Monthly Rent ($)" value={newP.monthlyRent} onChange={v=>setNewP(p=>({...p,monthlyRent:v}))} type="number" />
            <Field label="Asset Value ($)" value={newP.assetValue} onChange={v=>setNewP(p=>({...p,assetValue:v}))} type="number" />
            <Field label="Floors" value={newP.floors} onChange={v=>setNewP(p=>({...p,floors:v}))} type="number" />
            <Field label="Sq Ft" value={newP.sqft} onChange={v=>setNewP(p=>({...p,sqft:v}))} type="number" />
            <Field label="Lease Escalation %" value={newP.leaseEscalationPct} onChange={v=>setNewP(p=>({...p,leaseEscalationPct:v}))} type="number" />
            <Field label="Next Escalation Date" value={newP.leaseEscalationDate} onChange={v=>setNewP(p=>({...p,leaseEscalationDate:v}))} type="date" />
          </div>
          <button onClick={()=>{if(!newP.name||!newP.address)return; addProperty(newP); setShowAddProp(false); setNewP({name:"",address:"",type:"Office",floors:"",sqft:"",monthlyRent:"",assetValue:"",status:"active",estate:"in-estate",entity:"",leaseEscalationPct:"",leaseEscalationDate:""}); }}
            style={{ width:"100%",padding:"12px",background:"#4F46E5",color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",marginTop:4 }}>
            Add Property
          </button>
        </Modal>
      )}

      {/* ADD TENANT */}
      {showAddTenant && (
        <Modal title="Add Tenant" onClose={()=>setShowAddTenant(false)}>
          <Field label="Property" value={newT.propertyId} onChange={v=>setNewT(t=>({...t,propertyId:v}))} options={propOpts} />
          <Field label="Tenant / Company Name" value={newT.name} onChange={v=>setNewT(t=>({...t,name:v}))} />
          <Field label="Unit / Floor" value={newT.unit} onChange={v=>setNewT(t=>({...t,unit:v}))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Lease Start" value={newT.leaseStart} onChange={v=>setNewT(t=>({...t,leaseStart:v}))} type="date" />
            <Field label="Lease End" value={newT.leaseEnd} onChange={v=>setNewT(t=>({...t,leaseEnd:v}))} type="date" />
          </div>
          <Field label="Monthly Rent ($)" value={newT.monthlyRent} onChange={v=>setNewT(t=>({...t,monthlyRent:v}))} type="number" />
          <Field label="Contact Email" value={newT.contact} onChange={v=>setNewT(t=>({...t,contact:v}))} type="email" />
          <button onClick={()=>{if(!newT.name)return; addTenant(newT); setShowAddTenant(false); setNewT({propertyId:"",name:"",unit:"",leaseStart:"",leaseEnd:"",monthlyRent:"",contact:""}); }}
            style={{ width:"100%",padding:"12px",background:"#4F46E5",color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>
            Add Tenant
          </button>
        </Modal>
      )}

      {/* ADD MAINTENANCE */}
      {showAddMaint && (
        <Modal title="Log Maintenance Request" onClose={()=>setShowAddMaint(false)}>
          <Field label="Property" value={newM.propertyId} onChange={v=>setNewM(m=>({...m,propertyId:v}))} options={propOpts} />
          <Field label="Request Title" value={newM.title} onChange={v=>setNewM(m=>({...m,title:v}))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Priority" value={newM.priority} onChange={v=>setNewM(m=>({...m,priority:v}))} options={["low","medium","high"]} />
            <Field label="Date" value={newM.date} onChange={v=>setNewM(m=>({...m,date:v}))} type="date" />
          </div>
          <Field label="Assignee / Contractor" value={newM.assignee} onChange={v=>setNewM(m=>({...m,assignee:v}))} />
          <Field label="Estimated Cost ($)" value={newM.cost} onChange={v=>setNewM(m=>({...m,cost:v}))} type="number" />
          <button onClick={()=>{if(!newM.title)return; addMaintenance(newM); setShowAddMaint(false); setNewM({propertyId:"",title:"",priority:"medium",assignee:"",cost:"",date:""}); }}
            style={{ width:"100%",padding:"12px",background:"#4F46E5",color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>
            Log Request
          </button>
        </Modal>
      )}

      {/* ADD LOAN */}
      {showAddLoan && (
        <Modal title="Add Loan" onClose={()=>setShowAddLoan(false)}>
          <LoanForm
            loan={newL}
            setLoan={setNewL}
            propOpts={propOpts}
            showPropertyField={true}
            onSave={()=>{
              if(!newL.lender||!newL.propertyId) return;
              addLoan(newL);
              setShowAddLoan(false);
              setNewL({propertyId:"",lender:"",originalAmount:"",balance:"",interestRate:"",monthlyPayment:"",startDate:"",maturityDate:"",type:"Fixed",status:"current"});
            }}
            saveLabel="Add Loan"
          />
        </Modal>
      )}

      {/* EDIT LOAN */}
      {showEditLoan && editL && (
        <Modal title="Edit Loan" onClose={()=>{setShowEditLoan(false);setEditL(null);}}>
          <LoanForm
            loan={editL}
            setLoan={setEditL}
            showPropertyField={false}
            onSave={async ()=>{
              if(!editL.lender) return;
              await updateLoan(editL);
              setShowEditLoan(false);
              setEditL(null);
            }}
            saveLabel="Save Loan Changes"
          />
        </Modal>
      )}
      {/* EDIT MAINTENANCE */}
      {showEditMaint && editMaint && (
        <Modal title="Edit Maintenance Request" onClose={()=>{setShowEditMaint(false);setEditMaint(null);}}>
          <Field label="Property" value={editMaint.propertyId} onChange={v=>setEditMaint(m=>({...m,propertyId:v}))} options={propOpts} />
          <Field label="Request Title" value={editMaint.title} onChange={v=>setEditMaint(m=>({...m,title:v}))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Priority" value={editMaint.priority} onChange={v=>setEditMaint(m=>({...m,priority:v}))} options={["low","medium","high"]} />
            <Field label="Status" value={editMaint.status} onChange={v=>setEditMaint(m=>({...m,status:v}))} options={["open","in-progress","scheduled","completed"]} />
            <Field label="Date" value={editMaint.date||""} onChange={v=>setEditMaint(m=>({...m,date:v}))} type="date" />
            <Field label="Est. Cost ($)" value={editMaint.cost} onChange={v=>setEditMaint(m=>({...m,cost:v}))} type="number" />
          </div>
          <Field label="Assignee / Contractor" value={editMaint.assignee} onChange={v=>setEditMaint(m=>({...m,assignee:v}))} />
          <button onClick={async ()=>{
            if(!editMaint.title) return;
            await updateMaintenance({...editMaint, propertyId: +editMaint.propertyId});
            setShowEditMaint(false);
            setEditMaint(null);
          }} style={{ width:"100%",padding:"12px",background:"#4F46E5",color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>
            Save Changes
          </button>
        </Modal>
      )}

      {/* ADD TAX */}
      {showAddTax && (
        <Modal title="Add Tax Record" onClose={()=>setShowAddTax(false)}>
          <Field label="Property" value={newTax.propertyId} onChange={v=>setNewTax(t=>({...t,propertyId:v}))} options={propOpts} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Tax Year" value={newTax.taxYear} onChange={v=>setNewTax(t=>({...t,taxYear:v}))} type="number" />
            <Field label="Status" value={newTax.status} onChange={v=>setNewTax(t=>({...t,status:v}))} options={["due","partial","paid","overdue"]} />
            <Field label="Annual Amount ($)" value={newTax.annualAmount} onChange={v=>setNewTax(t=>({...t,annualAmount:v}))} type="number" />
            <Field label="Amount Paid ($)" value={newTax.amountPaid} onChange={v=>setNewTax(t=>({...t,amountPaid:v}))} type="number" />
            <Field label="Due Date" value={newTax.dueDate} onChange={v=>setNewTax(t=>({...t,dueDate:v}))} type="date" />
            <Field label="Date Paid" value={newTax.datePaid} onChange={v=>setNewTax(t=>({...t,datePaid:v}))} type="date" />
          </div>
          <Field label="Notes" value={newTax.notes} onChange={v=>setNewTax(t=>({...t,notes:v}))} />
          {newTax.annualAmount && newTax.amountPaid !== "" && (
            <div style={{ background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#4338CA", fontWeight: 600 }}>
              Balance remaining: ${(+newTax.annualAmount - +newTax.amountPaid).toLocaleString()}
            </div>
          )}
          <button onClick={async ()=>{
            if(!newTax.propertyId || !newTax.taxYear) return;
            await addTax(newTax);
            setShowAddTax(false);
            setNewTax({ propertyId:"", taxYear: new Date().getFullYear().toString(), annualAmount:"", amountPaid:"", dueDate:"", datePaid:"", status:"due", notes:"" });
          }} style={{ width:"100%",padding:"12px",background:"#4F46E5",color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>
            Add Tax Record
          </button>
        </Modal>
      )}

      {/* EDIT TAX */}
      {showEditTax && editTax && (
        <Modal title="Edit Tax Record" onClose={()=>{setShowEditTax(false);setEditTax(null);}}>
          <Field label="Property" value={editTax.propertyId} onChange={v=>setEditTax(t=>({...t,propertyId:v}))} options={propOpts} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Tax Year" value={editTax.taxYear} onChange={v=>setEditTax(t=>({...t,taxYear:v}))} type="number" />
            <Field label="Status" value={editTax.status} onChange={v=>setEditTax(t=>({...t,status:v}))} options={["due","partial","paid","overdue"]} />
            <Field label="Annual Amount ($)" value={editTax.annualAmount} onChange={v=>setEditTax(t=>({...t,annualAmount:v}))} type="number" />
            <Field label="Amount Paid ($)" value={editTax.amountPaid} onChange={v=>setEditTax(t=>({...t,amountPaid:v}))} type="number" />
            <Field label="Due Date" value={editTax.dueDate||""} onChange={v=>setEditTax(t=>({...t,dueDate:v}))} type="date" />
            <Field label="Date Paid" value={editTax.datePaid||""} onChange={v=>setEditTax(t=>({...t,datePaid:v}))} type="date" />
          </div>
          <Field label="Notes" value={editTax.notes||""} onChange={v=>setEditTax(t=>({...t,notes:v}))} />
          {editTax.annualAmount && (
            <div style={{ background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#4338CA", fontWeight: 600 }}>
              Balance remaining: ${(+editTax.annualAmount - +editTax.amountPaid).toLocaleString()}
            </div>
          )}
          <button onClick={async ()=>{
            if(!editTax.taxYear) return;
            await updateTax({...editTax, propertyId: +editTax.propertyId});
            setShowEditTax(false);
            setEditTax(null);
          }} style={{ width:"100%",padding:"12px",background:"#4F46E5",color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>
            Save Changes
          </button>
        </Modal>
      )}

      {/* ADD EXPENSE */}
      {showAddExpense && (
        <Modal title="Add Expense" onClose={()=>setShowAddExpense(false)}>
          <Field label="Property" value={newExpense.propertyId} onChange={v=>setNewExpense(e=>({...e,propertyId:v}))} options={propOpts} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Category" value={newExpense.category} onChange={v=>setNewExpense(e=>({...e,category:v}))} options={EXPENSE_CATEGORIES} />
            <Field label="Frequency" value={newExpense.frequency} onChange={v=>setNewExpense(e=>({...e,frequency:v}))} options={[{v:"monthly",l:"Monthly (Recurring)"},{v:"one-time",l:"One-Time"}]} />
            <Field label="Amount ($)" value={newExpense.amount} onChange={v=>setNewExpense(e=>({...e,amount:v}))} type="number" />
            <Field label="Date" value={newExpense.date} onChange={v=>setNewExpense(e=>({...e,date:v}))} type="date" />
          </div>
          <Field label="Description" value={newExpense.description} onChange={v=>setNewExpense(e=>({...e,description:v}))} />
          <Field label="Notes" value={newExpense.notes} onChange={v=>setNewExpense(e=>({...e,notes:v}))} />
          <button onClick={async()=>{
            if(!newExpense.propertyId||!newExpense.amount) return;
            await addExpense(newExpense);
            setShowAddExpense(false);
            setNewExpense({ propertyId:"", category:"Insurance", description:"", amount:"", frequency:"monthly", date:"", notes:"" });
          }} style={{ width:"100%",padding:"12px",background:"#4F46E5",color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>
            Add Expense
          </button>
        </Modal>
      )}

      {/* EDIT EXPENSE */}
      {showEditExpense && editExpense && (
        <Modal title="Edit Expense" onClose={()=>{setShowEditExpense(false);setEditExpense(null);}}>
          <Field label="Property" value={editExpense.propertyId} onChange={v=>setEditExpense(e=>({...e,propertyId:v}))} options={propOpts} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Category" value={editExpense.category} onChange={v=>setEditExpense(e=>({...e,category:v}))} options={EXPENSE_CATEGORIES} />
            <Field label="Frequency" value={editExpense.frequency} onChange={v=>setEditExpense(e=>({...e,frequency:v}))} options={[{v:"monthly",l:"Monthly (Recurring)"},{v:"one-time",l:"One-Time"}]} />
            <Field label="Amount ($)" value={editExpense.amount} onChange={v=>setEditExpense(e=>({...e,amount:v}))} type="number" />
            <Field label="Date" value={editExpense.date||""} onChange={v=>setEditExpense(e=>({...e,date:v}))} type="date" />
          </div>
          <Field label="Description" value={editExpense.description||""} onChange={v=>setEditExpense(e=>({...e,description:v}))} />
          <Field label="Notes" value={editExpense.notes||""} onChange={v=>setEditExpense(e=>({...e,notes:v}))} />
          <button onClick={async()=>{
            if(!editExpense.amount) return;
            await updateExpense({...editExpense, propertyId: +editExpense.propertyId});
            setShowEditExpense(false);
            setEditExpense(null);
          }} style={{ width:"100%",padding:"12px",background:"#4F46E5",color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif" }}>
            Save Changes
          </button>
        </Modal>
      )}
    </>
  );
}
