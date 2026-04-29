const OnlineDot = ({ isOnline, size = "sm" }) => {
  if (!isOnline) return null;

  const sizes = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-3.5 h-3.5",
  };

  return (
    <span
      className={`${sizes[size]} rounded-full bg-online online-glow absolute bottom-0 right-0`}
    />
  );
};

export default OnlineDot;
