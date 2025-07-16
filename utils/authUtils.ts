import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  email: string;
  role: string;
  [key: string]: any;
}

export const decodeToken = async(token: string): DecodedToken | null => {
  try {
    const decoded =await jwtDecode<DecodedToken>(token);
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const isAdmin = async(token: string): boolean => {
  const decoded = await decodeToken(token);
  return decoded?.role == '1';
};