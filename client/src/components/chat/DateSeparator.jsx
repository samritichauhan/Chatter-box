import { formatDate } from "../../lib/utils";

const DateSeparator = ({ date }) => {
  return (
    <div className="flex items-center justify-center my-4">
      <span className="date-separator px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-gray-500 text-xs font-mono shadow-sm border border-gray-100">
        {formatDate(date)}
      </span>
    </div>
  );
};

export default DateSeparator;
