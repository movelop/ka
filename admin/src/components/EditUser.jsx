import React, { useState, useEffect, useContext } from "react";
import api from "../hooks/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { Checkbox, FormControlLabel, TextField } from "@mui/material";
import { userInputs } from "../Data/formsource";
import { AuthContext } from "../context/AuthContextProvider";
import { useStateContext } from "../context/ContextProvider";

const EditUser = ({ item, setEdit }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { currentColor, currentMode } = useStateContext();
  const isDark = currentMode === "Dark";

  const [info, setInfo] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [file, setFile] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [preview, setPreview] = useState("");

  const c = {
    bg:      isDark ? "#2d3139" : "#ffffff",
    border:  isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
    text:    isDark ? "#f3f4f6" : "#1f2937",
    muted:   isDark ? "#9ca3af" : "#6b7280",
    inputBg: isDark ? "#383c44" : "#f9fafb",
    surface: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
  };

  /* ── Prefill ── */
  useEffect(() => {
    if (!item) return;
    const initialInfo = {};
    userInputs.forEach((input) => {
      if (input.id === "firstname") initialInfo.firstName = item.firstName || "";
      else if (input.id === "lastname") initialInfo.lastName = item.lastName || "";
      else initialInfo[input.id] = item[input.id] || "";
    });
    setInfo(initialInfo);
    setIsAdmin(item.isAdmin || false);
    setExistingImage(item.image || "");
    setPreview("");
    setFile(null);
  }, [item]);

  /* ── Cleanup blob URLs ── */
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  /* ── Handlers ── */
  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleAdminChange = (e) => {
    setIsAdmin(e.target.checked);
  };

  const handleFileSelect = (e) => {
    if (!e.target.files?.length) return;
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const removePreview = () => { setFile(null); setPreview(""); };
  const removeExistingImage = () => { setExistingImage(""); };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = existingImage;
      if (file) {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "ka_unsigned");
        const uploadRes = await axios.post(
          "https://api.cloudinary.com/v1_1/di5m6uq4j/image/upload", data
        );
        imageUrl = uploadRes.data.url;
      }
      const updatedUser = {
        ...info,
        firstName: info.firstName || "",
        lastName: info.lastName || "",
        image: imageUrl || null,
      };
      if (!updatedUser.password?.trim()) delete updatedUser.password;
      await api.put(`/users/${item._id}`, updatedUser, {
        headers: { token: `Bearer ${user.token}` },
      });
      navigate("/users");
      setEdit(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const activeImage = preview || existingImage;

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
          Edit User
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
            {activeImage ? (
              <>
                <img
                  src={activeImage}
                  alt="User"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <button
                  type="button"
                  onClick={preview ? removePreview : removeExistingImage}
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
              </>
            ) : (
              <label htmlFor="file" style={{
                width: '100%', height: '100%',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '8px', cursor: 'pointer', color: c.muted,
              }}>
                <DriveFolderUploadOutlinedIcon style={{ fontSize: '2rem', color: currentColor }} />
                <span style={{ fontSize: '12px', fontWeight: 500 }}>Upload photo</span>
              </label>
            )}
          </div>

          {/* Replace photo link */}
          {activeImage && (
            <label htmlFor="file" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '6px', marginTop: '12px',
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
              Replace photo
            </label>
          )}

          <input type="file" id="file" onChange={handleFileSelect} hidden />
        </div>

        {/* ── Form ── */}
        <div style={{ flex: 2, minWidth: '280px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

              {/* Text inputs */}
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
                      value={info[id] || ""}
                      onChange={handleChange}
                      style={{
                        height: '40px', padding: '0 14px',
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
                );
              })}

              {/* Admin toggle */}
              <div style={{
                gridColumn: '1 / -1',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderRadius: '12px',
                border: `1px solid ${c.border}`,
                background: c.surface,
              }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: c.text, margin: 0 }}>
                    Administrator
                  </p>
                  <p style={{ fontSize: '11px', color: c.muted, margin: '2px 0 0' }}>
                    Grant full access to this user
                  </p>
                </div>
                {/* Keep original Checkbox logic, style the label only */}
                <FormControlLabel
                  label=""
                  control={
                    <Checkbox
                      checked={isAdmin}
                      onChange={handleAdminChange}
                      sx={{
                        color: c.muted,
                        '&.Mui-checked': { color: currentColor },
                      }}
                    />
                  }
                />
              </div>

              {/* Submit */}
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
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

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUser;