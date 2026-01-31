import React, { useState, useContext } from 'react';
import api from '../hooks/api';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { Checkbox, FormControlLabel, TextField } from '@mui/material';
import { userInputs } from '../Data/formSource';
import { AuthContext } from '../context/AuthContextProvider';

const NewUser = () => {
  const [file, setFile] = useState("");
  const [info, setInfo] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Handle input changes
  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  // Admin checkbox toggle
  const handleSelect = (e) => {
    setIsAdmin(e.target.checked);
  };

  // ---------------- OUR CONFIRMED handleSubmit ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let profilePicUrl = "";

      // Upload image if selected
      if (file) {
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', 'dczars');

        const uploadRes = await axios.post(
          "https://api.cloudinary.com/v1_1/dmxz3k6o4/image/upload",
          data
        );
        profilePicUrl = uploadRes.data.url;
      }

      // Construct new user object
      const newUser = {
        ...info,
        firstName: info.firstName || info.firstname || "",
        lastName: info.lastName || info.lastname || "",
        isAdmin,
        imgage: profilePicUrl,
      };

      // Send to backend
      await api.post('/auth/register', newUser, {
        headers: { token: `Bearer ${user.token}` },
      });
      navigate('/users');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="m-2 md:m-10 mt-24 p-[20px] md:p-10 bg-white rounded-3xl">
      <div>
        <h1 className="text-xl md:text-3xl font-extrabold tracking tight mb-[20px] dark:text-gray-400 capitalize">Add New User</h1>
        <div className="lg:flex lg:gap-5">
          {/* Image Preview */}
          <div className="lg:flex-1">
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              }
              alt=""
              className='w-full rounded-lg object-cover'
            />
          </div>

          {/* Form */}
          <div className="flex-[2] mt-5 lg:mt-0">
            <form className='w-full md:flex md:flex-wrap md:gap-[30px] justify-between' onSubmit={handleSubmit}>
              {/* File Upload */}
              <div className="w-[45%]">
                <label htmlFor="file" className='flex items-center gap-2 text-xl font-semibold cursor-pointer'>
                  Image: <DriveFolderUploadOutlinedIcon />
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </div>

              {/* User Inputs */}
              {userInputs.map((input) => (
                <div className='lg:w-[45%] w-full mt-4 mb-4 md:mt-2 md:mb-2' key={input.id}>
                  <TextField
                    onChange={handleChange}
                    className="w-full"
                    placeholder={input.placeholder}
                    label={input.label}
                    variant="outlined"
                    id={input.id === "firstname" ? "firstName" : input.id === "lastname" ? "lastName" : input.id}
                    type={input.type}
                  />
                </div>
              ))}

              {/* Admin Checkbox */}
              <div className='lg:w-[45%] w-full mt-4 mb-4 md:mt-0 md:mb-2'>
                <FormControlLabel
                  label="Admin"
                  labelPlacement="start"
                  control={<Checkbox onChange={handleSelect} />}
                />
              </div>

              {/* Submit Button */}
              <div className="w-[100%] flex justify-end lg:pr-4">
                <button
                  type="submit"
                  className="py-[10px] px-[20px] text-white bg-teal-800 font-body cursor-pointer rounded-sm"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewUser;
