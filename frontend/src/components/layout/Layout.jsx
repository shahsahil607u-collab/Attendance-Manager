import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="page-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
