export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '৳0';
  return `৳${Number(amount).toLocaleString('en-US')}`;
};

export const calculatePercentage = (raised, goal) => {
  if (!goal || goal <= 0) return 0;
  const percentage = Math.round((raised / goal) * 100);
  return Math.min(percentage, 100);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export const daysLeft = (createdAtString, durationDays = 30) => {
  if (!createdAtString) return 30;
  const created = new Date(createdAtString);
  const now = new Date();
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const remaining = durationDays - diffDays;
  return remaining > 0 ? remaining : 0;
};
