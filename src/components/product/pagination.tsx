import { Pagination as AntPagination } from 'antd';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
      <AntPagination
        current={currentPage}
        total={totalPages * 10}
        pageSize={10}
        showSizeChanger={false}
        onChange={onPageChange}
      />
    </div>
  );
}
