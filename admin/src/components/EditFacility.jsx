import React, { useState, useEffect, useContext } from 'react';
import api from '../hooks/api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextProvider';
import { facilityInput } from '../Data/formsource';
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useStateContext } from '../context/ContextProvider';

const EditFacility = ({ item, setEdit }) => {
  const [file, setFile]       = useState(null);
  const [preview, setPreview] = useState("");
  const [info, setInfo]       = useState({});
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

  /* ── Pre-fill ── */
  useEffect(() => {
    if (item) {
      setInfo({ [facilityInput.id]: item[facilityInput.id] || "" });
      setPreview(item.image || "");
    }
  }, [item]);

  /* ── Blob preview ── */
  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  /* ── Handlers ── */
  const handleChange     = (e) => setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  const handleFileSelect = (e) => { if (e.target.files) setFile(e.target.files[0]); };
  const handleRemoveFile = () => { setFile(null); setPreview(""); };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = preview;
      if (file) {
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', 'ka_unsigned');
        const uploadRes = await axios.post(
          "https://api.cloudinary.com/v1_1/di5m6uq4j/image/upload", data
        );
        imageUrl = uploadRes.data.url;
      }
      await api.put(`/facilities/${item._id}`, { ...info, image: imageUrl }, {
        headers: { token: `Bearer ${user.token}` },
      });
      navigate('/facilities');
      setEdit(false);
    } catch (err) {
      console.error(err);
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
      maxWidth: '640px',
    }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{
          fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.08em', color: c.muted, marginBottom: '4px',
        }}>
          Facilities
        </p>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: c.text, margin: 0 }}>
          Edit Facility
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Image preview */}
        <div style={{
          width: '100%', aspectRatio: '16/9',
          borderRadius: '16px', overflow: 'hidden',
          border: `1px solid ${c.border}`,
          background: c.surface,
          position: 'relative',
        }}>
          {preview ? (
            <>
              <img
                src={preview}
                alt="Facility preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {file && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  style={{
                    position: 'absolute', top: '10px', right: '10px',
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: 'rgba(239,68,68,0.9)', color: '#fff',
                    border: 'none', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(220,38,38,1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.9)'}
                  aria-label="Remove image"
                >
                  ✕
                </button>
              )}
            </>
          ) : (
            <label htmlFor="file" style={{
              width: '100%', height: '100%',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '8px', cursor: 'pointer', color: c.muted,
            }}>
              <DriveFolderUploadOutlinedIcon style={{ fontSize: '2.5rem', color: currentColor }} />
              <span style={{ fontSize: '12px', fontWeight: 500 }}>Upload facility image</span>
            </label>
          )}
        </div>

        {/* Replace photo */}
        {preview && (
          <label htmlFor="file" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            alignSelf: 'flex-start',
            fontSize: '12px', fontWeight: 600,
            color: currentColor, cursor: 'pointer',
            padding: '7px 14px', borderRadius: '8px',
            border: `1px solid ${currentColor}40`,
            background: `${currentColor}10`,
            transition: 'background 0.15s',
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = `${currentColor}20`}
            onMouseLeave={(e) => e.currentTarget.style.background = `${currentColor}10`}
          >
            <DriveFolderUploadOutlinedIcon style={{ fontSize: '15px' }} />
            Replace image
          </label>
        )}

        <input type="file" id="file" onChange={handleFileSelect} style={{ display: 'none' }} />

        {/* Title input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label htmlFor={facilityInput.id} style={{
            fontSize: '10px', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            color: c.muted,
          }}>
            {facilityInput.label}
          </label>
          <input
            id={facilityInput.id}
            type={facilityInput.type}
            placeholder={facilityInput.placeholder}
            value={info[facilityInput.id] || ''}
            onChange={handleChange}
            style={{
              height: '42px', padding: '0 14px',
              fontSize: '13px', borderRadius: '10px',
              border: `1px solid ${c.border}`,
              background: c.inputBg, color: c.text,
              outline: 'none',
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = currentColor;
              e.target.style.boxShadow = `0 0 0 3px ${currentColor}25`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = c.border;
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            style={{
              padding: '10px 28px', borderRadius: '10px',
              background: currentColor, color: '#fff',
              fontSize: '13px', fontWeight: 600,
              border: 'none', cursor: 'pointer',
              boxShadow: `0 4px 14px ${currentColor}40`,
              transition: 'opacity 0.15s, transform 0.15s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Save Changes
          </button>
        </div>

      </form>
    </div>
  );
};

export default EditFacility;