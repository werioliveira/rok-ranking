'use client';

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  step?: number;
}

export const PaginationPages = ({ currentPage, totalPages, onPageChange, loading = false, step = 5 }: PaginationProps) => {
  if (totalPages <= 1) return null;

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage <= 4) {
        for (let i = 2; i <= Math.min(5, totalPages - 1); i++) {
          pages.push(i);
        }
        if (totalPages > 5) {
          pages.push('...');
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 3) {
        pages.push('...');
        for (let i = Math.max(totalPages - 4, 2); i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pages = generatePageNumbers();

  const handleChangePage = (e: React.MouseEvent, page: number) => {
    e.preventDefault(); // 🔹 Impede comportamento padrão
    onPageChange(page);
  };

  return (
    <div className="flex items-center justify-center gap-2 py-8 flex-wrap">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={(e) => handleChangePage(e, Math.max(1, currentPage - step))}
        disabled={currentPage <= 1 || loading}
        className="h-9 w-9 p-0"
      >
        <ChevronsLeft className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={(e) => handleChangePage(e, currentPage - 1)}
        disabled={currentPage <= 1 || loading}
        className="h-9 w-9 p-0"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((page, index) =>
        page === '...' ? (
          <div key={`ellipsis-${index}`} className="flex items-center justify-center h-9 w-9">
            <MoreHorizontal className="h-4 w-4" />
          </div>
        ) : (
          <Button
            type="button"
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={(e) => handleChangePage(e, page as number)}
            disabled={loading}
            className="h-9 w-9 p-0"
          >
            {page}
          </Button>
        )
      )}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={(e) => handleChangePage(e, currentPage + 1)}
        disabled={currentPage >= totalPages || loading}
        className="h-9 w-9 p-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={(e) => handleChangePage(e, Math.min(totalPages, currentPage + step))}
        disabled={currentPage >= totalPages || loading}
        className="h-9 w-9 p-0"
      >
        <ChevronsRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
