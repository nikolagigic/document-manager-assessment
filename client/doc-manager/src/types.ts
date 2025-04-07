export interface User {
  id: number;
  username: string;
  email: string;
}

export interface FileVersion {
  id: number;
  file: number;
  version_number: number;
  file_name: string;
  content_hash: string;
  created_at: string;
  can_read: User[];
  can_write: User[];
  file_owner: {
    id: number;
    username: string;
  };
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (newToken: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  getAuthHeader: () => { Authorization: string } | undefined;
} 