import React from 'react';
import { useStateContext } from '../context/ContextProvider';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

const formatRoomNumbers = (roomNumbers = []) =>
  roomNumbers.map((r) => (typeof r === 'object' ? r.number : r)).join(', ') || '—';

// ─── Sub-components ───────────────────────────────────────────────────────────

const Field = ({ label, value, mono = false, isDark }) => {
  const labelColor  = isDark ? '#9ca3af' : '#6b7280';
  const valueColor  = isDark ? '#f3f4f6' : '#1f2937';
  const borderColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '2px',
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
      padding: '2px 10px',
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
  }}>
    <img
      src={src || "https://i.ibb.co/MBtjqXQ/no-avatar.gif"}
      alt={alt}
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

const SingleDetails = ({ type, data, img }) => {
  const { currentMode, currentColor } = useStateContext();
  const isDark = currentMode === 'Dark';

  const titleColor = isDark ? '#f9fafb' : '#111827';
  const subtitleColor = isDark ? '#9ca3af' : '#6b7280';

  const layout = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  };

  // ── User ──────────────────────────────────────────────────────────────────
  if (type === 'user') return (
    <div style={layout}>
      <HeroImage src={data.image} alt={`${data.firstName} ${data.lastName}`} />
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: titleColor, marginBottom: '4px' }}>
          {`${data.firstName} ${data.lastName}`}
        </h1>
        <p style={{ fontSize: '13px', color: subtitleColor, marginBottom: '20px' }}>
          @{data.username}
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

  // ── Facility ──────────────────────────────────────────────────────────────
  if (type === 'facility') return (
    <div style={layout}>
      <HeroImage src={data.image} alt={data.title} />
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: titleColor, marginBottom: '4px' }}>
          {data.title}
        </h1>
        {data.description && (
          <p style={{ fontSize: '14px', color: subtitleColor, lineHeight: 1.7 }}>
            {data.description}
          </p>
        )}
      </div>
    </div>
  );

  // ── Room ──────────────────────────────────────────────────────────────────
  if (type === 'room') return (
    <div style={layout}>
      <HeroImage src={data.images?.[0]} alt={data.title} />
      <div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: titleColor, marginBottom: '4px' }}>
          {data.title}
        </h1>
        <p style={{ fontSize: '13px', color: subtitleColor, marginBottom: '20px' }}>
          {data.description}
        </p>
        <FieldGrid>
          <Field label="Price"        value={`₦${Number(data.price).toLocaleString()}`} isDark={isDark} />
          <Field label="Max People"   value={data.maxPeople}  isDark={isDark} />
          <Field label="Size"         value={data.size}       isDark={isDark} />
          <Field label="Bedding"      value={data.bedding}    isDark={isDark} />
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Room Numbers" value={formatRoomNumbers(data.roomNumbers)} isDark={isDark} />
          </div>
        </FieldGrid>
      </div>
    </div>
  );

  // ── Booking ───────────────────────────────────────────────────────────────
  if (type === 'booking') return (
    <div style={layout}>
      <HeroImage src={img} alt={data.roomTitle} />
      <div>

        {/* Title + confirmation */}
        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: titleColor, marginBottom: '4px' }}>
            {data.roomTitle}
          </h1>
          <span style={{
            fontFamily: 'monospace',
            fontSize: '12px',
            color: currentColor,
            fontWeight: 600,
            letterSpacing: '0.05em',
          }}>
            #{data.confirmation}
          </span>
        </div>

        {/* Status badges row */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {[
            { label: 'Checked In',  value: data.checkedIn },
            { label: 'Checked Out', value: data.checkedOut },
            { label: 'Cancelled',   value: data.cancelled },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: subtitleColor }}>
                {label}
              </span>
              <StatusBadge value={value} isDark={isDark} />
            </div>
          ))}
        </div>

        {/* Fields */}
        <FieldGrid>
          <Field label="Customer Name"  value={`${data.firstName} ${data.lastName}`} isDark={isDark} />
          <Field label="Email"          value={data.email}  isDark={isDark} />
          <Field label="Phone"          value={data.phone}  isDark={isDark} />
          <Field label="ID Number"      value={data.identity || 'NIL'} isDark={isDark} mono />
          <Field label="Check-in"       value={formatDate(data.startDate)} isDark={isDark} />
          <Field label="Check-out"      value={formatDate(data.endDate)}   isDark={isDark} />
          <Field label="Payment Ref"    value={data.paymentReference || 'Cash Payment'} isDark={isDark} mono />
          <Field label="Channel"        value={data.registeredBy || 'Online Booking'} isDark={isDark} />
          <div style={{ gridColumn: '1 / -1' }}>
            <Field label="Room Number(s)" value={formatRoomNumbers(data.roomNumbers)} isDark={isDark} />
          </div>
        </FieldGrid>
      </div>
    </div>
  );

  return null;
};

export default SingleDetails;