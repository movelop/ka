import React, { useState, useEffect, useContext } from 'react';
import api from '../hooks/api';
import { useNavigate } from 'react-router-dom';
import { TextField, Button } from '@mui/material';
import { AuthContext } from '../context/AuthContextProvider';
import { facilityInput } from '../Data/formSource';
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";

const EditFacility = ({ item, setEdit }) => {
  const [file, setFile] = useState(null);        // new selected file
  const [preview, setPreview] = useState("");    // image preview
  const [info, setInfo] = useState({});          // facility info
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Pre-fill existing data
  useEffect(() => {
    if (item) {
      setInfo({
        [facilityInput.id]: item[facilityInput.id] || ""
      });
      setPreview(item.image || "");
    }
  }, [item]);

  // Update preview when new file is selected
  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  // Handle input change
  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    if (!e.target.files) return;
    setFile(e.target.files[0]);
  };

  // Remove selected file
  const handleRemoveFile = () => {
    setFile(null);
    setPreview("");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = preview; // default to existing image

      // Upload new image if selected
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

      const updatedFacility = {
        ...info,
        image: imageUrl
      };

      await api.put(`/facilities/${item._id}`, updatedFacility, {
        headers: { token: `Bearer ${user.token}` },
      });

      navigate('/facilities');
      setEdit(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-6 md:p-10 bg-white rounded-3xl">
      <h1 className="text-2xl font-extrabold mb-6">Edit Facility</h1>
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>

        {/* Image preview */}
        {preview && (
          <div className="relative w-64 h-40">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
            {file && (
              <button
                type="button"
                className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 rounded"
                onClick={handleRemoveFile}
              >
                ✕
              </button>
            )}
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
        <div className="flex justify-end">
          <Button type="submit" variant="contained" color="primary">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditFacility;
