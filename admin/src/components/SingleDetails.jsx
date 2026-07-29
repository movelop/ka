import React from 'react';
import { useStateContext } from '../context/ContextProvider';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  }) : '—';

const formatTime = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';

const formatRoomNumbers = (roomNumbers = []) =>
  (Array.isArray(roomNumbers) ? roomNumbers.map((r) => (typeof r === 'object' ? r.number : r)).join(', ') : '—') || '—';

const formatNGN = (value) =>
  typeof value === 'number' ? `₦${value.toLocaleString('en-NG')}` : value ?? '—';

// ─── Sub-components ───────────────────────────────────────────────────────────

const Field = ({ label, value, mono = false, isDark }) => {
  const labelColor  = isDark ? '#9ca3af' : '#6b7280';
  const valueColor  = isDark ? '#f3f4f6' : '#1f2937';
  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      padding: '10px 0',
      borderBottom: `1px solid ${borderColor}`,
    }}>
      <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: labelColor }}>
        {label}
      </span>
      <span style={{
        fontSize: '14px',
        fontWeight: 500,
        color: valueColor,
        fontFamily: mono ? 'monospace' : 'inherit',
        letterSpacing: mono ? '0.03em' : 'inherit',
      }}>
        {value ?? '—'}
      </span>
    </div>
  );
};

const StatusBadge = ({ value, isDark }) => {
  const yes = value === true || value === 'Yes';
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '11px',
      fontWeight: 600,
      padding: '4px 10px',
      borderRadius: '99px',
      background: yes
        ? (isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)')
        : (isDark ? 'rgba(239,68,68,0.15)'  : 'rgba(239,68,68,0.1)'),
      color: yes ? '#16a34a' : '#dc2626',
    }}>
      {yes ? 'Yes' : 'No'}
    </span>
  );
};

const HeroImage = ({ src, alt }) => (
  <div style={{
    width: '100%',
    flexShrink: 0,
    borderRadius: '16px',
    overflow: 'hidden',
    maxWidth: '480px',
    aspectRatio: '4/3',
    background: '#f3f4f6',
  }}>
    <img
      src={src || "https://i.ibb.co/MBtjqXQ/no-avatar.gif"}
      alt={alt || 'image'}
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
    />
  </div>
);

const FieldGrid = ({ children }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 2rem' }}>
    {children}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const SingleDetails = ({ type, data = {}, img }) => {
  const { currentMode, currentColor } = useStateContext();
  const isDark = currentMode === 'Dark';

  const titleColor = isDark ? '#f9fafb' : '#111827';
  const subtitleColor = isDark ? '#9ca3af' : '#6b7280';

  // Helper: detect legacy booking (old schema)
  const isLegacyBooking = !Array.isArray(data.rooms) || data.rooms.length === 0;

  // ── User ──────────────────────────────────────────────────────────────────
  if (type === 'user') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <HeroImage src={data.image} alt={`${data.firstName} ${data.lastName}`} />
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: titleColor, marginBottom: '4px' }}>
            {`${data.firstName ?? ''} ${data.lastName ?? ''}`.trim() || '—'}
          </h1>
          <p style={{ fontSize: '13px', color: subtitleColor, marginBottom: '20px' }}>
            @{data.username ?? '—'}
          </p>
          <FieldGrid>
            <Field label="Email"    value={data.email}   isDark={isDark} />
            <Field label="Phone"    value={data.phone}   isDark={isDark} />
            <Field label="Username" value={data.username} isDark={isDark} />
            <Field label="Country"  value={data.country} isDark={isDark} />
          </FieldGrid>
        </div>
      </div>
    );
  }

  // ── Facility ──────────────────────────────────────────────────────────────
  if (type === 'facility') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <HeroImage src={data.image} alt={data.title} />
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: titleColor, marginBottom: '4px' }}>
            {data.title ?? '—'}
          </h1>
          {data.description && (
            <p style={{ fontSize: '14px', color: subtitleColor, lineHeight: 1.7 }}>
              {data.description}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Room ──────────────────────────────────────────────────────────────────
  if (type === 'room') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <HeroImage src={data.images?.[0]} alt={data.title} />
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: titleColor, marginBottom: '4px' }}>
            {data.title ?? '—'}
          </h1>
          <p style={{ fontSize: '13px', color: subtitleColor, marginBottom: '20px' }}>
            {data.description}
          </p>
          <FieldGrid>
            <Field label="Price"        value={formatNGN(Number(data.price) || 0)} isDark={isDark} />
            <Field label="Max People"   value={data.maxPeople ?? '—'}  isDark={isDark} />
            <Field label="Size"         value={data.size ?? '—'}       isDark={isDark} />
            <Field label="Bedding"      value={data.bedding ?? '—'}    isDark={isDark} />
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Room Numbers" value={formatRoomNumbers(data.roomNumbers)} isDark={isDark} />
            </div>
          </FieldGrid>
        </div>
      </div>
    );
  }

  // ── Booking ───────────────────────────────────────────────────────────────
  if (type === 'booking') {
    // Prepare display values with legacy fallbacks
    const customerName = `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim() || '—';
    const confirmation = data.confirmation ?? '—';
    const paymentRef = data.paymentReference ?? (isLegacyBooking ? 'Walk-in / legacy' : '—');
    const registeredBy = data.registeredBy ?? '—';
    const createdAt = data.createdAt ? formatDate(data.createdAt) : '—';
    const createdTime = data.createdAt ? formatTime(data.createdAt) : '—';

    // Totals (prefer new-schema fields, fallback to legacy)
    const subtotal = typeof data.subtotal === 'number' ? data.subtotal : (isLegacyBooking ? Number(data.price || 0) : 0);
    const discountAmount = data?.discount?.amount ?? 0;
    const totalPrice = typeof data.totalPrice === 'number' ? data.totalPrice : (isLegacyBooking ? Number(data.price || 0) : 0);
    const amountPaid = typeof data.amountPaid === 'number' ? data.amountPaid : (isLegacyBooking ? Number(data.price || 0) : 0);
    const balanceDue = typeof data.balanceDue === 'number' ? data.balanceDue : Math.max(0, totalPrice - amountPaid);
    const paymentStatus = data.paymentStatus ?? (isLegacyBooking ? 'paid' : 'unpaid');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <HeroImage src={img} alt={Array.isArray(data.rooms) && data.rooms[0]?.roomTitle ? data.rooms[0].roomTitle : data.roomTitle} />

        <div>
          {/* Title + confirmation */}
          <div style={{ marginBottom: '12px' }}>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: titleColor, marginBottom: '6px' }}>
              {isLegacyBooking ? (data.roomTitle ?? 'Booking') : 'Booking'}
            </h1>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                color: currentColor,
                fontWeight: 600,
                letterSpacing: '0.05em',
              }}>
                #{confirmation}
              </span>
              <span style={{ fontSize: '12px', color: subtitleColor }}>
                Registered by: {registeredBy}
              </span>
              <span style={{ fontSize: '12px', color: subtitleColor }}>
                Created: {createdAt} · {createdTime}
              </span>
            </div>
          </div>

          {/* Status badges */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {[
              { label: 'Checked In',  value: data.checkedIn },
              { label: 'Checked Out', value: data.checkedOut },
              { label: 'Cancelled',   value: data.cancelled },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: subtitleColor }}>
                  {label}
                </span>
                <StatusBadge value={value} isDark={isDark} />
              </div>
            ))}
          </div>

          {/* Main fields */}
          <FieldGrid>
            <Field label="Customer Name" value={customerName} isDark={isDark} />
            <Field label="Email" value={data.email ?? '—'} isDark={isDark} />
            <Field label="Phone" value={data.phone ?? '—'} isDark={isDark} />
            <Field label="ID Number" value={data.identity ?? 'NIL'} isDark={isDark} mono />
            <Field label="Check-in" value={formatDate(data.startDate)} isDark={isDark} />
            <Field label="Check-out" value={formatDate(data.endDate)} isDark={isDark} />
            <Field label="Payment Ref" value={paymentRef} isDark={isDark} mono />
            <Field label="Channel" value={registeredBy} isDark={isDark} />
            <Field label="Time registered" value={createdTime} isDark={isDark} />
            <Field label="Address" value={data.address ?? 'NIL'} isDark={isDark} />
            <div style={{ gridColumn: '1 / -1' }}>
              {/* Room numbers: if new schema, aggregate across categories; else legacy roomNumbers */}
              <Field
                label="Room Number(s)"
                value={
                  !isLegacyBooking
                    ? (Array.isArray(data.rooms) ? data.rooms.flatMap(r => r.roomNumbers || []).join(', ') || '—' : '—')
                    : formatRoomNumbers(data.roomNumbers)
                }
                isDark={isDark}
              />
            </div>
          </FieldGrid>

          {/* Room categories (new schema) or legacy room info */}
          <div style={{ marginTop: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: titleColor, marginBottom: '8px' }}>
              Room Details
            </h2>

            {isLegacyBooking ? (
              <div style={{ padding: '10px 0', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                <Field label="Room Title" value={data.roomTitle ?? '—'} isDark={isDark} />
                <Field label="Room Numbers" value={formatRoomNumbers(data.roomNumbers)} isDark={isDark} />
                <Field label="Price" value={formatNGN(Number(data.price || 0))} isDark={isDark} />
              </div>
            ) : (
              Array.isArray(data.rooms) && data.rooms.length > 0 ? (
                data.rooms.map((r, idx) => (
                  <div key={idx} style={{ padding: '10px 0', borderTop: idx === 0 ? `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` : 'none' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: subtitleColor, marginBottom: '6px' }}>
                      {`${r.numberOfRooms ?? r.selectedRooms?.length ?? 1}x ${r.roomTitle ?? 'Room'}`}
                    </h3>
                    <Field label="Room Numbers" value={formatRoomNumbers(r.roomNumbers)} isDark={isDark} />
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <Field label="Price Per Room" value={formatNGN(Number(r.pricePerRoom ?? 0))} isDark={isDark} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <Field label="Line Total" value={formatNGN(Number(r.lineTotal ?? 0))} isDark={isDark} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '10px 0' }}>
                  <Field label="Room Info" value="—" isDark={isDark} />
                </div>
              )
            )}
          </div>

          {/* Payments and totals */}
          <div style={{ marginTop: '18px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: titleColor, marginBottom: '8px' }}>
              Payments & Totals
            </h2>

            {/* Payments list (new schema) */}
            {!isLegacyBooking && Array.isArray(data.payments) && data.payments.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: subtitleColor, marginBottom: '8px' }}>Payments</h3>
                {data.payments.map((p, i) => (
                  <div key={i} style={{ padding: '8px 0', borderTop: i === 0 ? `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` : 'none' }}>
                    <Field
                      label={`${p.type?.toUpperCase() ?? 'PAYMENT'} • ${formatDate(p.paidAt ?? p.createdAt ?? data.createdAt)}`}
                      value={`${formatNGN(Number(p.amount ?? 0))} — ${p.method ?? '—'} ${p.reference ? `• ${p.reference}` : ''}`}
                      isDark={isDark}
                      mono
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Legacy single payment (implicit) */}
            {isLegacyBooking && (
              <div style={{ marginBottom: '12px' }}>
                <Field label="Recorded as legacy payment" value={`Amount: ${formatNGN(Number(data.price || 0))} • Date: ${formatDate(data.createdAt)}`} isDark={isDark} />
              </div>
            )}

            {/* Totals */}
            <div style={{ paddingTop: '8px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
              <Field label="Subtotal" value={formatNGN(Number(subtotal || 0))} isDark={isDark} />
              <Field label="Discount" value={formatNGN(Number(discountAmount || 0))} isDark={isDark} />
              <Field label="Total Price" value={formatNGN(Number(totalPrice || 0))} isDark={isDark} />
              <Field label="Amount Paid" value={formatNGN(Number(amountPaid || 0))} isDark={isDark} />
              <Field label="Balance Due" value={formatNGN(Number(balanceDue || 0))} isDark={isDark} />
              <Field label="Payment Status" value={paymentStatus?.toString?.().toUpperCase?.() ?? '—'} isDark={isDark} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SingleDetails;
