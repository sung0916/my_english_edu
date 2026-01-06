import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages < 1) {
    return null;
  }

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-row justify-center items-center py-4 space-x-2">
      {/* 이전 페이지 버튼 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-2 border rounded hover:bg-gray-100 ${
          currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'text-blue-600'
        }`}
      >
        &lt;
      </button>

      {/* 페이지 번호 버튼들 */}
      {pageNumbers.map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          className={`px-3 py-2 border rounded ${
            currentPage === pageNumber
              ? 'bg-blue-600 text-white border-blue-600 font-bold'
              : 'text-blue-600 border-gray-300 hover:bg-gray-100'
          }`}
        >
          {pageNumber}
        </button>
      ))}

      {/* 다음 페이지 버튼 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-2 border rounded hover:bg-gray-100 ${
          currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'text-blue-600'
        }`}
      >
        &gt;
      </button>
    </div>
  );
};
