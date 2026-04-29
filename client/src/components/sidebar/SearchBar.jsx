import { Search } from "lucide-react";

const SearchBar = ({ value, onChange, placeholder = "Search conversations..." }) => {
  return (
    <div className="px-4 py-3">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400/60" />
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/6 border border-white/8 text-sm text-indigo-100 placeholder:text-indigo-400/50 focus:outline-none focus:border-purple-500/40 focus:bg-white/8 transition-all"
        />
      </div>
    </div>
  );
};

export default SearchBar;
