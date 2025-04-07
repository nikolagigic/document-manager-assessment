export interface User {
  id: number;
  username: string;
  email: string;
}

export interface File {
  id: number;
  name: string;
  owner: User;
  created_at: string;
  updated_at: string;
}

export interface FileVersion {
  id: number;
  file: File;
  version_number: number;
  file_path: string;
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
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  getAuthHeader: () => { Authorization: string } | undefined;
}

export interface FileVersionItemProps {
  version: FileVersion;
  onDelete: (versionId: number) => void;
  onPermissionsChange: (versionId: number, canRead: number[], canWrite: number[]) => void;
}

export interface FileVersionsProps {
  fileId: number;
}

export interface FileUploadProps {
  onUploadComplete: () => void;
} 