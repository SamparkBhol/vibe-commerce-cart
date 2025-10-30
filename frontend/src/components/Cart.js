 
import React from 'react';

function Cart({ cart, onRemoveFromCart, onCheckout }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
      {cart.items.length === 0 ? (
        <p className="text-gray-500 text-center">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-md object-cover" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                    <p className="text-xs text-gray-500">${item.price.toFixed(2)} x {item.quantity}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <p className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  <button
                    onClick={() => onRemoveFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 font-medium text-xl"
                    title="Remove item"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>

          <hr className="my-6" />

          <div className="flex justify-between items-center mb-6">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-gray-900">${cart.total.toFixed(2)}</span>
          </div>

          <button
            onClick={onCheckout}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200"
          >
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
}

export default Cart;
