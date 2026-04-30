import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const SearchBar = ({ onSearch, fullWidth = false }) => {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(keyword.trim())}`);
      onSearch?.();
    }
  };

  const handleClear = () => {
    setKeyword('');
  };

  return (
    <form onSubmit={handleSubmit} className="position-relative w-100" style={{ maxWidth: fullWidth ? '100%' : '480px' }}>
      <input
        type="text"
        className="form-control-custom w-100"
        placeholder="Search products..."
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        style={{
          paddingLeft: '40px',
          paddingRight: keyword ? '40px' : '16px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          transition: 'all var(--transition-fast)'
        }}
      />
      <FiSearch
        style={{
          position: 'absolute',
          left: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--text-muted)',
          pointerEvents: 'none'
        }}
        size={16}
      />
      {keyword && (
        <FiX
          onClick={handleClear}
          style={{
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'color var(--transition-fast)'
          }}
          size={16}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        />
      )}
    </form>
  );
};

export default SearchBar;