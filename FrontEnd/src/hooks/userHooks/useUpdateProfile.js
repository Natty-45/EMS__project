import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfileStart, updateProfileSuccess, updateProfileFailure } from '../../redux/userStore/userSlice';
import toast from 'react-hot-toast';

const useUpdateProfile = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser); // Accessing currentUser from Redux
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profilepic: '',
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const fileInputRef = useRef(null);

  // Set initial form data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName,
        username: currentUser.username,
        email: currentUser.email,
        password: '',
        confirmPassword: '',
        profilepic: currentUser.profilepic,
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profilepic: reader.result, // Save base64 string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    dispatch(updateProfileStart());

    try {
      const updatedData = {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        profilepic: formData.profilepic,
      };

      const res = await fetch(`/api/user/updateProfile/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
        credentials: 'include',
      });

      const data = await res.json();

      if (data.error) {
        dispatch(updateProfileFailure(data.error));
        toast.error(data.error);
        return;
      }

      // Update Redux store with the new user data
      dispatch(updateProfileSuccess(data));

      toast.success('Profile updated successfully');
    } catch (error) {
      dispatch(updateProfileFailure(error.message));
      toast.error(error.message);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible((prev) => !prev);
  };

  return {
    formData,
    passwordVisible,
    confirmPasswordVisible,
    handleChange,
    handleSubmit,
    togglePasswordVisibility,
    toggleConfirmPasswordVisibility,
    handleImageChange, // Add this to handle image change
  };
};

export default useUpdateProfile;