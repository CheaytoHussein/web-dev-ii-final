import React, { useState, useEffect } from 'react';
import './EarningsPage.css';
import DriverLayout from '@/components/layouts/DriverLayout';

const EarningsPage = () => {
  const mockData = {
    activeDeliveries: 1,
    completedDeliveries: 42,
    totalDeliveries: 43,
    totalEarnings: 1245.75,
    todayEarnings: 38.50,
    weeklyEarnings: 320.25,
    pendingDeliveries: 5,
    recentDeliveries: [
      {
        id: 'del_12345',
        tracking_number: 'TRK-12345',
        status: 'in_transit',
        pickup_address: '123 Main St, San Francisco, CA',
        delivery_address: '456 Market St, San Francisco, CA',
        client: { name: 'John Doe', phone: '(555) 123-4567' },
        created_at: new Date().toISOString(),
        price: 29.99,
      },
      {
        id: 'del_12344',
        tracking_number: 'TRK-12344',
        status: 'delivered',
        pickup_address: '789 Howard St, San Francisco, CA',
        delivery_address: '101 Mission St, San Francisco, CA',
        client: { name: 'Jane Smith', phone: '(555) 987-6543' },
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        price: 24.50,
      }
    ]
  };

  const [earningsData, setEarningsData] = useState(mockData);
  const { activeDeliveries, completedDeliveries, totalDeliveries, totalEarnings, todayEarnings, weeklyEarnings, pendingDeliveries, recentDeliveries } = earningsData;
  const averageEarnings = totalEarnings / totalDeliveries;

  return (
      <DriverLayout>
        <div className="earnings-page">
          <h1>Driver Earnings</h1>
          <div className="earnings-summary">
            <div className="earnings-card">
              <h2>Total Earnings</h2>
              <p>${totalEarnings.toFixed(2)}</p>
            </div>
            <div className="earnings-card">
              <h2>Today's Earnings</h2>
              <p>${todayEarnings.toFixed(2)}</p>
            </div>
            <div className="earnings-card">
              <h2>Weekly Earnings</h2>
              <p>${weeklyEarnings.toFixed(2)}</p>
            </div>
            <div className="earnings-card">
              <h2>Average Earnings/Delivery</h2>
              <p>${averageEarnings.toFixed(2)}</p>
            </div>
          </div>

          <div className="deliveries-stats">
            <div className="deliveries-card">
              <h2>Active Deliveries</h2>
              <p>{activeDeliveries}</p>
            </div>
            <div className="deliveries-card">
              <h2>Completed Deliveries</h2>
              <p>{completedDeliveries}</p>
            </div>
            <div className="deliveries-card">
              <h2>Pending Deliveries</h2>
              <p>{pendingDeliveries}</p>
            </div>
            <div className="deliveries-card">
              <h2>Total Deliveries</h2>
              <p>{totalDeliveries}</p>
            </div>
          </div>

          <div className="recent-deliveries">
            <h2>Recent Deliveries</h2>
            <table>
              <thead>
              <tr>
                <th>Tracking Number</th>
                <th>Status</th>
                <th>Pickup Address</th>
                <th>Delivery Address</th>
                <th>Price ($)</th>
                <th>Client</th>
              </tr>
              </thead>
              <tbody>
              {recentDeliveries.map((delivery) => (
                  <tr key={delivery.id}>
                    <td>{delivery.tracking_number}</td>
                    <td>{delivery.status}</td>
                    <td>{delivery.pickup_address}</td>
                    <td>{delivery.delivery_address}</td>
                    <td>{delivery.price.toFixed(2)}</td>
                    <td>{delivery.client.name}</td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </div>
      </DriverLayout>
  );
};

export default EarningsPage;
