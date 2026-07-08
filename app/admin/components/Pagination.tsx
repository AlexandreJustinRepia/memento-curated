type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-zinc-900/70 p-4 text-sm text-zinc-300 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-full border border-white/10 bg-zinc-950/80 px-3 py-2 text-xs font-semibold transition hover:border-gold-400/20 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
              page === currentPage
                ? "border border-gold-400 bg-gold-400/10 text-gold-400"
                : "border border-white/10 bg-zinc-950/80 text-zinc-300 hover:border-gold-400/20 hover:text-gold-400"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-full border border-white/10 bg-zinc-950/80 px-3 py-2 text-xs font-semibold transition hover:border-gold-400/20 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <p className="text-xs text-zinc-500">
        Page {currentPage} of {totalPages}
      </p>
    </div>
  );
}
