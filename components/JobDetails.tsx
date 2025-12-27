
import React, { useState, useMemo } from 'react';
import { Job, Customer, Machine, UserRole, ServiceCheckItem } from '../types';
import { Header } from './Header';

interface JobDetailsProps {
  job: Job;
  customer?: Customer;
  machine?: Machine;
  allMachines?: Machine[]; // For Annual Service
  onBack: () => void;
  onEdit: () => void;
  onViewAllMachines: () => void;
  onUpdateJob?: (job: Job) => void;
  userRole: UserRole;
}

type ChecklistFilter = 'pending' | 'issue' | 'fixed' | 'all';

export const JobDetails: React.FC<JobDetailsProps> = ({ 
    job, 
    customer, 
    machine, 
    allMachines, 
    onBack, 
    onEdit, 
    onViewAllMachines,
    onUpdateJob,
    userRole
}) => {
  
  const isAnnualService = job.type === 'AnnualService';
  const [activeTab, setActiveTab] = useState<'details' | 'checklist'>('details');
  const [checklist, setChecklist] = useState(job.checklist || []);
  const [checklistFilter, setChecklistFilter] = useState<ChecklistFilter>('all');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-500';
      case 'Medium': return 'text-orange-500';
      case 'Low': return 'text-green-500';
      case 'None': return 'text-gray-400';
      default: return 'text-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleChecklistUpdate = (machineId: string, status: 'Passed' | 'Failed', note?: string) => {
      const existingItemIndex = checklist.findIndex(i => i.machineId === machineId);
      let newChecklist = [...checklist];
      
      if (existingItemIndex > -1) {
          newChecklist[existingItemIndex] = { ...newChecklist[existingItemIndex], status, note: note || newChecklist[existingItemIndex].note };
      } else {
          newChecklist.push({ machineId, status, note, attachments: [] });
      }
      
      setChecklist(newChecklist);
      if (onUpdateJob) {
          onUpdateJob({ ...job, checklist: newChecklist });
      }
  };

  const handleNoteUpdate = (machineId: string, note: string) => {
      const existingItemIndex = checklist.findIndex(i => i.machineId === machineId);
      if (existingItemIndex > -1) {
          const newChecklist = [...checklist];
          newChecklist[existingItemIndex].note = note;
          setChecklist(newChecklist);
          if (onUpdateJob) onUpdateJob({ ...job, checklist: newChecklist });
      }
  };

  const handleAttachmentAdd = (machineId: string, file: File) => {
    const imageUrl = URL.createObjectURL(file); 
    const existingItemIndex = checklist.findIndex(i => i.machineId === machineId);
    
    if (existingItemIndex > -1) {
        const newChecklist = [...checklist];
        const currentAttachments = newChecklist[existingItemIndex].attachments || [];
        newChecklist[existingItemIndex].attachments = [...currentAttachments, imageUrl];
        setChecklist(newChecklist);
        if (onUpdateJob) onUpdateJob({ ...job, checklist: newChecklist });
    }
  };

  const handleAttachmentRemove = (machineId: string, indexToRemove: number) => {
     const existingItemIndex = checklist.findIndex(i => i.machineId === machineId);
     if (existingItemIndex > -1) {
        const newChecklist = [...checklist];
        const currentAttachments = newChecklist[existingItemIndex].attachments || [];
        newChecklist[existingItemIndex].attachments = currentAttachments.filter((_, idx) => idx !== indexToRemove);
        setChecklist(newChecklist);
        if (onUpdateJob) onUpdateJob({ ...job, checklist: newChecklist });
     }
  };

  // Logic for filtering the list
  const filteredMachines = useMemo(() => {
    if (!allMachines) return [];
    return allMachines.filter(m => {
        const item = checklist.find(c => c.machineId === m.id);
        const status = item?.status || 'Pending';
        
        if (checklistFilter === 'all') return true;
        if (checklistFilter === 'fixed') return status === 'Passed';
        if (checklistFilter === 'issue') return status === 'Failed';
        if (checklistFilter === 'pending') return status === 'Pending';
        return true;
    });
  }, [allMachines, checklist, checklistFilter]);

  // Counts for the filter pills
  const counts = useMemo(() => {
    if (!allMachines) return { all: 0, fixed: 0, issue: 0, pending: 0 };
    const stats = { all: allMachines.length, fixed: 0, issue: 0, pending: 0 };
    allMachines.forEach(m => {
        const item = checklist.find(c => c.machineId === m.id);
        const status = item?.status || 'Pending';
        if (status === 'Passed') stats.fixed++;
        else if (status === 'Failed') stats.issue++;
        else stats.pending++;
    });
    return stats;
  }, [allMachines, checklist]);

  return (
    <div className="flex flex-col min-h-full bg-white">
      <div className="sticky top-0 z-20 bg-white shadow-sm">
        <Header 
            title={isAnnualService ? "Annual Service" : "Job Details"} 
            showBack 
            onBack={onBack} 
            action={
            userRole === 'FullTime' ? (
                <button onClick={onEdit} className="text-blue-700 font-bold text-sm">
                    Edit
                </button>
            ) : null
            }
        />
        
        {isAnnualService && (
            <div className="flex border-t border-gray-100">
                <button
                    onClick={() => setActiveTab('details')}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'details' ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                >
                    Details
                </button>
                <button
                    onClick={() => setActiveTab('checklist')}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'checklist' ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-gray-500 hover:bg-gray-50'}`}
                >
                    Checklist <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">{allMachines?.length || 0}</span>
                </button>
            </div>
        )}
      </div>
      
      <main className={`flex-1 overflow-y-auto bg-gray-50/30 ${activeTab === 'checklist' ? 'px-3 pt-4 pb-6' : 'px-4 pt-6 pb-8'}`}>
        
        {(!isAnnualService || activeTab === 'details') && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {isAnnualService ? job.title : (machine?.name || 'Unknown Machine')}
                  </h1>
                  <div className="flex items-center text-sm gap-2">
                    <span className="text-gray-500 font-medium">#WO-{job.id.toUpperCase()}</span>
                    <span className="text-gray-300">|</span>
                    <div className={`flex items-center gap-1 font-bold ${getPriorityColor(job.priority)}`}>
                      {job.priority !== 'None' && <div className={`w-1.5 h-1.5 rounded-full bg-current`}></div>}
                      {job.priority === 'None' ? 'No Priority' : job.priority}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                     </svg>
                     {formatDate(job.date)}
                  </div>
                </div>

                <hr className="border-gray-100 mb-6" />

                <div className="mb-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-2">Work Description</h2>
                  <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                     <h3 className="font-semibold text-gray-800 mb-1">{job.title}</h3>
                     <p className="text-gray-600 text-sm leading-relaxed">{job.description}</p>
                     {job.instructions && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                            <span className="text-xs font-bold text-gray-500 uppercase">Instructions</span>
                            <p className="text-gray-600 text-sm mt-1">{job.instructions}</p>
                        </div>
                     )}
                  </div>
                </div>

                {!isAnnualService && (
                    <div className="mb-8">
                      <h2 className="text-lg font-bold text-gray-900 mb-3">Machine</h2>
                      <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                         <h3 className="font-bold text-gray-900 mb-1">{machine?.name}</h3>
                         <p className="text-gray-500 text-sm mb-3">{machine?.serialNumber}</p>
                         
                         <div className="flex items-center gap-4">
                             <button className="text-sm text-gray-600 underline font-medium decoration-gray-400 underline-offset-2">
                                View Location
                             </button>
                             {userRole === 'FullTime' && (
                                 <>
                                     <span className="text-gray-300">|</span>
                                     <button 
                                        onClick={onViewAllMachines}
                                        className="text-sm text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1"
                                     >
                                        View All Machines
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                     </button>
                                 </>
                             )}
                         </div>
                         
                         {machine?.location && (
                             <p className="text-xs text-gray-400 mt-3 border-t border-gray-100 pt-2">Loc: {machine.location}</p>
                         )}
                      </div>
                    </div>
                )}

                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-3">Customer Info</h2>
                  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm relative">
                     <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                        Primary Site
                     </div>
                     
                     <h3 className="font-bold text-gray-900 mb-2 pr-20">{customer?.name}</h3>
                     
                     <div className="flex items-start gap-2 mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <p className="text-sm text-gray-600 leading-snug">{customer?.address}</p>
                     </div>

                     <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                        <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                            {customer?.contactName ? customer.contactName.charAt(0) : '?'}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">{customer?.contactName || 'No Contact'}</p>
                            <p className="text-xs text-gray-500">{customer?.email}</p>
                        </div>
                     </div>
                  </div>
                </div>
            </div>
        )}

        {isAnnualService && activeTab === 'checklist' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Filter Bar - Reordered and Compact */}
                <div className="flex justify-center mb-3">
                    <div className="inline-flex bg-gray-200/70 p-1 rounded-xl shadow-inner">
                        {(['pending', 'issue', 'fixed', 'all'] as ChecklistFilter[]).map(f => (
                            <button
                                key={f}
                                onClick={() => setChecklistFilter(f)}
                                className={`px-4 py-1.5 rounded-lg transition-all flex flex-col items-center min-w-[60px] ${checklistFilter === f ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <span className="text-[9px] font-bold uppercase tracking-tight">{f}</span>
                                <span className="text-xs font-bold leading-none">{counts[f]}</span>
                            </button>
                        ))}
                    </div>
                </div>
                
                {/* Machine List - Dense Layout */}
                <div className="space-y-2">
                    {filteredMachines.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
                            <p className="text-gray-400 text-sm italic">No items found.</p>
                        </div>
                    ) : (
                        filteredMachines.map(m => {
                            const checkItem = checklist.find(c => c.machineId === m.id);
                            const status = checkItem?.status || 'Pending';
                            const note = checkItem?.note || '';
                            const attachments = checkItem?.attachments || [];

                            return (
                                <div key={m.id} className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm animate-in fade-in duration-300">
                                    <div className="flex justify-between items-center">
                                        <div className="min-w-0 pr-2">
                                            <h3 className="font-bold text-gray-900 text-sm truncate">{m.name}</h3>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-wide truncate">{m.serialNumber} • {m.location || 'No Loc'}</p>
                                        </div>
                                        <div className="flex gap-1.5 flex-shrink-0">
                                            {/* Tick (Solved/Fixed) */}
                                            <button 
                                                onClick={() => handleChecklistUpdate(m.id, 'Passed')}
                                                className={`p-1.5 rounded-lg transition-all border ${status === 'Passed' ? 'bg-green-100 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-green-50'}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                            
                                            {/* Exclamation/Issue (Failed) */}
                                            <button 
                                                onClick={() => handleChecklistUpdate(m.id, 'Failed')}
                                                className={`p-1.5 rounded-lg transition-all border ${status === 'Failed' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-red-50'}`}
                                            >
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                            </svg>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {status === 'Failed' && (
                                        <div className="mt-2 animate-in slide-in-from-top-1 duration-200 p-2 bg-red-50 border border-red-100 rounded-lg space-y-2">
                                            <textarea
                                                value={note}
                                                onChange={(e) => handleNoteUpdate(m.id, e.target.value)}
                                                placeholder="Describe the issue..."
                                                className="w-full text-xs p-2 bg-white border border-red-200 rounded-md text-gray-800 placeholder-red-300 focus:outline-none focus:ring-1 focus:ring-red-300 resize-none"
                                                rows={2}
                                            />
                                            
                                            <div className="flex flex-wrap gap-2">
                                                <label 
                                                    htmlFor={`file-${m.id}`}
                                                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-500 bg-white border border-red-200 px-2.5 py-1.5 rounded-md cursor-pointer hover:bg-red-50 transition-colors shadow-sm"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                                                    </svg>
                                                    Photo
                                                    <input id={`file-${m.id}`} type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) handleAttachmentAdd(m.id, e.target.files[0]); }} />
                                                </label>

                                                {attachments.map((url, idx) => (
                                                    <div key={idx} className="w-10 h-10 rounded-md overflow-hidden relative border border-gray-200 shadow-sm flex-shrink-0 group">
                                                        <img src={url} alt="Attachment" className="w-full h-full object-cover" />
                                                        <button 
                                                            onClick={() => handleAttachmentRemove(m.id, idx)}
                                                            className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 text-white">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        )}

      </main>
    </div>
  );
};
