export const getErrorCode = (message: string): number | null => {
  const match = message.match(/status:\s*(\d{3})/i);
  return match ? parseInt(match[1]) : null;
};
