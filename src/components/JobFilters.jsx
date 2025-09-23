import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

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

// --- Reusable MultiSelect Dropdown Component ---
const MultiSelectDropdown = ({ options, selected, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleSelect = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-background border-[0.01rem] border-border rounded-md px-4 py-2 text-left flex items-center justify-between hover:border-grey focus:outline-none focus:ring-1 focus:ring-grey focus:border-border transition"
      >
        <span className={selected.length > 0 ? "" : "text-dark-grey"}>
            {selected.length > 0 ? `${selected.length} selected` : placeholder}
        </span>
        <ChevronDown className={`h-5 w-5 transform transition-transform ${isOpen ? '-rotate-180' : 'rotate-0'}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-background border-[0.01rem] border-border rounded-md shadow-lg">
          <ul className="max-h-60 overflow-auto py-1">
            {options.map((option) => (
              <li key={option} className="px-3 py-2 hover:bg-[#2f2a31] cursor-pointer" onClick={() => handleSelect(option)}>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selected.includes(option)}
                    readOnly
                    className="h-4 w-4 rounded border-border bg-background"
                  />
                  <span className="ml-3">{option}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
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

  const statusOptions = ['active', 'archived'];
  const typeOptions = ['Full-time', 'Part-time', 'Intern', 'Remote', 'Contract'];
  const amountOptions = ['10', '15', '20', '25', '30'];
  const sortOptions = { 'order': 'Default Order', 'title': 'Title' };

  return (
    <div className="bg-secondary p-4 rounded-xl border-[0.01rem] border-border mb-6">
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
                        className="w-full bg-background border-[0.01rem] border-border rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-grey focus:border-border transition"
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
                    className="w-full bg-background border-[0.01rem] border-border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-grey focus:border-border transition appearance-none"
                >
                    <option value="">All</option>
                    {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
            </div>
            
            {/* Type MultiSelect */}
            <div>
                <label className="block font-[400] mb-1">Job Type</label>
                <MultiSelectDropdown
                    options={typeOptions}
                    selected={types}
                    onChange={setTypes}
                    placeholder="Select types"
                />
            </div>

             {/* Amount MultiSelect is removed to match screenshot layout, but can be added back if needed */}
        </div>

        {/* --- Bottom Row: Sort and Clear --- */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between">
            <div>
                <label htmlFor="sort" className="font-[400] mr-2">Sort by:</label>
                <select
                    id="sort"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="bg-background border-[0.01rem] border-border rounded-md py-1 pl-2 pr-8 focus:outline-none focus:ring-1 focus:ring-grey focus:border-border transition appearance-none"
                >
                    {Object.entries(sortOptions).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                    ))}
                </select>
            </div>
             <button
                onClick={clearFilters}
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