import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useCreateEvent from '../../hooks/eventHooks/useCreateEvent';
import toast from 'react-hot-toast';
import { UserCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const CreateEvent = () => {
  const { theme } = useTheme();
  const { createEvent, loading, error } = useCreateEvent();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    StartTime: '',
    location: '',
    images: [],
    eventType: 'Public',
    eventCategory: 'Concert',
    host: '',
    eventPassword: '',
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const updatedImages = [...selectedImages, ...files].slice(0, 7); // Max 7
    setSelectedImages(updatedImages);
  };

  const handleImageRemove = (index) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedImages.length < 3 || selectedImages.length > 7) {
      toast.error('You must upload at least 3 and at most 7 images.');
      return;
    }
    toast.success('Images selected successfully!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedImages.length < 3 || selectedImages.length > 7) {
      toast.error('You must upload at least 3 and at most 7 images.');
      return;
    }

    const form = new FormData();
    form.append('title', formData.title);
    form.append('description', formData.description);
    form.append('date', formData.date);
    form.append('StartTime', formData.StartTime);
    form.append('location', formData.location);
    form.append('eventType', formData.eventType);
    form.append('eventCategory', formData.eventCategory);
    form.append('host', formData.host);

    if (formData.eventType === 'Private') {
      form.append('bookingCode', formData.eventPassword);
    }

    selectedImages.forEach((image) => {
      form.append('images', image);
    });

    await createEvent(form);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.background} pt-20 px-4`}>
      <div className="bg-white bg-opacity-30 backdrop-filter backdrop-blur-lg p-8 rounded-lg shadow-lg max-w-5xl w-full mt-20 mb-10">
        <h2 className={`text-4xl font-bold text-center mb-6 ${theme.text}`}>Create Event</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className={`block text-lg font-semibold mb-2 ${theme.text}`}>Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-300" required />
            </div>

            {/* Image Upload */}
            <div>
              <label className={`block text-lg font-semibold mb-2 ${theme.text}`}>Upload Images</label>
              <div className="relative">
                <label className="cursor-pointer">
                  <UserCircleIcon className="h-16 w-16 text-gray-500 absolute top-0 left-0" />
                  <input type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" />
                </label>
                <button type="button" onClick={handleUpload} className="mt-20 bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 transition">
                  Upload Selected Images
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedImages.map((file, index) => (
                  <div key={index} className="relative w-24 h-24">
                    <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover rounded-md shadow-md" />
                    <button type="button" onClick={() => handleImageRemove(index)} className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full text-xs hover:bg-red-600 transition">×</button>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">The first image will be used as the cover image</p>
            </div>

            {/* Description */}
            <div>
              <label className={`block text-lg font-semibold mb-2 ${theme.text}`}>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-300" required />
            </div>

            {/* Date, Time, Location */}
            <div><label className={`block text-lg font-semibold mb-2 ${theme.text}`}>Date</label><input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-300" required /></div>
            <div><label className={`block text-lg font-semibold mb-2 ${theme.text}`}>Start Time</label><input type="time" name="StartTime" value={formData.StartTime} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-300" required /></div>
            <div><label className={`block text-lg font-semibold mb-2 ${theme.text}`}>Location</label><input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-300" required /></div>

            {/* Event Type */}
            <div>
              <label className={`block text-lg font-semibold mb-2 ${theme.text}`}>Event Type</label>
              <select name="eventType" value={formData.eventType} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-300" required>
                <option value="Public">Public</option>
                <option value="Private">Private</option>
              </select>
            </div>

            {/* Password if Private */}
            {formData.eventType === 'Private' && (
              <div className="relative">
                <label className={`block text-lg font-semibold mb-2 ${theme.text}`}>Event Password</label>
                <input type={showPassword ? 'text' : 'password'} name="eventPassword" value={formData.eventPassword} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-300" minLength={4} maxLength={6} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute top-1/2 right-3 transform -translate-y-1/2">
                  {showPassword ? <EyeSlashIcon className="h-5 w-5 text-gray-500" /> : <EyeIcon className="h-5 w-5 text-gray-500" />}
                </button>
              </div>
            )}

            {/* Category & Host */}
            <div>
              <label className={`block text-lg font-semibold mb-2 ${theme.text}`}>Event Category</label>
              <select name="eventCategory" value={formData.eventCategory} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-300" required>
                <option value="Concert">Concert</option>
                <option value="Wedding">Wedding</option>
                <option value="Party">Party</option>
                <option value="Conference">Conference</option>
                <option value="Others">Others</option>
              </select>
            </div>
            <div>
              <label className={`block text-lg font-semibold mb-2 ${theme.text}`}>Host</label>
              <div className="relative">
                <input type="text" name="host" value={formData.host} onChange={handleChange} className="w-full p-2 rounded-md border border-gray-300" required />
                <UserCircleIcon className="absolute top-1/2 right-3 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
              </div>
            </div>
          </div>

          {error && <div className="text-red-500 text-center">{error}</div>}
          <button type="submit" className="w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-600 transition" disabled={loading}>
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
