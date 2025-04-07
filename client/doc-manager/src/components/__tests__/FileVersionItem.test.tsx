import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../../contexts/AuthContext';
import FileVersionItem from '../FileVersionItem';

const mockUsers = [
  { id: 1, username: 'owner', email: 'owner@example.com' },
  { id: 2, username: 'user1', email: 'user1@example.com' },
  { id: 3, username: 'user2', email: 'user2@example.com' }
];

const mockVersion = {
  id: 1,
  version_number: 1,
  file: {
    id: 1,
    name: 'test.pdf',
    owner: mockUsers[0]
  },
  file_owner: mockUsers[0],
  can_read: [mockUsers[1], mockUsers[2]],
  can_write: [mockUsers[1]],
  created_at: '2024-03-20T12:00:00Z',
  uploaded_at: '2024-03-20T12:00:00Z'
};

const mockOnDelete = jest.fn();

describe('FileVersionItem', () => {
  const renderComponent = (props = {}) => {
    return render(
      <AuthProvider>
        <FileVersionItem
          version={mockVersion}
          onDelete={mockOnDelete}
          users={mockUsers}
          {...props}
        />
      </AuthProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders version information correctly', () => {
    renderComponent();
    
    expect(screen.getByText('Version 1')).toBeInTheDocument();
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
  });

  it('shows manage permissions button for file owner', () => {
    renderComponent();
    
    expect(screen.getByText('Manage Permissions')).toBeInTheDocument();
  });

  it('does not show manage permissions button for non-owners', () => {
    const nonOwnerVersion = {
      ...mockVersion,
      file_owner: mockUsers[1]
    };
    
    renderComponent({ version: nonOwnerVersion });
    
    expect(screen.queryByText('Manage Permissions')).not.toBeInTheDocument();
  });

  it('opens permissions dialog when manage permissions button is clicked', () => {
    renderComponent();
    
    fireEvent.click(screen.getByText('Manage Permissions'));
    
    expect(screen.getByText('Manage Permissions')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked', async () => {
    renderComponent();
    
    fireEvent.click(screen.getByText('Delete Version'));
    
    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(1);
    });
  });
}); 