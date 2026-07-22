// Load status of the artist's order queue.
// Set the value below to change the active status of the workspace:
// 0 - Свободный (Green, no price changes)
// 1 - Средний (Yellow, +20% markup on the entire order)
// 2 - Полный (Red, fully blocks ordering, EXCEPT if "No Deadline" is selected/ON)
export const CURRENT_LOAD_STATUS: 0 | 1 | 2 = 1;
