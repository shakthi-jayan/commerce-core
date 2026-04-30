import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { cacheGet, cacheSet, cacheDelete } from '../config/redis.js';

/** @desc Get user cart @route GET /api/cart @access Private */
export const getCart = async (req, res, next) => {
  try {
    const cacheKey = `cart:${req.user._id}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.status(200).json(cached);

    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price images stock isActive');
    if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

    const response = { success: true, cart };
    await cacheSet(cacheKey, response, 300);
    res.status(200).json(response);
  } catch (error) { next(error); }
};

/** @desc Add item to cart @route POST /api/cart @access Private */
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (!product.isActive) return res.status(400).json({ success: false, message: 'Product is not available' });
    if (product.stock < quantity) return res.status(400).json({ success: false, message: `Only ${product.stock} items in stock` });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const existingItem = cart.items.find(item => item.product.toString() === productId);
    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > product.stock) return res.status(400).json({ success: false, message: `Only ${product.stock} items in stock` });
      existingItem.quantity = newQty;
      existingItem.price = product.price;
    } else {
      cart.items.push({ product: productId, quantity, price: product.price });
    }

    await cart.save();
    await cart.populate('items.product', 'name price images stock isActive');
    await cacheDelete(`cart:${req.user._id}`);
    res.status(200).json({ success: true, cart });
  } catch (error) { next(error); }
};

/** @desc Update cart item quantity @route PUT /api/cart/:productId @access Private */
export const updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    const item = cart.items.find(i => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not in cart' });

    const product = await Product.findById(req.params.productId);
    if (quantity > product.stock) return res.status(400).json({ success: false, message: `Only ${product.stock} items in stock` });

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    } else {
      item.quantity = quantity;
      item.price = product.price;
    }

    await cart.save();
    await cart.populate('items.product', 'name price images stock isActive');
    await cacheDelete(`cart:${req.user._id}`);
    res.status(200).json({ success: true, cart });
  } catch (error) { next(error); }
};

/** @desc Remove item from cart @route DELETE /api/cart/:productId @access Private */
export const removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });

    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
    await cart.save();
    await cart.populate('items.product', 'name price images stock isActive');
    await cacheDelete(`cart:${req.user._id}`);
    res.status(200).json({ success: true, cart });
  } catch (error) { next(error); }
};

/** @desc Clear cart @route DELETE /api/cart @access Private */
export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    await cacheDelete(`cart:${req.user._id}`);
    res.status(200).json({ success: true, message: 'Cart cleared', cart });
  } catch (error) { next(error); }
};
