 
import React, { useState } from 'react';

function CheckoutModal({ onClose, onSubmit, receipt, cartTotal }) {
  const [details, setDetails] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

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
    if (!validate()) return;

    setIsSubmitting(true);
    await onSubmit(details);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-full overflow-y-auto">
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-2xl font-semibold text-gray-900">
            {receipt ? 'Order Confirmed!' : 'Checkout'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </button>
        </div>

        {receipt ? (
          <div className="p-6 space-y-4">
            <p className="text-green-600 font-medium">Thank you for your order, {receipt.customer.name}!</p>
            <p className="text-sm text-gray-600">A confirmation has been sent to {receipt.customer.email}.</p>
            <div className="border border-gray-200 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold">Receipt #{receipt.receiptId}</h4>
              <p className="text-sm text-gray-500">Date: {new Date(receipt.timestamp).toLocaleString()}</p>
              <ul className="divide-y divide-gray-200">
                {receipt.items.map(item => (
                  <li key={item.id} className="py-2 flex justify-between text-sm">
                    <span>{item.name} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total Paid</span>
                <span>${receipt.total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">Your Name</label>
              <input
                type="text"
                name="name"
                id="name"
                className={`bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5`}
                placeholder="John Doe"
                value={details.name}
                onChange={handleChange}
              />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">Your Email</label>
              <input
                type="email"
                name="email"
                id="email"
                className={`bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5`}
                placeholder="name@company.com"
                value={details.email}
                onChange={handleChange}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-gray-900">${cartTotal.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-white bg-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-gray-400"
            >
              {isSubmitting ? 'Processing...' : `Pay $${cartTotal.toFixed(2)}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default CheckoutModal;
