import React, { useState, useContext, useEffect } from 'react';
import api from '../hooks/api';
import { useNavigate } from 'react-router-dom';
import { TextField, Button } from '@mui/material';
import { AuthContext } from '../context/AuthContextProvider';
import { facilityInput } from '../Data/formSource';
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import axios from 'axios';

const NewFacility = () => {
  const [file, setFile] = useState(null);        // selected file
  const [preview, setPreview] = useState("");    // preview URL
  const [info, setInfo] = useState({});
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Update preview when file changes
  useEffect(() => {
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Clean up
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleFileSelect = (e) => {
    if (!e.target.files) return;
    setFile(e.target.files[0]);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = "";

      if (file) {
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', 'ka_unsigned');

        const uploadRes = await axios.post(
          "https://api.cloudinary.com/v1_1/di5m6uq4j/image/upload",
          data
        );
        imageUrl = uploadRes.data.url;
      }

      const newFacility = {
        ...info,
        image: imageUrl,
      };

      await api.post('/facilities', newFacility, {
        headers: { token: `Bearer ${user.token}` },
      });

      navigate('/facilities');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-6 md:p-10 bg-white rounded-3xl">
      <h1 className="text-2xl font-extrabold mb-6">Add New Facility</h1>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        
        {/* Image preview */}
        {preview && (
          <div className="relative w-64 h-40">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              type="button"
              className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 rounded"
              onClick={handleRemoveFile}
            >
              ✕
            </button>
          </div>
        )}

        {/* File upload */}
        <div className="flex items-center gap-2">
          <label htmlFor="file" className="flex items-center gap-2 cursor-pointer text-lg font-semibold">
            Image: <DriveFolderUploadOutlinedIcon />
          </label>
          <input
            type="file"
            id="file"
            onChange={handleFileSelect}
            style={{ display: "none" }}
          />
        </div>

        {/* Title input */}
        <TextField
          fullWidth
          id={facilityInput.id}
          label={facilityInput.label}
          placeholder={facilityInput.placeholder}
          type={facilityInput.type}
          value={info[facilityInput.id] || ''}
          onChange={handleChange}
        />

        {/* Submit */}
        <Button type="submit" variant="contained" color="primary">
          Add Facility
        </Button>
      </form>
    </div>
  );
};

export default NewFacility;
