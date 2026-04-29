const Avatar = ({ src, name, size = "md", className = "" }) => {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
    "2xl": "w-24 h-24 text-2xl",
  };

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ring-2 ring-white/20 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-semibold flex-shrink-0 ring-2 ring-white/20 ${className}`}
    >
      {initials}
    </div>
  );
};

export default Avatar;
