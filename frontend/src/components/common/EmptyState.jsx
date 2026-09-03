import { Inbox } from 'lucide-react';

const EmptyState = ({ title = 'No data found', message = '', icon: Icon = Inbox }) => (
  <div className="empty-state">
    <Icon size={48} />
    <h3>{title}</h3>
    {message && <p>{message}</p>}
  </div>
);

export default EmptyState;
