const StatCard = ({ icon: Icon, label, value, sub, color = 'blue' }) => (
  <div className="stat-card">
    <div className={`stat-icon ${color}`}><Icon size={24} /></div>
    <div className="stat-info">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

export default StatCard;
