import React from 'react';
import './DeliveryDetailPage.css';
import DriverLayout from '@/components/layouts/DriverLayout';

const DeliveryDetailPage = () => {
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

  return (
      <DriverLayout>
        <div className="delivery-detail-page">
          <h1 className="text-2xl font-bold text-center mb-6">Delivery Details</h1>
          <div className="delivery-detail-card">
            <h2>Tracking Number: {delivery.tracking_number}</h2>
            <div className="detail-item">
              <strong>Status:</strong> {delivery.status}
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
          </div>
        </div>
      </DriverLayout>
  );
};

export default DeliveryDetailPage;
