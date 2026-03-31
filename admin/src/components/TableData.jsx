import { Skeleton } from '@mui/material';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { useStateContext } from '../context/ContextProvider';

// ─── Constants ────────────────────────────────────────────────────────────────

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatName = (row) =>
  [row.firstName, row.lastName].filter(Boolean).join(' ');

const formatRooms = (roomNumbers = []) =>
  roomNumbers.join(', ') || '—';

// ─── Sub-components ───────────────────────────────────────────────────────────

const Badge = ({ children, variant = 'default' }) => {
  const styles = {
    default: { bg: 'rgba(0,0,0,0.06)', color: 'inherit' },
    green:   { bg: 'rgba(34,197,94,0.12)', color: '#16a34a' },
  };
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '11px',
      fontWeight: 600,
      padding: '2px 10px',
      borderRadius: '99px',
      background: styles[variant].bg,
      color: styles[variant].color,
    }}>
      {children}
    </span>
  );
};

const SkeletonRows = () =>
  Array.from({ length: 5 }).map((_, i) => (
    <div
      key={i}
      className="grid gap-4 px-5 py-4 border-b border-gray-100 dark:border-gray-700/40 items-center"
      style={{ gridTemplateColumns: '1.2fr 1.4fr 1.6fr 1fr 1fr 1fr 1.2fr 1fr 0.8fr auto' }}
    >
      {Array.from({ length: 10 }).map((_, j) => (
        <Skeleton key={j} variant="rounded" height={13} sx={{ borderRadius: '6px' }} />
      ))}
    </div>
  ));

// ─── Main Component ───────────────────────────────────────────────────────────

const TableData = () => {
  const { data, loading, error } = useFetch('/bookings/latest');
  const { currentMode } = useStateContext();
  const bookings = data?.bookings;

  const isDark = currentMode === 'Dark';

  // Single source of truth for all text colors
  const c = {
    primary:   isDark ? '#f3f4f6' : '#1f2937',   // names, key values
    secondary: isDark ? '#9ca3af' : '#6b7280',   // email, phone, meta
    muted:     isDark ? '#6b7280' : '#9ca3af',   // confirmation, room no
    header:    isDark ? '#6b7280' : '#9ca3af',   // column headers
    border:    isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
    rowHover:  isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
  };

  const gridCols = '1.2fr 1.4fr 1.6fr 1fr 1fr 1fr 1.2fr 1fr 0.8fr auto';

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
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

      <div className="booking-scroll" style={{ minWidth: '960px' }}>

        {/* Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: gridCols,
            gap: '1rem',
            padding: '0.75rem 1.25rem',
            borderBottom: `1px solid ${c.border}`,
          }}
        >
          {['Confirmation','Guest','Email','Phone','Check-In','Check-Out','Payment','Room','Room No.',''].map((h) => (
            <span key={h} style={{
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: c.header,
            }}>
              {h}
            </span>
          ))}
        </div>

        {/* Loading */}
        {loading && <SkeletonRows />}

        {/* Error */}
        {error && (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#f87171', fontSize: '13px' }}>
            Failed to load bookings.
          </div>
        )}

        {/* Empty */}
        {!loading && !error && !bookings?.length && (
          <div style={{ padding: '4rem', textAlign: 'center', color: c.secondary, fontSize: '13px' }}>
            No recent bookings found.
          </div>
        )}

        {/* Rows */}
        {bookings?.map((row, i) => (
          <div
            key={row._id}
            className="booking-row"
            style={{
              display: 'grid',
              gridTemplateColumns: gridCols,
              gap: '1rem',
              padding: '1rem 1.25rem',
              borderBottom: `1px solid ${c.border}`,
              alignItems: 'center',
              opacity: 0,
              animation: 'rowFadeIn 0.3s ease forwards',
              animationDelay: `${i * 35}ms`,
            }}
          >
            {/* Confirmation */}
            <span style={{ fontFamily: 'monospace', fontSize: '11px', letterSpacing: '0.04em', color: c.muted }}>
              {row.confirmation || '—'}
            </span>

            {/* Guest */}
            <span style={{ fontSize: '13px', fontWeight: 600, color: c.primary }}>
              {formatName(row) || '—'}
            </span>

            {/* Email */}
            <span style={{ fontSize: '12px', color: c.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.email || '—'}
            </span>

            {/* Phone */}
            <span style={{ fontSize: '12px', color: c.secondary }}>
              {row.phone || '—'}
            </span>

            {/* Check-in */}
            <span style={{ fontSize: '12px', fontWeight: 500, color: c.primary }}>
              {formatDate(row.startDate)}
            </span>

            {/* Check-out */}
            <span style={{ fontSize: '12px', fontWeight: 500, color: c.primary }}>
              {formatDate(row.endDate)}
            </span>

            {/* Payment */}
            {row.paymentReference ? (
              <span style={{ fontFamily: 'monospace', fontSize: '11px', color: c.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {row.paymentReference}
              </span>
            ) : (
              <Badge variant="green">Transfer</Badge>
            )}

            {/* Room type */}
            <span style={{ fontSize: '12px', color: c.secondary }}>
              {row.roomTitle || '—'}
            </span>

            {/* Room numbers */}
            <span style={{ fontSize: '12px', color: c.muted }}>
              {formatRooms(row.roomNumbers)}
            </span>

            {/* Action */}
            <Link
              to={`/bookings/${row._id}`}
              state={{ data: row }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: '11px',
                fontWeight: 600,
                padding: '5px 12px',
                borderRadius: '8px',
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                color: c.secondary,
                border: `1px solid ${c.border}`,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(59,130,246,0.1)';
                e.currentTarget.style.color = '#3b82f6';
                e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
                e.currentTarget.style.color = c.secondary;
                e.currentTarget.style.borderColor = c.border;
              }}
            >
              View →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableData;