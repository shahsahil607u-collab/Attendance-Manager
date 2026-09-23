import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, GraduationCap, Code2 } from 'lucide-react';
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
        <footer className="app-footer" role="contentinfo">
          <div className="footer-inner">
            <div className="footer-brand-section">
              <div className="footer-brand-title">
                <span className="footer-brand-name">AttendanceMS</span>
                <span className="footer-separator" aria-hidden="true">•</span>
                <span className="footer-brand-desc">Institutional Attendance System</span>
              </div>
              <p className="footer-meta-note">
                Academic tracking, session analytics, and administrative reporting
              </p>
            </div>

            <div
              className="developer-badge"
              tabIndex={0}
              role="group"
              aria-label="Developer attribution: Sahil Irshad, AttendanceMS Technical Team"
            >
              <div className="developer-avatar" aria-hidden="true">
                <span className="developer-avatar-initials">SI</span>
                <span className="developer-status-pulse" />
              </div>
              <div className="developer-info">
                <div className="developer-role-tag">
                  <Code2 size={12} className="developer-role-icon" aria-hidden="true" />
                  <span>Developed by</span>
                </div>
                <div className="developer-name">Sahil Irshad</div>
                <div className="developer-affiliation">AttendanceMS · Technical Team</div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;

