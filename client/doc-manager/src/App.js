import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import FileVersions from './FileVersions';
import Login from './components/Login';
import { useAuth } from './contexts/AuthContext';

function AppContent() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="App">
      <header className="App-header">
        <h1>Document Version Manager</h1>
        {isAuthenticated && (
          <button onClick={logout} className="logout-button">
            Logout
          </button>
        )}
      </header>
      <main className="App-main">
        {isAuthenticated ? <FileVersions /> : <Login />}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
