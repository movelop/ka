import React, { useState, useContext } from 'react';
import api from '../hooks/api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { userInputs } from '../Data/formsource';
import { AuthContext } from '../context/AuthContextProvider';
import { useStateContext } from '../context/ContextProvider';

const NewUser = () => {
  const [file, setFile]       = useState("");
  const [info, setInfo]       = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate              = useNavigate();
  const { user }              = useContext(AuthContext);
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
  const handleChange = (e) => setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  const handleSelect = (e) => setIsAdmin(e.target.checked);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      let profilePicUrl = "";
      if (file) {
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', 'ka_unsigned');
        const uploadRes = await axios.post(
          'https://api.cloudinary.com/v1_1/di5m6uq4j/image/upload', data
        );
        profilePicUrl = uploadRes.data.url;
      }
      const newUser = {
        ...info,
        firstName: info.firstName || info.firstname || "",
        lastName:  info.lastName  || info.lastname  || "",
        isAdmin,
        imgage: profilePicUrl,
      };
      await api.post('/auth/register', newUser, {
        headers: { token: `Bearer ${user.token}` },
      });
      navigate('/users');
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  /* ── Render ── */
  return (
    <div style={{
      margin: '1.5rem',
      marginTop: '6rem',
      padding: '2rem',
      background: c.bg,
      borderRadius: '20px',
      border: `1px solid ${c.border}`,
    }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{
          fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: c.muted, marginBottom: '4px',
        }}>
          Users
        </p>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: c.text, margin: 0 }}>
          Add New User
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* ── Image section ── */}
        <div style={{ flex: 1, minWidth: '180px', maxWidth: '260px' }}>
          <div style={{
            width: '100%', aspectRatio: '1',
            borderRadius: '16px', overflow: 'hidden',
            border: `1px solid ${c.border}`,
            background: c.surface,
            position: 'relative',
          }}>
            {file ? (
              <>
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <button
                  type="button"
                  onClick={() => setFile("")}
                  disabled={isProcessing}
                  style={{
                    position: 'absolute', top: '10px', right: '10px',
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'rgba(239,68,68,0.9)', color: '#fff',
                    border: 'none', cursor: isProcessing ? 'not-allowed' : 'pointer',
                    fontSize: '12px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.15s',
                    opacity: isProcessing ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => !isProcessing && (e.currentTarget.style.background = 'rgba(220,38,38,1)')}
                  onMouseLeave={(e) => !isProcessing && (e.currentTarget.style.background = 'rgba(239,68,68,0.9)')}
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </>
            ) : (
              <label htmlFor="file" style={{
                width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '8px', cursor: isProcessing ? 'not-allowed' : 'pointer', color: c.muted,
                opacity: isProcessing ? 0.6 : 1,
              }}>
                <DriveFolderUploadOutlinedIcon style={{ fontSize: '2rem', color: currentColor }} />
                <span style={{ fontSize: '12px', fontWeight: 500 }}>Upload photo</span>
              </label>
            )}
          </div>

          {/* Replace photo */}
          {file && (
            <label htmlFor="file" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '6px', marginTop: '12px',
              fontSize: '12px', fontWeight: 600,
              color: currentColor, cursor: isProcessing ? 'not-allowed' : 'pointer',
              padding: '7px 14px', borderRadius: '8px',
              border: `1px solid ${currentColor}40`,
              background: `${currentColor}10`,
              transition: 'background 0.15s',
              opacity: isProcessing ? 0.6 : 1,
              pointerEvents: isProcessing ? 'none' : 'auto',
            }}
              onMouseEnter={(e) => !isProcessing && (e.currentTarget.style.background = `${currentColor}20`)}
              onMouseLeave={(e) => !isProcessing && (e.currentTarget.style.background = `${currentColor}10`)}
            >
              <DriveFolderUploadOutlinedIcon style={{ fontSize: '15px' }} />
              Replace photo
            </label>
          )}

          <input
            type="file"
            id="file"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ display: 'none' }}
            disabled={isProcessing}
          />
        </div>

        {/* ── Form ── */}
        <div style={{ flex: 2, minWidth: '280px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

              {/* User inputs */}
              {userInputs.map((input) => {
                const id = input.id === "firstname" ? "firstName"
                         : input.id === "lastname"  ? "lastName"
                         : input.id;
                return (
                  <div key={input.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label htmlFor={id} style={{
                      fontSize: '10px', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                      color: c.muted,
                    }}>
                      {input.label}
                    </label>
                    <input
                      id={id}
                      type={input.type}
                      placeholder={input.placeholder}
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
                );
              })}

              {/* Admin toggle */}
              <div style={{
                gridColumn: '1 / -1',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderRadius: '12px',
                border: `1px solid ${c.border}`,
                background: c.surface,
                opacity: isProcessing ? 0.6 : 1,
              }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: c.text, margin: 0 }}>
                    Administrator
                  </p>
                  <p style={{ fontSize: '11px', color: c.muted, margin: '2px 0 0' }}>
                    Grant full access to this user
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdmin((prev) => !prev)}
                  disabled={isProcessing}
                  role="switch"
                  aria-checked={isAdmin}
                  style={{
                    width: '44px', height: '24px',
                    borderRadius: '99px', border: 'none', cursor: isProcessing ? 'not-allowed' : 'pointer',
                    background: isAdmin
                      ? currentColor
                      : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                    position: 'relative',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    position: 'absolute', top: '3px',
                    left: isAdmin ? '23px' : '3px',
                    width: '18px', height: '18px',
                    borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </button>
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
                    'Create User'
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

export default NewUser;