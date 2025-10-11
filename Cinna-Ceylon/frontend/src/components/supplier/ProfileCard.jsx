import React from 'react';

const ProfileCard = ({ supplier, uploadingPhoto, handleProfileFileChange, handleUpdateSupplier, handleDeleteSupplier }) => {
  return (
    <div className="profile-card bg-white border-2 border-[#e5cdb4] rounded-2xl shadow-xl p-6 sticky top-24">
      <div className="text-center mb-6">
        {supplier.profileImage ? (
          <img
            src={`http://localhost:5000/uploads/${supplier.profileImage}`}
            alt={supplier.name}
            className="profile-avatar w-24 h-24 rounded-2xl mx-auto mb-4 object-cover border-4 border-white shadow-lg"
          />
        ) : (
          <div className="profile-avatar w-24 h-24 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg bg-gradient-to-br from-[#d97706] to-[#b36f3d]">
            <span className="text-2xl text-white font-bold">
              {supplier.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <h2 className="text-xl font-bold text-[#7a4522] mb-1">{supplier.name}</h2>
        <div className="verified-badge inline-flex items-center px-3 py-1 rounded-full text-sm font-medium">
          <span className="w-2 h-2 bg-[#d97706] rounded-full mr-2"></span>
          Verified Supplier
        </div>
        <div className="mt-4">
          <label htmlFor="profileUpload" className={`px-4 py-2 rounded-lg text-white text-sm font-medium cursor-pointer shadow ${uploadingPhoto ? 'bg-gray-400' : 'bg-[#d97706] hover:bg-[#b45309]'}`}>
            {uploadingPhoto ? 'Uploading...' : 'Change Photo'}
          </label>
          <input id="profileUpload" type="file" accept="image/*" className="hidden" onChange={handleProfileFileChange} />
        </div>
      </div>
      <div className="space-y-4 mb-6">
        <div className="flex items-center space-x-3 p-3 bg-[#fef7ed] rounded-xl">
          <div className="w-10 h-10 bg-[#e5cdb4] rounded-lg flex items-center justify-center">
            <span className="text-[#d97706]">📧</span>
          </div>
          <div>
            <p className="text-sm text-[#b36f3d]">Email</p>
            <p className="text-[#7a4522] font-medium">{supplier.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-[#fef7ed] rounded-xl">
          <div className="w-10 h-10 bg-[#e5cdb4] rounded-lg flex items-center justify-center">
            <span className="text-[#d97706]">📞</span>
          </div>
          <div>
            <p className="text-sm text-[#b36f3d]">Contact</p>
            <p className="text-[#7a4522] font-medium">{supplier.contactNumber}</p>
          </div>
        </div>
        {supplier.whatsappNumber && (
          <div className="flex items-center space-x-3 p-3 bg-[#fef7ed] rounded-xl">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600">💬</span>
            </div>
            <div>
              <p className="text-sm text-[#b36f3d]">WhatsApp</p>
              <p className="text-[#7a4522] font-medium">{supplier.whatsappNumber}</p>
            </div>
          </div>
        )}
        <div className="flex items-start space-x-3 p-3 bg-[#fef7ed] rounded-xl">
          <div className="w-10 h-10 bg-[#e5cdb4] rounded-lg flex items-center justify-center">
            <span className="text-[#d97706]">📍</span>
          </div>
          <div>
            <p className="text-sm text-[#b36f3d]">Address</p>
            <p className="text-[#7a4522] font-medium">{supplier.address}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 p-3 bg-[#fef7ed] rounded-xl">
          <div className="w-10 h-10 bg-[#e5cdb4] rounded-lg flex items-center justify-center">
            <span className="text-[#d97706]">📅</span>
          </div>
          <div>
            <p className="text-sm text-[#b36f3d]">Member Since</p>
            <p className="text-[#7a4522] font-medium">
              {supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : '—'}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <button
          onClick={handleUpdateSupplier}
          className="w-full px-4 py-3 bg-gradient-to-r from-[#d97706] to-[#b36f3d] text-white rounded-xl hover:from-[#b45309] hover:to-[#9a582a] transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center space-x-2"
        >
          <span>✏️</span>
          <span>Edit Profile</span>
        </button>
        <button
          onClick={handleDeleteSupplier}
          className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center justify-center space-x-2"
        >
          <span>🗑️</span>
          <span>Delete Account</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;
