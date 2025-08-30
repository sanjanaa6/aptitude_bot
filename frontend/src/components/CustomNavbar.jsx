import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext.jsx';

const CustomNavbar = ({ 
  title = "Quantitative Tutor", 
  subtitle = "Welcome back!", 
  streakDays = 0, 
  completionRate = 0,
  onLogout,
  onVoiceSettings,
  userLabel = "User"
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const { isDark, toggleTheme, colors } = useTheme();

  const navbarStyle = {
    background: colors.surface,
    backdropFilter: 'blur(20px)',
    borderBottom: `1px solid ${colors.border}`,
    padding: '16px 24px',
    color: colors.text,
    boxShadow: `0 8px 32px ${colors.shadow}`,
    position: 'sticky',
    top: 0,
    zIndex: 1000
  };

  const navbarInnerStyle = {
    width: '100%',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  };

  const logoContainer = {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    animation: 'slideInLeft 0.8s ease-out'
  };

  const logoIcon = {
    width: 48,
    height: 48,
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
    display: 'grid',
    placeItems: 'center',
    boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
    animation: 'pulse 2s ease-in-out infinite'
  };

  const headerText = {
    animation: 'fadeInUp 0.8s ease-out 0.2s both'
  };

  const headerTitle = {
    fontWeight: '800',
    fontSize: '28px',
    color: colors.text,
    margin: 0,
    background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  };

  const headerSubtitle = {
    fontSize: '16px',
    color: colors.textSecondary,
    margin: '4px 0 0 0',
    fontWeight: '500'
  };

  const navbarActions = {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    animation: 'slideInRight 0.8s ease-out 0.4s both'
  };

  const actionButton = {
    background: colors.hover,
    border: `1px solid ${colors.borderSecondary}`,
    color: colors.text,
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    textDecoration: 'none'
  };

  const actionButtonHover = {
    background: colors.hover,
    borderColor: colors.accent,
    transform: 'translateY(-1px)',
    boxShadow: `0 4px 12px ${colors.accent}`
  };

  const toggleButton = {
    background: colors.hover,
    border: `1px solid ${colors.borderSecondary}`,
    color: colors.text,
    padding: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    width: '40px',
    height: '40px',
  };

  const toggleButtonHover = {
    background: colors.hover,
    borderColor: colors.accent,
    transform: 'scale(1.05)',
  };

  const mobileMenuStyle = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    background: colors.surface,
    backdropFilter: 'blur(20px)',
    borderBottom: `1px solid ${colors.border}`,
    padding: '16px',
    display: isMenuOpen ? 'block' : 'none',
    animation: isMenuOpen ? 'slideDown 0.3s ease-out' : 'none',
    boxShadow: `0 8px 32px ${colors.shadow}`,
    zIndex: 999
  };

  const mobileMenuItem = {
    padding: '12px 16px',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    color: colors.text,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const mobileMenuItemHover = {
    background: colors.hover,
    borderLeft: `3px solid ${colors.primary}`
  };

  return (
    <nav style={navbarStyle} className="navbar-container">
      <div style={navbarInnerStyle}>
        {/* Logo and Title */}
        <div style={logoContainer} className="logo-container">
          <div style={logoIcon} className="logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div style={headerText}>
            <h1 style={headerTitle} className="navbar-title">{title}</h1>
            <p style={headerSubtitle}>{subtitle} {userLabel}!</p>
          </div>
        </div>

        {/* Desktop Actions */}
        <div style={navbarActions} className="navbar-actions">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              ...toggleButton,
              ...(hoveredItem === 'theme' ? toggleButtonHover : {})
            }}
            onMouseEnter={() => setHoveredItem('theme')}
            onMouseLeave={() => setHoveredItem(null)}
            title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
          >
            {isDark ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
          
          {/* Mobile Toggle Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            style={{
              ...toggleButton,
              ...(hoveredItem === 'toggle' ? toggleButtonHover : {})
            }}
            onMouseEnter={() => setHoveredItem('toggle')}
            onMouseLeave={() => setHoveredItem(null)}
            title="Toggle Menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12"/>
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18"/>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div style={mobileMenuStyle}>
        <div
          style={{
            ...mobileMenuItem,
            ...(hoveredItem === 'mobile-theme' ? mobileMenuItemHover : {})
          }}
          onMouseEnter={() => setHoveredItem('mobile-theme')}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={toggleTheme}
        >
          {isDark ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
          {isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
        </div>
        <div
          style={{
            ...mobileMenuItem,
            ...(hoveredItem === 'mobile-streak' ? mobileMenuItemHover : {})
          }}
          onMouseEnter={() => setHoveredItem('mobile-streak')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          {streakDays} Day Streak
        </div>
        <div
          style={{
            ...mobileMenuItem,
            ...(hoveredItem === 'mobile-progress' ? mobileMenuItemHover : {})
          }}
          onMouseEnter={() => setHoveredItem('mobile-progress')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4"/>
            <path d="M21 12c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2z"/>
            <path d="M3 12c1 0 2-1 2-2s-1-2-2-2-2 1-2 2 1 2 2 2z"/>
            <path d="M12 3c0 1-1 2-2 2s-2 1-2 2 1 1 2 2 2 1 2 2 1-1 2-2 2-1 2-2-1-1-2-2-2-1-2-2z"/>
          </svg>
          {completionRate}% Complete
        </div>
        <div
          style={{
            ...mobileMenuItem,
            ...(hoveredItem === 'mobile-voice' ? mobileMenuItemHover : {})
          }}
          onMouseEnter={() => setHoveredItem('mobile-voice')}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={onVoiceSettings}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
          Voice Settings
        </div>
        <div
          style={{
            ...mobileMenuItem,
            ...(hoveredItem === 'mobile-logout' ? mobileMenuItemHover : {})
          }}
          onMouseEnter={() => setHoveredItem('mobile-logout')}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={onLogout}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 17l5-5-5-5"/>
            <path d="M15 12H3"/>
            <path d="M21 19V5a2 2 0 0 0-2-2h-6"/>
          </svg>
          Logout
        </div>
      </div>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        /* Responsive styles */
        @media (max-width: 768px) {
          .navbar-container {
            padding: 12px 16px;
          }
          .navbar-title {
            font-size: 24px;
          }
          .logo-icon {
            width: 40px;
            height: 40px;
          }
          .logo-container {
            gap: 12px;
          }
          .navbar-actions {
            gap: 8px;
          }
        }
        
        @media (max-width: 480px) {
          .navbar-container {
            padding: 10px 12px;
          }
          .navbar-title {
            font-size: 20px;
          }
          .logo-icon {
            width: 36px;
            height: 36px;
          }
          .logo-container {
            gap: 8px;
          }
        }
      `}</style>
    </nav>
  );
};

export default CustomNavbar;
