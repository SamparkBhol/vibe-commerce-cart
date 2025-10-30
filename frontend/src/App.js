import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';
const PROMO_CODE = 'VIBE10';
const LOW_STOCK_AMOUNT = 5;

const TRIVIA_QUESTIONS = [
  {
    question: "What does 'LTS' stand for in 'Node.js LTS'?",
    options: { a: "Long Term Support", b: "Lite Tech Server", c: "Linked Time Script" },
    answer: "a",
  },
  {
    question: "Which company developed the React framework?",
    options: { a: "Google", b: "Meta (Facebook)", c: "Microsoft" },
    answer: "b",
  },
  {
    question: "What is the primary purpose of Tailwind CSS?",
    options: { a: "Database management", b: "State management", c: "Utility-first CSS styling" },
    answer: "c",
  },
  {
    question: "Which of these is NOT a JavaScript data type?",
    options: { a: "string", b: "boolean", c: "integer" },
    answer: "c",
  }
];

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-20">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col animate-pulse">
      <div className="h-72 w-full bg-gray-200"></div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="flex items-center justify-between mt-2">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="mt-4 w-full bg-gray-200 h-12 rounded-lg"></div>
      </div>
    </div>
  );
}

function Notification({ id, message, type = 'success', onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, 3000); 

    return () => clearTimeout(timer);
  }, [id, onRemove]);

  const bgColor = type === 'success'
    ? 'bg-gradient-to-r from-green-500 to-green-600'
    : 'bg-gradient-to-r from-red-500 to-red-600';

  return (
    <div 
      className={`relative ${bgColor} text-white py-3 px-6 rounded-lg shadow-xl transition-all duration-300 transform animate-fade-in`}
      onClick={() => onRemove(id)}
    >
      {message}
    </div>
  );
}

function NotificationContainer({ notifications, onRemove }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3">
      {notifications.map(note => (
        <Notification
          key={note.id}
          id={note.id}
          message={note.message}
          type={note.type}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

function StarRating({ rating }) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <svg key={`full-${i}`} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
      ))}
      {halfStar && (
        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292zM10 5.118L8.89 8.664a1 1 0 00-.95.69H4.53l2.8 2.034a1 1 0 00.364 1.118l-1.07 3.292 2.8-2.034a1 1 0 001.175 0l.001-.001h.001z" /></svg>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
      ))}
    </div>
  );
}

function Header({ onNavClick, currentPage, cartItemCount, wishlistCount, onWishlistClick, walletBalance, onCartClick, onProfileClick, onRecentClick }) {
  const getLinkClasses = (page) => {
    return `py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 transform ${
      currentPage === page
        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md scale-105'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
    }`;
  };

  return (
    <header className="bg-white/80 shadow-md sticky top-0 z-40 backdrop-blur-lg">
      <div className="container mx-auto px-4 py-4 max-w-7xl flex justify-between items-center">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
          Vibe Commerce
        </h1>
        <nav className="flex space-x-2 items-center">
          <div className="flex items-center bg-green-100 text-green-700 font-medium py-1.5 px-3 rounded-full text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            ${walletBalance.toFixed(2)}
          </div>
          <button onClick={() => onNavClick('store')} className={getLinkClasses('store')}>
            Store
          </button>
          <button onClick={() => onNavClick('history')} className={getLinkClasses('history')}>
            Order History
          </button>
          <button onClick={onRecentClick} className="relative text-gray-500 hover:text-blue-600 transition-colors p-2" title="Recently Viewed">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button onClick={onWishlistClick} className="relative text-gray-500 hover:text-purple-600 transition-colors p-2" title="Wishlist">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {wishlistCount}
              </span>
            )}
          </button>
          <button onClick={onCartClick} className="relative text-gray-500 hover:text-indigo-600 transition-colors p-2" title="My Cart">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartItemCount}
              </span>
            )}
          </button>
          <button onClick={onProfileClick} className="relative text-gray-500 hover:text-gray-800 transition-colors p-2" title="My Profile">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </nav>
      </div>
    </header>
  );
}

function CategoryTabs({ categories, selectedCategory, onSelectCategory }) {
  const getTabClasses = (category) => {
    return `capitalize text-sm font-medium py-2 px-4 rounded-full transition-all duration-300 transform ${
      selectedCategory === category
        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
        : 'bg-white text-gray-600 hover:bg-gray-100 hover:shadow-md'
    }`;
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <button onClick={() => onSelectCategory('all')} className={getTabClasses('all')}>
        All
      </button>
      {categories.map(category => (
        <button key={category} onClick={() => onSelectCategory(category)} className={getTabClasses(category)}>
          {category}
        </button>
      ))}
    </div>
  );
}

function ProductControls({ searchQuery, onSearchChange, sortOrder, onSortChange }) {
  return (
    <div className="mb-6 flex flex-col md:flex-row gap-4">
      <div className="relative flex-grow">
        <input
          type="text"
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search for products..."
          className="w-full pl-10 pr-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
        <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <div className="relative">
        <select
          value={sortOrder}
          onChange={onSortChange}
          className="w-full md:w-auto appearance-none bg-white border border-gray-300 rounded-full py-3 px-5 pr-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        >
          <option value="popular">Sort by Popularity</option>
          <option value="price-asc">Sort by Price: Low to High</option>
          <option value="price-desc">Sort by Price: High to Low</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    </div>
  );
}

function ProductList({ products, onAddToCart, onProductClick, onToggleWishlist, wishlist }) {
  const [addingProductId, setAddingProductId] = useState(null);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    setAddingProductId(product.id);
    onAddToCart(product);
    setTimeout(() => {
      setAddingProductId(null);
    }, 1500);
  };

  const handleWishlistClick = (e, product) => {
    e.stopPropagation();
    onToggleWishlist(product);
  };

  const isWished = (productId) => wishlist.some(item => item.id === productId);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <div 
          key={product.id} 
          className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col group"
        >
          <div 
            className="h-72 w-full flex items-center justify-center p-6 overflow-hidden relative cursor-pointer"
            onClick={() => onProductClick(product)}
          >
            <img
              src={product.image}
              alt={product.title}
              className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
            />
            <button
              onClick={(e) => handleWishlistClick(e, product)}
              className="absolute top-4 right-4 bg-white/70 p-2 rounded-full text-gray-600 hover:text-red-500 transition-all duration-300 opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isWished(product.id) ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
              </svg>
            </button>
            {product.rating.count > 400 && (
              <span className="absolute top-4 left-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">Bestseller</span>
            )}
            {product.onSale && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">SALE</span>
            )}
            {product.stock === 0 ? (
               <span className="absolute bottom-4 left-4 bg-gray-700 text-white text-xs font-medium px-3 py-1 rounded-full">Out of Stock</span>
            ) : product.stock <= LOW_STOCK_AMOUNT && (
              <span className="absolute bottom-4 left-4 bg-red-100 text-red-700 text-xs font-medium px-3 py-1 rounded-full">Only {product.stock} left!</span>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/60 to-transparent transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-1/2 group-hover:translate-y-0">
               <button
                onClick={(e) => handleAddToCart(e, product)}
                disabled={addingProductId === product.id || product.stock === 0}
                className={`w-full text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 transform ${
                  addingProductId === product.id
                    ? 'bg-green-500'
                    : product.stock === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105'
                }`}
              >
                {addingProductId === product.id ? 'Added!' : (product.stock === 0 ? 'Out of Stock' : 'Add to Cart')}
              </button>
            </div>
          </div>
          <div className="p-5 flex flex-col flex-grow">
            <h3 className="text-md font-semibold text-gray-800 flex-grow h-16 line-clamp-2">{product.title}</h3>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-baseline space-x-2">
                <p className="text-gray-800 text-2xl font-bold">${product.price.toFixed(2)}</p>
                {product.onSale && (
                  <p className="text-gray-400 text-lg line-through">${product.oldPrice.toFixed(2)}</p>
                )}
              </div>
              <div className="flex items-center space-x-1">
                <StarRating rating={product.rating.rate} />
                <span className="text-xs text-gray-500">({product.rating.count})</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Sidebar({ show, onClose, children, direction = 'right' }) {
  const slideClass = direction === 'right' ? 'translate-x-0' : 'translate-x-0';
  const hiddenClass = direction === 'right' ? 'translate-x-full' : '-translate-x-full';
  const animationClass = direction === 'right' ? 'animate-slide-in-right' : 'animate-slide-in-left';
  
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${show ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>
      <div 
        className={`fixed top-0 ${direction === 'right' ? 'right-0' : 'left-0'} w-full max-w-md h-full bg-white shadow-xl z-50 flex flex-col transform transition-transform duration-300 ${show ? slideClass : hiddenClass} ${show ? animationClass : ''}`}
      >
        {children}
      </div>
    </>
  );
}

function MiniCartSidebar({ show, onClose, cart, onRemoveFromCart, onUpdateQuantity, onClearCart, onCheckout, discount, isCouponApplied, onApplyCoupon }) {
  const [promoCode, setPromoCode] = useState('');

  const subtotal = cart.total;
  const discountAmount = subtotal * discount;
  const finalTotal = subtotal - discountAmount;
  
  const handleApplyClick = () => {
    onApplyCoupon(promoCode);
    setPromoCode('');
  };

  return (
    <Sidebar show={show} onClose={onClose} direction="right">
      <div className="flex justify-between items-center p-5 border-b">
        <h3 className="text-2xl font-semibold text-gray-900">Your Cart</h3>
        <button
          onClick={onClose}
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
        </button>
      </div>

      {cart.items.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500 text-center mt-6 font-medium text-lg">Your cart is empty.</p>
        </div>
      ) : (
        <>
          <div className="flex-1 p-6 overflow-y-auto space-y-5">
            <button onClick={onClearCart} className="w-full text-sm text-center text-red-500 hover:text-red-700 font-medium mb-2">
              Empty Cart
            </button>
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between space-x-3">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-contain flex-shrink-0 p-1 border border-gray-100" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{item.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <button onClick={() => onUpdateQuantity(item, item.quantity - 1)} className="text-indigo-500 w-6 h-6 rounded-full border border-indigo-300 hover:bg-indigo-100">-</button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item, item.quantity + 1)} className="text-indigo-500 w-6 h-6 rounded-full border border-indigo-300 hover:bg-indigo-100">+</button>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                  <p className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => onRemoveFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 text-xs font-medium transition-colors duration-200"
                    title="Remove item"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 border-t space-y-4">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount (10%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input 
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Promo Code (VIBE10)"
                disabled={isCouponApplied}
                className={`flex-1 border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 ${isCouponApplied ? 'bg-gray-100' : ''}`}
              />
              <button 
                onClick={handleApplyClick}
                disabled={isCouponApplied}
                className="bg-gray-700 text-white text-sm font-medium px-4 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isCouponApplied ? 'Applied' : 'Apply'}
              </button>
            </div>

            <button
              onClick={() => { onCheckout(); onClose(); }}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </Sidebar>
  );
}

function ProfileSidebar({ show, onClose, user, walletBalance, onAddFunds, onLogin, onLogout }) {
  return (
    <Sidebar show={show} onClose={onClose} direction="right">
      <div className="flex justify-between items-center p-5 border-b">
        <h3 className="text-2xl font-semibold text-gray-900">My Profile</h3>
        <button
          onClick={onClose}
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
        </button>
      </div>
      
      <div className="flex-1 p-6 space-y-6">
        {user ? (
          <>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-medium">
                {user.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{user.name}</h4>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>

            <div className="p-5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg">
              <span className="text-sm font-light opacity-80">Wallet Balance</span>
              <p className="text-4xl font-bold">${walletBalance.toFixed(2)}</p>
            </div>
            
            <button
              onClick={() => { onAddFunds(100); }}
              className="w-full bg-indigo-100 text-indigo-700 py-3 px-4 rounded-lg font-semibold hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300"
            >
              + Add $100 to Wallet
            </button>
          </>
        ) : (
          <div className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-gray-500 mt-4">Log in to manage your profile.</p>
            <button
              onClick={onLogin}
              className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700"
            >
              Log In
            </button>
          </div>
        )}
      </div>
      
      {user && (
        <div className="p-6 border-t">
          <button onClick={onLogout} className="w-full text-left text-gray-600 hover:text-red-600 hover:bg-red-50 p-3 rounded-lg transition-colors">
            Log Out
          </button>
        </div>
      )}
    </Sidebar>
  );
}

function RecentlyViewedSidebar({ show, onClose, viewedItems, onProductClick, onClearHistory }) {
  return (
    <Sidebar show={show} onClose={onClose} direction="left">
      <div className="flex justify-between items-center p-5 border-b">
        <h3 className="text-2xl font-semibold text-gray-900">Recently Viewed</h3>
        <button
          onClick={onClose}
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
        </button>
      </div>

      {viewedItems.length === 0 ? (
        <div className="flex-1 flex flex-col justify-center items-center text-center p-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-500 text-center mt-6 font-medium text-lg">No recently viewed items.</p>
          <p className="text-gray-400 text-sm mt-1">Products you view will show up here.</p>
        </div>
      ) : (
        <>
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            <button onClick={onClearHistory} className="w-full text-sm text-center text-red-500 hover:text-red-700 font-medium mb-2">
              Clear History
            </button>
            {viewedItems.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center space-x-3 overflow-hidden cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                onClick={() => { onProductClick(item); onClose(); }}
              >
                <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-contain flex-shrink-0 p-1 border border-gray-100" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">{item.title}</h4>
                  <p className="text-lg font-bold text-gray-800">${item.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </Sidebar>
  );
}

function CheckoutModal({ show, onClose, onSubmit, receipt, orderTotal, walletBalance, onAddFunds }) {
  const [details, setDetails] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const hasSufficientFunds = orderTotal <= walletBalance;

  const handleChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const validate = () => {
    let tempErrors = {};
    if (!details.name.trim()) tempErrors.name = 'Name is required';
    if (!details.email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) {
      tempErrors.email = 'Email is not valid';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || !hasSufficientFunds) return;

    setIsSubmitting(true);
    await onSubmit(details);
    setIsSubmitting(false);
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-all duration-300 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-white rounded-xl shadow-2xl w-full max-w-md max-h-full overflow-y-auto transform transition-all duration-300 ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className={`flex justify-between items-center p-5 border-b ${receipt ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'}`}>
          <h3 className="text-2xl font-semibold text-white">
            {receipt ? 'Order Confirmed!' : 'Checkout'}
          </h3>
          <button
            onClick={onClose}
            className="text-white bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-sm p-1.5 ml-auto inline-flex items-center transition-all duration-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </button>
        </div>

        {receipt ? (
          <div className="p-6 space-y-4">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xl text-green-600 font-medium mt-3">Thank you for your order, {receipt.customer.name}!</p>
              <p className="text-sm text-gray-600 mt-1">A confirmation has been sent to {receipt.customer.email}.</p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold">Receipt #{receipt.receiptId}</h4>
              <p className="text-sm text-gray-500">Date: {new Date(receipt.timestamp).toLocaleString()}</p>
              <ul className="divide-y divide-gray-200">
                {receipt.items.map(item => (
                  <li key={item.id} className="py-2 flex justify-between text-sm">
                    <span className="truncate pr-4">{item.title} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              {receipt.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 pt-2 border-t">
                  <span>Discount Applied</span>
                  <span>-${(receipt.total / (1 - receipt.discount) * receipt.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total Paid</span>
                <span>${receipt.total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">Your Name</label>
              <input type="text" name="name" id="name" className={`bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3`} placeholder="John Doe" value={details.name} onChange={handleChange} />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Your Email</label>
              <input type="email" name="email" id="email" className={`bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-3`} placeholder="name@company.com" value={details.email} onChange={handleChange} />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Your Balance</span>
                <span className="text-sm font-medium text-gray-800">${walletBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t">
                <span className="text-lg font-semibold text-gray-900">Order Total</span>
                <span className="text-3xl font-bold text-gray-900">${orderTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className="font-medium text-gray-600">Remaining</span>
                <span className={`font-medium ${hasSufficientFunds ? 'text-green-600' : 'text-red-600'}`}>
                  ${(walletBalance - orderTotal).toFixed(2)}
                </span>
              </div>
            </div>

            {!hasSufficientFunds && (
              <div className="p-3 text-center bg-red-100 text-red-700 rounded-lg">
                <p className="font-medium mb-2">Insufficient funds!</p>
                <button
                  type="button"
                  onClick={() => {onAddFunds(100)}}
                  className="bg-green-500 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-green-600"
                >
                  Add $100 to Wallet
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !hasSufficientFunds}
              className="w-full text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-lg px-5 py-3 text-center disabled:opacity-50 transition-all duration-300 transform hover:scale-105"
            >
              {isSubmitting ? 'Processing...' : `Pay $${orderTotal.toFixed(2)}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function ProductModal({ product, show, onClose, onAddToCart, onProductClick, relatedProducts }) {
  const [adding, setAdding] = useState(false);

  if (!product) return null;

  const handleAddToCart = () => {
    setAdding(true);
    onAddToCart(product);
    setTimeout(() => {
      setAdding(false);
      onClose();
    }, 1500);
  };

  const handleRelatedClick = (relatedProduct) => {
    onClose();
    setTimeout(() => onProductClick(relatedProduct), 300); 
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-all duration-300 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all duration-300 ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <button
          onClick={onClose}
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center absolute top-4 right-4 z-10"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
        </button>
        <div className="flex flex-col md:flex-row max-h-full">
          <div className="md:w-1/2 p-6 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.title}
              className="max-w-full max-h-96 object-contain"
            />
          </div>
          <div className="md:w-1/2 p-8 flex flex-col justify-between overflow-y-auto max-h-[90vh]">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h2>
              <span className="text-sm font-medium bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full capitalize">{product.category}</span>
              <div className="flex items-center space-x-1 mt-4">
                <StarRating rating={product.rating.rate} />
                <span className="text-sm text-gray-500">({product.rating.count} reviews)</span>
              </div>
              <div className="flex items-baseline space-x-2 mt-4">
                <p className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
                {product.onSale && (
                  <p className="text-gray-400 text-xl line-through">${product.oldPrice.toFixed(2)}</p>
                )}
              </div>
              {product.stock === 0 ? (
                 <span className="font-medium text-red-600 mt-4">Out of Stock</span>
              ) : product.stock <= LOW_STOCK_AMOUNT && (
                <span className="font-medium text-red-600 mt-4">Only {product.stock} left in stock!</span>
              )}
              <p className="text-gray-600 mt-4 text-sm max-h-32 overflow-y-auto">{product.description}</p>
            </div>
            <div className="mt-6">
              <button
                onClick={handleAddToCart}
                disabled={adding || product.stock === 0}
                className={`w-full text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 transform ${
                  adding
                    ? 'bg-green-500'
                    : product.stock === 0
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105'
                }`}
              >
                {adding ? 'Added!' : (product.stock === 0 ? 'Out of Stock' : 'Add to Cart')}
              </button>
            </div>
            
            <div className="mt-8">
              <h4 className="font-semibold text-gray-800 mb-3">You Might Also Like</h4>
              <div className="space-y-3">
                {relatedProducts.map(relProd => (
                  <div 
                    key={relProd.id} 
                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                    onClick={() => handleRelatedClick(relProd)}
                  >
                    <img src={relProd.image} alt={relProd.title} className="w-12 h-12 object-contain rounded-md border p-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">{relProd.title}</p>
                      <p className="text-sm font-bold text-gray-800">${relProd.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryItem({ receipt, onTrackOrder }) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusClass = () => {
    switch (receipt.status) {
      case 'Processing':
        return 'bg-blue-100 text-blue-800';
      case 'Shipped':
        return 'bg-yellow-100 text-yellow-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300">
      <div
        className="w-full flex justify-between items-center p-5 text-left transition-colors duration-200 hover:bg-gray-50"
      >
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-indigo-600">Receipt #{receipt.receiptId}</h3>
          <p className="text-sm text-gray-500">Date: {new Date(receipt.timestamp).toLocaleString()}</p>
          <p className="text-sm text-gray-500">Tracking: {receipt.trackingId}</p>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusClass()} mt-2 inline-block`}>
            {receipt.status}
          </span>
        </div>
        <div className="text-right mx-4">
          <span className="text-2xl font-bold text-gray-900">${receipt.total.toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-end">
           <button
            onClick={(e) => { e.stopPropagation(); onTrackOrder(receipt); }}
            className="mb-2 bg-indigo-500 text-white py-1.5 px-3 rounded-md text-sm font-medium hover:bg-indigo-600 transition-all"
          >
            Track
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className="p-2">
            <svg
              className={`w-6 h-6 text-indigo-500 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="p-5 border-t border-gray-100 bg-gray-50">
          <h4 className="font-semibold mb-3 text-gray-700">Order Details:</h4>
          <ul className="divide-y divide-gray-200">
            {receipt.items.map(item => (
              <li key={item.id} className="py-3 flex justify-between items-center text-sm">
                <div className="flex items-center space-x-3">
                  <img src={item.image} alt={item.title} className="w-12 h-12 object-contain rounded-md bg-white p-1 border" />
                  <div>
                    <span className="font-medium text-gray-800">{item.title}</span>
                    <p className="text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-medium text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function HistoryPage({ history, onTrackOrder }) {
  if (history.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl shadow-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-20 w-20 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <p className="text-gray-500 font-medium text-xl mt-6">You haven't placed any orders yet.</p>
        <p className="text-gray-400 text-sm mt-2">Complete a checkout on the Store page to see your history here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-semibold text-gray-800">Your Order History</h2>
      {history.map((receipt) => (
        <HistoryItem key={receipt.receiptId} receipt={receipt} onTrackOrder={onTrackOrder} />
      ))}
    </div>
  );
}

function TrackingPage({ order, onBack }) {
  const [currentStatus, setCurrentStatus] = useState(order.status);
  
  useEffect(() => {
    setCurrentStatus(order.status);
    if(order.status === 'Processing') {
      setTimeout(() => setCurrentStatus('Shipped'), 2000);
    }
  }, [order]);

  const statuses = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
  const currentStatusIndex = statuses.indexOf(currentStatus);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <button onClick={onBack} className="text-sm text-indigo-600 font-medium mb-4">&larr; Back to History</button>
      <h2 className="text-3xl font-semibold text-gray-800">Track Order</h2>
      <p className="text-gray-500 mt-1">Tracking ID: <span className="font-medium text-gray-900">{order.trackingId}</span></p>

      <div className="my-8">
        <div className="relative pt-4">
          <div className="flex mb-2 items-center justify-between">
            {statuses.map((status, index) => (
              <div key={status} className="flex-1 text-center">
                <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold ${index <= currentStatusIndex ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {index < currentStatusIndex ? '✓' : index + 1}
                </div>
                <p className={`mt-2 text-xs font-medium ${index <= currentStatusIndex ? 'text-gray-800' : 'text-gray-400'}`}>{status}</p>
              </div>
            ))}
          </div>
          <div className="absolute top-8 left-0 w-full h-1 bg-gray-200 -z-10">
            <div 
              className="absolute top-0 left-0 h-1 bg-indigo-600 transition-all duration-500"
              style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-2">Order Summary</h3>
        <ul className="divide-y divide-gray-200 border rounded-lg p-4">
            {order.items.map(item => (
              <li key={item.id} className="py-3 flex justify-between items-center text-sm">
                <span className="truncate pr-4">{item.title} (x{item.quantity})</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
      </div>
    </div>
  );
}

function WishlistModal({ show, onClose, wishlist, onRemoveFromWishlist, onMoveToCart }) {
  return (
    <Sidebar show={show} onClose={onClose} direction="right">
      <div className="flex justify-between items-center p-5 border-b bg-gradient-to-r from-indigo-600 to-purple-600">
        <h3 className="text-2xl font-semibold text-white">Your Wishlist</h3>
        <button
          onClick={onClose}
          className="text-white bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-sm p-1.5 ml-auto inline-flex items-center transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
        </button>
      </div>
      <div className="p-6 overflow-y-auto">
        {wishlist.length === 0 ? (
          <div className="text-center py-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
            </svg>
            <p className="text-gray-500 text-center mt-4 font-medium">Your wishlist is empty.</p>
            <p className="text-gray-400 text-sm mt-1">Click the heart on a product to save it.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {wishlist.map(item => (
              <div key={item.id} className="flex items-center justify-between space-x-3">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-contain flex-shrink-0 p-1 border border-gray-100" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{item.title}</h4>
                    <p className="text-lg font-bold text-gray-800">${item.price.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onMoveToCart(item)}
                    className="bg-green-100 text-green-700 hover:bg-green-200 text-xs font-medium py-1.5 px-3 rounded-full"
                  >
                    Move to Cart
                  </button>
                  <button
                    onClick={() => onRemoveFromWishlist(item.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Sidebar>
  );
}

function ChatWidget({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full p-4 shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl z-50 animate-pulse"
      title="Chat with VibeBot"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </button>
  );
}

function ChatWindow({ messages, onSend, onClose }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <div className="fixed bottom-24 left-6 w-80 h-[28rem] bg-white rounded-xl shadow-2xl flex flex-col z-50 transition-all duration-300">
      <div className="flex justify-between items-center p-3 border-b bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl">
        <h4 className="font-semibold">Chat with VibeBot</h4>
        <button onClick={onClose} className="text-indigo-200 hover:text-white font-bold text-2xl">&times;</button>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg, index) => (
          <div key={index} className="flex flex-col">
            <div className={`chat-bubble ${msg.sender === 'user' ? 'user' : 'bot'}`}>
              {msg.text.split('\n').map((line, i) => <p key={i}>{line}</p>)}
              {msg.options && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {msg.options.map(option => (
                    <button
                      key={option}
                      onClick={() => onSend(option)}
                      className="bg-indigo-500 bg-opacity-80 text-white py-1 px-3 rounded-full text-sm hover:bg-opacity-100"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-3 border-t flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-gray-300 rounded-l-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Type your answer..."
        />
        <button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 rounded-r-lg hover:from-indigo-700 hover:to-purple-700 text-sm font-medium transition-all duration-300">Send</button>
      </form>
    </div>
  );
}

function StorePageContent({
  loading,
  error,
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortOrder,
  onSortChange,
  onAddToCart,
  onProductClick,
  onToggleWishlist,
  wishlist
}) {
  const renderProductContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      );
    }
    if (error) {
      return <div className="text-center text-red-600 bg-red-100 p-6 rounded-lg shadow-md">{error}</div>;
    }
    if (products.length === 0) {
      return <div className="text-center text-gray-500 p-10 bg-white rounded-lg shadow-md">No products found.</div>
    }
    return (
      <ProductList 
        products={products} 
        onAddToCart={onAddToCart} 
        onProductClick={onProductClick}
        onToggleWishlist={onToggleWishlist}
        wishlist={wishlist}
      />
    );
  };

  return (
    <div>
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">Products</h2>
      <ProductControls 
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        sortOrder={sortOrder}
        onSortChange={onSortChange}
      />
      <CategoryTabs 
        categories={categories} 
        selectedCategory={selectedCategory} 
        onSelectCategory={onSelectCategory} 
      />
      {renderProductContent()}
    </div>
  );
}

function PageTransition({ children, pageKey }) {
  return (
    <div key={pageKey} className="animate-fade-in">
      {children}
    </div>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useLocalStorage('vibeCart', { items: [], total: 0 });
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  
  const [currentPage, setCurrentPage] = useState('store');
  const [orderHistory, setOrderHistory] = useLocalStorage('vibeHistory', []); 

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('popular');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useLocalStorage('vibeRecentlyViewed', []);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [chatState, setChatState] = useState('idle');
  
  const [walletBalance, setWalletBalance] = useLocalStorage('vibeWallet', 1000.00);
  const [user, setUser] = useLocalStorage('vibeUser', null);
  
  const [wishlist, setWishlist] = useLocalStorage('vibeWishlist', []);
  
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRecentOpen, setIsRecentOpen] = useState(false);
  
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [discount, setDiscount] = useLocalStorage('vibeDiscount', 0);
  const [isCouponApplied, setIsCouponApplied] = useLocalStorage('vibeCouponApplied', false);

  const addBotMessage = (text, options = null) => {
    setTimeout(() => {
      setChatMessages(prev => [...prev, { sender: 'bot', text, options }]);
    }, 500);
  };
  
  useEffect(() => {
    if (isChatOpen && chatMessages.length === 0) {
      addBotMessage("Hi! I'm VibeBot. I can answer questions or we can play a trivia game. What would you like?", ["Trivia Game", "Just looking"]);
      setChatState('awaiting_trivia');
    }
  }, [isChatOpen, chatMessages.length]);

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  useEffect(() => {
    if (cart.items.length === 0 && isCouponApplied) {
      setDiscount(0);
      setIsCouponApplied(false);
    }
  }, [cart.items.length, isCouponApplied, setDiscount, setIsCouponApplied]);

  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(note => note.id !== id));
  };
  
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setRecentlyViewed(prev => {
      const isViewed = prev.some(item => item.id === product.id);
      if (isViewed) {
        return [product, ...prev.filter(item => item.id !== product.id)];
      }
      return [product, ...prev].slice(0, 10);
    });
  };
  
  const handleClearRecentHistory = () => {
    setRecentlyViewed([]);
    showNotification('Recently viewed history cleared!', 'error');
  };
  
  const handleLogin = () => {
    setUser({ name: 'S K Bhoi', email: 'skbhoi@vibemail.com' });
    setIsProfileOpen(false);
    showNotification('Welcome, S K!');
  };
  
  const handleLogout = () => {
    setUser(null);
    showNotification('Logged out successfully.', 'error');
  };

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        axios.get('https://fakestoreapi.com/products/categories'),
        axios.get('https://fakestoreapi.com/products') 
      ]);
      
      const productsWithStock = productsRes.data.map((product, index) => ({
        ...product,
        stock: product.id % 5 === 0 ? LOW_STOCK_AMOUNT : 99,
        onSale: index % 4 === 0,
        oldPrice: index % 4 === 0 ? product.price * 1.25 : product.price
      }));
      
      setCategories(categoriesRes.data);
      setProducts(productsWithStock);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load products. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };
  
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products
      .filter(product => 
        selectedCategory === 'all' || product.category === selectedCategory
      )
      .filter(product => 
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
    switch(sortOrder) {
      case 'price-asc':
        return filtered.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return filtered.sort((a, b) => b.price - a.price);
      case 'popular':
        return filtered.sort((a, b) => b.rating.count - a.rating.count);
      default:
        return filtered;
    }
  }, [products, selectedCategory, searchQuery, sortOrder]);
  
  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    return products
      .filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id)
      .slice(0, 3);
  }, [selectedProduct, products]);
  
  const calculateCartTotal = (items) => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const addToCart = (product) => {
    if (product.stock === 0) {
      showNotification('This item is out of stock.', 'error');
      return;
    }
    
    const itemInCart = cart.items.find(item => item.id === product.id);
    const newQuantity = (itemInCart ? itemInCart.quantity : 0) + 1;
    
    if (newQuantity > product.stock) {
      showNotification(`Only ${product.stock} in stock!`, 'error');
      return;
    }

    setCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(item => item.id === product.id);
      let newItems;

      if (existingItemIndex > -1) {
        newItems = prevCart.items.map((item, index) => 
          index === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newItems = [...prevCart.items, { ...product, quantity: 1 }];
      }
      
      return {
        items: newItems,
        total: calculateCartTotal(newItems)
      };
    });
    showNotification('Item added to cart!');
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(item => item.id !== productId);
      return {
        items: newItems,
        total: calculateCartTotal(newItems)
      };
    });
    showNotification('Item removed from cart.');
  };
  
  const updateCartQuantity = (product, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(product.id);
      return;
    }
    
    if (newQuantity > product.stock) {
      showNotification(`Only ${product.stock} in stock!`, 'error');
      return;
    }
    
    setCart(prevCart => {
      const newItems = prevCart.items.map(item =>
        item.id === product.id ? { ...item, quantity: newQuantity } : item
      );
      return {
        items: newItems,
        total: calculateCartTotal(newItems)
      };
    });
  };

  const clearCart = () => {
    setCart({ items: [], total: 0 });
    setDiscount(0);
    setIsCouponApplied(false);
    showNotification('Cart cleared!');
  };
  
  const toggleWishlist = (product) => {
    setWishlist(prevWishlist => {
      const isWished = prevWishlist.some(item => item.id === product.id);
      if (isWished) {
        showNotification('Removed from wishlist.', 'error');
        return prevWishlist.filter(item => item.id !== product.id);
      } else {
        showNotification('Added to wishlist!');
        return [...prevWishlist, product];
      }
    });
  };
  
  const moveWishlistToCart = (product) => {
    addToCart(product);
    setWishlist(prevWishlist => prevWishlist.filter(item => item.id !== product.id));
  };
  
  const handleTrackOrder = (order) => {
    setTrackingOrder(order);
    setCurrentPage('tracking');
  };
  
  const handleApplyCoupon = (code) => {
    if (isCouponApplied) {
      showNotification('Coupon already applied.', 'error');
      return;
    }
    
    if (code.toUpperCase() === PROMO_CODE) {
      setDiscount(0.10);
      setIsCouponApplied(true);
      showNotification('Promo code applied!');
    } else {
      setDiscount(0);
      showNotification('Invalid promo code.', 'error');
    }
  };
  
  const handleAddFunds = (amount) => {
    setWalletBalance(prev => prev + amount);
    showNotification(`Added $${amount} to wallet!`);
  };

  const handleCheckout = async (checkoutDetails, finalTotal) => {
    if (finalTotal > walletBalance) {
      showNotification('Insufficient funds!', 'error');
      return;
    }
    
    try {
      const response = await axios.post(`${API_URL}/checkout`, {
        cartItems: cart.items,
        checkoutDetails,
      });
      
      const newReceipt = {
        ...response.data.receipt,
        total: finalTotal,
        discount: discount,
        status: 'Processing',
        trackingId: `VIBE-${Math.floor(Math.random() * 900000 + 100000)}`
      };
      
      setReceipt(newReceipt);
      setWalletBalance(prevBalance => prevBalance - finalTotal);
      setCart({ items: [], total: 0 }); 
      setDiscount(0);
      setIsCouponApplied(false);
      setOrderHistory(prevHistory => [newReceipt, ...prevHistory]);
    } catch (error)
    {
      console.error('Error during checkout:', error);
      showNotification('Checkout failed. Please try again.', 'error');
    }
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
    setReceipt(null);
  };
  
  const handleSendChatMessage = (message) => {
    const userMessage = { sender: 'user', text: message };
    setChatMessages(prev => [...prev, userMessage]);

    const normalizedMessage = message.toLowerCase().trim();

    if (chatState === 'awaiting_trivia') {
      if (normalizedMessage === 'trivia game') {
        const q = TRIVIA_QUESTIONS[currentQuestionIndex];
        addBotMessage(`Great! Here's question ${currentQuestionIndex + 1}: \n\n${q.question}`);
        addBotMessage(`A) ${q.options.a}\nB) ${q.options.b}\nC) ${q.options.c}`, ["A", "B", "C"]);
        setChatState('awaiting_answer');
      } else {
        addBotMessage("No problem! Enjoy browsing. Let me know if you change your mind.");
        setChatState('idle');
      }
    } 
    else if (chatState === 'awaiting_answer') {
      const q = TRIVIA_QUESTIONS[currentQuestionIndex];
      const answer = normalizedMessage;
      
      if (answer === q.answer) {
        addBotMessage("Correct! Well done.");
      } else {
        addBotMessage(`Sorry, that's not right. The correct answer was ${q.answer.toUpperCase()}.`);
      }
      
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex < TRIVIA_QUESTIONS.length) {
        setCurrentQuestionIndex(nextIndex);
        addBotMessage("Want to try another one?", ["Yes", "No"]);
        setChatState('awaiting_trivia_next');
      } else {
        addBotMessage("That was the last question! Thanks for playing.");
        setCurrentQuestionIndex(0);
        addBotMessage("What else can I help with?", ["Trivia Game", "Just looking"]);
        setChatState('awaiting_trivia');
      }
    }
    else if (chatState === 'awaiting_trivia_next') {
        if (normalizedMessage === 'yes') {
            const q = TRIVIA_QUESTIONS[currentQuestionIndex];
            addBotMessage(`Awesome! Here's question ${currentQuestionIndex + 1}: \n\n${q.question}`);
            addBotMessage(`A) ${q.options.a}\nB) ${q.options.b}\nC) ${q.options.c}`, ["A", "B", "C"]);
            setChatState('awaiting_answer');
        } else {
            addBotMessage("Okay, thanks for playing!");
            addBotMessage("What else can I help with?", ["Trivia Game", "Just looking"]);
            setChatState('awaiting_trivia');
        }
    }
    else {
        addBotMessage("I'm just a simple bot. You can ask me to play a trivia game!", ["Trivia Game", "Just looking"]);
        setChatState('awaiting_trivia');
    }
  };
  
  const cartItemCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;
  const finalTotal = cart.total * (1 - discount);
  
  const renderPage = () => {
    switch(currentPage) {
      case 'store':
        return (
          <StorePageContent
            loading={loading}
            error={error}
            products={filteredAndSortedProducts}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            sortOrder={sortOrder}
            onSortChange={(e) => setSortOrder(e.target.value)}
            onAddToCart={addToCart}
            onProductClick={handleProductClick}
            onToggleWishlist={toggleWishlist}
            wishlist={wishlist}
          />
        );
      case 'history':
        return <HistoryPage history={orderHistory} onTrackOrder={handleTrackOrder} />;
      case 'tracking':
        return <TrackingPage order={trackingOrder} onBack={() => setCurrentPage('history')} />;
      default:
        return null;
    }
  }

  return (
    <div className="font-sans bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
      
      <Header 
        onNavClick={setCurrentPage} 
        currentPage={currentPage} 
        cartItemCount={cartItemCount}
        wishlistCount={wishlistCount}
        onWishlistClick={() => setIsWishlistOpen(true)}
        walletBalance={walletBalance}
        onCartClick={() => setIsCartOpen(true)}
        onProfileClick={() => setIsProfileOpen(true)}
        onRecentClick={() => setIsRecentOpen(true)}
      />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <PageTransition pageKey={currentPage}>
          {renderPage()}
        </PageTransition>
      </main>

      {!isChatOpen && <ChatWidget onClick={() => setIsChatOpen(true)} />}
      {isChatOpen && (
        <ChatWindow 
          messages={chatMessages}
          onSend={handleSendChatMessage}
          onClose={() => setIsChatOpen(false)}
        />
      )}

      <MiniCartSidebar
        show={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onRemoveFromCart={removeFromCart}
        onUpdateQuantity={updateCartQuantity}
        onClearCart={clearCart}
        onCheckout={() => setIsCheckoutOpen(true)}
        discount={discount}
        isCouponApplied={isCouponApplied}
        onApplyCoupon={handleApplyCoupon}
      />
      
      <ProfileSidebar
        show={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        walletBalance={walletBalance}
        onAddFunds={handleAddFunds}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      
      <RecentlyViewedSidebar
        show={isRecentOpen}
        onClose={() => setIsRecentOpen(false)}
        viewedItems={recentlyViewed}
        onProductClick={handleProductClick}
        onClearHistory={handleClearRecentHistory}
      />

      <CheckoutModal
        show={isCheckoutOpen}
        onClose={closeCheckout}
        onSubmit={(details) => handleCheckout(details, finalTotal)}
        receipt={receipt}
        orderTotal={finalTotal}
        walletBalance={walletBalance}
        onAddFunds={handleAddFunds}
      />
      
      <ProductModal
        show={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
        onProductClick={handleProductClick}
        relatedProducts={relatedProducts}
      />
      
      <WishlistModal
        show={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={toggleWishlist}
        onMoveToCart={moveWishlistToCart}
      />
    </div>
  );
}

export default App;

