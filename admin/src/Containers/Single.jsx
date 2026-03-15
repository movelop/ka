import { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../hooks/api';
import { AuthContext } from '../context/AuthContextProvider';
import { EditRoom, EditUser, SingleDetails, EditBooking, EditFacility } from '../components';
import { useStateContext } from '../context/ContextProvider';

// ─── Edit Form Map ────────────────────────────────────────────────────────────

const EDIT_COMPONENTS = {
  room:     EditRoom,
  user:     EditUser,
  facility: EditFacility,
  booking:  EditBooking,
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Single = ({ type }) => {
  const location  = useLocation();
  const { data }  = location.state;
  const { user }  = useContext(AuthContext);
  const { currentColor, currentMode } = useStateContext();
  const isDark = currentMode === 'Dark';

  const [edit,      setEdit]      = useState(false);
  const [room,      setRoom]      = useState(null);
  const [roomError, setRoomError] = useState(null);

  const c = {
    bg:     isDark ? '#2d3139' : '#ffffff',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    text:   isDark ? '#f3f4f6' : '#1f2937',
    muted:  isDark ? '#9ca3af' : '#6b7280',
  };

  /* ── Fetch room for booking type ── */
  useEffect(() => {
    if (type !== 'booking' || !user?.token || !data?.roomTitle) return;
    const fetchRoom = async () => {
      setRoomError(null);
      try {
        const res = await api.get('/rooms', {
          headers: { token: `Bearer ${user.token}` },
        });
        const match = (res.data?.rooms || []).find((r) => r.title === data.roomTitle);
        setRoom(match ?? null);
      } catch (err) {
        console.error('Failed to fetch room:', err);
        setRoomError('Could not load room details.');
      }
    };
    fetchRoom();
  }, [type, data?.roomTitle, user?.token]);

  const EditComponent = EDIT_COMPONENTS[type] ?? null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Info card ── */}
      <div style={{
        margin: '1.5rem',
        marginTop: '6rem',
        padding: '2rem',
        background: c.bg,
        borderRadius: '20px',
        border: `1px solid ${c.border}`,
        position: 'relative',
      }}>

        {/* Edit toggle */}
        <button
          type="button"
          onClick={() => setEdit((prev) => !prev)}
          style={{
            position: 'absolute', top: 0, right: 0,
            padding: '10px 20px',
            borderRadius: '0 20px 0 12px',
            fontSize: '12px', fontWeight: 600,
            border: 'none', cursor: 'pointer',
            background: edit
              ? isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)'
              : `${currentColor}15`,
            color: edit ? '#ef4444' : currentColor,
            transition: 'background 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = edit
              ? 'rgba(239,68,68,0.2)'
              : `${currentColor}25`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = edit
              ? isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)'
              : `${currentColor}15`;
          }}
        >
          {edit ? 'Close ✕' : 'Edit →'}
        </button>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{
            fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: c.muted, marginBottom: '4px',
          }}>
            {type}
          </p>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: c.text, margin: 0 }}>
            Information
          </h1>
        </div>

        {/* Error */}
        {roomError && (
          <div role="alert" style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 14px', borderRadius: '10px',
            marginBottom: '1rem', fontSize: '13px',
            background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${isDark ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.15)'}`,
            color: '#ef4444',
          }}>
            ⚠ {roomError}
          </div>
        )}

        <SingleDetails
          type={type}
          data={data}
          img={room?.images?.[0] ?? null}
        />
      </div>

      {/* ── Edit card ── */}
      {edit && EditComponent && (
        <div style={{
          margin: '0 1.5rem 1.5rem',
          padding: '2rem',
          background: c.bg,
          borderRadius: '20px',
          border: `1px solid ${c.border}`,
          animation: 'fadeIn 0.2s ease-out both',
        }}>
          <EditComponent item={data} setEdit={setEdit} />
        </div>
      )}

    </div>
  );
};

export default Single;