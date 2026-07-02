export const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

export const formatTime = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

export const formatDateTime = (date) => {
  if (!date) return "";
  return `${formatDate(date)} at ${formatTime(date)}`;
};

export const isToday = (date) => {
  if (!date) return false;
  const d = new Date(date);
  const t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
};

export const isTomorrow = (date) => {
  if (!date) return false;
  const d = new Date(date);
  const t = new Date();
  const tomorrow = new Date(t);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return d.getDate() === tomorrow.getDate() && d.getMonth() === tomorrow.getMonth() && d.getFullYear() === tomorrow.getFullYear();
};

export const isOverdue = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

export const getDayName = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", { weekday: "long" });
};

export const getShortDayName = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", { weekday: "short" });
};

export const getMonthName = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", { month: "long" });
};

export const getRelativeDay = (date) => {
  if (!date) return "";
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  const d = new Date(date);
  const days = Math.floor((d - new Date()) / (1000 * 60 * 60 * 24));
  if (days > 0 && days < 7) return `${getDayName(date)}`;
  return formatDate(date);
};

export const formatRelativeTime = (date) => {
  if (!date) return "";
  const diff = new Date() - new Date(date);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
};
