import { useState, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../hooks/api';
import { AuthContext } from '../context/AuthContextProvider';
import { EditRoom, EditUser, SingleDetails, EditBooking, EditFacility } from '../components';

// ─── Edit Form Map ────────────────────────────────────────────────────────────

const EDIT_COMPONENTS = {
  room:     EditRoom,
  user:     EditUser,
  facility: EditFacility,
  booking:  EditBooking,
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Single = ({ type }) => {
  const location = useLocation();
  const { data } = location.state;
  const { user } = useContext(AuthContext);

  const [edit,     setEdit]     = useState(false);
  const [room,     setRoom]     = useState(null);
  const [roomError, setRoomError] = useState(null);

  // Fetch room data for booking type
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
    <div className="space-y-6">

      {/* ── Info Card ── */}
      <div className="m-2 md:m-10 mt-24 p-5 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl relative">
        <button
          type="button"
          onClick={() => setEdit((prev) => !prev)}
          className="absolute top-0 right-0 px-4 py-2 text-sm md:text-base text-[#7451f8] bg-[#7551f818] hover:bg-[#7551f830] rounded-tr-3xl rounded-bl-lg transition-colors"
        >
          {edit ? 'Close' : 'Edit'}
        </button>

        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-5 dark:text-gray-200 capitalize">
          Information
        </h1>

        {roomError && (
          <p role="alert" className="text-sm text-red-500 mb-3">{roomError}</p>
        )}

        <SingleDetails
          type={type}
          data={data}
          img={room?.images?.[0] ?? null}
        />
      </div>

      {/* ── Edit Card ── */}
      {edit && EditComponent && (
        <div className="m-2 md:m-10 p-5 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
          <EditComponent item={data} setEdit={setEdit} />
        </div>
      )}

    </div>
  );
};

export default Single;