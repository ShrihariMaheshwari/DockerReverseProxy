import React, { useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';

export default function ServiceManagement() {
  const [newService, setNewService] = useState({
    name: '',
    host: '',
    port: ''
  });

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/services/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newService)
      });
      if (response.ok) {
        setNewService({ name: '', host: '', port: '' });
      }
    } catch (error) {
      console.error('Error adding service:', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Add New Service</h2>
      <form onSubmit={handleAddService} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Service Name</label>
            <input
              type="text"
              value={newService.name}
              onChange={(e) => setNewService({...newService, name: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Host</label>
            <input
              type="text"
              value={newService.host}
              onChange={(e) => setNewService({...newService, host: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Port</label>
            <input
              type="number"
              value={newService.port}
              onChange={(e) => setNewService({...newService, port: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Plus size={16} />
            Add Service
          </button>
        </div>
      </form>
    </div>
  );
}