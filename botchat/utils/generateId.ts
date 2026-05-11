import uuid from 'react-native-uuid';

/**
 * Generate a unique ID using UUID v4
 */
export const generateId = (): string => {
  return uuid.v4() as string;
};
