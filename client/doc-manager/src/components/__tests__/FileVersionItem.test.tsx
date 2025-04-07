import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FileVersionItem from '../FileVersionItem';
import { User } from '../../types';

// Mock the AuthContext
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, username: 'testuser' },
    getAuthHeader: () => ({ Authorization: 'Bearer test-token' }),
  }),
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('FileVersionItem', () => {
  const mockVersion = {
    id: 1,
    file: {
      id: 1,
      name: 'test.pdf',
      owner: {
        id: 1,
        username: 'testuser',
      },
    },
    version_number: 1,
    file_name: 'test.pdf',
    content_hash: 'abc123',
    created_at: '2024-03-20T13:00:00Z',
    uploaded_at: '2024-03-20T13:00:00Z',
    can_read: [],
    can_write: [],
    file_owner: {
      id: 1,
      username: 'testuser',
    },
  };

  const mockUsers: User[] = [
    { id: 1, username: 'testuser', email: 'test@example.com' },
    { id: 2, username: 'otheruser', email: 'other@example.com' },
  ];

  const mockOnDelete = jest.fn();

  const renderComponent = () => {
    return render(
      <FileVersionItem
        version={mockVersion}
        users={mockUsers}
        onDelete={mockOnDelete}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.confirm
    window.confirm = jest.fn(() => true);
    // Reset fetch mock
    mockFetch.mockReset();
    mockFetch.mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      })
    );
  });

  it('renders version information correctly', () => {
    renderComponent();

    expect(screen.getByText('Version 1')).toBeInTheDocument();
    expect(screen.getByText('test.pdf')).toBeInTheDocument();
    expect(screen.getByText('abc123')).toBeInTheDocument();
  });

  it('shows manage permissions button for file owner', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: /manage permissions/i })).toBeInTheDocument();
  });

  it('does not show manage permissions button for non-owners', () => {
    const nonOwnerVersion = {
      ...mockVersion,
      file_owner: {
        id: 2,
        username: 'otheruser',
      },
    };

    render(
      <FileVersionItem
        version={nonOwnerVersion}
        users={mockUsers}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.queryByRole('button', { name: /manage permissions/i })).not.toBeInTheDocument();
  });

  it('opens permissions dialog when manage permissions button is clicked', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /manage permissions/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('calls onDelete when delete button is clicked and confirmed', async () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith(1);
    });
  });

  it('does not call onDelete when delete is cancelled', () => {
    window.confirm = jest.fn(() => false);
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('shows error message when delete fails', async () => {
    // Mock fetch to return an error
    mockFetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Network error'))
    );

    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(screen.getByText('Failed to delete version')).toBeInTheDocument();
    });
  });
}); 