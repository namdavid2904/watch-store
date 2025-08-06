import React, { useState } from 'react';
import UserOrders from './UserOrders';
import UserWishlist from './UserWishlist';
import UserSettings from './UserSettings';
import './UserProfile.css';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    mobile: '+1 (555) 123-4567',
    avatar: '/default-avatar.jpg',
    joinDate: '2023-01-15',
    totalOrders: 12,
    totalSpent: 5670.50
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'wishlist', label: 'Wishlist', icon: '♥' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="profile-content">
            <div className="profile-header">
              <div className="avatar-section">
                <img src={user.avatar} alt="Profile" className="avatar" />
                <button className="change-avatar-btn">Change Photo</button>
              </div>
              <div className="profile-info">
                <h2>{user.firstName} {user.lastName}</h2>
                <p className="member-since">Member since {new Date(user.joinDate).toLocaleDateString()}</p>
                <div className="profile-stats">
                  <div className="stat">
                    <span className="stat-value">{user.totalOrders}</span>
                    <span className="stat-label">Orders</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">${user.totalSpent.toFixed(2)}</span>
                    <span className="stat-label">Total Spent</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="profile-details">
              <div className="detail-section">
                <h3>Contact Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <label>Email</label>
                    <span>{user.email}</span>
                  </div>
                  <div className="detail-item">
                    <label>Phone</label>
                    <span>{user.mobile}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Shipping Addresses</h3>
                <div className="address-list">
                  <div className="address-item">
                    <div className="address-type">Home</div>
                    <div className="address-details">
                      123 Main Street<br />
                      New York, NY 10001<br />
                      United States
                    </div>
                    <button className="edit-btn">Edit</button>
                  </div>
                  <button className="add-address-btn">+ Add New Address</button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'orders':
        return <UserOrders />;
      case 'wishlist':
        return <UserWishlist />;
      case 'settings':
        return <UserSettings user={user} onUpdate={setUser} />;
      default:
        return null;
    }
  };

  return (
    <div className="user-profile">
      <div className="profile-sidebar">
        <div className="profile-nav">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="profile-main">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default UserProfile;