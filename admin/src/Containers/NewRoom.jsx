import React, { useContext, useState, useEffect } from 'react';
import api from '../hooks/api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DriveFolderUploadOutlinedIcon from '@mui/icons-material/DriveFolderUploadOutlined';
import { AuthContext } from '../context/AuthContextProvider';
import { roomInputs } from '../Data/formsource';
import { useStateContext } from '../context/ContextProvider';

const NewRoom = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
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

  const [info, setInfo]                   = useState({});
  const [rooms, setRooms]                 = useState([]);
  const [room, setRoom]                   = useState('');
  const [files, setFiles]                 = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [isProcessing, setIsProcessing]   = useState(false);

  /* ── Cleanup ── */
  useEffect(() => {
    return () => { previewImages.forEach((url) => URL.revokeObjectURL(url)); };
  }, [previewImages]);

  /* ── Handlers ── */
  const handleChange = (e) => setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));

  const handleAddRoom = () => {
    if (room.trim() !== '') { setRooms([...rooms, { number: room }]); setRoom(''); }
  };

  const handleFileSelect = (e) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    setPreviewImages(selectedFiles.map((file) => URL.createObjectURL(file)));
  };

  const handleRemovePreviewImage = (index) => {
    setPreviewImages(previewImages.filter((_, i) => i !== index));
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      let uploadedImages = [];
      if (files.length > 0) {
        uploadedImages = await Promise.all(
          files.map(async (file) => {
            const data = new FormData();
            data.append('file', file);
            data.append('upload_preset', 'ka_unsigned');
            const res = await axios.post(
              'https://api.cloudinary.com/v1_1/di5m6uq4j/image/upload', data
            );
            return res.data.url;
          })
        );
      }
      await api.post('/rooms', { ...info, roomNumbers: rooms, images: uploadedImages }, {
        headers: { token: `Bearer ${user.token}` },
      });
      navigate('/rooms');
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ padding: '0 0.5rem' }}>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{
          fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: c.muted, marginBottom: '4px',
        }}>
          Rooms
        </p>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: c.text, margin: 0 }}>
          Create New Room
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* ── Images panel ── */}
        <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          <p style={{
            fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: c.muted, margin: 0,
          }}>
            Room Images
          </p>

          {/* Preview grid */}
          {previewImages.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {previewImages.map((img, index) => (
                <div key={index} style={{
                  position: 'relative', borderRadius: '10px',
                  overflow: 'hidden', aspectRatio: '4/3',
                }}>
                  <img
                    src={img}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute', top: '6px', left: '6px',
                    fontSize: '9px', fontWeight: 700, padding: '2px 7px',
                    borderRadius: '99px', background: `${currentColor}cc`,
                    color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    New
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePreviewImage(index)}
                    disabled={isProcessing}
                    style={{
                      position: 'absolute', top: '6px', right: '6px',
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: 'rgba(239,68,68,0.9)', color: '#fff',
                      border: 'none', cursor: isProcessing ? 'not-allowed' : 'pointer',
                      fontSize: '11px', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background 0.15s',
                      opacity: isProcessing ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => !isProcessing && (e.currentTarget.style.background = 'rgba(220,38,38,1)')}
                    onMouseLeave={(e) => !isProcessing && (e.currentTarget.style.background = 'rgba(239,68,68,0.9)')}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Empty state */
            <div style={{
              aspectRatio: '4/3', borderRadius: '12px',
              border: `1px dashed ${c.border}`,
              background: c.surface,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '8px', color: c.muted,
            }}>
              <DriveFolderUploadOutlinedIcon style={{ fontSize: '2rem', color: currentColor }} />
              <span style={{ fontSize: '12px', fontWeight: 500 }}>No images yet</span>
            </div>
          )}

          {/* Upload button */}
          <label htmlFor="file" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            fontSize: '12px', fontWeight: 600,
            color: currentColor, cursor: isProcessing ? 'not-allowed' : 'pointer',
            padding: '8px 14px', borderRadius: '8px',
            border: `1px solid ${currentColor}40`,
            background: `${currentColor}10`,
            transition: 'background 0.15s',
            opacity: isProcessing ? 0.6 : 1,
            pointerEvents: isProcessing ? 'none' : 'auto',
          }}
            onMouseEnter={(e) => !isProcessing && (e.currentTarget.style.background = `${currentColor}20`)}
            onMouseLeave={(e) => !isProcessing && (e.currentTarget.style.background = `${currentColor}10`)}
          >
            <DriveFolderUploadOutlinedIcon style={{ fontSize: '16px' }} />
            {previewImages.length > 0 ? 'Replace images' : 'Upload images'}
          </label>
          <input type="file" id="file" multiple hidden onChange={handleFileSelect} disabled={isProcessing} />
        </div>

        {/* ── Form ── */}
        <div style={{ flex: 2, minWidth: '280px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

              {/* Room detail inputs */}
              {roomInputs.map((input) => (
                <div key={input.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor={input.id} style={{
                    fontSize: '10px', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    color: c.muted,
                  }}>
                    {input.label}
                  </label>
                  <input
                    id={input.id}
                    type={input.type}
                    value={info[input.id] || ''}
                    onChange={handleChange}
                    disabled={isProcessing}
                    style={{
                      height: '40px', padding: '0 14px',
                      fontSize: '13px', borderRadius: '10px',
                      border: `1px solid ${c.border}`,
                      background: c.inputBg, color: c.text,
                      outline: 'none',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                      opacity: isProcessing ? 0.6 : 1,
                      cursor: isProcessing ? 'not-allowed' : 'text',
                    }}
                    onFocus={(e) => {
                      if (!isProcessing) {
                        e.target.style.borderColor = currentColor;
                        e.target.style.boxShadow = `0 0 0 3px ${currentColor}25`;
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = c.border;
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              ))}

              {/* Room numbers */}
              <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{
                  fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: c.muted, margin: 0,
                }}>
                  Room Numbers
                </p>

                {rooms.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {rooms.map((chip) => (
                      <span key={chip.number} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        fontSize: '11px', fontWeight: 600,
                        padding: '3px 10px', borderRadius: '99px',
                        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                        color: c.text,
                        border: `1px solid ${c.border}`,
                        opacity: isProcessing ? 0.6 : 1,
                      }}>
                        {chip.number}
                        <button
                          type="button"
                          onClick={() => setRooms(rooms.filter((r) => r.number !== chip.number))}
                          disabled={isProcessing}
                          style={{
                            background: 'none', border: 'none', cursor: isProcessing ? 'not-allowed' : 'pointer',
                            color: c.muted, fontSize: '11px', lineHeight: 1, padding: '0 2px',
                            transition: 'color 0.15s',
                          }}
                          onMouseEnter={(e) => !isProcessing && (e.currentTarget.style.color = '#ef4444')}
                          onMouseLeave={(e) => !isProcessing && (e.currentTarget.style.color = c.muted)}
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="Room number"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRoom())}
                    disabled={isProcessing}
                    style={{
                      flex: 1, height: '40px', padding: '0 14px',
                      fontSize: '13px', borderRadius: '10px',
                      border: `1px solid ${c.border}`,
                      background: c.inputBg, color: c.text,
                      outline: 'none',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                      opacity: isProcessing ? 0.6 : 1,
                      cursor: isProcessing ? 'not-allowed' : 'text',
                    }}
                    onFocus={(e) => {
                      if (!isProcessing) {
                        e.target.style.borderColor = currentColor;
                        e.target.style.boxShadow = `0 0 0 3px ${currentColor}25`;
                      }
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = c.border;
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddRoom}
                    disabled={isProcessing}
                    style={{
                      padding: '0 18px', height: '40px',
                      borderRadius: '10px', border: 'none',
                      background: `${currentColor}18`, color: currentColor,
                      fontSize: '12px', fontWeight: 600, cursor: isProcessing ? 'not-allowed' : 'pointer',
                      transition: 'background 0.15s', whiteSpace: 'nowrap',
                      opacity: isProcessing ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => !isProcessing && (e.currentTarget.style.background = `${currentColor}30`)}
                    onMouseLeave={(e) => !isProcessing && (e.currentTarget.style.background = `${currentColor}18`)}
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  type="submit"
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
                  onMouseEnter={(e) => !isProcessing && (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => !isProcessing && (e.currentTarget.style.opacity = '1')}
                  onMouseDown={(e) => !isProcessing && (e.currentTarget.style.transform = 'scale(0.97)')}
                  onMouseUp={(e) => !isProcessing && (e.currentTarget.style.transform = 'scale(1)')}
                >
                  {isProcessing ? (
                    <>
                      <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                      Uploading...
                    </>
                  ) : (
                    'Create Room'
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

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewRoom;