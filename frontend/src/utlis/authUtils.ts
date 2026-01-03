export const isTokenExpired = (expiresAt: number | null): boolean => {
  if (!expiresAt) return true;
  return expiresAt * 1000 < Date.now(); 
};
