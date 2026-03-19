import { useState, useEffect } from "react";

function usePersistedState(key, fallback) {
  const [value, setValue] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(key);
        setValue(result ? JSON.parse(result.value) : fallback);
      } catch {
        setValue(fallback);
      }
      setLoaded(true);
    })();
  }, []);

  const set = async (updater) => {
    setValue(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      window.storage.set(key, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  return [value, set, loaded];
}

const initialProperties = [
  { id: 1, name: "Meridian Tower", address: "123 Financial District, New York, NY 10004", type: "Office", floors: 12, sqft: 48000, occupancy: 87, monthlyRent: 142000, status: "active", estate: "in-estate", entity: "Meridian Holdings LLC", lat: 40.7074, lng: -74.0113 },
  { id: 2, name: "Harbor Point Plaza", address: "500 Harbor Blvd, San Francisco, CA 94105", type: "Retail", floors: 3, sqft: 22000, occupancy: 100, monthlyRent: 88000, status: "active", estate: "in-estate", entity: "Harbor Realty Trust", lat: 37.7897, lng: -122.3942 },
  { id: 3, name: "Westgate Commerce Park", address: "789 Industrial Way, Chicago, IL 60607", type: "Industrial", floors: 2, sqft: 95000, occupancy: 60, monthlyRent: 210000, status: "partial", estate: "out-of-estate", entity: "Westgate Partners LP", lat: 41.8748, lng: -87.6678 },
  { id: 4, name: "Elm Street Medical Center", address: "45 Elm Street, Boston, MA 02115", type: "Medical", floors: 5, sqft: 31000, occupancy: 95, monthlyRent: 124000, status: "active", estate: "in-estate", entity: "Elm Street Properties LLC", lat: 42.3431, lng: -71.0968 },
  { id: 5, name: "Sunrise Business Hub", address: "2100 Tech Corridor, Austin, TX 78701", type: "Office", floors: 8, sqft: 39000, occupancy: 75, monthlyRent: 98000, status: "active", estate: "out-of-estate", entity: "Sunrise Capital Group", lat: 30.2672, lng: -97.7431 },
  { id: 6, name: "Lakeside Retail Center", address: "350 Lakeshore Dr, Miami, FL 33132", type: "Retail", floors: 2, sqft: 18000, occupancy: 0, monthlyRent: 0, status: "vacant", estate: "in-estate", entity: "Lakeside Ventures LLC", lat: 25.7617, lng: -80.1918 },
  { id: 7, name: "Pacific Gateway Warehouse", address: "900 Port Access Rd, Seattle, WA 98108", type: "Industrial", floors: 1, sqft: 120000, occupancy: 100, monthlyRent: 312000, status: "active", estate: "out-of-estate", entity: "Pacific Logistics REIT", lat: 47.5480, lng: -122.3200 },
  { id: 8, name: "Central Park Professional", address: "88 Park Avenue, New York, NY 10016", type: "Office", floors: 15, sqft: 57000, occupancy: 80, monthlyRent: 198000, status: "active", estate: "in-estate", entity: "Meridian Holdings LLC", lat: 40.7484, lng: -73.9967 },
  { id: 9, name: "Oakwood Strip Mall", address: "1200 Commerce Blvd, Dallas, TX 75201", type: "Retail", floors: 1, sqft: 14000, occupancy: 71, monthlyRent: 52000, status: "partial", estate: "in-estate", entity: "Oakwood Retail LLC", lat: 32.7767, lng: -96.7970 },
  { id: 10, name: "Innovation Campus A", address: "500 Innovation Way, San Jose, CA 95110", type: "Office", floors: 4, sqft: 28000, occupancy: 90, monthlyRent: 115000, status: "active", estate: "out-of-estate", entity: "Innovation RE Partners", lat: 37.3382, lng: -121.8863 },
  { id: 11, name: "Metro Distribution Hub", address: "750 Freight Ave, Denver, CO 80216", type: "Industrial", floors: 1, sqft: 88000, occupancy: 100, monthlyRent: 176000, status: "active", estate: "in-estate", entity: "Metro Industrial Trust", lat: 39.7392, lng: -104.9903 },
  { id: 12, name: "Riverside Medical Suites", address: "30 River Road, Portland, OR 97201", type: "Medical", floors: 3, sqft: 19000, occupancy: 84, monthlyRent: 76000, status: "active", estate: "in-estate", entity: "Elm Street Properties LLC", lat: 45.5051, lng: -122.6750 },
  { id: 13, name: "Galleria Shopping Complex", address: "2000 Mall Drive, Houston, TX 77056", type: "Retail", floors: 3, sqft: 66000, occupancy: 92, monthlyRent: 264000, status: "active", estate: "out-of-estate", entity: "Galleria Partners LP", lat: 29.7355, lng: -95.4638 },
  { id: 14, name: "Tech Row Office Park", address: "1800 Silicon Blvd, Phoenix, AZ 85001", type: "Office", floors: 6, sqft: 34000, occupancy: 65, monthlyRent: 88000, status: "partial", estate: "in-estate", entity: "Sunrise Capital Group", lat: 33.4484, lng: -112.0740 },
  { id: 15, name: "Capitol Hill Tower", address: "500 Capitol Way, Washington, DC 20001", type: "Office", floors: 18, sqft: 72000, occupancy: 94, monthlyRent: 310000, status: "active", estate: "in-estate", entity: "Capitol RE Holdings LLC", lat: 38.8951, lng: -77.0369 },
];

const initialLoans = [
  { id: 1, propertyId: 1, lender: "Goldman Sachs Bank", originalAmount: 18500000, balance: 14200000, interestRate: 4.75, monthlyPayment: 96500, startDate: "2020-03-01", maturityDate: "2030-03-01", type: "Fixed", status: "current" },
  { id: 2, propertyId: 2, lender: "Wells Fargo Commercial", originalAmount: 9800000, balance: 8100000, interestRate: 5.1, monthlyPayment: 53200, startDate: "2021-06-01", maturityDate: "2031-06-01", type: "Fixed", status: "current" },
  { id: 3, propertyId: 3, lender: "JP Morgan Chase", originalAmount: 32000000, balance: 29500000, interestRate: 6.25, monthlyPayment: 196000, startDate: "2022-01-01", maturityDate: "2032-01-01", type: "Variable", status: "current" },
  { id: 4, propertyId: 4, lender: "Bank of America CRE", originalAmount: 14500000, balance: 11900000, interestRate: 4.5, monthlyPayment: 73800, startDate: "2019-09-01", maturityDate: "2029-09-01", type: "Fixed", status: "current" },
  { id: 5, propertyId: 7, lender: "Citibank Commercial", originalAmount: 48000000, balance: 43200000, interestRate: 5.75, monthlyPayment: 282000, startDate: "2022-01-01", maturityDate: "2032-01-01", type: "Fixed", status: "current" },
  { id: 6, propertyId: 8, lender: "Deutsche Bank RE", originalAmount: 28500000, balance: 24800000, interestRate: 4.9, monthlyPayment: 151000, startDate: "2020-07-01", maturityDate: "2030-07-01", type: "Fixed", status: "current" },
  { id: 7, propertyId: 13, lender: "KeyBank CRE", originalAmount: 42000000, balance: 39100000, interestRate: 5.5, monthlyPayment: 238500, startDate: "2023-03-01", maturityDate: "2033-03-01", type: "Variable", status: "current" },
  { id: 8, propertyId: 15, lender: "PNC Real Estate", originalAmount: 55000000, balance: 52300000, interestRate: 4.65, monthlyPayment: 285000, startDate: "2023-07-01", maturityDate: "2033-07-01", type: "Fixed", status: "current" },
  { id: 9, propertyId: 6, lender: "First Republic CRE", originalAmount: 6500000, balance: 6500000, interestRate: 7.2, monthlyPayment: 0, startDate: "2021-01-01", maturityDate: "2026-01-01", type: "Bridge", status: "watch" },
];

const initialTenants = [
  { id: 1, propertyId: 1, name: "Goldman Analytics LLC", unit: "Floors 2-4", leaseStart: "2023-01-01", leaseEnd: "2025-12-31", monthlyRent: 58000, status: "current", contact: "sarah@goldman-analytics.com" },
  { id: 2, propertyId: 1, name: "Vertex Consulting", unit: "Floor 7", leaseStart: "2022-06-01", leaseEnd: "2024-05-31", monthlyRent: 24000, status: "expiring", contact: "j.liu@vertex.com" },
  { id: 3, propertyId: 2, name: "Urban Outfitters", unit: "Unit A", leaseStart: "2021-03-01", leaseEnd: "2026-02-28", monthlyRent: 32000, status: "current", contact: "leasing@uo.com" },
  { id: 4, propertyId: 4, name: "New England Medical Group", unit: "Floors 2-4", leaseStart: "2020-09-01", leaseEnd: "2025-08-31", monthlyRent: 78000, status: "current", contact: "admin@nemg.org" },
  { id: 5, propertyId: 7, name: "Pacific Freight Co.", unit: "Full Facility", leaseStart: "2022-01-01", leaseEnd: "2027-12-31", monthlyRent: 312000, status: "current", contact: "ops@pacificfreight.com" },
  { id: 6, propertyId: 13, name: "Luxury Brands Consortium", unit: "East Wing", leaseStart: "2023-03-01", leaseEnd: "2028-02-28", monthlyRent: 140000, status: "current", contact: "lbc@luxurybrands.com" },
];

const initialMaintenance = [
  { id: 1, propertyId: 1, title: "HVAC Unit Replacement", priority: "high", status: "in-progress", date: "2025-02-15", cost: 18500, assignee: "BuildRight HVAC" },
  { id: 2, propertyId: 3, title: "Loading Dock Door Repair", priority: "medium", status: "open", date: "2025-03-01", cost: 3200, assignee: "Industrial Doors Inc." },
  { id: 3, propertyId: 6, title: "Full Interior Renovation", priority: "high", status: "open", date: "2025-03-05", cost: 95000, assignee: "Unassigned" },
  { id: 4, propertyId: 8, title: "Elevator Modernization", priority: "high", status: "scheduled", date: "2025-04-01", cost: 220000, assignee: "Otis Elevator Co." },
  { id: 5, propertyId: 9, title: "Parking Lot Resurfacing", priority: "low", status: "open", date: "2025-03-10", cost: 12000, assignee: "Unassigned" },
  { id: 6, propertyId: 12, title: "Roof Inspection & Repair", priority: "medium", status: "scheduled", date: "2025-03-20", cost: 8500, assignee: "Pacific Roofing" },
  { id: 7, propertyId: 14, title: "Lobby Refresh", priority: "low", status: "in-progress", date: "2025-02-20", cost: 45000, assignee: "Interior Spaces Co." },
];

const TYPE_COLORS = { Office: "#3B82F6", Retail: "#F59E0B", Industrial: "#6B7280", Medical: "#10B981" };
const STATUS_STYLES = {
  active: { bg: "#D1FAE5", color: "#065F46", label: "Active" },
  partial: { bg: "#FEF3C7", color: "#92400E", label: "Partial" },
  vacant: { bg: "#FEE2E2", color: "#991B1B", label: "Vacant" },
};
const ESTATE_STYLES = {
  "in-estate": { bg: "#EEF2FF", color: "#4338CA", label: "In Estate" },
  "out-of-estate": { bg: "#F3F4F6", color: "#374151", label: "Out of Estate" },
};
const PRIORITY_STYLES = {
  high: { bg: "#FEE2E2", color: "#991B1B" },
  medium: { bg: "#FEF3C7", color: "#92400E" },
  low: { bg: "#DBEAFE", color: "#1E40AF" },
};
const MAINT_STATUS_STYLES = {
  open: { bg: "#FEE2E2", color: "#991B1B" },
  "in-progress": { bg: "#FEF3C7", color: "#92400E" },
  scheduled: { bg: "#DBEAFE", color: "#1E40AF" },
  completed: { bg: "#D1FAE5", color: "#065F46" },
};
const LOAN_STATUS_STYLES = {
  current: { bg: "#D1FAE5", color: "#065F46" },
  watch: { bg: "#FEF3C7", color: "#92400E" },
  default: { bg: "#FEE2E2", color: "#991B1B" },
};

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
        <div style={{ width: `${pct}%`, height: "100%", background: color || "#3B82F6", borderRadius: 99, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ fontSize: 12, color: "#374151", fontWeight: 600, minWidth: 32, textAlign: "right" }}>{pct}%</span>
    </div>
  );
}

function Badge({ label, bg, color }) {
  return <span style={{ background: bg, color, fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 99, letterSpacing: "0.03em", whiteSpace: "nowrap" }}>{label}</span>;
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 560, maxWidth: "95vw", maxHeight: "88vh", overflowY: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: "#111827" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, color: "#6B7280", cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text", options }) {
  const style = { width: "100%", padding: "9px 12px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box", background: "#FAFAFA" };
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</label>
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={style}>
          {options.map(o => <option key={o.value !== undefined ? o.value : o} value={o.value !== undefined ? o.value : o}>{o.label !== undefined ? o.label : o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} style={style} />
      )}
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

export default function PropertyManager() {
  const [tab, setTab] = useState("dashboard");
  const [properties, setProperties, propsLoaded] = usePersistedState("pm:properties", initialProperties);
  const [loans, setLoans, loansLoaded] = usePersistedState("pm:loans", initialLoans);
  const [tenants, setTenants, tenantsLoaded] = usePersistedState("pm:tenants", initialTenants);
  const [maintenance, setMaintenance, maintLoaded] = usePersistedState("pm:maintenance", initialMaintenance);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [showAddMaint, setShowAddMaint] = useState(false);
  const [showAddLoan, setShowAddLoan] = useState(false);

  const isLoading = !propsLoaded || !loansLoaded || !tenantsLoaded || !maintLoaded;

  if (isLoading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", background: "#F8F9FA", flexDirection: "column", gap: 16 }}>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: "#111827" }}>PropManager</div>
      <div style={{ fontSize: 14, color: "#9CA3AF" }}>Loading your portfolio…</div>
    </div>
  );
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterEstate, setFilterEstate] = useState("all");
  const [searchQ, setSearchQ] = useState("");
  const [financeView, setFinanceView] = useState("overview");
  const [newProp, setNewProp] = useState({ name: "", address: "", type: "Office", floors: "", sqft: "", monthlyRent: "", status: "active", estate: "in-estate", entity: "" });
  const [newTenant, setNewTenant] = useState({ propertyId: "", name: "", unit: "", leaseStart: "", leaseEnd: "", monthlyRent: "", contact: "" });
  const [newMaint, setNewMaint] = useState({ propertyId: "", title: "", priority: "medium", assignee: "", cost: "", date: "" });
  const [newLoan, setNewLoan] = useState({ propertyId: "", lender: "", originalAmount: "", balance: "", interestRate: "", monthlyPayment: "", startDate: "", maturityDate: "", type: "Fixed", status: "current" });

  const totalRevenue = properties.reduce((s, p) => s + p.monthlyRent, 0);
  const avgOccupancy = Math.round(properties.reduce((s, p) => s + p.occupancy, 0) / properties.length);
  const vacantCount = properties.filter(p => p.status === "vacant").length;
  const openMaint = maintenance.filter(m => m.status !== "completed").length;
  const totalDebt = loans.reduce((s, l) => s + l.balance, 0);
  const totalDebtService = loans.reduce((s, l) => s + l.monthlyPayment, 0);
  const netOperatingIncome = totalRevenue - totalDebtService;

  const filteredProps = properties.filter(p => {
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    if (filterType !== "all" && p.type !== filterType) return false;
    if (filterEstate !== "all" && p.estate !== filterEstate) return false;
    if (searchQ && !p.name.toLowerCase().includes(searchQ.toLowerCase()) && !p.address.toLowerCase().includes(searchQ.toLowerCase()) && !(p.entity || "").toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  const addProperty = () => {
    setProperties(prev => [...prev, { ...newProp, id: Date.now(), floors: +newProp.floors, sqft: +newProp.sqft, monthlyRent: +newProp.monthlyRent, occupancy: newProp.status === "vacant" ? 0 : 80, lat: 37.7, lng: -96.0 }]);
    setShowAddProperty(false);
    setNewProp({ name: "", address: "", type: "Office", floors: "", sqft: "", monthlyRent: "", status: "active", estate: "in-estate", entity: "" });
  };
  const addTenant = () => {
    setTenants(prev => [...prev, { ...newTenant, id: Date.now(), propertyId: +newTenant.propertyId, monthlyRent: +newTenant.monthlyRent, status: "current" }]);
    setShowAddTenant(false);
    setNewTenant({ propertyId: "", name: "", unit: "", leaseStart: "", leaseEnd: "", monthlyRent: "", contact: "" });
  };
  const addMaintenance = () => {
    setMaintenance(prev => [...prev, { ...newMaint, id: Date.now(), propertyId: +newMaint.propertyId, cost: +newMaint.cost, status: "open" }]);
    setShowAddMaint(false);
    setNewMaint({ propertyId: "", title: "", priority: "medium", assignee: "", cost: "", date: "" });
  };
  const addLoan = () => {
    setLoans(prev => [...prev, { ...newLoan, id: Date.now(), propertyId: +newLoan.propertyId, originalAmount: +newLoan.originalAmount, balance: +newLoan.balance, interestRate: +newLoan.interestRate, monthlyPayment: +newLoan.monthlyPayment }]);
    setShowAddLoan(false);
    setNewLoan({ propertyId: "", lender: "", originalAmount: "", balance: "", interestRate: "", monthlyPayment: "", startDate: "", maturityDate: "", type: "Fixed", status: "current" });
  };
  const updateMaintStatus = (id, status) => setMaintenance(prev => prev.map(m => m.id === id ? { ...m, status } : m));

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "⬛" },
    { id: "properties", label: "Properties", icon: "🏢" },
    { id: "tenants", label: "Tenants", icon: "👥" },
    { id: "maintenance", label: "Maintenance", icon: "🔧" },
    { id: "finances", label: "Finances", icon: "💰" },
    { id: "map", label: "Map", icon: "📍" },
  ];

  const propOptions = [{ value: "", label: "Select property..." }, ...properties.map(p => ({ value: String(p.id), label: p.name }))];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #F8F9FA; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 99px; }
        .nav-item:hover { background: #EEF2FF !important; color: #4F46E5 !important; }
        .nav-item.active { background: #EEF2FF !important; color: #4F46E5 !important; font-weight: 600 !important; }
        .prop-row:hover { background: #F9FAFB !important; cursor: pointer; }
        .action-btn:hover { background: #4F46E5 !important; color: #fff !important; }
        .maint-row:hover { background: #F9FAFB !important; }
        .fpill { cursor:pointer; padding:7px 16px; border-radius:8px; border:1.5px solid #E5E7EB; background:#fff; font-size:13px; font-weight:500; color:#374151; font-family:'DM Sans',sans-serif; transition:all 0.15s; }
        .fpill.act { border-color:#4F46E5; background:#EEF2FF; color:#4F46E5; font-weight:600; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#F8F9FA", overflow: "hidden" }}>
        {/* Sidebar */}
        <div style={{ width: 220, background: "#111827", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "28px 20px 20px", borderBottom: "1px solid #1F2937" }}>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#F9FAFB", letterSpacing: "-0.02em" }}>PropManager</div>
            <div style={{ fontSize: 11, color: "#6B7280", marginTop: 3, letterSpacing: "0.06em", textTransform: "uppercase" }}>Commercial Portfolio</div>
          </div>
          <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
            {navItems.map(n => (
              <button key={n.id} className={`nav-item${tab === n.id ? " active" : ""}`} onClick={() => setTab(n.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8, border: "none", background: "transparent", color: "#9CA3AF", fontSize: 14, cursor: "pointer", textAlign: "left", transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>
                <span style={{ fontSize: 16 }}>{n.icon}</span>{n.label}
              </button>
            ))}
          </nav>
          <div style={{ padding: "16px 20px", borderTop: "1px solid #1F2937" }}>
            <div style={{ fontSize: 12, color: "#6B7280" }}>{properties.length} Properties</div>
            <div style={{ fontSize: 12, color: "#10B981", fontWeight: 600, marginTop: 2 }}>${(totalRevenue / 1000000).toFixed(2)}M / month</div>
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Serif Display', serif", color: "#111827" }}>{navItems.find(n => n.id === tab)?.label}</h1>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 1 }}>Updated today · March 2026</div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {tab === "properties" && <button className="action-btn" onClick={() => setShowAddProperty(true)} style={{ padding: "9px 18px", background: "#fff", border: "1.5px solid #4F46E5", color: "#4F46E5", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif" }}>+ Add Property</button>}
              {tab === "tenants" && <button className="action-btn" onClick={() => setShowAddTenant(true)} style={{ padding: "9px 18px", background: "#fff", border: "1.5px solid #4F46E5", color: "#4F46E5", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif" }}>+ Add Tenant</button>}
              {tab === "maintenance" && <button className="action-btn" onClick={() => setShowAddMaint(true)} style={{ padding: "9px 18px", background: "#fff", border: "1.5px solid #4F46E5", color: "#4F46E5", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif" }}>+ Log Request</button>}
              {tab === "finances" && financeView === "loans" && <button className="action-btn" onClick={() => setShowAddLoan(true)} style={{ padding: "9px 18px", background: "#fff", border: "1.5px solid #4F46E5", color: "#4F46E5", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif" }}>+ Add Loan</button>}
            </div>
          </div>

          <div style={{ flex: 1, padding: "28px 32px", overflow: "auto" }}>

            {/* DASHBOARD */}
            {tab === "dashboard" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
                  <MetricCard label="Monthly Revenue" value={`$${(totalRevenue / 1000000).toFixed(2)}M`} sub="Across all properties" accent="#4F46E5" />
                  <MetricCard label="Avg Occupancy" value={`${avgOccupancy}%`} sub={`${properties.filter(p => p.status === "active").length} fully leased`} accent="#10B981" />
                  <MetricCard label="Total Debt" value={`$${(totalDebt / 1000000).toFixed(1)}M`} sub={`${loans.length} active loans`} accent="#EF4444" />
                  <MetricCard label="Open Work Orders" value={openMaint} sub="Maintenance requests" accent="#F59E0B" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
                  <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 18 }}>Occupancy by Property</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {properties.slice(0, 10).map(p => (
                        <div key={p.id}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 13, color: "#374151", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200 }}>{p.name}</span>
                            <Badge label={p.type} bg={TYPE_COLORS[p.type] + "22"} color={TYPE_COLORS[p.type]} />
                          </div>
                          <OccupancyBar pct={p.occupancy} color={p.occupancy === 0 ? "#EF4444" : p.occupancy < 75 ? "#F59E0B" : "#10B981"} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 18 }}>Revenue by Type</h3>
                    {Object.entries(TYPE_COLORS).map(([type, color]) => {
                      const rev = properties.filter(p => p.type === type).reduce((s, p) => s + p.monthlyRent, 0);
                      return (
                        <div key={type} style={{ marginBottom: 16 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                            <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{type}</span>
                            <span style={{ fontSize: 13, color: "#111827", fontWeight: 700 }}>${(rev / 1000000).toFixed(2)}M</span>
                          </div>
                          <OccupancyBar pct={Math.round((rev / totalRevenue) * 100)} color={color} />
                        </div>
                      );
                    })}
                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #F3F4F6" }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 12 }}>Urgent Maintenance</h4>
                      {maintenance.filter(m => m.priority === "high" && m.status !== "completed").slice(0, 3).map(m => (
                        <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{m.title}</div>
                            <div style={{ fontSize: 11, color: "#9CA3AF" }}>{properties.find(p => p.id === m.propertyId)?.name}</div>
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
                  <input placeholder="Search name, address, entity..." value={searchQ} onChange={e => setSearchQ(e.target.value)}
                    style={{ flex: 1, minWidth: 200, padding: "9px 14px", border: "1px solid #D1D5DB", borderRadius: 8, fontSize: 14, outline: "none", background: "#fff" }} />
                  {["all", "active", "partial", "vacant"].map(s => (
                    <button key={s} onClick={() => setFilterStatus(s)}
                      style={{ padding: "9px 12px", borderRadius: 8, border: "1.5px solid", borderColor: filterStatus === s ? "#4F46E5" : "#D1D5DB", background: filterStatus === s ? "#EEF2FF" : "#fff", color: filterStatus === s ? "#4F46E5" : "#374151", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                      {s === "all" ? "All" : STATUS_STYLES[s]?.label}
                    </button>
                  ))}
                  {["all", "in-estate", "out-of-estate"].map(e => (
                    <button key={e} onClick={() => setFilterEstate(e)}
                      style={{ padding: "9px 12px", borderRadius: 8, border: "1.5px solid", borderColor: filterEstate === e ? "#4F46E5" : "#D1D5DB", background: filterEstate === e ? "#EEF2FF" : "#fff", color: filterEstate === e ? "#4F46E5" : "#374151", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                      {e === "all" ? "All Estate" : ESTATE_STYLES[e].label}
                    </button>
                  ))}
                  {["all", "Office", "Retail", "Industrial", "Medical"].map(t => (
                    <button key={t} onClick={() => setFilterType(t)}
                      style={{ padding: "9px 12px", borderRadius: 8, border: "1.5px solid", borderColor: filterType === t ? "#4F46E5" : "#D1D5DB", background: filterType === t ? "#EEF2FF" : "#fff", color: filterType === t ? "#4F46E5" : "#374151", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                      {t === "all" ? "All Types" : t}
                    </button>
                  ))}
                </div>
                <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                        {["Property", "Type", "Owning Entity", "Estate", "Size", "Occupancy", "Monthly Rent", "Status", ""].map(h => (
                          <th key={h} style={{ padding: "12px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProps.map(p => (
                        <tr key={p.id} className="prop-row" style={{ borderBottom: "1px solid #F3F4F6", transition: "background 0.1s" }} onClick={() => setSelectedProperty(p)}>
                          <td style={{ padding: "13px 12px" }}>
                            <div style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{p.name}</div>
                            <div style={{ fontSize: 11, color: "#9CA3AF" }}>{p.floors} floors</div>
                          </td>
                          <td style={{ padding: "13px 12px" }}><Badge label={p.type} bg={TYPE_COLORS[p.type] + "20"} color={TYPE_COLORS[p.type]} /></td>
                          <td style={{ padding: "13px 12px", fontSize: 12, color: "#374151", maxWidth: 150 }}>
                            <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.entity || "—"}</div>
                          </td>
                          <td style={{ padding: "13px 12px" }}><Badge label={ESTATE_STYLES[p.estate]?.label || p.estate} bg={ESTATE_STYLES[p.estate]?.bg || "#F3F4F6"} color={ESTATE_STYLES[p.estate]?.color || "#374151"} /></td>
                          <td style={{ padding: "13px 12px", fontSize: 12, color: "#374151", whiteSpace: "nowrap" }}>{p.sqft.toLocaleString()} sqft</td>
                          <td style={{ padding: "13px 12px", minWidth: 110 }}><OccupancyBar pct={p.occupancy} color={p.occupancy === 0 ? "#EF4444" : p.occupancy < 75 ? "#F59E0B" : "#10B981"} /></td>
                          <td style={{ padding: "13px 12px", fontSize: 13, fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }}>{p.monthlyRent > 0 ? `$${p.monthlyRent.toLocaleString()}` : "—"}</td>
                          <td style={{ padding: "13px 12px" }}><Badge label={STATUS_STYLES[p.status].label} bg={STATUS_STYLES[p.status].bg} color={STATUS_STYLES[p.status].color} /></td>
                          <td style={{ padding: "13px 12px" }}>
                            <div style={{ display: "flex", gap: 10 }}>
                              <button onClick={e => { e.stopPropagation(); setSelectedProperty(p); }} style={{ fontSize: 12, color: "#4F46E5", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Details →</button>
                              <button onClick={e => { e.stopPropagation(); if (window.confirm(`Remove "${p.name}"?`)) setProperties(prev => prev.filter(x => x.id !== p.id)); }} style={{ fontSize: 12, color: "#EF4444", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Remove</button>
                            </div>
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
                      {["Tenant", "Property", "Unit", "Lease Period", "Monthly Rent", "Status", "Contact", ""].map(h => (
                        <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.map(t => {
                      const prop = properties.find(p => p.id === t.propertyId);
                      const daysLeft = Math.ceil((new Date(t.leaseEnd) - new Date()) / 86400000);
                      return (
                        <tr key={t.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                          <td style={{ padding: "14px 16px", fontWeight: 600, color: "#111827", fontSize: 14 }}>{t.name}</td>
                          <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151" }}>{prop?.name || "—"}</td>
                          <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151" }}>{t.unit}</td>
                          <td style={{ padding: "14px 16px", fontSize: 12, color: "#6B7280" }}>
                            <div>{t.leaseStart} → {t.leaseEnd}</div>
                            <div style={{ color: daysLeft < 90 ? "#EF4444" : "#9CA3AF", fontWeight: daysLeft < 90 ? 600 : 400 }}>{daysLeft > 0 ? `${daysLeft} days left` : "Expired"}</div>
                          </td>
                          <td style={{ padding: "14px 16px", fontWeight: 700, color: "#111827" }}>${t.monthlyRent.toLocaleString()}</td>
                          <td style={{ padding: "14px 16px" }}><Badge label={daysLeft < 90 ? "Expiring Soon" : "Current"} bg={daysLeft < 90 ? "#FEE2E2" : "#D1FAE5"} color={daysLeft < 90 ? "#991B1B" : "#065F46"} /></td>
                          <td style={{ padding: "14px 16px", fontSize: 12, color: "#4F46E5" }}>{t.contact}</td>
                          <td style={{ padding: "14px 16px" }}>
                            <button onClick={() => { if (window.confirm(`Remove "${t.name}"?`)) setTenants(prev => prev.filter(x => x.id !== t.id)); }} style={{ fontSize: 12, color: "#EF4444", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Remove</button>
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
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
                  {["open", "in-progress", "scheduled", "completed"].map(s => (
                    <div key={s} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "16px 20px", textAlign: "center" }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "#111827", fontFamily: "'DM Serif Display', serif" }}>{maintenance.filter(m => m.status === s).length}</div>
                      <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2, textTransform: "capitalize" }}>{s.replace("-", " ")}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                        {["Request", "Property", "Priority", "Assignee", "Est. Cost", "Status", "Update"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {maintenance.map(m => {
                        const prop = properties.find(p => p.id === m.propertyId);
                        return (
                          <tr key={m.id} className="maint-row" style={{ borderBottom: "1px solid #F3F4F6" }}>
                            <td style={{ padding: "14px 16px" }}>
                              <div style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>{m.title}</div>
                              <div style={{ fontSize: 11, color: "#9CA3AF" }}>{m.date}</div>
                            </td>
                            <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151" }}>{prop?.name || "—"}</td>
                            <td style={{ padding: "14px 16px" }}><Badge label={m.priority} bg={PRIORITY_STYLES[m.priority].bg} color={PRIORITY_STYLES[m.priority].color} /></td>
                            <td style={{ padding: "14px 16px", fontSize: 13, color: "#374151" }}>{m.assignee}</td>
                            <td style={{ padding: "14px 16px", fontWeight: 600, color: "#111827" }}>{m.cost > 0 ? `$${m.cost.toLocaleString()}` : "TBD"}</td>
                            <td style={{ padding: "14px 16px" }}><Badge label={m.status.replace("-", " ")} bg={MAINT_STATUS_STYLES[m.status].bg} color={MAINT_STATUS_STYLES[m.status].color} /></td>
                            <td style={{ padding: "14px 16px" }}>
                              <select value={m.status} onChange={e => updateMaintStatus(m.id, e.target.value)}
                                style={{ fontSize: 12, padding: "5px 8px", border: "1px solid #D1D5DB", borderRadius: 6, outline: "none", cursor: "pointer", background: "#fff" }}>
                                {["open", "in-progress", "scheduled", "completed"].map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
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
            {tab === "finances" && (
              <div>
                <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
                  {[["overview", "Overview"], ["loans", "Loans"], ["revenue", "Revenue"]].map(([v, label]) => (
                    <button key={v} className={`fpill${financeView === v ? " act" : ""}`} onClick={() => setFinanceView(v)}>{label}</button>
                  ))}
                </div>

                {financeView === "overview" && (
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
                      <MetricCard label="Monthly Revenue" value={`$${(totalRevenue / 1000000).toFixed(2)}M`} sub="All active leases" accent="#10B981" />
                      <MetricCard label="Monthly Debt Service" value={`$${(totalDebtService / 1000000).toFixed(2)}M`} sub={`${loans.length} loans`} accent="#EF4444" />
                      <MetricCard label="Net Operating Income" value={`$${(netOperatingIncome / 1000000).toFixed(2)}M`} sub="Revenue minus debt service" accent="#4F46E5" />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
                      <MetricCard label="Annual Revenue" value={`$${(totalRevenue * 12 / 1000000).toFixed(2)}M`} sub="Run rate" accent="#3B82F6" />
                      <MetricCard label="Total Debt Outstanding" value={`$${(totalDebt / 1000000).toFixed(1)}M`} sub="Across all loans" accent="#F59E0B" />
                      <MetricCard label="Maintenance Budget" value={`$${(maintenance.reduce((s, m) => s + m.cost, 0) / 1000000).toFixed(2)}M`} sub="Open work orders" accent="#6B7280" />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      {["in-estate", "out-of-estate"].map(estate => {
                        const eProps = properties.filter(p => p.estate === estate);
                        const eRev = eProps.reduce((s, p) => s + p.monthlyRent, 0);
                        const eDebt = loans.filter(l => eProps.find(p => p.id === l.propertyId)).reduce((s, l) => s + l.balance, 0);
                        const eService = loans.filter(l => eProps.find(p => p.id === l.propertyId)).reduce((s, l) => s + l.monthlyPayment, 0);
                        return (
                          <div key={estate} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 22 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                              <Badge label={ESTATE_STYLES[estate].label} bg={ESTATE_STYLES[estate].bg} color={ESTATE_STYLES[estate].color} />
                              <span style={{ fontSize: 13, color: "#6B7280" }}>{eProps.length} properties</span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
                              {[
                                ["Monthly Revenue", `$${(eRev / 1000000).toFixed(2)}M`],
                                ["Debt Outstanding", `$${(eDebt / 1000000).toFixed(1)}M`],
                                ["Debt Service", `$${(eService / 1000000).toFixed(2)}M/mo`],
                                ["Avg Occupancy", `${eProps.length ? Math.round(eProps.reduce((s, p) => s + p.occupancy, 0) / eProps.length) : 0}%`]
                              ].map(([l, v]) => (
                                <div key={l}>
                                  <div style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>{l}</div>
                                  <div style={{ fontSize: 16, fontWeight: 700, color: "#111827", fontFamily: "'DM Serif Display', serif" }}>{v}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {financeView === "loans" && (
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
                      <MetricCard label="Total Loans" value={loans.length} sub="Across portfolio" accent="#4F46E5" />
                      <MetricCard label="Total Balance" value={`$${(totalDebt / 1000000).toFixed(1)}M`} sub="Outstanding principal" accent="#EF4444" />
                      <MetricCard label="Monthly Service" value={`$${(totalDebtService / 1000000).toFixed(2)}M`} sub="Combined payments" accent="#F59E0B" />
                      <MetricCard label="Watch / Default" value={loans.filter(l => l.status !== "current").length} sub="Needs attention" accent="#EF4444" />
                    </div>
                    <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                            {["Property / Entity", "Lender", "Type", "Balance / Original", "Paid Down", "Rate", "Monthly Pmt", "Maturity", "Status"].map(h => (
                              <th key={h} style={{ padding: "12px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6B7280", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {loans.map(l => {
                            const prop = properties.find(p => p.id === l.propertyId);
                            const paidDown = Math.round(((l.originalAmount - l.balance) / l.originalAmount) * 100);
                            const daysToMaturity = Math.ceil((new Date(l.maturityDate) - new Date()) / 86400000);
                            return (
                              <tr key={l.id} style={{ borderBottom: "1px solid #F3F4F6" }}>
                                <td style={{ padding: "13px 12px" }}>
                                  <div style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{prop?.name || "—"}</div>
                                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>{prop?.entity || ""}</div>
                                </td>
                                <td style={{ padding: "13px 12px", fontSize: 12, color: "#374151" }}>{l.lender}</td>
                                <td style={{ padding: "13px 12px" }}>
                                  <Badge label={l.type} bg={l.type === "Fixed" ? "#DBEAFE" : l.type === "Variable" ? "#FEF3C7" : "#FEE2E2"} color={l.type === "Fixed" ? "#1E40AF" : l.type === "Variable" ? "#92400E" : "#991B1B"} />
                                </td>
                                <td style={{ padding: "13px 12px", minWidth: 150 }}>
                                  <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>${(l.balance / 1000000).toFixed(2)}M</div>
                                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>of ${(l.originalAmount / 1000000).toFixed(2)}M</div>
                                  <LoanBar balance={l.balance} original={l.originalAmount} />
                                </td>
                                <td style={{ padding: "13px 12px", fontSize: 13, color: "#10B981", fontWeight: 600 }}>{paidDown}%</td>
                                <td style={{ padding: "13px 12px", fontSize: 13, fontWeight: 600, color: "#374151" }}>{l.interestRate}%</td>
                                <td style={{ padding: "13px 12px", fontSize: 13, fontWeight: 700, color: "#111827" }}>${l.monthlyPayment > 0 ? l.monthlyPayment.toLocaleString() : "—"}</td>
                                <td style={{ padding: "13px 12px", fontSize: 12, color: daysToMaturity < 365 ? "#EF4444" : "#6B7280", fontWeight: daysToMaturity < 365 ? 600 : 400 }}>
                                  <div>{l.maturityDate}</div>
                                  <div>{daysToMaturity > 0 ? `${(daysToMaturity / 365).toFixed(1)}y left` : "Matured"}</div>
                                </td>
                                <td style={{ padding: "13px 12px" }}>
                                  <Badge label={l.status} bg={LOAN_STATUS_STYLES[l.status]?.bg || "#F3F4F6"} color={LOAN_STATUS_STYLES[l.status]?.color || "#374151"} />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {financeView === "revenue" && (
                  <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 18 }}>Revenue vs Debt Service by Property</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {[...properties].sort((a, b) => b.monthlyRent - a.monthlyRent).map(p => {
                        const loan = loans.find(l => l.propertyId === p.id);
                        const noi = p.monthlyRent - (loan?.monthlyPayment || 0);
                        return (
                          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 190, minWidth: 190 }}>
                              <div style={{ fontSize: 12, color: "#374151", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                              <div style={{ fontSize: 10, color: "#9CA3AF" }}>{p.entity}</div>
                            </div>
                            <div style={{ flex: 1, position: "relative" }}>
                              <div style={{ height: 20, background: "#F3F4F6", borderRadius: 4, overflow: "hidden" }}>
                                <div style={{ width: `${(p.monthlyRent / 312000) * 100}%`, height: "100%", background: TYPE_COLORS[p.type] + "BB", borderRadius: 4, minWidth: p.monthlyRent > 0 ? 4 : 0 }} />
                              </div>
                              {loan && loan.monthlyPayment > 0 && (
                                <div style={{ position: "absolute", top: 0, left: 0, width: `${(loan.monthlyPayment / 312000) * 100}%`, height: "100%", background: "rgba(239,68,68,0.3)", borderRadius: 4, borderRight: "2px solid #EF4444" }} />
                              )}
                            </div>
                            <div style={{ width: 120, textAlign: "right" }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{p.monthlyRent > 0 ? `$${p.monthlyRent.toLocaleString()}` : <span style={{ color: "#EF4444" }}>Vacant</span>}</div>
                              {loan && loan.monthlyPayment > 0 && <div style={{ fontSize: 11, color: noi >= 0 ? "#10B981" : "#EF4444" }}>NOI: ${noi.toLocaleString()}</div>}
                            </div>
                            <div style={{ width: 88 }}><Badge label={ESTATE_STYLES[p.estate]?.label} bg={ESTATE_STYLES[p.estate]?.bg} color={ESTATE_STYLES[p.estate]?.color} /></div>
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #F3F4F6", display: "flex", gap: 16, fontSize: 12, color: "#6B7280" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 12, height: 12, background: "#3B82F6BB", borderRadius: 2 }} /> Revenue</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 12, height: 12, background: "rgba(239,68,68,0.3)", borderRadius: 2, border: "1px solid #EF4444" }} /> Debt Service overlay</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* MAP */}
            {tab === "map" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, height: "calc(100vh - 160px)" }}>
                <div style={{ background: "#1a1a2e", borderRadius: 12, overflow: "hidden", position: "relative", minHeight: 400 }}>
                  <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <svg viewBox="0 0 960 600" style={{ width: "90%", maxHeight: "85%" }}>
                      <rect width="960" height="600" fill="#1a1a2e" />
                      <path d="M120,120 L840,120 L840,480 L680,520 L580,510 L500,530 L400,510 L280,520 L200,480 L120,450 Z" fill="#16213e" stroke="#4F46E5" strokeWidth="1.5" opacity="0.6" />
                      {properties.map(p => {
                        const x = ((p.lng + 125) / 60) * 800 + 80;
                        const y = ((50 - p.lat) / 25) * 380 + 100;
                        return (
                          <g key={p.id} style={{ cursor: "pointer" }} onClick={() => setSelectedProperty(p)}>
                            <circle cx={x} cy={y} r={Math.sqrt(p.monthlyRent / 3000) + 4} fill={TYPE_COLORS[p.type]} opacity={0.85} />
                            <circle cx={x} cy={y} r={Math.sqrt(p.monthlyRent / 3000) + 4} fill="none" stroke={p.estate === "in-estate" ? "#fff" : "#FCD34D"} strokeWidth="2" opacity={0.8} />
                          </g>
                        );
                      })}
                    </svg>
                    <div style={{ position: "absolute", bottom: 16, left: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
                      {Object.entries(TYPE_COLORS).map(([t, c]) => (
                        <div key={t} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
                          <span style={{ fontSize: 11, color: "#9CA3AF" }}>{t}</span>
                        </div>
                      ))}
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 10, height: 10, borderRadius: "50%", border: "2px solid #fff", background: "transparent" }} /><span style={{ fontSize: 11, color: "#9CA3AF" }}>In Estate</span></div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}><div style={{ width: 10, height: 10, borderRadius: "50%", border: "2px solid #FCD34D", background: "transparent" }} /><span style={{ fontSize: 11, color: "#9CA3AF" }}>Out of Estate</span></div>
                    </div>
                    <div style={{ position: "absolute", top: 16, left: 16, fontSize: 12, color: "#6B7280" }}>Click a dot · Bubble = revenue · Ring = estate status</div>
                  </div>
                </div>
                <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "auto", padding: 20 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 14 }}>All Locations</h3>
                  {properties.map(p => (
                    <div key={p.id} onClick={() => setSelectedProperty(p)} style={{ padding: "12px 0", borderBottom: "1px solid #F3F4F6", cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 1 }}>{p.entity}</div>
                        </div>
                        <Badge label={ESTATE_STYLES[p.estate]?.label} bg={ESTATE_STYLES[p.estate]?.bg} color={ESTATE_STYLES[p.estate]?.color} />
                      </div>
                      <div style={{ marginTop: 6 }}><OccupancyBar pct={p.occupancy} color={p.occupancy === 0 ? "#EF4444" : p.occupancy < 75 ? "#F59E0B" : "#10B981"} /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PROPERTY DETAIL MODAL */}
      {selectedProperty && (
        <Modal title={selectedProperty.name} onClose={() => setSelectedProperty(null)}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            {[
              ["Type", <Badge label={selectedProperty.type} bg={TYPE_COLORS[selectedProperty.type] + "20"} color={TYPE_COLORS[selectedProperty.type]} />],
              ["Status", <Badge label={STATUS_STYLES[selectedProperty.status].label} bg={STATUS_STYLES[selectedProperty.status].bg} color={STATUS_STYLES[selectedProperty.status].color} />],
              ["Estate", <Badge label={ESTATE_STYLES[selectedProperty.estate]?.label} bg={ESTATE_STYLES[selectedProperty.estate]?.bg} color={ESTATE_STYLES[selectedProperty.estate]?.color} />],
              ["Owning Entity", selectedProperty.entity || "—"],
              ["Size", `${selectedProperty.sqft.toLocaleString()} sqft`],
              ["Floors", selectedProperty.floors],
              ["Occupancy", `${selectedProperty.occupancy}%`],
              ["Monthly Rent", selectedProperty.monthlyRent > 0 ? `$${selectedProperty.monthlyRent.toLocaleString()}` : "Vacant"],
            ].map(([label, val]) => (
              <div key={label} style={{ background: "#F9FAFB", borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>📍 {selectedProperty.address}</div>
          {(() => {
            const loan = loans.find(l => l.propertyId === selectedProperty.id);
            return loan ? (
              <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#92400E", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>Loan — {loan.lender}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, fontSize: 13 }}>
                  {[["Balance", `$${(loan.balance / 1000000).toFixed(2)}M`], ["Original", `$${(loan.originalAmount / 1000000).toFixed(2)}M`], ["Rate", `${loan.interestRate}% ${loan.type}`], ["Monthly Pmt", `$${loan.monthlyPayment.toLocaleString()}`], ["Maturity", loan.maturityDate], ["Status", <Badge label={loan.status} bg={LOAN_STATUS_STYLES[loan.status]?.bg} color={LOAN_STATUS_STYLES[loan.status]?.color} />]].map(([l, v]) => (
                    <div key={l}><div style={{ fontSize: 10, color: "#9CA3AF", marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.04em" }}>{l}</div><div style={{ fontWeight: 700 }}>{v}</div></div>
                  ))}
                </div>
              </div>
            ) : <div style={{ background: "#F9FAFB", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#9CA3AF" }}>No loan on record for this property.</div>;
          })()}
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 10 }}>Tenants</h4>
            {tenants.filter(t => t.propertyId === selectedProperty.id).length === 0
              ? <div style={{ fontSize: 13, color: "#9CA3AF" }}>No tenants on record.</div>
              : tenants.filter(t => t.propertyId === selectedProperty.id).map(t => (
                <div key={t.id} style={{ background: "#F9FAFB", borderRadius: 8, padding: "10px 14px", marginBottom: 8, fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "#111827" }}>{t.name} · {t.unit}</div>
                    <div style={{ color: "#6B7280", marginTop: 2 }}>{t.leaseStart} → {t.leaseEnd} · ${t.monthlyRent.toLocaleString()}/mo</div>
                  </div>
                  <button onClick={() => { if (window.confirm(`Remove tenant "${t.name}"?`)) setTenants(prev => prev.filter(x => x.id !== t.id)); }}
                    style={{ fontSize: 12, color: "#EF4444", background: "none", border: "none", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>Remove</button>
                </div>
              ))}
          </div>
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 10 }}>Maintenance</h4>
            {maintenance.filter(m => m.propertyId === selectedProperty.id).length === 0
              ? <div style={{ fontSize: 13, color: "#9CA3AF" }}>No maintenance requests.</div>
              : maintenance.filter(m => m.propertyId === selectedProperty.id).map(m => (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #F3F4F6" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{m.title}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>${m.cost.toLocaleString()} · {m.assignee}</div>
                  </div>
                  <Badge label={m.status} bg={MAINT_STATUS_STYLES[m.status].bg} color={MAINT_STATUS_STYLES[m.status].color} />
                </div>
              ))}
          </div>
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #F3F4F6" }}>
            <button onClick={() => { if (window.confirm(`Permanently remove "${selectedProperty.name}"?`)) { setProperties(prev => prev.filter(x => x.id !== selectedProperty.id)); setSelectedProperty(null); } }}
              style={{ width: "100%", padding: "11px", background: "#FEF2F2", border: "1.5px solid #FECACA", color: "#DC2626", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
              🗑 Remove Property
            </button>
          </div>
        </Modal>
      )}

      {/* ADD PROPERTY */}
      {showAddProperty && (
        <Modal title="Add New Property" onClose={() => setShowAddProperty(false)}>
          <InputField label="Property Name" value={newProp.name} onChange={v => setNewProp(p => ({ ...p, name: v }))} />
          <InputField label="Address" value={newProp.address} onChange={v => setNewProp(p => ({ ...p, address: v }))} />
          <InputField label="Owning Entity (LLC, LP, Trust, etc.)" value={newProp.entity} onChange={v => setNewProp(p => ({ ...p, entity: v }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <InputField label="Type" value={newProp.type} onChange={v => setNewProp(p => ({ ...p, type: v }))} options={["Office", "Retail", "Industrial", "Medical"]} />
            <InputField label="Status" value={newProp.status} onChange={v => setNewProp(p => ({ ...p, status: v }))} options={["active", "partial", "vacant"]} />
            <InputField label="Estate" value={newProp.estate} onChange={v => setNewProp(p => ({ ...p, estate: v }))} options={[{ value: "in-estate", label: "In Estate" }, { value: "out-of-estate", label: "Out of Estate" }]} />
            <InputField label="Monthly Rent ($)" value={newProp.monthlyRent} onChange={v => setNewProp(p => ({ ...p, monthlyRent: v }))} type="number" />
            <InputField label="Floors" value={newProp.floors} onChange={v => setNewProp(p => ({ ...p, floors: v }))} type="number" />
            <InputField label="Sq Ft" value={newProp.sqft} onChange={v => setNewProp(p => ({ ...p, sqft: v }))} type="number" />
          </div>
          <button onClick={addProperty} disabled={!newProp.name || !newProp.address}
            style={{ width: "100%", padding: "12px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", opacity: !newProp.name || !newProp.address ? 0.5 : 1, marginTop: 4 }}>
            Add Property
          </button>
        </Modal>
      )}

      {/* ADD TENANT */}
      {showAddTenant && (
        <Modal title="Add Tenant" onClose={() => setShowAddTenant(false)}>
          <InputField label="Property" value={newTenant.propertyId} onChange={v => setNewTenant(t => ({ ...t, propertyId: v }))} options={propOptions} />
          <InputField label="Tenant / Company Name" value={newTenant.name} onChange={v => setNewTenant(t => ({ ...t, name: v }))} />
          <InputField label="Unit / Floor" value={newTenant.unit} onChange={v => setNewTenant(t => ({ ...t, unit: v }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <InputField label="Lease Start" value={newTenant.leaseStart} onChange={v => setNewTenant(t => ({ ...t, leaseStart: v }))} type="date" />
            <InputField label="Lease End" value={newTenant.leaseEnd} onChange={v => setNewTenant(t => ({ ...t, leaseEnd: v }))} type="date" />
          </div>
          <InputField label="Monthly Rent ($)" value={newTenant.monthlyRent} onChange={v => setNewTenant(t => ({ ...t, monthlyRent: v }))} type="number" />
          <InputField label="Contact Email" value={newTenant.contact} onChange={v => setNewTenant(t => ({ ...t, contact: v }))} type="email" />
          <button onClick={addTenant} disabled={!newTenant.name} style={{ width: "100%", padding: "12px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Add Tenant</button>
        </Modal>
      )}

      {/* ADD MAINTENANCE */}
      {showAddMaint && (
        <Modal title="Log Maintenance Request" onClose={() => setShowAddMaint(false)}>
          <InputField label="Property" value={newMaint.propertyId} onChange={v => setNewMaint(m => ({ ...m, propertyId: v }))} options={propOptions} />
          <InputField label="Request Title" value={newMaint.title} onChange={v => setNewMaint(m => ({ ...m, title: v }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <InputField label="Priority" value={newMaint.priority} onChange={v => setNewMaint(m => ({ ...m, priority: v }))} options={["low", "medium", "high"]} />
            <InputField label="Date" value={newMaint.date} onChange={v => setNewMaint(m => ({ ...m, date: v }))} type="date" />
          </div>
          <InputField label="Assignee / Contractor" value={newMaint.assignee} onChange={v => setNewMaint(m => ({ ...m, assignee: v }))} />
          <InputField label="Estimated Cost ($)" value={newMaint.cost} onChange={v => setNewMaint(m => ({ ...m, cost: v }))} type="number" />
          <button onClick={addMaintenance} disabled={!newMaint.title} style={{ width: "100%", padding: "12px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Log Request</button>
        </Modal>
      )}

      {/* ADD LOAN */}
      {showAddLoan && (
        <Modal title="Add Loan" onClose={() => setShowAddLoan(false)}>
          <InputField label="Property" value={newLoan.propertyId} onChange={v => setNewLoan(l => ({ ...l, propertyId: v }))} options={propOptions} />
          <InputField label="Lender" value={newLoan.lender} onChange={v => setNewLoan(l => ({ ...l, lender: v }))} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <InputField label="Loan Type" value={newLoan.type} onChange={v => setNewLoan(l => ({ ...l, type: v }))} options={["Fixed", "Variable", "Bridge", "Construction"]} />
            <InputField label="Status" value={newLoan.status} onChange={v => setNewLoan(l => ({ ...l, status: v }))} options={["current", "watch", "default"]} />
            <InputField label="Original Amount ($)" value={newLoan.originalAmount} onChange={v => setNewLoan(l => ({ ...l, originalAmount: v }))} type="number" />
            <InputField label="Current Balance ($)" value={newLoan.balance} onChange={v => setNewLoan(l => ({ ...l, balance: v }))} type="number" />
            <InputField label="Interest Rate (%)" value={newLoan.interestRate} onChange={v => setNewLoan(l => ({ ...l, interestRate: v }))} type="number" />
            <InputField label="Monthly Payment ($)" value={newLoan.monthlyPayment} onChange={v => setNewLoan(l => ({ ...l, monthlyPayment: v }))} type="number" />
            <InputField label="Start Date" value={newLoan.startDate} onChange={v => setNewLoan(l => ({ ...l, startDate: v }))} type="date" />
            <InputField label="Maturity Date" value={newLoan.maturityDate} onChange={v => setNewLoan(l => ({ ...l, maturityDate: v }))} type="date" />
          </div>
          <button onClick={addLoan} disabled={!newLoan.lender || !newLoan.propertyId}
            style={{ width: "100%", padding: "12px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", marginTop: 4 }}>
            Add Loan
          </button>
        </Modal>
      )}
    </>
  );
}
