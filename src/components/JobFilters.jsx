import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import BtnFilter from './BtnFilter';

// A custom hook for debouncing a value.
// This prevents the API from being called on every keystroke in the search input.
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function to cancel the timeout if the value changes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// --- Main JobFilters Component ---
const JobFilters = ({
  search, setSearch,
  status, setStatus,
  types, setTypes,
  amounts, setAmounts,
  sort, setSort
}) => {

  const [internalSearch, setInternalSearch] = useState(search);
  const debouncedSearch = useDebounce(internalSearch, 500); // 500ms delay

  useEffect(() => {
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const clearFilters = () => {
    setInternalSearch('');
    setStatus('');
    setTypes([]);
    setAmounts([]);
    setSort('order');
  };

  const handleTypeToggle = (type) => {
    setTypes((prevTypes) => 
      prevTypes.includes(type)
        ? prevTypes.filter((t) => t !== type)
        : [...prevTypes, type]
    );
  };

  const handleAmountToggle = (amt) => {
    setAmounts((prevAmounts) => 
      prevAmounts.includes(amt)
        ? prevAmounts.filter((a) => a !== amt)
        : [...prevAmounts, amt]
    );
  };

  const statusOptions = ['active', 'archived'];
  const typeOptions = ['Full-time', 'Part-time', 'Intern', 'Remote', 'Contract'];
  const amountOptions = ['10', '15', '20', '25', '30'];
  const sortOptions = { 'order': 'Default Order', 'title': 'Title' };

  return (
    <div className="bg-secondary p-4 rounded-xl border-[0.01rem] border-border mb-6">

      
      {/*-------------------------------------1st Row Filters Search, Status and Sort By--------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Search Input */}
        <div className="lg:col-span-2">
          <label htmlFor="search" className="block font-[400] mb-1">Search</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-grey" />
            </div>
            <input
              id="search"
              type="text"
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              placeholder="Search by job title..."
              className="w-full hover:ring-1 hover:ring-grey bg-background border-[0.01rem] border-border rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-grey focus:border-border transition"
            />
          </div>
        </div>

        {/* Status Dropdown */}
        <div>
          <label htmlFor="status" className="block font-[400] mb-1">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full hover:ring-1 hover:ring-grey bg-background border-[0.01rem] border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-grey focus:border-border transition appearance-none"
          >
            <option value="">All</option>
            {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
          
        {/* Sort By */}
        <div>
          <label htmlFor="sort" className="block font-[400] mb-1">Sort by:</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full bg-background border-[0.01rem] border-border rounded-md px-3 py-2 focus:outline-none hover:ring-1 hover:ring-grey focus:ring-1 focus:ring-grey focus:border-border transition appearance-none"
          >
            {Object.entries(sortOptions).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
        </div>
      </div>
      

      {/* --------------------------------Job Types Filter---------------------------------------- */}
      <div className='flex items-center my-4 gap-5'>
        <p className='font-[400]'>Job Types: </p>
        <div className='flex items-center gap-2'>
          {typeOptions.map((type) => (
            <BtnFilter key={type} label={type} onClick={() => handleTypeToggle(type)} isActive={types.includes(type)}/>
          ))}
        </div>
      </div>


      {/* ---------------------------Bottom Row: Amount Filter and Clear------------------------------------- */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between">
        <div className='flex items-center gap-5'>
          <p className='font-[400]'>Amounts: </p>
          <div className='flex items-center gap-2'>
            {amountOptions.map((amt) => (
              <BtnFilter key={amt} label={`$${amt}K`} onClick={() => handleAmountToggle(amt)} isActive={amounts.includes(amt)}/>
            ))}
          </div>
        </div>
      
        <button onClick={clearFilters}
          className="mt-4 sm:mt-0 rounded-md text-sm cursor-pointer hover:bg-dark-grey bg-grey text-background font-medium py-[0.4rem] px-3 transition flex items-center gap-1.5"
        >
          <X size={16} className="text-background"/>
          Clear All Filters
        </button>
      </div>


    </div>
  );
};

export default JobFilters