import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, GraduationCap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="app-layout">
      {/* Mobile Top Bar */}
      <header className="mobile-topbar">
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <div className="mobile-topbar-brand">
          <GraduationCap size={20} color="var(--primary-600)" />
          <span>AttendanceMS</span>
        </div>
        <div className="mobile-topbar-user">
          <span className="mobile-role-tag">{user?.role}</span>
        </div>
      </header>

      {/* Backdrop overlay for mobile */}
      {mobileOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="main-content">
        <div className="page-wrapper">
          {children}
        </div>
        <footer className="app-footer">
          Developed by <span className="developer-name">Sahil Irshad</span>
        </footer>
      </div>
    </div>
  );
};

export default Layout;

