import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, CalendarCheck, ClipboardList, BarChart3,
  Bell, ScrollText, Settings, ChevronLeft, ChevronRight, LogOut, GraduationCap
} from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
  const { user, logout, isCoordinator, isHod } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const coordinatorLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/students', icon: Users, label: 'Students' },
    { to: '/sessions', icon: CalendarCheck, label: 'Attendance' },
    { to: '/attendance-history', icon: ClipboardList, label: 'History' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
    { to: '/notifications', icon: Bell, label: 'Notifications' },
    { to: '/audit-logs', icon: ScrollText, label: 'Audit Logs' },
  ];

  const hodLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/students', icon: Users, label: 'Students' },
    { to: '/attendance-history', icon: ClipboardList, label: 'History' },
    { to: '/reports', icon: BarChart3, label: 'Reports' },
  ];

  const links = isHod ? hodLinks : coordinatorLinks;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} style={{
      width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)',
      position: 'fixed', left: 0, top: 0, bottom: 0, background: 'var(--gray-900)',
      display: 'flex', flexDirection: 'column', transition: 'width var(--transition-normal)',
      zIndex: 100, overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--gray-700)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--primary-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <GraduationCap size={22} color="#fff" />
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>AttendanceMS</div>
            <div style={{ color: 'var(--gray-400)', fontSize: '0.7rem', whiteSpace: 'nowrap' }}>Technical Team</div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {links.map(link => (
          <NavLink key={link.to} to={link.to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
            borderRadius: 'var(--radius-sm)', color: isActive ? '#fff' : 'var(--gray-400)',
            background: isActive ? 'var(--primary-700)' : 'transparent', marginBottom: 2,
            fontSize: '0.875rem', fontWeight: isActive ? 500 : 400, textDecoration: 'none',
            transition: 'all var(--transition-fast)', whiteSpace: 'nowrap',
          })}>
            <link.icon size={20} style={{ flexShrink: 0 }} />
            {!collapsed && link.label}
          </NavLink>
        ))}
      </nav>

      {/* User & Collapse */}
      <div style={{ borderTop: '1px solid var(--gray-700)', padding: '12px' }}>
        {!collapsed && (
          <div style={{ padding: '8px 12px', marginBottom: 8 }}>
            <div style={{ color: '#fff', fontSize: '0.8125rem', fontWeight: 500 }}>{user?.name}</div>
            <div style={{ color: 'var(--gray-400)', fontSize: '0.7rem', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        )}
        <button onClick={logout} style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', width: '100%',
          borderRadius: 'var(--radius-sm)', color: 'var(--gray-400)', background: 'transparent',
          border: 'none', fontSize: '0.875rem', cursor: 'pointer', whiteSpace: 'nowrap',
        }}>
          <LogOut size={20} /> {!collapsed && 'Logout'}
        </button>
        <button onClick={() => setCollapsed(!collapsed)} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px',
          width: '100%', borderRadius: 'var(--radius-sm)', color: 'var(--gray-500)',
          background: 'transparent', border: 'none', marginTop: 4, cursor: 'pointer',
        }}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
