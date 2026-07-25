import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../hooks/api';
import { AuthContext } from '../context/AuthContextProvider';
import { bookingInputs } from '../Data/formsource';
import { useStateContext } from '../context/ContextProvider';

const EditBooking = ({ item, setEdit }) => {
  // A booking may be in either shape:
  //   - OLD (pre-multi-category): flat item.roomTitle / item.roomNumbers / item.price
  //   - NEW: item.rooms is an array of room-category line items, and the
  //     total is a DERIVED item.totalPrice (subtotal - discount), computed
  //     server-side from rooms + discount — it isn't a free-standing field
  //     you can just overwrite anymore.
  const isLegacyBooking = !Array.isArray(item.rooms) || item.rooms.length === 0;

  const [checkedIn, setCheckedIn] = useState(item.checkedIn);
  const [amount, setAmount] = useState(item.totalPrice ?? item.price ?? 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user }    = useContext(AuthContext);
  const navigate    = useNavigate();
  const { currentColor, currentMode } = useStateContext();
  const isDark = currentMode === 'Dark';

  // Payment tracking only exists on new-shape bookings — a legacy booking
  // has no `rooms` array, and addPayment's booking.save() would fail
  // required-field validation on one (rooms is required and non-empty).
  const [totalPrice, setTotalPrice]       = useState(item.totalPrice ?? 0);
  const [amountPaid, setAmountPaid]       = useState(item.amountPaid ?? 0);
  const [balanceDue, setBalanceDue]       = useState(item.balanceDue ?? 0);
  const [paymentStatus, setPaymentStatus] = useState(item.paymentStatus ?? 'unpaid');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentNote, setPaymentNote]     = useState('');
  const [recordingPayment, setRecordingPayment] = useState(false);
  const [paymentError, setPaymentError]   = useState(null);

  const c = {
    bg:      isDark ? '#2d3139' : '#ffffff',
    border:  isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    text:    isDark ? '#f3f4f6' : '#1f2937',
    muted:   isDark ? '#9ca3af' : '#6b7280',
    inputBg: isDark ? '#383c44' : '#f9fafb',
    surface: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
  };

  /* ── Handlers ── */
  const handleSelect = (e) => setCheckedIn(e.target.checked);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setPaymentError(null);

    const amt = Number(paymentAmount);
    if (!amt || amt <= 0) {
      setPaymentError('Enter a valid payment amount');
      return;
    }
    if (amt > balanceDue) {
      setPaymentError(`Payment cannot exceed the outstanding balance of ₦${balanceDue.toLocaleString()}`);
      return;
    }

    setRecordingPayment(true);
    try {
      const res = await api.put(`/bookings/${item._id}/payment`, {
        amount: amt,
        method: paymentMethod,
        note: paymentNote || undefined,
      }, {
        headers: { token: `Bearer ${user.token}` },
      });

      const updated = res.data?.booking || res.data;
      setAmountPaid(updated.amountPaid ?? amountPaid + amt);
      setBalanceDue(updated.balanceDue ?? Math.max(0, balanceDue - amt));
      setPaymentStatus(updated.paymentStatus ?? paymentStatus);
      setPaymentAmount('');
      setPaymentNote('');
    } catch (err) {
      console.log(err);
      setPaymentError(err.response?.data?.message || 'Failed to record payment. Please try again.');
    } finally {
      setRecordingPayment(false);
    }
  };

  const handleClick = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      // Send only the fields that actually changed — not the whole `item`
      // object. `price` is only meaningful (and only accepted server-side)
      // on a legacy booking; on a new booking, totalPrice is derived from
      // rooms + discount and this endpoint strips price-related fields
      // anyway, so there's nothing useful to send for it.
      const payload = isLegacyBooking
        ? { checkedIn, price: amount }
        : { checkedIn };

      await api.put(`/bookings/${item._id}`, payload, {
        headers: { token: `Bearer ${user.token}` },
      });
      navigate('/bookings');
    } catch (error) {
      console.log(error);
      setIsProcessing(false);
    }
  };

  // Build a room summary that works for both shapes: a single "Title
  // (numbers)" for a legacy booking, or a joined list of every category
  // for a new multi-category booking — e.g. "2× Deluxe (101, 102); 1×
  // Executive (201)".
  const roomSummary = isLegacyBooking
    ? `${item.roomTitle || "—"}${item.roomNumbers?.length ? ` (${item.roomNumbers.join(', ')})` : ''}`
    : item.rooms
        .map((r) => `${r.numberOfRooms}× ${r.roomTitle}${r.roomNumbers?.length ? ` (${r.roomNumbers.join(', ')})` : ''}`)
        .join('; ');

  /* ── Render ── */
  return (
    <div style={{ padding: '0 0.5rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{
          fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: c.muted, marginBottom: '4px',
        }}>
          Bookings
        </p>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: c.text, margin: 0 }}>
          Update Booking
        </h1>
      </div>

      <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* Disabled read-only fields & editable amount (legacy bookings only) */}
        {bookingInputs.map((input) => {
          const isAmountField = input.id === 'amount';
          const amountEditable = isAmountField && isLegacyBooking;
          return (
            <div key={input.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{
                fontSize: '10px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                color: c.muted,
              }}>
                {isAmountField && !isLegacyBooking ? `${input.label} (Total)` : input.label}
              </label>
              <input
                id={input.id}
                type={input.type}
                value={isAmountField ? amount : input.placeholder}
                onChange={amountEditable ? (e) => setAmount(Number(e.target.value)) : undefined}
                disabled={!amountEditable || isProcessing}
                style={{
                  height: '40px', padding: '0 14px',
                  fontSize: '13px', borderRadius: '10px',
                  border: `1px solid ${c.border}`,
                  background: amountEditable ? c.inputBg : c.surface,
                  color: amountEditable ? c.text : c.muted,
                  outline: 'none',
                  cursor: amountEditable && !isProcessing ? 'text' : 'not-allowed',
                  opacity: amountEditable && isProcessing ? 0.6 : amountEditable ? 1 : 0.7,
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={amountEditable && !isProcessing ? (e) => {
                  e.target.style.borderColor = currentColor;
                  e.target.style.boxShadow = `0 0 0 3px ${currentColor}25`;
                } : undefined}
                onBlur={amountEditable ? (e) => {
                  e.target.style.borderColor = c.border;
                  e.target.style.boxShadow = 'none';
                } : undefined}
              />
              {isAmountField && !isLegacyBooking && (
                <p style={{ fontSize: '10px', color: c.muted, margin: '2px 0 0' }}>
                  Computed from rooms and discount — use the booking's discount/payment tools to change it.
                </p>
              )}
            </div>
          );
        })}

        {/* Room info */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '6px',
        }}>
          <p style={{
            fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: c.muted, margin: 0,
          }}>
            Room{!isLegacyBooking && item.rooms.length > 1 ? 's' : ''}
          </p>
          <div style={{
            minHeight: '40px', padding: '8px 14px',
            fontSize: '13px', borderRadius: '10px',
            border: `1px solid ${c.border}`,
            background: c.surface, color: c.text,
            display: 'flex', alignItems: 'center', gap: '6px',
            opacity: isProcessing ? 0.6 : 1,
          }}>
            <span>{roomSummary}</span>
          </div>
        </div>

        {/* Payment (new-shape bookings only) */}
        {!isLegacyBooking && (
          <div style={{
            gridColumn: '1 / -1',
            display: 'flex', flexDirection: 'column', gap: '10px',
            padding: '1rem', borderRadius: '12px',
            border: `1px solid ${c.border}`, background: c.surface,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: c.text, margin: 0 }}>Payment</p>
              <span style={{
                fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '99px',
                background: paymentStatus === 'paid'
                  ? 'rgba(34,197,94,0.12)'
                  : paymentStatus === 'partial' ? 'rgba(249,115,22,0.12)' : 'rgba(239,68,68,0.12)',
                color: paymentStatus === 'paid' ? '#16a34a' : paymentStatus === 'partial' ? '#ea580c' : '#dc2626',
              }}>
                {paymentStatus === 'paid' ? 'Paid' : paymentStatus === 'partial' ? 'Partial' : 'Unpaid'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              {[
                { label: 'Total', value: totalPrice },
                { label: 'Paid', value: amountPaid },
                { label: 'Balance', value: balanceDue },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: c.muted }}>{label}</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: c.text }}>₦{Number(value).toLocaleString()}</span>
                </div>
              ))}
            </div>

            {balanceDue > 0 ? (
              <>
                {paymentError && (
                  <p style={{ fontSize: '12px', color: '#ef4444', margin: 0 }}>{paymentError}</p>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: c.muted }}>
                      Amount (₦)
                    </label>
                    <input
                      type="number" min={1} max={balanceDue}
                      placeholder={`Up to ${balanceDue.toLocaleString()}`}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      disabled={recordingPayment}
                      style={{
                        height: '38px', padding: '0 12px', fontSize: '13px', borderRadius: '10px',
                        border: `1px solid ${c.border}`, background: c.inputBg, color: c.text, outline: 'none',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: c.muted }}>
                      Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      disabled={recordingPayment}
                      style={{
                        height: '38px', padding: '0 12px', fontSize: '13px', borderRadius: '10px',
                        border: `1px solid ${c.border}`, background: c.inputBg, color: c.text, outline: 'none', cursor: 'pointer',
                      }}
                    >
                      <option value="cash">Cash</option>
                      <option value="transfer">Bank Transfer</option>
                      <option value="pos">POS / Card</option>
                      <option value="paystack">Paystack</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <input
                  type="text" placeholder="Note (optional)"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  disabled={recordingPayment}
                  style={{
                    height: '38px', padding: '0 12px', fontSize: '13px', borderRadius: '10px',
                    border: `1px solid ${c.border}`, background: c.inputBg, color: c.text, outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={handleRecordPayment}
                  disabled={recordingPayment}
                  style={{
                    alignSelf: 'flex-start', padding: '9px 20px', borderRadius: '10px',
                    background: currentColor, color: '#fff', fontSize: '13px', fontWeight: 600,
                    border: 'none', cursor: recordingPayment ? 'not-allowed' : 'pointer',
                    opacity: recordingPayment ? 0.7 : 1, transition: 'opacity 0.15s',
                  }}
                >
                  {recordingPayment ? 'Recording...' : 'Record Payment'}
                </button>
              </>
            ) : (
              <p style={{ fontSize: '12px', color: c.muted, margin: 0 }}>Fully paid — no balance outstanding.</p>
            )}
          </div>
        )}

        {/* Checked in toggle */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderRadius: '12px',
          border: `1px solid ${c.border}`,
          background: c.surface,
          opacity: isProcessing ? 0.6 : 1,
        }}>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: c.text, margin: 0 }}>
              Checked In
            </p>
            <p style={{ fontSize: '11px', color: c.muted, margin: '2px 0 0' }}>
              Mark guest as checked in
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCheckedIn((prev) => !prev)}
            disabled={isProcessing}
            role="switch"
            aria-checked={checkedIn}
            style={{
              width: '44px', height: '24px',
              borderRadius: '99px', border: 'none', cursor: isProcessing ? 'not-allowed' : 'pointer',
              background: checkedIn
                ? currentColor
                : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
              position: 'relative',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute',
              top: '3px',
              left: checkedIn ? '23px' : '3px',
              width: '18px', height: '18px',
              borderRadius: '50%', background: '#fff',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>

        {/* Actions */}
        <div style={{
          gridColumn: '1 / -1',
          display: 'flex', justifyContent: 'flex-end', gap: '10px',
          marginTop: '8px',
        }}>
          <button
            type="button"
            onClick={() => setEdit(false)}
            disabled={isProcessing}
            style={{
              padding: '10px 24px', borderRadius: '10px',
              background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
              color: '#ef4444',
              border: '1px solid rgba(239,68,68,0.2)',
              fontSize: '13px', fontWeight: 600, cursor: isProcessing ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
              opacity: isProcessing ? 0.6 : 1,
            }}
            onMouseEnter={(e) => !isProcessing && (e.currentTarget.style.background = 'rgba(239,68,68,0.18)')}
            onMouseLeave={(e) => !isProcessing && (e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)')}
          >
            Cancel
          </button>

          <button
            disabled={isProcessing}
            style={{
              padding: '10px 28px', borderRadius: '10px',
              background: currentColor, color: '#fff',
              fontSize: '13px', fontWeight: 600,
              border: 'none', cursor: isProcessing ? 'not-allowed' : 'pointer',
              boxShadow: `0 4px 14px ${currentColor}40`,
              transition: 'opacity 0.15s, transform 0.15s',
              opacity: isProcessing ? 0.7 : 1,
              display: 'flex', alignItems: 'center', gap: '8px',
            }}
            onClick={handleClick}
            onMouseEnter={(e) => !isProcessing && (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => !isProcessing && (e.currentTarget.style.opacity = '1')}
            onMouseDown={(e) => !isProcessing && (e.currentTarget.style.transform = 'scale(0.97)')}
            onMouseUp={(e) => !isProcessing && (e.currentTarget.style.transform = 'scale(1)')}
          >
            {isProcessing ? (
              <>
                <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
          {isProcessing && (
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          )}
        </div>

      </form>
    </div>
  );
};

export default EditBooking;