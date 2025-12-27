
import React, { useState } from 'react';
import { Customer, Machine, ScreenName, User, Job } from './types';
import { BottomNav } from './components/BottomNav';
import { Profile } from './components/Profile';
import { CreateWorkOrder } from './components/CreateWorkOrder';
import { MyJobs } from './components/MyJobs';
import { Header } from './components/Header';
import { JobDetails } from './components/JobDetails';
import { Login } from './components/Login';

// Mock Data
const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Old Gym', email: 'contact@oldgym.com', address: '1515 Broadway, New York, NY 10036', phone: '555-0101', contactName: 'Nico Williams' },
  { id: 'c2', name: 'Gold Gym', email: 'support@goldgym.com', address: '200 West St, New York, NY 10282', phone: '555-0102', contactName: 'Sarah Connor' },
  { id: 'c3', name: 'Planet Fitness - Brooklyn', email: 'manager@pf-brooklyn.com', address: '450 Fulton St, Brooklyn, NY 11201', phone: '555-0103', contactName: 'Mike Johnson' },
  { id: 'c4', name: 'Equinox Hudson Yards', email: 'info@equinox-hy.com', address: '32 Hudson Yards, New York, NY 10001', phone: '555-0104', contactName: 'Jessica Pearson' },
  { id: 'c5', name: 'Crunch Fitness', email: 'help@crunch-unionsq.com', address: '113 4th Ave, New York, NY 10003', phone: '555-0105', contactName: 'Harvey Specter' },
  { id: 'c6', name: 'NYU Sports Center', email: 'facilities@nyu.edu', address: '181 Mercer St, New York, NY 10012', phone: '555-0106', contactName: 'Louis Litt' },
  { id: 'c7', name: 'Chelsea Piers Fitness', email: 'support@chelseapiers.com', address: '60 Chelsea Piers, New York, NY 10011', phone: '555-0107', contactName: 'Donna Paulsen' },
  { id: 'c8', name: 'Blink Fitness', email: 'contact@blink-soho.com', address: '533 Broadway, New York, NY 10012', phone: '555-0108', contactName: 'Rachel Zane' },
  { id: 'c9', name: 'Life Time Sky', email: 'concierge@lifetime-sky.com', address: '605 W 42nd St, New York, NY 10036', phone: '555-0109', contactName: 'Alex Williams' },
];

const MOCK_MACHINES: Machine[] = [
  { id: 'm1', customerId: 'c1', name: 'Flexi Strength 9000', serialNumber: 'FS-9000-X', installDate: '2022-01-15', location: 'Main Floor - Bay 3' },
  { id: 'm2', customerId: 'c2', name: 'PowerMax 3000', serialNumber: 'PM-3000-A', installDate: '2023-05-10', location: 'Server Room B' },
  { id: 'm3', customerId: 'c1', name: 'Hydraulic Press', serialNumber: 'HP-5000', installDate: '2021-11-20', location: 'Warehouse Section A' },
  { id: 'm4', customerId: 'c1', name: 'Conveyor Belt System', serialNumber: 'CB-2024-01', installDate: '2024-02-01', location: 'Loading Dock' },
  { id: 'm5', customerId: 'c2', name: 'Cooling Tower', serialNumber: 'CT-888', installDate: '2020-06-15', location: 'Roof Level 2' },
  { id: 'm6', customerId: 'c1', name: 'Robotic Arm', serialNumber: 'RA-X7', installDate: '2023-08-30', location: 'Assembly Line 4' },
  { id: 'm7', customerId: 'c2', name: 'Backup Generator', serialNumber: 'BG-9000', installDate: '2019-04-12', location: 'Basement Utility' },
  // New machines
  { id: 'm8', customerId: 'c3', name: 'Treadmill T-1000', serialNumber: 'TM-1000-01', installDate: '2023-01-10', location: 'Cardio Zone' },
  { id: 'm9', customerId: 'c3', name: 'Elliptical E-500', serialNumber: 'EL-500-02', installDate: '2023-01-15', location: 'Cardio Zone' },
  { id: 'm10', customerId: 'c4', name: 'Steam Room Generator', serialNumber: 'SG-200', installDate: '2022-08-05', location: 'Spa Area' },
  { id: 'm11', customerId: 'c4', name: 'Pool Filtration System', serialNumber: 'PFS-X1', installDate: '2022-07-20', location: 'Pool Maintenance Room' },
  { id: 'm12', customerId: 'c5', name: 'Cable Crossover', serialNumber: 'CC-300', installDate: '2021-03-12', location: 'Weight Room' },
  { id: 'm13', customerId: 'c6', name: 'Basketball Hoop Mechanism', serialNumber: 'BB-HOOP-1', installDate: '2019-09-01', location: 'Main Court' },
  { id: 'm14', customerId: 'c6', name: 'Scoreboard Controller', serialNumber: 'SC-BOARD-1', installDate: '2019-09-01', location: 'Control Booth' },
  { id: 'm15', customerId: 'c7', name: 'Climbing Wall Auto-Belay', serialNumber: 'AB-WALL-5', installDate: '2023-11-11', location: 'Climbing Zone' },
  { id: 'm16', customerId: 'c8', name: 'Rowing Machine Concept2', serialNumber: 'RM-C2-99', installDate: '2024-01-05', location: 'Rowing Studio' },
  { id: 'm17', customerId: 'c9', name: 'Sauna Heater', serialNumber: 'SH-550', installDate: '2023-06-20', location: 'Locker Room A' },
];

const MOCK_JOBS: Job[] = [
    {
        id: 'j1',
        customerId: 'c1',
        machineId: 'm1',
        engineerId: 'u1',
        type: 'Standard',
        title: 'Cable snapped',
        description: 'Main resistance cable snapped during operation. Emergency repair required for main production line conveyor system. Belt stops intermittently causing production delays.',
        priority: 'High',
        status: 'Scheduled',
        date: '2025-01-19',
        instructions: 'Enter via side gate code 1234. Report to site manager upon arrival.',
        estimatedDuration: '4 hours',
    },
    {
        id: 'j2',
        customerId: 'c2',
        machineId: 'm2',
        engineerId: 'u1',
        type: 'Standard',
        title: 'Display malfunction',
        description: 'Screen flickering intermittently.',
        priority: 'Low',
        status: 'In Progress',
        date: '2025-01-19',
    },
    {
        id: 'j3',
        customerId: 'c1',
        machineId: 'm3',
        engineerId: 'u1',
        type: 'Standard',
        title: 'Oil leak',
        description: 'Hydraulic fluid leaking from main cylinder.',
        priority: 'Medium',
        status: 'Scheduled',
        date: '2025-01-19',
    },
     {
        id: 'j4',
        customerId: 'c2',
        machineId: 'm7',
        engineerId: 'u1',
        type: 'Standard',
        title: 'Routine Maintenance',
        description: 'Annual servicing required.',
        priority: 'High',
        status: 'Scheduled',
        date: '2025-01-19',
    },
    {
        id: 'j5',
        customerId: 'c2',
        engineerId: 'u1',
        type: 'AnnualService',
        title: 'Annual Equipment Certification',
        description: 'Complete inspection of all gym equipment for safety certification.',
        priority: 'None',
        status: 'Scheduled',
        date: '2025-01-20',
        instructions: 'Check all moving parts, lubrication levels, and emergency stops.',
        checklist: [
             { machineId: 'm2', status: 'Pending' },
             { machineId: 'm5', status: 'Pending' },
             { machineId: 'm7', status: 'Pending' },
        ]
    },
];

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('profile');
  const [machines, setMachines] = useState<Machine[]>(MOCK_MACHINES);
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentScreen('home'); // Redirect to home on login
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('home'); // Reset screen for next login
  };

  const handleNavigate = (screen: ScreenName) => {
    setCurrentScreen(screen);
  };

  const handleAddMachine = (newMachine: Machine) => {
    setMachines((prev) => [...prev, newMachine]);
  };

  const handleUpdateMachine = (updatedMachine: Machine) => {
    setMachines((prev) => prev.map(m => m.id === updatedMachine.id ? updatedMachine : m));
  };

  const handleCreateJobSuccess = () => {
      // In a real app, this would receive the new job and add it
      setCurrentScreen('my-jobs');
  };

  const handleJobClick = (job: Job) => {
      setSelectedJob(job);
      setCurrentScreen('job-details');
  };

  const handleUpdateJob = (updatedJob: Job) => {
      setJobs(prev => prev.map(j => j.id === updatedJob.id ? updatedJob : j));
      setSelectedJob(updatedJob);
      setCurrentScreen('job-details');
  };

  if (!user) {
      return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentScreen) {
      case 'home':
        return (
            <div className="flex flex-col min-h-full bg-gray-50">
                <Header title="Home" />
                <div className="flex-1 flex items-center justify-center text-gray-400 p-8 text-center">
                    <div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 text-gray-300">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        <p>Welcome, {user.name}.</p>
                        <p className="text-sm mt-1">Role: <span className="font-semibold text-blue-600">{user.role === 'FullTime' ? 'Full-Time Engineer' : 'Trainee Engineer'}</span></p>
                    </div>
                </div>
            </div>
        );
      case 'my-jobs':
         return (
             <MyJobs 
                jobs={jobs} 
                customers={MOCK_CUSTOMERS} 
                machines={machines}
                onJobClick={handleJobClick}
                onCreateWorkOrder={() => setCurrentScreen('create-work-order')}
                userRole={user.role}
             />
         );
      case 'job-details':
        if (!selectedJob) return null;
        const jobCustomer = MOCK_CUSTOMERS.find(c => c.id === selectedJob.customerId);
        const jobMachine = machines.find(m => m.id === selectedJob.machineId);
        // For annual service, we pass all machines of that customer
        const customerMachines = machines.filter(m => m.customerId === selectedJob.customerId);
        
        return (
            <JobDetails 
                job={selectedJob}
                customer={jobCustomer}
                machine={jobMachine} // undefined for annual service
                allMachines={customerMachines}
                onBack={() => setCurrentScreen('my-jobs')}
                onEdit={() => setCurrentScreen('edit-job')}
                onViewAllMachines={() => setCurrentScreen('customer-assets')}
                onUpdateJob={handleUpdateJob}
                userRole={user.role}
            />
        );
      case 'edit-job':
        if (!selectedJob || user.role === 'Trainee') return null; // Protect route
        return (
            <CreateWorkOrder
                onBack={() => setCurrentScreen('job-details')}
                onSuccess={() => {/* handled by onUpdateJob */}}
                customers={MOCK_CUSTOMERS}
                machines={machines}
                onAddMachine={handleAddMachine}
                onUpdateMachine={handleUpdateMachine}
                initialJob={selectedJob}
                onUpdateJob={handleUpdateJob}
            />
        );
      case 'customer-assets':
        if (!selectedJob || user.role === 'Trainee') return null; // Protect route
        const assetCustomer = MOCK_CUSTOMERS.find(c => c.id === selectedJob.customerId);
        return (
            <CreateWorkOrder
                onBack={() => setCurrentScreen('job-details')}
                onSuccess={() => {}}
                customers={MOCK_CUSTOMERS}
                machines={machines}
                onAddMachine={handleAddMachine}
                onUpdateMachine={handleUpdateMachine}
                initialCustomer={assetCustomer}
                mode="manage"
            />
        );
      case 'history':
         return (
             <div className="flex flex-col min-h-full bg-gray-50">
                 <Header title="History" />
                 <div className="flex-1 flex items-center justify-center text-gray-400">
                     <p>Job History</p>
                 </div>
             </div>
         );
      case 'profile':
        return (
          <Profile 
            user={user} 
            onCreateWorkOrderClick={() => setCurrentScreen('create-work-order')}
            onLogout={handleLogout}
          />
        );
      case 'create-work-order':
        if (user.role === 'Trainee') return null; // Protect route
        
        // Determine allowed customers based on open jobs (not 'Completed')
        const activeCustomerIds = Array.from(new Set(jobs.filter(j => j.status !== 'Completed').map(j => j.customerId)));

        return (
          <CreateWorkOrder
            onBack={() => setCurrentScreen('profile')}
            onSuccess={handleCreateJobSuccess}
            customers={MOCK_CUSTOMERS}
            allowedCustomerIds={activeCustomerIds} // Pass restricted list
            machines={machines}
            onAddMachine={handleAddMachine}
            onUpdateMachine={handleUpdateMachine}
          />
        );
      default:
        return <div>Screen not found</div>;
    }
  };

  return (
    // Replaced min-h-screen with h-[100dvh] and flex-col to effectively constrain components inside the phone frame
    <div className="max-w-md mx-auto h-[100dvh] bg-white shadow-2xl relative flex flex-col font-sans text-gray-900 selection:bg-blue-100 overflow-hidden">
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide relative">
        {renderContent()}
      </div>
      
      {/* Static Bottom Navigation */}
      {currentScreen !== 'create-work-order' && currentScreen !== 'job-details' && currentScreen !== 'edit-job' && currentScreen !== 'customer-assets' && (
        <BottomNav currentScreen={currentScreen} onNavigate={handleNavigate} />
      )}
    </div>
  );
};

export default App;
