/**
 * cn — conditional class name utility
 * Merges Tailwind classes, filtering out falsy values.
 * Usage: cn("base-class", condition && "conditional-class", ...)
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
