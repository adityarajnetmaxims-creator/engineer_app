
import React, { useState } from 'react';
import { Job, Customer, Machine, UserRole } from '../types';

interface MyJobsProps {
  jobs: Job[];
  customers: Customer[];
  machines: Machine[];
  onJobClick: (job: Job) => void;
  onCreateWorkOrder: () => void;
  userRole: UserRole;
}

export const MyJobs: React.FC<MyJobsProps> = ({ jobs, customers, machines, onJobClick, onCreateWorkOrder, userRole }) => {
  const [searchText, setSearchText] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');

  // Helper to get linked data
  const getJobDetails = (job: Job) => {
    const customer = customers.find(c => c.id === job.customerId);
    const machine = machines.find(m => m.id === job.machineId);
    return { customer, machine };
  };

  // Filter Logic
  const filteredJobs = jobs.filter(job => {
    const { machine } = getJobDetails(job);
    const matchesSearch = 
      job.id.toLowerCase().includes(searchText.toLowerCase()) ||
      (machine?.name.toLowerCase() || '').includes(searchText.toLowerCase()) ||
      job.title.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesPriority = priorityFilter === 'All' || job.priority === priorityFilter;
    
    return matchesSearch && matchesPriority;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-500';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-500';
      case 'None': return 'text-gray-400';
      default: return 'text-gray-500';
    }
  };

  const getPriorityDot = (priority: string) => {
     switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      <div className="pt-12 pb-2 px-4 bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Work Orders</h1>
            {userRole === 'FullTime' && (
                <button
                    onClick={onCreateWorkOrder}
                    className="flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white pl-3 pr-4 py-2 rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                    </svg>
                    New Order
                </button>
            )}
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-3">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm"
                placeholder="Search by work order no. or machine name"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
            />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 mb-2">
            <div className="relative">
                <select 
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as any)}
                    className="appearance-none bg-gray-100 border border-transparent text-gray-700 py-1.5 pl-3 pr-8 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 cursor-pointer"
                >
                    <option value="All">Priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-2 space-y-3 pb-6 mt-2">
        {filteredJobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mb-4 text-gray-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
                <p>No work orders found.</p>
                {userRole === 'FullTime' && (
                    <button onClick={onCreateWorkOrder} className="mt-4 text-blue-600 font-bold text-sm">Create New Order</button>
                )}
            </div>
        ) : (
            filteredJobs.map(job => {
                const { customer, machine } = getJobDetails(job);
                const isAnnualService = job.type === 'AnnualService';

                return (
                    <div 
                        key={job.id} 
                        onClick={() => onJobClick(job)}
                        className={`bg-white rounded-xl p-4 shadow-sm border active:bg-gray-50 transition-colors relative overflow-hidden ${isAnnualService ? 'border-blue-200' : 'border-gray-100'}`}
                    >
                        {isAnnualService && (
                            <div className="absolute top-0 left-0 w-full bg-blue-50 border-b border-blue-100 px-4 py-1 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-blue-600">
                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                </svg>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Annual Service</span>
                            </div>
                        )}

                        <div className={`flex justify-between items-start mb-2 ${isAnnualService ? 'mt-6' : ''}`}>
                            <h3 className="text-base font-bold text-gray-900 line-clamp-1">
                                {isAnnualService ? customer?.name : (machine?.name || 'Unknown Machine')}
                            </h3>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                {!isAnnualService && <div className={`w-2 h-2 rounded-full ${getPriorityDot(job.priority)}`}></div>}
                                <span className={`text-xs font-medium ${getPriorityColor(job.priority)}`}>
                                    {isAnnualService ? 'No Priority' : job.priority}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            {/* Customer Name / Address - Logic depends on type */}
                            <div className="flex items-center gap-2 text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                                </svg>
                                <span className="text-sm">
                                    {isAnnualService ? customer?.address : (customer?.name || 'Unknown Customer')}
                                </span>
                            </div>

                            {/* Address line 2 if standard, or Created Date for Annual */}
                            <div className="flex items-start gap-2 text-gray-500">
                                {isAnnualService ? (
                                    <>
                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                     </svg>
                                     <span className="text-xs">{formatDate(job.date)}</span>
                                    </>
                                ) : (
                                    <>
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                      </svg>
                                      <span className="text-xs leading-tight">{customer?.address || 'No address'}</span>
                                    </>
                                )}
                            </div>

                            {/* Standard Job Date */}
                            {!isAnnualService && (
                                <div className="flex items-center gap-2 text-gray-500 pt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                    </svg>
                                    <span className="text-xs">{formatDate(job.date)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};
