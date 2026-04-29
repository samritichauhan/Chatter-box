const SkeletonLoader = ({ count = 5 }) => {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-[var(--surface)]" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-[var(--surface)] rounded w-1/3" />
            <div className="h-3 bg-[var(--surface)] rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
