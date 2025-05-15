// src/pages/DriverEarnings.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const DriverEarnings: React.FC = () => {
  const [earnings, setEarnings] = useState({
    todayEarnings: 0,
    weekEarnings: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEarnings = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:8000/api/driver/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        const data = await response.json();

        setEarnings({
          todayEarnings: Number(data.stats.today_earnings),
          weekEarnings: Number(data.stats.week_earnings),
        });
      } catch (error) {
        console.error('Error fetching earnings:', error);
      }
    };

    fetchEarnings();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Driver Earnings</h1>
        <Button 
          variant="outline" 
          onClick={() => navigate('/driver/dashboard')}
          className="hover:bg-gray-100 transition-colors"
        >
          Back to Dashboard
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow border border-gray-200 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-gray-700">Today's Earnings</CardTitle>
            <CardDescription className="text-sm text-gray-500">Income from today</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              ${earnings.todayEarnings.toFixed(2)}
            </p>
            <div className="mt-2 h-1 w-full bg-green-100 rounded-full">
              <div className="h-1 bg-green-500 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border border-gray-200 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-gray-700">Total Today</CardTitle>
            <CardDescription className="text-sm text-gray-500">Includes bonuses if any</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              ${earnings.todayEarnings.toFixed(2)}
            </p>
            <div className="mt-2 h-1 w-full bg-blue-100 rounded-full">
              <div className="h-1 bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border border-gray-200 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-gray-700">This Week</CardTitle>
            <CardDescription className="text-sm text-gray-500">Total earnings for the week</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">
              ${earnings.weekEarnings.toFixed(2)}
            </p>
            <div className="mt-2 h-1 w-full bg-purple-100 rounded-full">
              <div className="h-1 bg-purple-500 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 border-t pt-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">Earnings Summary</h3>
          <p className="text-sm text-gray-500">
            Your earnings are updated in real-time. For detailed breakdown, check your weekly report.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DriverEarnings;