import React, { useState, useEffect, useContext } from "react";
import api from "../hooks/api";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { Checkbox, FormControlLabel, TextField } from "@mui/material";
import { userInputs } from "../Data/formSource";
import { AuthContext } from "../context/AuthContextProvider";

const EditUser = ({ item, setEdit }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [info, setInfo] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);

  // image states
  const [file, setFile] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [preview, setPreview] = useState("");

  /* ===============================
     Prefill user data
  =============================== */
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

  /* ===============================
     Cleanup blob URLs
  =============================== */
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  /* ===============================
     Handlers
  =============================== */
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

  const removePreview = () => {
    setFile(null);
    setPreview("");
  };

  const removeExistingImage = () => {
    setExistingImage("");
  };

  /* ===============================
     Submit
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrl = existingImage;

      // Upload new image only if selected
      if (file) {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "ka_unsigned");

        const uploadRes = await axios.post(
          "https://api.cloudinary.com/v1_1/di5m6uq4j/image/upload",
          data
        );

        imageUrl = uploadRes.data.url;
      }

      const updatedUser = {
        ...info,
        firstName: info.firstName || "",
        lastName: info.lastName || "",
        image: imageUrl || null,
      };

      // Do not update password if empty
      if (!updatedUser.password?.trim()) {
        delete updatedUser.password;
      }

      await api.put(`/users/${item._id}`, updatedUser, {
        headers: { token: `Bearer ${user.token}` },
      });

      navigate("/users");
      setEdit(false);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  /* ===============================
     Render
  =============================== */
  return (
    <div className="m-2 md:m-10 mt-24 p-5 md:p-10 bg-white rounded-3xl">
      <h1 className="text-xl md:text-3xl font-extrabold mb-6 capitalize">
        Edit User
      </h1>

      <div className="lg:flex gap-6">
        {/* IMAGE SECTION */}
        <div className="lg:flex-1">
          {/* Preview image */}
          {preview && (
            <div className="relative">
              <img src={preview} className="w-full rounded-lg object-cover" />
              <button
                type="button"
                onClick={removePreview}
                className="absolute top-2 right-2 bg-red-600 text-white px-2 rounded text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* Existing image */}
          {!preview && existingImage && (
            <div className="relative">
              <img
                src={existingImage}
                className="w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={removeExistingImage}
                className="absolute top-2 right-2 bg-red-600 text-white px-2 rounded text-xs"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* FORM */}
        <div className="flex-[2]">
          <form
            onSubmit={handleSubmit}
            className="flex flex-wrap gap-6 justify-between"
          >
            {/* Upload */}
            <div className="w-full md:w-[45%]">
              <label
                htmlFor="file"
                className="flex items-center gap-2 font-semibold cursor-pointer"
              >
                Image <DriveFolderUploadOutlinedIcon />
              </label>
              <input
                type="file"
                id="file"
                onChange={handleFileSelect}
                hidden
              />
            </div>

            {/* Inputs */}
            {userInputs.map((input) => {
              const id =
                input.id === "firstname"
                  ? "firstName"
                  : input.id === "lastname"
                  ? "lastName"
                  : input.id;

              return (
                <div key={input.id} className="w-full md:w-[45%]">
                  <TextField
                    fullWidth
                    label={input.label}
                    id={id}
                    type={input.type}
                    value={info[id] || ""}
                    onChange={handleChange}
                  />
                </div>
              );
            })}

            {/* Admin */}
            <div className="w-full md:w-[45%]">
              <FormControlLabel
                label="Admin"
                labelPlacement="start"
                control={
                  <Checkbox checked={isAdmin} onChange={handleAdminChange} />
                }
              />
            </div>

            {/* Submit */}
            <div className="w-full flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-teal-800 text-white rounded"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
