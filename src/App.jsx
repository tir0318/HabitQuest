import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import QuickMemoBar from './components/QuickMemoBar';
import RoutineResetModal from './components/RoutineResetModal';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';
import { useStorage } from './contexts/StorageContext';
import { useDailyReset } from './hooks/useDailyReset';

// Lazy Load Pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Tasks = React.lazy(() => import('./pages/Tasks'));
const Habits = React.lazy(() => import('./pages/Habits'));
const Timer = React.lazy(() => import('./pages/Timer'));
const Journal = React.lazy(() => import('./pages/Journal'));
const Memo = React.lazy(() => import('./pages/Memo'));
const Calendar = React.lazy(() => import('./pages/Calendar'));
const Routines = React.lazy(() => import('./pages/Routines'));
const Stats = React.lazy(() => import('./pages/Stats'));
const Settings = React.lazy(() => import('./pages/Settings'));

const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    color: 'var(--text-secondary)'
  }}>
    <div className="spinner">読み込み中...</div>
  </div>
);

const Layout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { tasks, showRoutineResetModal, setShowRoutineResetModal, confirmRoutineReset } = useStorage();

  // Use independent hooks
  useDailyReset();

  const toggleMenu = () => setMobileMenuOpen(prev => !prev);
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className={`app-container ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      <Sidebar isOpen={mobileMenuOpen} onClose={closeMenu} />
      <div className="sidebar-overlay" onClick={closeMenu}></div>
      <main className="main-content">
        <Header onToggleMenu={toggleMenu} />
        <QuickMemoBar />
        <div className="page-container" id="page-container">
          <ErrorBoundary>
            <Suspense fallback={<LoadingSpinner />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
      <div id="modals-container"></div>
      <div className="toast-container" id="toast-container"></div>
      <div className="level-up-overlay" id="level-up-overlay"></div>
      {showRoutineResetModal && (
        <RoutineResetModal
          tasks={tasks}
          onConfirm={confirmRoutineReset}
          onCancel={() => setShowRoutineResetModal(false)}
        />
      )}
    </div>
  );
};


import { TimerProvider } from './contexts/TimerContext';

// ... (existing imports)

function App() {
  const { isLoading } = useStorage();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <TimerProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="routines" element={<Routines />} />
            <Route path="habits" element={<Habits />} />
            <Route path="timer" element={<Timer />} />
            <Route path="journal" element={<Journal />} />
            <Route path="memo" element={<Memo />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="stats" element={<Stats />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </TimerProvider>
    </BrowserRouter>
  );
}

export default App;
