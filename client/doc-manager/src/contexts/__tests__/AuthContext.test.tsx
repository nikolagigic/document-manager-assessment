import React from 'react';
import { render, act, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { User } from '../../types';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('AuthContext', () => {
  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
  };

  const mockToken = 'mock-token-123';

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockFetch.mockReset();
  });

  it('should initialize with no user and token', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should load user and token from localStorage on mount', () => {
    mockLocalStorage.getItem
      .mockReturnValueOnce(mockToken)
      .mockReturnValueOnce(JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle login correctly', async () => {
    // Mock the fetch response for login
    mockFetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ access: mockToken, ...mockUser }),
      })
    );

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    await act(async () => {
      // @ts-ignore - The login function in the test is different from the actual implementation
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.user).toEqual({ access: mockToken, ...mockUser });
    expect(result.current.token).toBe(mockToken);
    expect(result.current.isAuthenticated).toBe(true);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('token', mockToken);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify({ access: mockToken, ...mockUser }));
  });

  it('should handle logout correctly', async () => {
    // First login
    mockLocalStorage.getItem
      .mockReturnValueOnce(mockToken)
      .mockReturnValueOnce(JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    // Then logout
    await act(async () => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('token');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
  });

  it('should return correct auth header when authenticated', () => {
    mockLocalStorage.getItem
      .mockReturnValueOnce(mockToken)
      .mockReturnValueOnce(JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    const authHeader = result.current.getAuthHeader();
    expect(authHeader).toEqual({
      Authorization: `Bearer ${mockToken}`,
    });
  });

  it('should return empty auth header when not authenticated', () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    const authHeader = result.current.getAuthHeader();
    expect(authHeader).toEqual({});
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    const TestComponent = () => {
      useAuth();
      return null;
    };
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
  });
}); 