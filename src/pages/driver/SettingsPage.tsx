import React, { useState } from 'react';

const SettingsPage = () => {
  const [driverName, setDriverName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [language, setLanguage] = useState('en');
  const [preferredArea, setPreferredArea] = useState('');
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  
  const [faqOpen, setFaqOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Settings Updated:', { driverName, email, phone, vehicleType, language, preferredArea, pushNotifications, smsNotifications });
  };

  return (
    <div className="min-h-screen py-6 px-4 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Driver Settings</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
        {/* Driver Name */}
        <div>
          <label htmlFor="driverName" className="block text-sm font-medium text-gray-700">
            Driver Name
          </label>
          <input
            id="driverName"
            type="text"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your full name"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your email address"
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            id="phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your phone number"
          />
        </div>

        {/* Vehicle Type */}
        <div>
          <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700">
            Vehicle Type
          </label>
          <select
            id="vehicleType"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select your vehicle type</option>
            <option value="car">Car</option>
            <option value="van">Van</option>
            <option value="truck">Truck</option>
          </select>
        </div>

        {/* Language Settings */}
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-gray-700">
            Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="ar">Arabic</option>
          </select>
        </div>

        {/* Preferred Area */}
        <div>
          <label htmlFor="preferredArea" className="block text-sm font-medium text-gray-700">
            Preferred Area
          </label>
          <input
            id="preferredArea"
            type="text"
            value={preferredArea}
            onChange={(e) => setPreferredArea(e.target.value)}
            className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your preferred delivery area"
          />
        </div>

        {/* Notifications Settings */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Notifications</h2>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={pushNotifications}
              onChange={() => setPushNotifications(!pushNotifications)}
              id="pushNotifications"
              className="mr-2"
            />
            <label htmlFor="pushNotifications" className="text-sm">Enable Push Notifications</label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={smsNotifications}
              onChange={() => setSmsNotifications(!smsNotifications)}
              id="smsNotifications"
              className="mr-2"
            />
            <label htmlFor="smsNotifications" className="text-sm">Enable SMS Notifications</label>
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <button
            type="button"
            onClick={() => setFaqOpen(!faqOpen)}
            className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            {faqOpen ? 'Hide FAQ' : 'Show FAQ'}
          </button>

          {faqOpen && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <h3 className="font-medium">Frequently Asked Questions</h3>
              <div className="mt-2 space-y-2">
                <p><strong>How do I update my settings?</strong> - Simply edit the fields above and click "Save Changes" to update your settings.</p>
                <p><strong>How do I change my preferred area?</strong> - Enter your new preferred area in the "Preferred Area" field and save the changes.</p>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
          >
            Save Changes
          </button>
        </div>
      </form>

      <div className="mt-6">
        <p className="text-sm text-gray-500">App Version: 1.0.0</p>
      </div>
    </div>
  );
};

export default SettingsPage;
