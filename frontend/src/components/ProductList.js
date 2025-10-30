 
import React from 'react';

function ProductList({ products, onAddToCart }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x300/cccccc/999999?text=Image+Missing' }}
          />
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
            <p className="text-gray-600 mt-1">${product.price.toFixed(2)}</p>
            <button
              onClick={() => onAddToCart(product.id)}
              className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200"
            >
              Add to Cart
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductList;
