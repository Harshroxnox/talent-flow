import { Search } from 'lucide-react';

const SearchBar = ({ value, onChange, placeholder }) => {
  return (
    <div className="relative flex items-center w-full">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-blue border border-border rounded-md py-3 pl-6 pr-14 text-text focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-secondary p-2 rounded-full">
        <Search className="w-5 h-5 text-grey" />
      </div>
    </div>
  );
};

export default SearchBar;