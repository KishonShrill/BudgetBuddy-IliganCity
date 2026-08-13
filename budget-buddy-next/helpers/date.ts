/**
 * Converts a MongoDB ISO date string into a readable format: "Oct 24, 2026"
 * @param dateStr - The ISO date string from MongoDB (or a Date object)
 */
export const mongoDateToText = (dateStr: string | Date | number): string => {
    const date = new Date(dateStr);

    // Check if the date is actually valid before trying to format it
    if (isNaN(date.getTime())) {
        return "Invalid Date";
    }

    const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        year: "numeric"
    };

    return date.toLocaleDateString("en-US", options);
};
