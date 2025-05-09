import { useState } from 'react';
import { User } from '../models/User';
import { UserService } from '../api/useService';

export const useUserRegistration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const registerUser = async (userData: User) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await UserService.registerActiveUser(userData);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return { registerUser, isLoading, error, success };
};