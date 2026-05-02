// Room codes are 4 digits; the server owns the deck and the actual code generation.
export function normalizeRoomCode(input) {
  return (input || '').replace(/\D/g, '').slice(0, 4);
}
