
import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Customer, Machine, Job } from '../types';
import { MachineForm } from './MachineForm';
import { generateJobSuggestions } from '../services/geminiService';

interface CreateWorkOrderProps {
  onBack: () => void;
  onSuccess: () => void;
  customers: Customer[];
  machines: Machine[];
  onAddMachine: (machine: Machine) => void;
  onUpdateMachine: (machine: Machine) => void;
  initialJob?: Job; // For Edit Mode
  onUpdateJob?: (job: Job) => void; // For saving edits
  initialCustomer?: Customer; // For Manage Mode
  mode?: 'default' | 'manage';
  allowedCustomerIds?: string[]; // IDs of customers allowed for WO creation
}

export const CreateWorkOrder: React.FC<CreateWorkOrderProps> = ({
  onBack,
  onSuccess,
  customers,
  machines,
  onAddMachine,
  onUpdateMachine,
  initialJob,
  onUpdateJob,
  initialCustomer,
  mode = 'default',
  allowedCustomerIds,
}) => {
  // Step 1: Select Customer
  // Step 2: View/Select Asset (Machine List)
  // Step 3: Create Job Form
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [internalMode, setInternalMode] = useState<'default' | 'manage'>(mode);
  
  // Selection State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [restrictionModalCustomer, setRestrictionModalCustomer] = useState<Customer | null>(null);
  
  // Form State
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Low');
  const [instructions, setInstructions] = useState('');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  
  // UI State
  const [isMachineFormOpen, setIsMachineFormOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize
  useEffect(() => {
    if (initialJob) {
        const jobCustomer = customers.find(c => c.id === initialJob.customerId);
        // machineId can be undefined for annual service
        const jobMachine = initialJob.machineId ? machines.find(m => m.id === initialJob.machineId) : null;
        
        if (jobCustomer) setSelectedCustomer(jobCustomer);
        if (jobMachine) setSelectedMachine(jobMachine);
        
        setIssueTitle(initialJob.title);
        setIssueDescription(initialJob.description);
        setPriority(initialJob.priority === 'Emergency' ? 'High' : (initialJob.priority === 'None' ? 'Low' : initialJob.priority)); 
        setInstructions(initialJob.instructions || '');
        setDueDate(initialJob.date || new Date().toISOString().split('T')[0]);
        
        setStep(3); // Jump straight to form
    } else if (initialCustomer && mode === 'manage') {
        setSelectedCustomer(initialCustomer);
        setInternalMode('manage');
        setStep(2); // Jump to Asset List
    }
  }, [initialJob, initialCustomer, mode, customers, machines]);

  // Filter Logic
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
    c.address.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const customerMachines = machines.filter(m => m.customerId === selectedCustomer?.id);

  // Handlers
  const handleCustomerClick = (customer: Customer) => {
    // If in manage mode initially, or if no restrictions are passed, allow all
    if (internalMode === 'manage' || !allowedCustomerIds) {
        setSelectedCustomer(customer);
        setStep(2);
        return;
    }

    // Check if allowed
    if (allowedCustomerIds.includes(customer.id)) {
        setSelectedCustomer(customer);
        setStep(2);
    } else {
        // Restricted
        setRestrictionModalCustomer(customer);
    }
  };

  const handleSwitchToManageMode = () => {
    if (restrictionModalCustomer) {
        setSelectedCustomer(restrictionModalCustomer);
        setInternalMode('manage'); // Switch mode for this session
        setRestrictionModalCustomer(null);
        setStep(2);
    }
  };

  const handleMachineCardClick = (machine: Machine) => {
    if (internalMode === 'manage') {
        // In manage mode, clicking the card opens edit form
        setEditingMachine(machine);
        setIsMachineFormOpen(true);
    } else {
        // In create/edit mode, select for job
        setSelectedMachine(machine);
        setStep(3); // Go to Job Form
    }
  };

  const handleEditMachineClick = (e: React.MouseEvent, machine: Machine) => {
    e.stopPropagation(); // Prevent card click
    setEditingMachine(machine);
    setIsMachineFormOpen(true);
  };

  const handleAddOrUpdateMachine = (data: Partial<Machine>) => {
    if (editingMachine) {
        onUpdateMachine({ ...editingMachine, ...data } as Machine);
    } else {
        const newMachine: Machine = {
            id: Math.random().toString(36).substr(2, 9),
            ...data
        } as Machine;
        onAddMachine(newMachine);
    }
    setIsMachineFormOpen(false);
    setEditingMachine(null);
  };

  const handleAIAssist = async () => {
    if (!selectedMachine || !issueTitle) return;
    setIsGenerating(true);
    const suggestion = await generateJobSuggestions(selectedMachine.name, issueTitle);
    setIssueDescription(suggestion);
    setIsGenerating(false);
  };

  const handleSubmit = () => {
    if (initialJob && onUpdateJob) {
        // Update existing job
        onUpdateJob({
            ...initialJob,
            machineId: selectedMachine?.id || initialJob.machineId, 
            title: issueTitle,
            description: issueDescription,
            // Map priority to valid type.
            priority: priority as any,
            instructions,
            date: dueDate,
        });
    } else {
        onSuccess();
    }
  };

  // --- RENDER ---

  // STEP 1: SELECT CUSTOMER
  if (step === 1) {
    const activeCustomers = allowedCustomerIds 
        ? filteredCustomers.filter(c => allowedCustomerIds.includes(c.id))
        : filteredCustomers;
        
    const otherCustomers = allowedCustomerIds 
        ? filteredCustomers.filter(c => !allowedCustomerIds.includes(c.id))
        : [];

    return (
      <div className="flex flex-col min-h-full bg-white relative">
        <Header title="Select Customer" showBack onBack={onBack} />
        <div className="px-4 py-2 bg-white border-b border-gray-100 sticky top-16 z-10">
            <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute left-3 top-3 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input 
                    type="text" 
                    placeholder="Search gym name or address..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                />
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
            {filteredCustomers.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                    <p>No customers found.</p>
                </div>
            ) : (
                <div className="pb-8">
                    {/* Active/Allowed Customers */}
                    {activeCustomers.length > 0 && (
                        <div>
                             {allowedCustomerIds && <div className="px-4 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wide">Active Sites</div>}
                             <div className="divide-y divide-gray-100">
                                {activeCustomers.map(cust => (
                                    <button
                                        key={cust.id}
                                        onClick={() => handleCustomerClick(cust)}
                                        className="w-full text-left p-4 hover:bg-gray-50 transition-colors group flex justify-between items-center"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <div className="font-bold text-gray-900 text-base group-hover:text-blue-700 transition-colors">{cust.name}</div>
                                                {allowedCustomerIds && (
                                                    <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">OPEN JOB</span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
                                                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                                                </svg>
                                                {cust.address}
                                            </div>
                                        </div>
                                        <div className="text-gray-300 group-hover:text-blue-600 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                            </svg>
                                        </div>
                                    </button>
                                ))}
                             </div>
                        </div>
                    )}

                    {/* Restricted/Other Customers */}
                    {otherCustomers.length > 0 && (
                        <div>
                             <div className="px-4 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wide border-t border-gray-100 mt-2">Other Customers</div>
                             <div className="divide-y divide-gray-100">
                                {otherCustomers.map(cust => (
                                    <button
                                        key={cust.id}
                                        onClick={() => handleCustomerClick(cust)}
                                        className="w-full text-left p-4 hover:bg-gray-50 transition-colors group opacity-80"
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="font-semibold text-gray-600 text-base">{cust.name}</div>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-400">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                            </svg>
                                        </div>
                                        <div className="text-sm text-gray-400 mt-0.5">{cust.address}</div>
                                    </button>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Restriction Modal/Drawer */}
        {restrictionModalCustomer && (
            <div className="absolute inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center animate-in fade-in duration-200">
                <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-xl animate-in slide-in-from-bottom duration-300">
                    <div className="mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-4">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                             </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Restricted Action</h3>
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                            You don't have an active work order for <strong>{restrictionModalCustomer.name}</strong>. 
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            You can't create new jobs for this customer, but you can manage their machine assets.
                        </p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={handleSwitchToManageMode}
                            className="w-full bg-blue-700 text-white font-bold py-3 rounded-xl hover:bg-blue-800 transition-colors"
                        >
                            Manage Assets
                        </button>
                        <button 
                            onClick={() => setRestrictionModalCustomer(null)}
                            className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    );
  }

  // STEP 2: ASSET LIST (Select Machine OR Manage Machines)
  if (step === 2) {
      return (
        <div className="flex flex-col min-h-full bg-white relative">
            <Header 
                title={internalMode === 'manage' ? "Customer Assets" : "Select Asset"}
                showBack 
                onBack={() => {
                    if (initialJob) { setStep(3); return; }
                    if (mode === 'manage') { onBack(); return; }
                    // Reset mode if coming back from forced manage mode
                    if (internalMode === 'manage' && mode === 'default') {
                         setInternalMode('default');
                    }
                    setStep(1);
                }} 
                action={
                    <button 
                        onClick={() => { setEditingMachine(null); setIsMachineFormOpen(true); }}
                        className="text-blue-700 font-bold text-sm px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                    >
                        + Add Machine
                    </button>
                }
            />
            
            {/* Customer Info Header */}
            <div className={`px-4 py-3 border-b ${internalMode === 'manage' ? 'bg-orange-50 border-orange-100' : 'bg-blue-50 border-blue-100'}`}>
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-sm font-bold text-gray-900">{selectedCustomer?.name}</h2>
                        <p className="text-xs text-gray-500">{selectedCustomer?.address}</p>
                    </div>
                    {internalMode === 'manage' && (
                        <span className="text-[10px] font-bold bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full uppercase">
                            Asset Mode
                        </span>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {customerMachines.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <p className="mb-4">No machines added yet.</p>
                        <button 
                            onClick={() => { setEditingMachine(null); setIsMachineFormOpen(true); }}
                            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg"
                        >
                            Add First Machine
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {customerMachines.map(machine => (
                            <div 
                                key={machine.id} 
                                onClick={() => handleMachineCardClick(machine)}
                                className={`bg-white rounded-xl p-4 border shadow-sm relative active:scale-[0.99] transition-transform cursor-pointer group hover:border-blue-300 ${internalMode === 'manage' ? 'border-gray-200' : 'border-gray-200'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">{machine.name}</h3>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={(e) => handleEditMachineClick(e, machine)}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                            </svg>
                                        </button>
                                        
                                        {internalMode !== 'manage' && (
                                            <div className="text-gray-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600">
                                    <div>
                                        <span className="text-gray-400 text-xs uppercase tracking-wide">Serial</span>
                                        <div className="font-medium">{machine.serialNumber}</div>
                                    </div>
                                    <div>
                                         <span className="text-gray-400 text-xs uppercase tracking-wide">Location</span>
                                         <div className="font-medium flex items-center gap-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-gray-400">
                                                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                                            </svg>
                                            {machine.location || 'Not specified'}
                                         </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Machine Form Overlay */}
            {isMachineFormOpen && (
                <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
                    <div className="pt-12 px-4 pb-2 h-full overflow-y-auto">
                        <MachineForm 
                            initialData={editingMachine || {}} 
                            customerId={selectedCustomer!.id} 
                            onSave={handleAddOrUpdateMachine}
                            onCancel={() => setIsMachineFormOpen(false)}
                        />
                    </div>
                </div>
            )}
        </div>
      );
  }

  // STEP 3: FILL FORM
  return (
    <div className="flex flex-col min-h-full bg-white relative">
      {/* Header */}
      <div className="pt-12 pb-4 px-4 bg-white sticky top-0 z-10 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2">
            {!initialJob && (
                <button onClick={() => setStep(2)} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
            )}
            {initialJob && (
                 <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
            <h1 className="text-xl font-bold text-gray-900">
                {initialJob ? 'Edit Work Order' : 'Add Work Order'}
            </h1>
          </div>
          <button onClick={handleSubmit} className="text-blue-600 font-bold text-sm hover:text-blue-700">
            Submit
          </button>
      </div>

      <main className="flex-1 overflow-y-auto pb-8">
        {/* Context Banner */}
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex justify-between items-start">
                <div>
                     <h3 className="text-sm font-bold text-gray-900">{selectedCustomer?.name}</h3>
                     <p className="text-xs text-gray-500">{selectedMachine?.name} • {selectedMachine?.serialNumber}</p>
                </div>
                <button onClick={() => setStep(2)} className="text-xs text-blue-600 font-medium underline">Change Asset</button>
            </div>
        </div>

        <div className="px-4 py-6 space-y-6">
            
            {/* Machine Field (Read Only) */}
            <div>
                <label className="text-sm font-bold text-gray-900 mb-1.5 block">Machine</label>
                <div className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-gray-100 text-gray-700">
                    {selectedMachine?.name || 'No Machine Selected'}
                </div>
            </div>

            {/* Issue Title */}
            <div>
                 <label className="block text-gray-700 font-bold text-sm mb-1.5">Issue Title</label>
                 <input 
                    type="text"
                    value={issueTitle}
                    onChange={(e) => setIssueTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-black placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    placeholder="Brief summary"
                 />
            </div>

            {/* Issue Description */}
            <div>
                 <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-gray-700 font-bold text-sm">Issue description*</label>
                    <button 
                        onClick={handleAIAssist}
                        disabled={!issueTitle}
                        className={`text-xs flex items-center gap-1 font-medium ${!issueTitle ? 'opacity-50 cursor-not-allowed text-gray-400' : 'text-purple-600 hover:text-purple-700'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM6.727 10.923a1.5 1.5 0 01-1.38-2.146 6.5 6.5 0 0110.306 0 1.5 1.5 0 01-1.38 2.146h-7.546z" clipRule="evenodd" />
                        </svg>
                        AI Auto-Fill
                    </button>
                 </div>
                 <textarea 
                    value={issueDescription}
                    onChange={(e) => setIssueDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-black placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                    placeholder="Detailed explanation of the problem..."
                 />
            </div>

            {/* Priority */}
            <div>
                 <label className="block text-gray-900 font-bold text-sm mb-3">Priority</label>
                 <div className="flex gap-3">
                    {['Low', 'Medium', 'High'].map((p) => {
                        const isSelected = priority === p;
                        let colorClass = "bg-white text-gray-600 border-gray-300 hover:bg-gray-50";
                        if (isSelected) {
                            if (p === 'Low') colorClass = "bg-green-50 text-green-600 border-green-300 ring-1 ring-green-200 font-bold";
                            if (p === 'Medium') colorClass = "bg-orange-50 text-orange-600 border-orange-300 ring-1 ring-orange-200 font-bold";
                            if (p === 'High') colorClass = "bg-red-50 text-red-600 border-red-300 ring-1 ring-red-200 font-bold";
                        }
                        return (
                            <button
                                key={p}
                                onClick={() => setPriority(p as any)}
                                className={`flex-1 py-3 rounded-xl text-sm border transition-all flex items-center justify-center gap-2 ${colorClass}`}
                            >
                                {isSelected && <div className={`w-1.5 h-1.5 rounded-full bg-current`}></div>}
                                {p}
                            </button>
                        )
                    })}
                 </div>
            </div>

            {/* Instructions */}
            <div>
                 <label className="block text-gray-700 font-bold text-sm mb-1.5">Instructions for Engineer</label>
                 <textarea 
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-black placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                    placeholder="Gate code, specific entry instructions, etc."
                 />
            </div>
            
            {/* Attachments */}
            <div>
                <div className="flex justify-between items-center p-4 border border-gray-300 rounded-xl bg-white">
                    <label className="text-gray-900 font-bold text-sm">Attachments</label>
                    <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Due Date (Replaced Estimated Timeline) */}
            <div>
                <label className="block text-gray-900 font-bold text-sm mb-1.5">Due Date</label>
                <div className="relative">
                    <input 
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-black placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                        placeholder="Select date"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-500">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                    </div>
                </div>
            </div>

        </div>
      </main>

    </div>
  );
};
