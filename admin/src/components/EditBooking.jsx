import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../hooks/api';
import { AuthContext } from '../context/AuthContextProvider';
import { bookingInputs } from '../Data/formsource';
import { useStateContext } from '../context/ContextProvider';

const EditBooking = ({ item, setEdit }) => {
  const [checkedIn, setCheckedIn] = useState(item.checkedIn);
  const [amount, setAmount] = useState(item.price || 0);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user }    = useContext(AuthContext);
  const navigate    = useNavigate();
  const { currentColor, currentMode } = useStateContext();
  const isDark = currentMode === 'Dark';

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

  const handleClick = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await api.put(`/bookings/${item._id}`, { ...item, checkedIn, price: amount }, {
        headers: { token: `Bearer ${user.token}` },
      });
      navigate('/bookings');
    } catch (error) {
      console.log(error);
      setIsProcessing(false);
    }
  };

  const roomNumbers = item.roomNumbers.length > 1
    ? item.roomNumbers.map((r) => r).join(', ')
    : item.roomNumbers.map((r) => r).join('');

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

        {/* Disabled read-only fields & editable amount */}
        {bookingInputs.map((input) => {
          const isAmountField = input.id === 'amount';
          return (
            <div key={input.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{
                fontSize: '10px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                color: c.muted,
              }}>
                {input.label}
              </label>
              <input
                id={input.id}
                type={input.type}
                value={isAmountField ? amount : input.placeholder}
                onChange={isAmountField ? (e) => setAmount(Number(e.target.value)) : undefined}
                disabled={!isAmountField || isProcessing}
                style={{
                  height: '40px', padding: '0 14px',
                  fontSize: '13px', borderRadius: '10px',
                  border: `1px solid ${c.border}`,
                  background: isAmountField ? c.inputBg : c.surface,
                  color: isAmountField ? c.text : c.muted,
                  outline: 'none',
                  cursor: isAmountField && !isProcessing ? 'text' : 'not-allowed',
                  opacity: isAmountField && isProcessing ? 0.6 : isAmountField ? 1 : 0.7,
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={isAmountField && !isProcessing ? (e) => {
                  e.target.style.borderColor = currentColor;
                  e.target.style.boxShadow = `0 0 0 3px ${currentColor}25`;
                } : undefined}
                onBlur={isAmountField ? (e) => {
                  e.target.style.borderColor = c.border;
                  e.target.style.boxShadow = 'none';
                } : undefined}
              />
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
            Room
          </p>
          <div style={{
            height: '40px', padding: '0 14px',
            fontSize: '13px', borderRadius: '10px',
            border: `1px solid ${c.border}`,
            background: c.surface, color: c.text,
            display: 'flex', alignItems: 'center', gap: '6px',
            opacity: isProcessing ? 0.6 : 1,
          }}>
            <span style={{ fontWeight: 500 }}>{item.roomTitle}</span>
            <span style={{ color: c.muted, fontSize: '12px' }}>
              ({roomNumbers})
            </span>
          </div>
        </div>

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