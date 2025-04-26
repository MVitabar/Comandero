import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { UserRole } from '@/types/permissions';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  restaurantName?: string;
  currentEstablishmentName?: string;
}

export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

interface UserProviderProps {
  children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);