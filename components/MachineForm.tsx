
import React, { useState } from 'react';
import { Machine } from '../types';

interface MachineFormProps {
  initialData?: Partial<Machine>;
  customerId: string;
  onSave: (machine: Partial<Machine>) => void;
  onCancel: () => void;
}

export const MachineForm: React.FC<MachineFormProps> = ({ initialData, customerId, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Machine>>({
    customerId,
    name: initialData?.name || '',
    serialNumber: initialData?.serialNumber || '',
    installDate: initialData?.installDate || new Date().toISOString().split('T')[0],
    location: initialData?.location || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">
          {initialData?.id ? 'Edit Machine' : 'Add New Machine'}
        </h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Machine Name/Type</label>
          <input
            required
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-gray-400"
            placeholder="e.g. Industrial HVAC Unit"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
          <input
            required
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-gray-400"
            placeholder="e.g. SN-2023-XYZ"
            value={formData.serialNumber}
            onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-black focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder-gray-400"
            placeholder="e.g. Roof, Basement, Room 101"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        <div className="pt-4">
            <button
                type="submit"
                className="w-full bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:bg-blue-800 active:scale-[0.98] transition-all"
            >
                {initialData?.id ? 'Update Machine' : 'Add Machine'}
            </button>
        </div>
      </form>
    </div>
  );
};
