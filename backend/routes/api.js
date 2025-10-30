import { Router } from 'express';
import axios from 'axios'; // We'll use axios to fetch from the live API
const router = Router();

let cartItems = [];

const calculateTotal = () => {
  return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
};

// --- UPDATED PRODUCTS ROUTE ---
router.get('/products', async (req, res) => {
  try {
    const response = await axios.get('https://fakestoreapi.com/products');
    // We send the data directly from the Fake Store API
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching products from Fake Store API:', error.message);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

router.get('/cart', (req, res) => {
  res.json({
    items: cartItems,
    total: calculateTotal(),
  });
});

router.post('/cart', async (req, res) => {
  const { productId, quantity } = req.body;
  
  // Find the product from the API
  let product;
  try {
    const response = await axios.get(`https://fakestoreapi.com/products/${productId}`);
    product = response.data;
  } catch (error) {
    return res.status(404).json({ message: 'Product not found' });
  }

  const existingItemIndex = cartItems.findIndex(item => item.id === productId);

  if (existingItemIndex > -1) {
    cartItems[existingItemIndex].quantity += quantity;
  } else {
    // Use the title, price, and image from the live API
    cartItems.push({ 
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity 
    });
  }

  res.status(201).json({
    items: cartItems,
    total: calculateTotal(),
  });
});

router.delete('/cart/:id', (req, res) => {
  const productId = parseInt(req.params.id, 10);
  cartItems = cartItems.filter(item => item.id !== productId);
  
  res.json({
    items: cartItems,
    total: calculateTotal(),
  });
});

router.post('/checkout', (req, res) => {
  const { cartItems: itemsFromClient, checkoutDetails } = req.body;
  
  const total = itemsFromClient.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const receipt = {
    receiptId: `VIBE-${Date.now()}`,
    timestamp: new Date().toISOString(),
    items: itemsFromClient,
    total: total,
    customer: checkoutDetails,
  };

  cartItems = [];

  res.json({ message: 'Checkout successful!', receipt });
});

export default router;