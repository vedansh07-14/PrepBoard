import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const generateId = () => crypto.randomUUID();

/**
 * Calculate overall progress for a subject given its units and completedTopics array.
 */
export const calculateSubjectProgress = (units, completedTopics) => {
  const totalTopics = units.reduce((acc, unit) => acc + unit.topics.length, 0);
  if (totalTopics === 0) return 0;
  const completed = completedTopics.filter(id =>
    units.some(unit => unit.topics.some(t => t.id === id))
  ).length;
  return Math.round((completed / totalTopics) * 100);
};

/**
 * Calculate progress for a single unit.
 */
export const calculateUnitProgress = (unit, completedTopics) => {
  if (!unit || unit.topics.length === 0) return 0;
  const completed = unit.topics.filter(t => completedTopics.includes(t.id)).length;
  return Math.round((completed / unit.topics.length) * 100);
};
