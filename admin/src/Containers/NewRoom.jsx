import React, { useContext, useState, useEffect } from 'react';
import api from '../hooks/api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DriveFolderUploadOutlinedIcon from '@mui/icons-material/DriveFolderUploadOutlined';
import { TextField, Chip } from '@mui/material';
import { AuthContext } from '../context/AuthContextProvider';
import { roomInputs } from '../Data/formSource';

const NewRoom = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [info, setInfo] = useState({});
  const [rooms, setRooms] = useState([]);
  const [room, setRoom] = useState('');

  const [files, setFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  // Clean up preview URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      previewImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewImages]);

  // Handle input changes
  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  // Add a room number
  const handleAddRoom = () => {
    if (room.trim() !== '') {
      setRooms([...rooms, { number: room }]);
      setRoom('');
    }
  };

  // Handle file selection & generate preview
  const handleFileSelect = (e) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    const previews = selectedFiles.map((file) =>
      URL.createObjectURL(file)
    );
    setPreviewImages(previews);
  };

  // Remove a preview image before upload
  const handleRemovePreviewImage = (index) => {
    setPreviewImages(previewImages.filter((_, i) => i !== index));
    setFiles(files.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let uploadedImages = [];

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

      const newRoom = {
        ...info,
        roomNumbers: rooms,
        images: uploadedImages,
      };

      await api.post('/rooms', newRoom, {
        headers: { token: `Bearer ${user.token}` },
      });

      navigate('/rooms');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="text-xl md:text-3xl font-extrabold mb-5 dark:text-gray-400">
        Create New Room
      </h1>

      <div className="lg:flex gap-5">
        {/* IMAGE UPLOAD & PREVIEW */}
        <div className="lg:flex-1">
          {previewImages.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
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
          )}

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

        {/* FORM */}
        <div className="flex-[2] mt-5 lg:mt-0">
          <form
            className="w-full md:flex md:flex-wrap gap-6 px-3"
            onSubmit={handleSubmit}
          >
            {/* ROOM DETAILS INPUTS */}
            {roomInputs.map((input) => (
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
                      setRooms(rooms.filter((r) => r.number !== chip.number))
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

            {/* SUBMIT BUTTON */}
            <div className="w-full flex gap-3 justify-end mt-6">
              <button
                type="submit"
                className="px-5 py-2 bg-teal-800 text-white rounded"
              >
                Create Room
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewRoom;