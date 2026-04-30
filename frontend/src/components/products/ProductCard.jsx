import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, Badge } from 'react-bootstrap';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { toggleWishlistItem } from '../../redux/slices/wishlistSlice';
import { formatPrice, getMainImage, getDiscountPercentage } from '../../utils/helpers';
import useCart from '../../hooks/useCart';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { add } = useCart();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const wishlistItems = useSelector((s) => s.wishlist.items);
  const inWishlist = wishlistItems.includes(product._id);
  const discount = getDiscountPercentage(product.price, product.compareAtPrice);
  const image = getMainImage(product.images);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to add items to cart'); return; }
    try {
      await add(product._id, 1);
      toast.success('Added to cart!');
    } catch { toast.error('Failed to add to cart'); }
  };

  const handleWishlist = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { toast.error('Please login to add to wishlist'); return; }
    try {
      const result = await dispatch(toggleWishlistItem(product._id)).unwrap();
      toast.success(result.action === 'added' ? 'Added to wishlist' : 'Removed from wishlist');
    } catch {
      toast.error('Failed to update wishlist');
    }
  }, [dispatch, product._id, isAuthenticated]);

  return (
    <Link to={`/product/${product._id}`} className="product-card-link">
      <Card className="product-card" data-theme={theme}>
        <div className="product-card__image-wrapper">
          <img src={image} alt={product.name} className="product-card__image" loading="lazy" />
          {discount > 0 && <Badge className="product-card__discount">-{discount}%</Badge>}
          {product.stock === 0 && <div className="product-card__out-of-stock">Out of Stock</div>}
          <div className="product-card__actions">
            <button className="product-card__action-btn" onClick={handleAddToCart} title="Add to cart" disabled={product.stock === 0}>
              <FiShoppingCart size={16} />
            </button>
            <button
              className={`product-card__action-btn ${inWishlist ? 'product-card__action-btn--active' : ''}`}
              onClick={handleWishlist}
              title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <FiHeart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
        <Card.Body className="product-card__body">
          {product.category && <span className="product-card__category">{product.category.name}</span>}
          <h3 className="product-card__title">{product.name}</h3>
          <div className="product-card__rating">
            <FiStar size={14} className="star-filled" fill="#FBBF24" />
            <span>{product.ratings?.toFixed(1) || '0.0'}</span>
            <span className="product-card__reviews">({product.numReviews || 0})</span>
          </div>
          <div className="product-card__price-row">
            <span className="price">{formatPrice(product.price)}</span>
            {product.compareAtPrice > product.price && (
              <span className="price-old">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
};

export default ProductCard;