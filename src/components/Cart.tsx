import { useState } from 'react';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { ordersAPI } from '../services/api';
import { formatPrice } from '../utils/currency';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      setIsProcessing(true);
      const orderItems = cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      const order = await ordersAPI.create({
        items: orderItems,
        total: getCartTotal()
      });

      alert(`Order placed successfully! Order ID: ${order.id}`);
      setTimeout(() => {
        clearCart();
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</p>
            <p className="text-gray-500 text-center">Add some products to get started</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-gray-50 p-4 rounded-lg">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-lg font-bold text-blue-600 mb-2">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>
                          <span className="w-8 text-center font-medium text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            <Plus className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={clearCart}
                className="w-full mt-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                Clear Cart
              </button>
            </div>

            <div className="border-t border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between text-lg">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(getCartTotal())}
                </span>
              </div>
              <div className="flex items-center justify-between text-lg">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
              <div className="border-t border-gray-200 pt-4 flex items-center justify-between text-xl">
                <span className="font-bold text-gray-900">Total:</span>
                <span className="font-bold text-gray-900">
                  {formatPrice(getCartTotal())}
                </span>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={isProcessing}
                className={`w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg ${
                  isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
