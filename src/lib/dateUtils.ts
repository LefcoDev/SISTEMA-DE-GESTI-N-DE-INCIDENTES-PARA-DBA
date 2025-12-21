/**
 * Utilidades para formateo de fechas
 * Evita problemas con date-fns v3 export type issues
 */

export const formatDate = (date: Date | string, formatType: 'short' | 'long' | 'datetime' | 'time' | 'full' = 'short'): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return 'Invalid date';
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const day = d.getDate();
  const month = months[d.getMonth()];
  const monthFull = monthsFull[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  switch (formatType) {
    case 'short':
      return `${day}/${d.getMonth() + 1}/${year}`;
    case 'long':
      return `${month} ${day}, ${year}`;
    case 'datetime':
      return `${day}/${String(d.getMonth() + 1).padStart(2, '0')}/${year} ${hours}:${minutes}:${seconds}`;
    case 'time':
      return `${month} ${day}, ${hours}:${minutes}`;
    case 'full':
      return `${monthFull} ${day}, ${year}`;
    default:
      return `${month} ${day}, ${year}`;
  }
};

export const isPast = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() < Date.now();
};
