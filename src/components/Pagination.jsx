

const Pagination = ({ 
  page, setPage,
  pageSize, setPageSize,
  totalItems
}) => {

  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePrev = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="flex items-center gap-4 mt-4">
      <button
        onClick={handlePrev}
        disabled={page === 1}
        className="px-3 py-[0.1rem] rounded-md font-[400] cursor-pointer hover:bg-blue border-[0.1rem] disabled:opacity-50"
      >
        Prev
      </button>

      <span>Page {page} of {totalPages}</span>

      <button
        onClick={handleNext}
        disabled={page === totalPages}
        className="px-3 py-[0.1rem] rounded-md font-[400] cursor-pointer hover:bg-blue border-[0.1rem] disabled:opacity-50"
      >
        Next
      </button>

      <span>Page Size: </span>

      <select
        value={pageSize}
        onChange={(e) => {
          setPageSize(Number(e.target.value));
          setPage(1); // reset to first page
        }}
        className="border rounded p-1"
      >
        {[6, 9, 12, 15].map((size) => (
          <option className="bg-background text-text" key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Pagination
