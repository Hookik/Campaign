/**
 * UUID Generator
 * Uses crypto.randomUUID() (Node 19+) with fallback to uuid package
 */

const { v4: uuidv4 } = require('uuid');

function generateId() {
  return uuidv4();
}

module.exports = { generateId };
