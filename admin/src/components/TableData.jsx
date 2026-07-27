import React from "react";
import { Skeleton } from "@mui/material";
import { Link } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import { useStateContext } from "../context/ContextProvider";

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const formatName = (row) => [row.firstName, row.lastName].filter(Boolean).join(" ") || "—";

/**
 * Room helpers: support old schema (roomNumbers, roomTitle) and new schema (rooms[])
 */
const formatRoomsList = (row) => {
  if (Array.isArray(row.roomNumbers) && row.roomNumbers.length) {
    return row.roomNumbers.join(", ");
  }
  if (Array.isArray(row.rooms) && row.rooms.length) {
    const flattened = row.rooms.flatMap((r) => r.roomNumbers || []);
    return flattened.length ? flattened.join(", ") : "—";
  }
  return "—";
};

const formatRoomTitle = (row) => {
  if (row.roomTitle) return row.roomTitle;
  if (Array.isArray(row.rooms) && row.rooms.length) {
    return row.rooms
      .map((r) => {
        const qty = r.numberOfRooms ?? r.selectedRooms?.length ?? 1;
        return `${qty}x ${r.roomTitle || "Room"}`;
      })
      .join(", ");
  }
  return "—";
};

// ─── UI helpers ─────────────────────────────────────────────────────────────

const Badge = ({ children, variant = "default", style = {} }) => {
  const styles = {
    default: { bg: "rgba(0,0,0,0.06)", color: "inherit" },
    green: { bg: "rgba(34,197,94,0.12)", color: "#16a34a" },
    amber: { bg: "rgba(245,158,11,0.08)", color: "#d97706" },
    red: { bg: "rgba(239,68,68,0.08)", color: "#ef4444" },
  };
  const s = styles[variant] || styles.default;
  return (
    <span
      style={{
        display: "inline-block",
        fontSize: "11px",
        fontWeight: 600,
        padding: "4px 10px",
        borderRadius: "99px",
        background: s.bg,
        color: s.color,
        ...style,
      }}
    >
      {children}
    </span>
  );
};

const SkeletonRows = () =>
  Array.from({ length: 5 }).map((_, i) => (
    <div
      key={i}
      className="grid gap-4 px-5 py-4 border-b"
      style={{
        gridTemplateColumns: "1.2fr 1.4fr 1.6fr 1fr 1fr 1fr 1.2fr 1fr 0.8fr auto",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
      }}
    >
      {Array.from({ length: 10 }).map((_, j) => (
        <Skeleton key={j} variant="rounded" height={13} sx={{ borderRadius: "6px" }} />
      ))}
    </div>
  ));

// ─── Main Component ─────────────────────────────────────────────────────────

const TableData = () => {
  const { data, loading, error } = useFetch("/bookings/latest");
  const { currentMode } = useStateContext();
  const bookings = data?.bookings || [];

  const isDark = currentMode === "Dark";

  const c = {
    primary: isDark ? "#f3f4f6" : "#1f2937",
    secondary: isDark ? "#9ca3af" : "#6b7280",
    muted: isDark ? "#6b7280" : "#9ca3af",
    header: isDark ? "#6b7280" : "#9ca3af",
    border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
    rowHover: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
  };

  const gridCols = "1.2fr 1.4fr 1.6fr 1fr 1fr 1fr 1.2fr 1fr 0.8fr auto";

  /**
   * Robust payment rendering:
   * - Treat legacy documents (price present and no explicit new paymentStatus) as Paid.
   * - If balanceDue === 0 or amountPaid >= total, show Paid.
   * - If paymentReference exists, show it.
   * - Otherwise honor paymentStatus or infer from payments/amounts.
   * - Avoid labeling legacy docs Unpaid.
   */
  const renderPaymentCell = (row) => {
    // normalize flags
    const hasPrice = typeof row.price === "number";
    const hasTotalPrice = typeof row.totalPrice === "number";
    const hasPaymentStatus = row.paymentStatus !== undefined && row.paymentStatus !== null;
    const amountPaid = typeof row.amountPaid === "number" ? row.amountPaid : null;
    const balanceDue = typeof row.balanceDue === "number" ? row.balanceDue : null;
    const total = hasTotalPrice ? row.totalPrice : hasPrice ? row.price : null;
    const hasPaymentsArray = Array.isArray(row.payments) && row.payments.length > 0;

    // 0) If balanceDue is explicitly zero, treat as Paid (covers backend inconsistencies)
    if (balanceDue === 0) {
      return <Badge variant="green">Paid</Badge>;
    }

    // 1) Legacy detection: price exists and there is no explicit new-schema paymentStatus
    //    Treat these as Paid (legacy documents were paid at creation).
    if (hasPrice && !hasPaymentStatus) {
      return <Badge variant="green">Paid</Badge>;
    }

    // 2) If there's an explicit paymentReference (legacy or recorded), show it
    if (row.paymentReference) {
      return (
        <span
          style={{
            fontFamily: "monospace",
            fontSize: "11px",
            color: c.muted,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {row.paymentReference}
        </span>
      );
    }

    // 3) If numeric totals indicate fully paid, show Paid
    if (amountPaid != null && total != null) {
      if (amountPaid >= total) return <Badge variant="green">Paid</Badge>;
      if (amountPaid > 0) return <Badge variant="amber">Partial</Badge>;
      // If this is clearly a new-schema booking (has totalPrice or explicit paymentStatus), show Unpaid
      if (hasTotalPrice || hasPaymentStatus) return <Badge variant="default">Unpaid</Badge>;
    }

    // 4) Honor explicit paymentStatus if present
    if (hasPaymentStatus) {
      if (row.paymentStatus === "paid") return <Badge variant="green">Paid</Badge>;
      if (row.paymentStatus === "partial") return <Badge variant="amber">Partial</Badge>;
      if (row.paymentStatus === "unpaid") {
        // defensive: if balanceDue is 0 or amountPaid >= total, override to Paid
        if (balanceDue === 0 || (amountPaid != null && total != null && amountPaid >= total)) {
          return <Badge variant="green">Paid</Badge>;
        }
        return <Badge variant="default">Unpaid</Badge>;
      }
    }

    // 5) Check payments array: prefer last non-refund reference or infer sums
    if (hasPaymentsArray) {
      const nonRefund = row.payments.filter((p) => p.type !== "refund");
      if (nonRefund.length) {
        const last = nonRefund[nonRefund.length - 1];
        if (last.reference) {
          return (
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "11px",
                color: c.muted,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {last.reference}
            </span>
          );
        }
        const sum = nonRefund.reduce((s, p) => s + (Number(p.amount) || 0), 0);
        if (total != null) {
          if (sum >= total) return <Badge variant="green">Paid</Badge>;
          if (sum > 0) return <Badge variant="amber">Partial</Badge>;
        } else {
          return <Badge variant="amber">Partial</Badge>;
        }
      }
    }

    // 6) Final fallback: neutral label (do not mark legacy as Unpaid)
    return <Badge variant="default">—</Badge>;
  };

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <style>{`
        .booking-scroll::-webkit-scrollbar { height: 4px; }
        .booking-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }
        .booking-scroll::-webkit-scrollbar-track { background: transparent; }
        .booking-row { transition: background 0.15s; }
        .booking-row:hover { background: ${c.rowHover}; }
        @keyframes rowFadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="booking-scroll" style={{ minWidth: "960px" }}>
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: gridCols,
            gap: "1rem",
            padding: "0.75rem 1.25rem",
            borderBottom: `1px solid ${c.border}`,
          }}
        >
          {[
            "Confirmation",
            "Guest",
            "Email",
            "Phone",
            "Check-In",
            "Check-Out",
            "Payment",
            "Room",
            "Room No.",
            "",
          ].map((h) => (
            <span
              key={h}
              style={{
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: c.header,
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Loading */}
        {loading && <SkeletonRows />}

        {/* Error */}
        {error && (
          <div style={{ padding: "4rem", textAlign: "center", color: "#f87171", fontSize: "13px" }}>
            Failed to load bookings.
          </div>
        )}

        {/* Empty */}
        {!loading && !error && !bookings.length && (
          <div style={{ padding: "4rem", textAlign: "center", color: c.secondary, fontSize: "13px" }}>
            No recent bookings found.
          </div>
        )}

        {/* Rows */}
        {bookings.map((row, i) => {
          const confirmation = row.confirmation || "—";
          const guestName = formatName(row);
          const email = row.email || "—";
          const phone = row.phone || "—";
          const checkIn = formatDate(row.startDate);
          const checkOut = formatDate(row.endDate);
          const roomTitle = formatRoomTitle(row);
          const roomNumbers = formatRoomsList(row);

          return (
            <div
              key={row._id}
              className="booking-row"
              style={{
                display: "grid",
                gridTemplateColumns: gridCols,
                gap: "1rem",
                padding: "1rem 1.25rem",
                borderBottom: `1px solid ${c.border}`,
                alignItems: "center",
                opacity: 0,
                animation: "rowFadeIn 0.3s ease forwards",
                animationDelay: `${i * 35}ms`,
              }}
            >
              {/* Confirmation */}
              <span style={{ fontFamily: "monospace", fontSize: "11px", letterSpacing: "0.04em", color: c.muted }}>
                {confirmation}
              </span>

              {/* Guest */}
              <span style={{ fontSize: "13px", fontWeight: 600, color: c.primary }}>
                {guestName}
              </span>

              {/* Email */}
              <span style={{ fontSize: "12px", color: c.secondary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {email}
              </span>

              {/* Phone */}
              <span style={{ fontSize: "12px", color: c.secondary }}>
                {phone}
              </span>

              {/* Check-in */}
              <span style={{ fontSize: "12px", fontWeight: 500, color: c.primary }}>
                {checkIn}
              </span>

              {/* Check-out */}
              <span style={{ fontSize: "12px", fontWeight: 500, color: c.primary }}>
                {checkOut}
              </span>

              {/* Payment */}
              <div style={{ fontSize: "12px" }}>{renderPaymentCell(row)}</div>

              {/* Room type */}
              <span style={{ fontSize: "12px", color: c.secondary }}>{roomTitle}</span>

              {/* Room numbers */}
              <span style={{ fontSize: "12px", color: c.muted }}>{roomNumbers}</span>

              {/* Action */}
              <Link
                to={`/bookings/${row._id}`}
                state={{ data: row }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  fontSize: "11px",
                  fontWeight: 600,
                  padding: "6px 12px",
                  borderRadius: "8px",
                  background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  color: c.secondary,
                  border: `1px solid ${c.border}`,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(59,130,246,0.1)";
                  e.currentTarget.style.color = "#3b82f6";
                  e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)";
                  e.currentTarget.style.color = c.secondary;
                  e.currentTarget.style.borderColor = c.border;
                }}
              >
                View →
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TableData;
