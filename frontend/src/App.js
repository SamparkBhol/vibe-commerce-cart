import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

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

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-20">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );
}

function Notification({ message, type = 'success' }) {
  if (!message) return null;

  const bgColor = type === 'success'
    ? 'bg-gradient-to-r from-green-500 to-green-600'
    : 'bg-gradient-to-r from-red-500 to-red-600';

  return (
    <div className={`fixed bottom-6 right-6 ${bgColor} text-white py-3 px-6 rounded-lg shadow-xl z-50 animate-bounce`}>
      {message}
    </div>
  );
}

function Header({ onNavClick, currentPage, cartItemCount, wishlistCount, onWishlistClick, walletBalance }) {
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
        <nav className="flex space-x-4 items-center">
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
          <button onClick={onWishlistClick} className="relative text-gray-500 hover:text-purple-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {wishlistCount}
              </span>
            )}
          </button>
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartItemCount}
              </span>
            )}
          </div>
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

function SearchBar({ searchQuery, onSearchChange }) {
  return (
    <div className="mb-6 relative">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
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
          </div>
          <div className="p-5 flex flex-col flex-grow">
            <h3 className="text-md font-semibold text-gray-800 flex-grow h-16 line-clamp-2">{product.title}</h3>
            <p className="text-gray-800 mt-2 text-2xl font-bold">${product.price.toFixed(2)}</p>
            <button
              onClick={(e) => handleAddToCart(e, product)}
              disabled={addingProductId === product.id}
              className={`mt-4 w-full text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 transform ${
                addingProductId === product.id
                  ? 'bg-green-500'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105'
              }`}
            >
              {addingProductId === product.id ? 'Added!' : 'Add to Cart'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function Cart({ cart, onRemoveFromCart, onCheckout, onUpdateQuantity, onClearCart }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
      {cart.items.length === 0 ? (
        <div className="text-center py-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500 text-center mt-4 font-medium">Your cart is empty.</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Your Items</h3>
            <button onClick={onClearCart} className="text-sm text-red-500 hover:text-red-700 font-medium">
              Empty Cart
            </button>
          </div>
          <div className="space-y-5 max-h-[30rem] overflow-y-auto pr-2 -mr-2">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between space-x-3">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-contain flex-shrink-0 p-1 border border-gray-100" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{item.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="text-indigo-500 w-6 h-6 rounded-full border border-indigo-300 hover:bg-indigo-100">-</button>
                      <span className="text-sm font-medium">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="text-indigo-500 w-6 h-6 rounded-full border border-indigo-300 hover:bg-indigo-100">+</button>
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

          <hr className="my-6" />

          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-3xl font-bold text-gray-900">${cart.total.toFixed(2)}</span>
          </div>

          <button
            onClick={onCheckout}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-105"
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
}

function CheckoutModal({ show, onClose, onSubmit, receipt, cartTotal, walletBalance }) {
  const [details, setDetails] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const hasSufficientFunds = cartTotal <= walletBalance;

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
                <span className="text-3xl font-bold text-gray-900">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className="font-medium text-gray-600">Remaining</span>
                <span className={`font-medium ${hasSufficientFunds ? 'text-green-600' : 'text-red-600'}`}>
                  ${(walletBalance - cartTotal).toFixed(2)}
                </span>
              </div>
            </div>

            {!hasSufficientFunds && (
              <div className="p-3 text-center bg-red-100 text-red-700 rounded-lg text-sm">
                You have insufficient funds in your wallet.
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !hasSufficientFunds}
              className="w-full text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-lg px-5 py-3 text-center disabled:opacity-50 transition-all duration-300 transform hover:scale-105"
            >
              {isSubmitting ? 'Processing...' : `Pay $${cartTotal.toFixed(2)}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function ProductModal({ product, show, onClose, onAddToCart }) {
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

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-all duration-300 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col md:flex-row transform transition-all duration-300 ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <div className="md:w-1/2 p-6 flex items-center justify-center">
          <img
            src={product.image}
            alt={product.title}
            className="max-w-full max-h-96 object-contain"
          />
        </div>
        <div className="md:w-1/2 p-8 flex flex-col justify-between">
          <button
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center absolute top-4 right-4"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.title}</h2>
            <span className="text-sm font-medium bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full capitalize">{product.category}</span>
            <p className="text-3xl font-bold text-gray-900 mt-4">${product.price.toFixed(2)}</p>
            <p className="text-gray-600 mt-4 text-sm max-h-48 overflow-y-auto">{product.description}</p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className={`mt-6 w-full text-white py-3 px-4 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 transform ${
              adding
                ? 'bg-green-500'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:scale-105'
            }`}
          >
            {adding ? 'Added!' : 'Add to Cart'}
          </button>
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

  const getStatusClass = (index) => {
    if (index < currentStatusIndex) return 'bg-green-500 text-white';
    if (index === currentStatusIndex) return 'bg-indigo-600 text-white animate-pulse';
    return 'bg-gray-200 text-gray-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <button onClick={onBack} className="text-sm text-indigo-600 font-medium mb-4">&larr; Back to History</button>
      <h2 className="text-3xl font-semibold text-gray-800">Track Order</h2>
      <p className="text-gray-500 mt-1">Tracking ID: <span className="font-medium text-gray-900">{order.trackingId}</span></p>

      <div className="my-8">
        <div className="flex justify-between items-center">
          {statuses.map((status, index) => (
            <div key={status} className="flex-1 text-center">
              <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center font-bold ${getStatusClass(index)}`}>
                {index < currentStatusIndex ? '✓' : index + 1}
              </div>
              <p className={`mt-2 text-sm font-medium ${index <= currentStatusIndex ? 'text-gray-800' : 'text-gray-400'}`}>{status}</p>
            </div>
          ))}
        </div>
        <div className="relative w-full h-1 bg-gray-200 mt-4 -z-10">
          <div 
            className="absolute top-0 left-0 h-1 bg-green-500 transition-all duration-500"
            style={{ width: `${(currentStatusIndex / (statuses.length - 1)) * 100}%` }}
          ></div>
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
    <div className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-all duration-300 ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col transform transition-all duration-300 ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
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
      </div>
    </div>
  );
}

function ChatWidget({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full p-4 shadow-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-110 hover:shadow-2xl z-50 animate-pulse"
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
    <div className="fixed bottom-24 right-6 w-80 h-[28rem] bg-white rounded-xl shadow-2xl flex flex-col z-50 transition-all duration-300">
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
  cart,
  onAddToCart,
  onRemoveFromCart,
  onUpdateQuantity,
  onClearCart,
  onCheckout,
  onProductClick,
  onToggleWishlist,
  wishlist
}) {
  const renderProductContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }
    if (error) {
      return <div className="text-center text-red-600 bg-red-100 p-6 rounded-lg shadow-md">{error}</div>;
    }
    if (products.length === 0) {
      return <div className="text-center text-gray-500 p-10 bg-white rounded-lg shadow-md">No products found for "{searchQuery}".</div>
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Products</h2>
        <SearchBar searchQuery={searchQuery} onSearchChange={onSearchChange} />
        <CategoryTabs 
          categories={categories} 
          selectedCategory={selectedCategory} 
          onSelectCategory={onSelectCategory} 
        />
        {renderProductContent()}
      </div>
      <div className="lg:col-span-1">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">Your Cart</h2>
        <Cart
          cart={cart}
          onRemoveFromCart={onRemoveFromCart}
          onUpdateQuantity={onUpdateQuantity}
          onClearCart={onClearCart}
          onCheckout={onCheckout}
        />
      </div>
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
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('vibeCart');
    return savedCart ? JSON.parse(savedCart) : { items: [], total: 0 };
  });
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: 'success' });
  
  const [currentPage, setCurrentPage] = useState('store');
  const [orderHistory, setOrderHistory] = useState(() => {
    const savedHistory = localStorage.getItem('vibeHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  }); 

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [chatState, setChatState] = useState('idle');
  
  const [walletBalance, setWalletBalance] = useState(() => {
    const savedWallet = localStorage.getItem('vibeWallet');
    return savedWallet ? parseFloat(savedWallet) : 1000.00;
  });
  
  const [wishlist, setWishlist] = useState(() => {
    const savedWishlist = localStorage.getItem('vibeWishlist');
    return savedWishlist ? JSON.parse(savedWishlist) : [];
  });
  
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);

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
    localStorage.setItem('vibeCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('vibeHistory', JSON.stringify(orderHistory));
  }, [orderHistory]);
  
  useEffect(() => {
    localStorage.setItem('vibeWallet', walletBalance);
  }, [walletBalance]);
  
  useEffect(() => {
    localStorage.setItem('vibeWishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: 'success' });
    }, 2000); 
  };

  const fetchProductsAndCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const [categoriesRes, productsRes] = await Promise.all([
        axios.get('https://fakestoreapi.com/products/categories'),
        axios.get('https://fakestoreapi.com/products') 
      ]);
      
      setCategories(categoriesRes.data);
      setProducts(productsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load products. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };
  
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => 
        selectedCategory === 'all' || product.category === selectedCategory
      )
      .filter(product => 
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [products, selectedCategory, searchQuery]);
  
  const calculateCartTotal = (items) => {
    return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const addToCart = (product) => {
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
  
  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => {
      const newItems = prevCart.items.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
      return {
        items: newItems,
        total: calculateCartTotal(newItems)
      };
    });
  };

  const clearCart = () => {
    setCart({ items: [], total: 0 });
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

  const handleCheckout = async (checkoutDetails) => {
    if (cart.total > walletBalance) {
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
        status: 'Processing',
        trackingId: `VIBE-${Math.floor(Math.random() * 900000 + 100000)}`
      };
      
      setReceipt(newReceipt);
      setWalletBalance(prevBalance => prevBalance - cart.total);
      setCart({ items: [], total: 0 }); 
      setOrderHistory(prevHistory => [newReceipt, ...prevHistory]);
    } catch (error) {
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
  
  const renderPage = () => {
    switch(currentPage) {
      case 'store':
        return (
          <StorePageContent
            loading={loading}
            error={error}
            products={filteredProducts}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            cart={cart}
            onAddToCart={addToCart}
            onRemoveFromCart={removeFromCart}
            onUpdateQuantity={updateCartQuantity}
            onClearCart={clearCart}
            onCheckout={() => setIsCheckoutOpen(true)}
            onProductClick={setSelectedProduct}
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
      <Notification message={notification.message} type={notification.type} />
      
      <Header 
        onNavClick={setCurrentPage} 
        currentPage={currentPage} 
        cartItemCount={cartItemCount}
        wishlistCount={wishlistCount}
        onWishlistClick={() => setIsWishlistOpen(true)}
        walletBalance={walletBalance}
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

      <CheckoutModal
        show={isCheckoutOpen}
        onClose={closeCheckout}
        onSubmit={handleCheckout}
        receipt={receipt}
        cartTotal={cart.total}
        walletBalance={walletBalance}
      />
      
      <ProductModal
        show={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
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