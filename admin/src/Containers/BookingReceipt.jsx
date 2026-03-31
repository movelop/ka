import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStateContext } from "../context/ContextProvider";
import { BsPrinterFill } from "react-icons/bs";
import { MdDownload, MdArrowBack, MdCheckCircle } from "react-icons/md";
import { images } from "../Data/dummy"; // adjust if needed

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap";

const BookingReceipt = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const { currentColor, currentMode } = useStateContext();

  const isDark  = currentMode === "Dark";
  const booking = location.state?.booking;

  /* ── Admin shell tokens ── */
  const c = {
    bg:      isDark ? "#2d3139" : "#ffffff",
    border:  isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    text:    isDark ? "#f3f4f6" : "#1f2937",
    muted:   isDark ? "#9ca3af" : "#6b7280",
    surface: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
  };

  /* ─────────────────────────────────────────────────────
     THERMAL PRINT HTML
     • Everything black, bold, no colour, no background tints
     • Logo converted to black via CSS filter
     • Wide letter-spacing removed — thermal fonts render better tight
     • Thick solid dividers instead of faint rgba borders
     • Font sizes bumped for readability on thermal roll
  ───────────────────────────────────────────────────── */
  const buildPrintHTML = (b, rows) => {
    const logoSrc = images?.logo || "";
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Receipt · K.A Hotel &amp; Suites</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="${FONT_URL}" rel="stylesheet"/>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Jost', sans-serif;
      background: #fff;
      color: #000;
      display: flex;
      justify-content: center;
      padding: 24px 16px 48px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .card {
      width: 100%;
      max-width: 380px;           /* typical 80mm thermal roll width */
      background: #fff;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* ── Logo ── */
    .logo-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      margin-bottom: 12px;
      width: 100%;
    }
    .logo-img {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid #000;     /* solid black ring */
    }
    .logo-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: grayscale(100%) contrast(200%) brightness(0); /* force black */
    }
    .logo-name {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #000;
    }
    .hotel-tagline {
      font-size: 10px;
      font-weight: 400;
      color: #000;
      letter-spacing: 0.05em;
    }

    /* ── Top / bottom rules ── */
    .rule {
      width: 100%;
      border: none;
      border-top: 2px solid #000;
      margin: 10px 0;
    }
    .rule-dashed {
      width: 100%;
      border: none;
      border-top: 1px dashed #000;
      margin: 8px 0;
    }

    /* ── Confirmation code ── */
    .code-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #000;
      margin-bottom: 4px;
      text-align: center;
    }
    .code-value {
      font-family: 'Cormorant Garamond', serif;
      font-weight: 700;
      font-size: 34px;
      letter-spacing: 0.08em;
      color: #000;
      margin-bottom: 4px;
      text-align: center;
    }

    /* ── Checked-in badge ── */
    .badge {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: #000;
      border: 1.5px solid #000;
      padding: 3px 10px;
      margin-bottom: 10px;
    }

    /* ── Detail rows ── */
    .rows { width: 100%; }
    .row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      width: 100%;
      padding: 5px 0;
      border-bottom: 1px dashed #000;
      gap: 8px;
    }
    .row:last-child { border-bottom: none; }
    .row-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #000;
      flex-shrink: 0;
    }
    .row-value {
      font-size: 11px;
      font-weight: 700;
      color: #000;
      text-align: right;
    }

    /* ── Total row ── */
    .row-total {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      width: 100%;
      padding: 8px 0 4px;
      gap: 8px;
    }
    .row-total .row-label { font-size: 12px; font-weight: 700; }
    .row-total .row-value { font-size: 14px; font-weight: 700; }

    /* ── Alerts ── */
    .alert {
      width: 100%;
      margin-top: 8px;
      padding: 6px 8px;
      border: 1.5px solid #000;
      font-size: 10px;
      font-weight: 700;
      color: #000;
      line-height: 1.5;
    }

    /* ── Footer ── */
    .footer {
      margin-top: 14px;
      font-size: 10px;
      font-weight: 700;
      color: #000;
      text-align: center;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    /* ── Print overrides ── */
    @media print {
      body { padding: 0; }
      .card { max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="card">

    <!-- Logo -->
    <div class="logo-wrap">
      <div class="logo-img">
        <img src="${logoSrc}" alt="K.A Hotel and Suites"/>
      </div>
      <span class="logo-name">K.A Hotel &amp; Suites</span>
      <span class="hotel-tagline">Official Booking Receipt</span>
    </div>

    <hr class="rule"/>

    <!-- Confirmation code -->
    <p class="code-label">Confirmation Code</p>
    <p class="code-value">${b.confirmation || "—"}</p>

    ${b.checkedIn ? `<span class="badge">✓ Checked In</span>` : ""}

    <hr class="rule-dashed"/>

    <!-- Detail rows (all except total) -->
    <div class="rows">
      ${rows.slice(0, -1).map(({ label, value }) => `
        <div class="row">
          <span class="row-label">${label}</span>
          <span class="row-value">${value ?? "—"}</span>
        </div>`).join("")}
    </div>

    <hr class="rule"/>

    <!-- Total row separated -->
    <div class="row-total">
      <span class="row-label">${rows[rows.length - 1].label}</span>
      <span class="row-value">${rows[rows.length - 1].value}</span>
    </div>

    <hr class="rule"/>

    <!-- Alerts -->
    <div class="alert">⚠ Damage to any hotel property will be charged to the room occupant.</div>
    <div class="alert">Reservations with "non-arrival" will be forfeited if not cancelled at least 24 hours prior to the check-in date.</div>

    <!-- Footer -->
    <hr class="rule-dashed"/>
    <p class="footer">Thank you for choosing K.A Hotel &amp; Suites</p>

  </div>
</body>
</html>`;
  };

  /* ── Error state ── */
  if (!booking) {
    return (
      <div style={{
        margin: "1.5rem", marginTop: "6rem",
        padding: "3rem", borderRadius: "20px",
        border: `1px solid ${c.border}`, background: c.bg,
        display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem",
      }}>
        <p style={{ fontSize: "14px", color: c.muted }}>No booking data found.</p>
        <button
          onClick={() => navigate("/bookings/new")}
          style={{ padding: "10px 24px", borderRadius: "10px", background: currentColor, color: "#fff", fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer" }}
        >
          ← New Booking
        </button>
      </div>
    );
  }

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" });

  const days = Math.ceil(
    (new Date(booking.endDate) - new Date(booking.startDate)) / (1000 * 60 * 60 * 24)
  );

  const rows = [
    { label: "Room(s)",           value: booking.roomNumbers?.join(", ") || "N/A" },
    { label: "Name",              value: `${booking.lastName || ""} ${booking.firstName || ""}`.trim() },
    { label: "Email",             value: booking.email },
    { label: "Phone",             value: booking.phone },
    { label: "ID Number",         value: booking.identity || "—" },
    { label: "Payment Ref",       value: booking.paymentReference || "Cash" },
    { label: "Room Type",         value: booking.roomTitle },
    { label: "Adults",            value: booking.adults },
    { label: "Children",          value: booking.children },
    { label: "Night(s)",          value: days },
    { label: "Check-in",          value: formatDate(booking.startDate) },
    { label: "Check-out",         value: formatDate(booking.endDate) },
    { label: "Total Amount",      value: `NGN ${Number(booking.price).toLocaleString()}` }, // ₦ may not render on thermal
  ];

  /* ── Print handler ── */
  const handlePrint = () => {
    const html = buildPrintHTML(booking, rows);
    const win  = window.open("", "_blank", "width=500,height=900");
    win.document.write(html);
    win.document.close();
    win.focus();
    win.onload = () => setTimeout(() => { win.print(); win.close(); }, 800);
    setTimeout(() => { if (!win.closed) { win.print(); win.close(); } }, 1800);
  };

  /* ── Admin button styles ── */
  const ghostBtn = {
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "9px 20px", borderRadius: "10px",
    border: `1px solid ${c.border}`, background: "transparent",
    color: c.text, fontSize: "13px", fontWeight: 600,
    cursor: "pointer", transition: "opacity 0.15s",
  };
  const primaryBtn = {
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "9px 20px", borderRadius: "10px",
    background: currentColor, color: "#fff",
    fontSize: "13px", fontWeight: 600,
    border: "none", cursor: "pointer",
    boxShadow: `0 4px 14px ${currentColor}40`,
    transition: "opacity 0.15s",
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href={FONT_URL} rel="stylesheet" />

      {/* ── Admin shell — same wrapper as NewBooking ── */}
      <div style={{
        margin: "1.5rem", marginTop: "6rem",
        padding: "2rem", background: c.bg,
        borderRadius: "20px", border: `1px solid ${c.border}`,
      }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
          <div>
            <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: c.muted, marginBottom: "4px" }}>
              Bookings
            </p>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: c.text, margin: 0 }}>
              Booking Receipt
            </h1>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/bookings")} style={ghostBtn}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}>
              <MdArrowBack style={{ fontSize: "16px" }} /> Bookings
            </button>
            <button onClick={handlePrint} style={ghostBtn}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}>
              <BsPrinterFill style={{ fontSize: "14px" }} /> Print
            </button>
            <button onClick={handlePrint} style={primaryBtn}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}>
              <MdDownload style={{ fontSize: "16px" }} /> Download PDF
            </button>
          </div>
        </div>

        {/* ── On-screen receipt preview (luxury design unchanged) ── */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{
            width: "100%", maxWidth: "640px",
            background: "#faf7f2",
            border: "1px solid rgba(184,145,63,0.2)",
            padding: "2.5rem 3rem",
            display: "flex", flexDirection: "column", alignItems: "center",
            position: "relative", fontFamily: "'Jost', sans-serif",
          }}>

            {/* Gold top bar */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(to right, #b8913f, transparent)" }} />

            {/* Logo */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(184,145,63,0.3)" }}>
                <img src={images?.logo} alt="K.A Hotel and Suites" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <span style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.35em", textTransform: "uppercase", color: "#b8913f" }}>
                K.A Hotel &amp; Suites
              </span>
            </div>

            {/* Checked-in badge */}
            {booking.checkedIn && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", marginBottom: "1.5rem", fontSize: "10px", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#b8913f" }}>
                <MdCheckCircle style={{ fontSize: "13px" }} /> Checked In
              </div>
            )}

            {/* Confirmation code */}
            <p style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(26,26,24,0.45)", marginBottom: "0.4rem" }}>
              Confirmation Code
            </p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "38px", letterSpacing: "0.12em", color: "#1a1a18", marginBottom: "2rem" }}>
              {booking.confirmation || "—"}
            </p>

            {/* Detail rows */}
            <div style={{ width: "100%" }}>
              {rows.map(({ label, value }, i) => (
                <div key={label} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "baseline",
                  width: "100%", padding: "0.65rem 0", gap: "1rem",
                  borderBottom: i < rows.length - 1 ? "1px solid rgba(26,26,24,0.06)" : "none",
                }}>
                  <span style={{ fontSize: "10px", fontWeight: 500, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(26,26,24,0.45)", flexShrink: 0 }}>
                    {label}
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: 400, color: "#1a1a18", textAlign: "right" }}>
                    {value ?? "—"}
                  </span>
                </div>
              ))}
            </div>

            {/* Alerts */}
            {[
              "⚠ Damage to any hotel property will be charged to the room occupant.",
              `Reservations with "non-arrival" will be forfeited if not cancelled at least 24 hours prior to the check-in date.`,
            ].map((msg, i) => (
              <div key={i} style={{
                width: "100%", marginTop: i === 0 ? "1rem" : "0.5rem",
                padding: "0.75rem 1rem",
                background: "rgba(175,45,45,0.06)",
                borderLeft: "2px solid #b94a48",
                fontSize: "12px", fontWeight: 300,
                color: "#b94a48", lineHeight: 1.6,
              }}>
                {msg}
              </div>
            ))}

            {/* Card action buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", width: "100%", marginTop: "2rem" }}>
              {[
                { label: "Print",  icon: <BsPrinterFill />, action: handlePrint },
                { label: "← Back", icon: null,              action: () => navigate("/bookings") },
              ].map(({ label, icon, action }) => (
                <button
                  key={label}
                  onClick={action}
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    gap: "0.5rem", background: "transparent",
                    border: "1px solid #1a1a18",
                    fontFamily: "'Jost', sans-serif", fontWeight: 500,
                    fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase",
                    color: "#1a1a18", padding: "0.85em 2em",
                    cursor: "pointer", position: "relative", overflow: "hidden",
                    transition: "color 0.35s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.querySelector(".fill").style.transform = "translateX(0)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#1a1a18";
                    e.currentTarget.querySelector(".fill").style.transform = "translateX(-100%)";
                  }}
                >
                  <span className="fill" style={{ position: "absolute", inset: 0, background: "#1a1a18", transform: "translateX(-100%)", transition: "transform 0.35s cubic-bezier(0.76,0,0.24,1)" }} />
                  <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {icon}{label}
                  </span>
                </button>
              ))}
            </div>

          </div>
        </div>

      </div>
    </>
  );
};

export default BookingReceipt;