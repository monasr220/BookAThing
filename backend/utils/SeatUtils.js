/**
 * Formats row identifier into upper-case trimmed string.
 */
const formatRowName = (row) => {
    if (!row || typeof row !== 'string') return '';
    return row.trim().toUpperCase();
};

/**
 * Validates and parses seat numeric position within a row.
 * Returns a positive integer, or null if invalid.
 */
const parseSeatNumber = (numberInRow) => {
    const parsed = parseInt(numberInRow, 10);
    if (isNaN(parsed) || parsed <= 0) return null;
    return parsed;
};

/**
 * Generates a unique seat identifier string (e.g. "A1").
 */
const generateSeatIdentifier = (rowName, seatNum) => {
    return `${rowName}${seatNum}`;
};

module.exports = {
    formatRowName,
    parseSeatNumber,
    generateSeatIdentifier
};
