
import React from 'react';
import { User } from '../types';
import { Header } from './Header';

interface ProfileProps {
  user: User;
  onCreateWorkOrderClick: () => void;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onCreateWorkOrderClick, onLogout }) => {
  return (
    <div className="flex flex-col min-h-full bg-white">
      <Header title="Profile" />
      
      <main className="flex-1 px-4 pt-2 pb-8">
        {/* User Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6 flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-blue-700 flex items-center justify-center text-white text-xl font-bold shadow-md">
            {user.initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500 mb-1">{user.email}</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${user.role === 'FullTime' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                {user.role === 'FullTime' ? 'Full-Time Engineer' : 'Trainee Engineer'}
            </span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
          
          {user.role === 'FullTime' && (
              <button 
                onClick={onCreateWorkOrderClick}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                    <span className="text-blue-700 font-medium">Create Work Order</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400 group-hover:text-blue-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
          )}

          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <span className="text-gray-700 font-medium">Edit Profile</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <span className="text-gray-700 font-medium">Working Areas</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <span className="text-gray-700 font-medium">Change Password</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          
          <button 
            onClick={onLogout}
            className="w-full text-left p-4 text-red-500 font-medium hover:bg-red-50 transition-colors"
          >
             Logout
          </button>
        
        </div>
      </main>
    </div>
  );
};
