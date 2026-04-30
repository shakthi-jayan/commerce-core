import { Spinner } from 'react-bootstrap';
import { useTheme } from '../../context/ThemeContext';

const Loader = ({ size = 'md', text = 'Loading...', fullScreen = false }) => {
  const { theme } = useTheme();
  const sizes = { sm: '1.5rem', md: '3rem', lg: '4rem' };
  
  const spinnerStyle = {
    width: sizes[size],
    height: sizes[size],
    borderWidth: '3px',
    color: 'var(--primary)'
  };

  const containerStyle = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'var(--bg-primary)',
    zIndex: 9999
  } : {
    minHeight: '200px'
  };

  return (
    <div 
      className="d-flex flex-column align-items-center justify-content-center" 
      style={containerStyle}
    >
      <Spinner animation="border" style={spinnerStyle} />
      {text && (
        <p className="mt-3" style={{ 
          color: 'var(--text-secondary)', 
          fontSize: 'var(--font-size-sm)',
          fontWeight: '500'
        }}>
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;