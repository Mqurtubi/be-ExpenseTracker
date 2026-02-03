const randomColor = () => {
  const colors = [
    "#EF4444", // red
    "#F97316", // orange
    "#F59E0B", // amber
    "#10B981", // green
    "#3B82F6", // blue
    "#6366F1", // indigo
    "#8B5CF6", // violet
    "#EC4899", // pink
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
export { randomColor };
