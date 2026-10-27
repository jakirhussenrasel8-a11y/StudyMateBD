import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { DemoBanner } from './components/common/DemoBanner';
import { Toast } from './components/common/Toast';
import { AuthModal } from './components/auth/AuthModal';

import { DashboardView } from './components/dashboard/DashboardView';
import { SubjectsView } from './components/subjects/SubjectsView';
import { TasksView } from './components/tasks/TasksView';
import { RoutineView } from './components/routine/RoutineView';
import { ExamsView } from './components/exams/ExamsView';
import { PomodoroView } from './components/timer/PomodoroView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Trigger quick creation from Dashboard
  const handleOpenCreateTask = () => {
    setActiveTab('tasks');
  };

  const handleOpenCreateSubject = () => {
    setActiveTab('subjects');
  };

  const handleOpenCreateExam = () => {
    setActiveTab('exams');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Toast Notifications */}
      <Toast />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onOpenSettings={() => setActiveTab('settings')}
      />

      {/* Top Header */}
      <Header onOpenAuth={() => setIsAuthModalOpen(true)} />

      {/* Clear Demo Mode / Cloud Connected Banner */}
      <DemoBanner 
        onOpenAuth={() => setIsAuthModalOpen(true)} 
        onOpenSettings={() => setActiveTab('settings')} 
      />

      {/* Main Body Area: Sidebar (Desktop) + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop / Tablet Sidebar */}
        <Sidebar />

        {/* Dynamic Content View with mobile bottom nav clearance */}
        <main className="flex-1 px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-28 md:pb-8 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenCreateTask={handleOpenCreateTask}
              onOpenCreateSubject={handleOpenCreateSubject}
              onOpenCreateExam={handleOpenCreateExam}
            />
          )}

          {activeTab === 'subjects' && (
            <SubjectsView onOpenCreate={() => {}} />
          )}

          {activeTab === 'tasks' && (
            <TasksView onOpenCreate={() => {}} />
          )}

          {activeTab === 'routine' && (
            <RoutineView onOpenCreate={() => {}} />
          )}

          {activeTab === 'exams' && (
            <ExamsView onOpenCreate={() => {}} />
          )}

          {activeTab === 'timer' && (
            <PomodoroView />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
