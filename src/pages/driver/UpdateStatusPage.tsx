import React, { useState } from 'react';
import './UpdateStatusPage.css';  // You can add specific styles if necessary

const UpdateStatusPage = () => {
  // Mock delivery data
  const delivery = {
    tracking_number: 'TRK-12345',
    status: 'in_transit',
    pickup_address: '123 Main St, San Francisco, CA',
    delivery_address: '456 Market St, San Francisco, CA',
    client: {
      name: 'John Doe',
      phone: '(555) 123-4567',
    },
    created_at: new Date().toISOString(),
    price: 29.99,
  };

  // Set initial status
  const [status, setStatus] = useState(delivery.status);

  // Handle status change
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
  };

  // Handle update button click
  const handleUpdateStatus = () => {
    alert(`Delivery status updated to: ${status}`);
    // Here you can add your logic to update the delivery status in the app's state or backend.
  };

  return (
    <div className="update-status-page">
      <h1>Update Delivery Status</h1>
      <div className="update-status-card">
        <h2>Tracking Number: {delivery.tracking_number}</h2>
        
        <div className="detail-item">
          <strong>Status:</strong>
          <select value={status} onChange={handleStatusChange}>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        <div className="detail-item">
          <strong>Pickup Address:</strong> {delivery.pickup_address}
        </div>
        <div className="detail-item">
          <strong>Delivery Address:</strong> {delivery.delivery_address}
        </div>

        <div className="client-details">
          <h3>Client Information</h3>
          <p><strong>Name:</strong> {delivery.client.name}</p>
          <p><strong>Phone:</strong> {delivery.client.phone}</p>
        </div>

        <div className="price">
          <strong>Price:</strong> ${delivery.price.toFixed(2)}
        </div>

        <div className="created-at">
          <strong>Created At:</strong> {new Date(delivery.created_at).toLocaleString()}
        </div>

        <div className="update-button-container">
          <button className="update-button" onClick={handleUpdateStatus}>
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateStatusPage;
