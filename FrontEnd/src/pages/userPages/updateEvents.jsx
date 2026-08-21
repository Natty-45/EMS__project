import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { UserCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { useUpdateEvent } from '../../hooks/userHooks/useUpdateEvents';
import { useDeleteEvent } from '../../hooks/eventHooks/useDeleteEvent';
import { useSelector } from 'react-redux';

const UpdateEvent = () => {
  const { theme } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);
  const { updateEvent, loading: updating, error: updateError } = useUpdateEvent();
  const { deleteEvent, loading: deleting, error: deleteError } = useDeleteEvent();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    StartTime: '',
    location: '',
    images: [], // string URLs from DB
    eventType: 'Public',
    eventCategory: 'Concert',
    host: '',
    eventPassword: '',
  });

  const [selectedImages, setSelectedImages] = useState([]); // new File objects user selects
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  const formRef = useRef(null);

  // Fetch event details on mount
  useEffect(() => {
    if (!currentUser) {
      toast.error('Please log in first');
      navigate('/login');
      return;
    }
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/event/${id}`, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch event');
        const data = await res.json();

        setFormData({
          title: data.title || '',
          description: data.description || '',
          date: data.date ? data.date.slice(0, 10) : '',
          StartTime: data.StartTime || '',
          location: data.location || '',
          images: Array.isArray(data.image) ? data.image : data.image ? [data.image] : [],
          eventType: data.eventType || 'Public',
          eventCategory: data.eventCategory || 'Concert',
          host: data.host || '',
          eventPassword: data.eventPassword || '',
        });
      } catch (error) {
        toast.error(error.message);
        navigate('/my-events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const updatedImages = [...selectedImages, ...files].slice(0, 7);
    setSelectedImages(updatedImages);
  };

  const handleImageRemove = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleExistingImageRemove = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  // ONLY this is changed:
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const totalImagesCount = formData.images.length + selectedImages.length;
      if (totalImagesCount < 3 || totalImagesCount > 7) {
        toast.error('You must have between 3 and 7 images.');
        return;
      }

      // Build FormData manually, using formRef (your form) and appending files + old images JSON
      const form = new FormData(formRef.current);

      // Append old images JSON separately (your backend expects this key)
      form.set('existingImages', JSON.stringify(formData.images));

      // Append new images files
      selectedImages.forEach((img) => {
        form.append('images', img);
      });

      // Debug (optional)
      for (let pair of form.entries()) {
        console.log(pair[0], pair[1]);
      }

      // Call your updateEvent hook (make sure it supports FormData)
      const updated = await updateEvent(id, form, currentUser.token);

      if (updated) {
        toast.success('Event updated successfully!');
        navigate('/my-events');
      } else {
        toast.error('Failed to update event.');
      }
    } catch (error) {
      console.error('Update Event Error:', error.message);
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    const deleted = await deleteEvent(id);
    if (deleted) {
      toast.success('Event deleted successfully!');
      navigate('/my-events');
    } else {
      toast.error('Failed to delete event.');
    }
  };

  if (loading) {
    return <p className={`text-center pt-20 ${theme.text}`}>Loading event details...</p>;
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.background} pt-20 px-4`}>
      <div className="bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg p-8 rounded-lg shadow-lg max-w-5xl w-full mt-20 mb-10">
        <h2 className={`text-4xl font-bold text-center mb-6 ${theme.text}`}>Update Event</h2>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className={`block text-lg font-semibold mb-2 ${theme.text}`}>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300"
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className={`block text-lg font-semibold mb-2 ${theme.text}`}>Upload Images</label>
              <div className="relative">
                <label className="cursor-pointer inline-block">
                  <UserCircleIcon className="h-16 w-16 text-gray-500 absolute top-0 left-0" />
                  <input
                    type="file"
                    name="images" // IMPORTANT: name should match expected backend field
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const total = formData.images.length + selectedImages.length;
                    if (total < 3 || total > 7) {
                      toast.error('You must have between 3 and 7 images.');
                      return;
                    }
                    toast.success('Images ready to upload!');
                  }}
                  className="mt-20 bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 transition"
                >
                  Confirm Images
                </button>
              </div>

              {/* Existing Images Preview with remove */}
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.images.map((url, index) => (
                  <div key={`existing-${index}`} className="relative w-24 h-24">
                    <img
                      src={url.startsWith('http') ? url : `/uploads/${url}`}
                      alt={`Existing Image ${index + 1}`}
                      className="w-full h-full object-cover rounded-md shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleExistingImageRemove(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full text-xs hover:bg-red-600 transition"
                      title="Remove existing image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Newly Selected Images Preview with remove */}
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedImages.map((file, index) => (
                  <div key={`new-${index}`} className="relative w-24 h-24">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`New Image ${index + 1}`}
                      className="w-full h-full object-cover rounded-md shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageRemove(index)}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full text-xs hover:bg-red-600 transition"
                      title="Remove selected image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Total images must be between 3 and 7. The first image will be used as the cover image.
              </p>
            </div>

            {/* Description */}
            <div>
              <label className={`block text-lg font-semibold mb-2 ${theme.text}`}>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300"
                required
              />
            </div>

            {/* Date */}
            <div>
              <label className={`block text-lg font-semibold mb-2 ${theme.text}`}>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300"
                required
              />
            </div>

            {/* Start Time */}
            <div>
              <label className={`block text-lg font-semibold mb-2 ${theme.text}`}>Start Time</label>
              <input
                type="time"
                name="StartTime"
                value={formData.StartTime}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300"
              />
            </div>

            {/* Location */}
            <div>
              <label className={`block text-lg font-semibold mb-2 ${theme.text}`}>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300"
                required
              />
            </div>

            {/* Event Type */}
            <div>
              <label className={`block text-lg font-semibold mb-2 ${theme.text}`}>Event Type</label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300"
                required
              >
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>

            {/* Event Password if Private */}
            {formData.eventType === 'Private' && (
              <div className="relative">
                <label className={`block text-lg font-semibold mb-2 ${theme.text}`}>Event Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="eventPassword"
                  value={formData.eventPassword}
                  onChange={handleChange}
                  className="w-full p-2 rounded-md border border-gray-300"
                  minLength={4}
                  maxLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-500" />
                  )}
                </button>
              </div>
            )}

            {/* Event Category */}
            <div>
              <label className={`block text-lg font-semibold mb-2 ${theme.text}`}>Event Category</label>
              <select
                name="eventCategory"
                value={formData.eventCategory}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-gray-300"
                required
              >
                <option value="Concert">Concert</option>
                <option value="Wedding">Wedding</option>
                <option value="Party">Party</option>
                <option value="Conference">Conference</option>
                <option value="Others">Others</option>
              </select>
            </div>

            {/* Host */}
            <div>
              <label className={`block text-lg font-semibold mb-2 ${theme.text}`}>Host</label>
              <div className="relative">
                <input
                  type="text"
                  name="host"
                  value={formData.host}
                  onChange={handleChange}
                  className="w-full p-2 rounded-md border border-gray-300"
                  required
                />
                <UserCircleIcon className="absolute top-1/2 right-3 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              </div>
            </div>
          </div>

          {/* Show error messages */}
          {(updateError || deleteError) && (
            <div className="text-red-500 text-center">
              {updateError || deleteError}
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              disabled={updating}
              className="flex-1 bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition"
            >
              {updating ? 'Updating...' : 'Update Event'}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 transition"
            >
              {deleting ? 'Deleting...' : 'Delete Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateEvent;
