import React, { useEffect, useState } from 'react';
import './App.css';

const App = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Handle install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    // Handle online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
      }
    };

    // Handle PWA updates
    const handleUpdateFound = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Listen for PWA updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
    
    checkIfInstalled();

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstalled(true);
    } else {
      console.log('User dismissed the install prompt');
    }

    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const handleUpdateClick = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      });
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>My Progressive Web App</h1>
        <div className="status-indicators">
          <div className={`status ${isOnline ? 'online' : 'offline'}`}>
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </div>
          {isInstalled && (
            <div className="status installed">
              📱 Installed
            </div>
          )}
          {updateAvailable && (
            <div className="status update">
              🔄 Update Available
            </div>
          )}
        </div>
      </header>

      <main className="app-main">
        <div className="content">
          <h2>Welcome to My PWA!</h2>
          <p>This is a Progressive Web App that you can install on your mobile device.</p>
          
          <div className="features">
            <div className="feature">
              <h3>🚀 Fast & Reliable</h3>
              <p>Works offline and loads instantly</p>
            </div>
            <div className="feature">
              <h3>📱 Installable</h3>
              <p>Add to home screen like a native app</p>
            </div>
            <div className="feature">
              <h3>🔄 Auto Updates</h3>
              <p>Always gets the latest version</p>
            </div>
          </div>

          {showInstallButton && !isInstalled && (
            <div className="install-prompt">
              <div className="install-content">
                <h3>Install MyPWA</h3>
                <p>Get the full app experience by installing it on your device</p>
                <button 
                  className="install-button"
                  onClick={handleInstallClick}
                >
                  📱 Install App
                </button>
              </div>
            </div>
          )}

          {updateAvailable && (
            <div className="update-prompt">
              <div className="update-content">
                <h3>Update Available</h3>
                <p>A new version of the app is available. Click to update.</p>
                <button 
                  className="update-button"
                  onClick={handleUpdateClick}
                >
                  🔄 Update Now
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>Built with React + Vite + PWA</p>
      </footer>
    </div>
  );
};

export default App;
