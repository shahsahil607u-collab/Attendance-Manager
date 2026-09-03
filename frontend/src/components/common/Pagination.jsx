import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, pages, total, onPageChange }) => {
  if (pages <= 1) return null;
  const getPages = () => {
    const items = [];
    const start = Math.max(1, page - 2);
    const end = Math.min(pages, page + 2);
    for (let i = start; i <= end; i++) items.push(i);
    return items;
  };
  return (
    <div>
      <div className="pagination-info">Showing page {page} of {pages} ({total} total)</div>
      <div className="pagination">
        <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}><ChevronLeft size={16} /></button>
        {getPages().map(p => (
          <button key={p} className={p === page ? 'active' : ''} onClick={() => onPageChange(p)}>{p}</button>
        ))}
        <button disabled={page >= pages} onClick={() => onPageChange(page + 1)}><ChevronRight size={16} /></button>
      </div>
    </div>
  );
};

export default Pagination;
