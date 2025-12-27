import React from 'react';
import { ScreenName } from '../types';

interface BottomNavProps {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  const navItems = [
    { name: 'home', label: 'Home', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    )},
    { name: 'my-jobs', label: 'My Job', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125V17.25M6 9l2.25-2.25M12 12l2.25-2.25m-2.25 2.25V6.75h-1.5V12l-2.25-2.25M6.75 6.75h.75v.75h-.75v-.75zM8.25 17.25h7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 12H12v6.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75h9.75a1.5 1.5 0 001.5-1.5V9a1.5 1.5 0 00-1.5-1.5h-5.25" />
      </svg>
    )},
    { name: 'history', label: 'History', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )},
    { name: 'profile', label: 'Profile', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    )},
  ];

  return (
    <div className="w-full bg-white border-t border-gray-200 pb-safe pt-2 px-4 shadow-lg z-20">
      <div className="flex justify-between items-center mx-auto">
        {navItems.map((item) => {
          const isActive = currentScreen === item.name || (item.name === 'my-jobs' && currentScreen === 'create-work-order');
          return (
            <button
              key={item.name}
              onClick={() => onNavigate(item.name as ScreenName)}
              className={`flex flex-col items-center justify-center w-16 h-14 space-y-1 ${
                isActive ? 'text-blue-700' : 'text-gray-500'
              }`}
            >
              <div className={`${isActive ? 'scale-110 transform transition-transform' : ''}`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
              {isActive && (
                <div className="h-1 w-8 bg-blue-700 rounded-full absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};