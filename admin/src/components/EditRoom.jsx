import React, { useContext, useState, useEffect } from 'react';
import api from '../hooks/api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DriveFolderUploadOutlinedIcon from '@mui/icons-material/DriveFolderUploadOutlined';
import { TextField, Chip } from '@mui/material';
import { AuthContext } from '../context/AuthContextProvider';
import { userInputs } from '../Data/formSource';

const EditRoom = ({ item, setEdit }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // ---------------- STATE ----------------
  const [info, setInfo] = useState(item);
  const [rooms, setRooms] = useState(item.roomNumbers || []);
  const [room, setRoom] = useState('');

  const [existingImages, setExistingImages] = useState(item.images || []);
  const [files, setFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // ---------------- CLEAN UP PREVIEW URLS ----------------
  useEffect(() => {
    return () => {
      previewImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  // ---------------- HANDLERS ----------------
  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleAddRoom = () => {
    if (room.trim() !== '') {
      setRooms([...rooms, { number: room }]);
      setRoom('');
    }
  };

  const handleRemoveExistingImage = (img, index) => {
    setImagesToDelete([...imagesToDelete, img]);
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleFileSelect = (e) => {
  if (!e.target.files) return;

  const selectedFiles = Array.from(e.target.files); // ✅ use Array.from
  setFiles(selectedFiles);

  const previews = selectedFiles.map((file) => URL.createObjectURL(file));
  setPreviewImages(previews);
};


  const handleRemovePreviewImage = (index) => {
    setPreviewImages(previewImages.filter((_, i) => i !== index));
    setFiles(files.filter((_, i) => i !== index));
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let uploadedImages = [];

      // Upload new images
      if (files.length > 0) {
        uploadedImages = await Promise.all(
          files.map(async (file) => {
            const data = new FormData();
            data.append('file', file);
            data.append('upload_preset', 'ka_unsigned');

            const res = await axios.post(
              'https://api.cloudinary.com/v1_1/di5m6uq4j/image/upload',
              data
            );

            return res.data.url;
          })
        );
      }

      const updatedRoom = {
        ...info,
        roomNumbers: rooms,
        images: [...existingImages, ...uploadedImages],
        imagesToDelete,
      };

      await api.put(`/rooms/${item._id}`, updatedRoom, {
        headers: { token: `Bearer ${user.token}` },
      });

      navigate('/rooms');
    } catch (err) {
      console.error(err);
    }
  };

  // ---------------- JSX ----------------
  return (
    <div>
      <h1 className="text-xl md:text-3xl font-extrabold mb-5 dark:text-gray-400">
        Edit Room
      </h1>

      <div className="lg:flex gap-5">
        {/* IMAGES SECTION */}
        <div className="lg:flex-1">
          {/* EXISTING IMAGES */}
          <div className="grid grid-cols-3 gap-3">
            {existingImages.length > 0 ? (
              existingImages.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img}
                    alt=""
                    className="w-full h-[120px] object-cover rounded"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 rounded"
                    onClick={() =>
                      handleRemoveExistingImage(img, index)
                    }
                  >
                    ✕
                  </button>
                </div>
              ))
            ) : (
              <img
                src="https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
                alt=""
                className="rounded"
              />
            )}
          </div>

          {/* NEW IMAGE PREVIEW */}
          {previewImages.length > 0 && (
          <div className="mt-5">
            <h4 className="text-sm font-semibold mb-2">New Images (Preview)</h4>
            <div className="grid grid-cols-3 gap-3">
              {previewImages.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img}
                    alt=""
                    className="w-full h-[120px] object-cover rounded"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 rounded"
                    onClick={() => handleRemovePreviewImage(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>

        {/* FORM SECTION */}
        <div className="flex-[2] mt-5 lg:mt-0">
          <form
            className="w-full md:flex md:flex-wrap gap-6 px-3"
            onSubmit={handleSubmit}
          >
            {/* FILE INPUT */}
            <div className="w-[45%]">
              <label
                htmlFor="file"
                className="flex items-center gap-2 text-lg font-semibold cursor-pointer"
              >
                Upload Images <DriveFolderUploadOutlinedIcon />
              </label>
              <input
                type="file"
                id="file"
                multiple
                hidden
                onChange={handleFileSelect}
              />
            </div>

            {/* ROOM INPUTS */}
            {userInputs.map((input) => (
              <div className="lg:w-[45%] w-full" key={input.id}>
                <TextField
                  fullWidth
                  label={input.label}
                  id={input.id}
                  type={input.type}
                  value={info[input.id] || ''}
                  onChange={handleChange}
                />
              </div>
            ))}

            {/* ROOM NUMBERS */}
            <div className="lg:w-[45%] w-full">
              <label>Rooms</label>

              <div className="flex gap-2 my-3 flex-wrap">
                {rooms.map((chip) => (
                  <Chip
                    key={chip.number}
                    label={chip.number}
                    size="small"
                    onDelete={() =>
                      setRooms(
                        rooms.filter((r) => r.number !== chip.number)
                      )
                    }
                  />
                ))}
              </div>

              <TextField
                className="w-[75%]"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Enter room number"
              />

              <button
                type="button"
                onClick={handleAddRoom}
                className="ml-2 px-4 py-2 bg-blue-700 text-white rounded"
              >
                Add
              </button>
            </div>

            {/* ACTION BUTTONS */}
            <div className="w-full flex gap-3 justify-end mt-6">
              <button
                type="submit"
                className="px-5 py-2 bg-teal-800 text-white rounded"
              >
                Update
              </button>

              <button
                type="button"
                onClick={() => setEdit(false)}
                className="px-5 py-2 bg-red-500 text-white rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditRoom;
