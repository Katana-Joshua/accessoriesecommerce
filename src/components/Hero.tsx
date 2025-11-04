import { ArrowRight, Zap, Shield, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-900 text-white">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8 animate-fade-in">
            <Zap className="w-4 h-4 text-orange-400 animate-pulse" />
            <span className="text-sm font-medium">New Arrivals Every Week</span>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight animate-slide-up">
            Latest Electronics at
            <span className="block text-orange-400">
              Unbeatable Prices
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl text-blue-100 mb-12 leading-relaxed max-w-3xl mx-auto">
            Discover cutting-edge technology and premium gadgets for your digital lifestyle
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-slide-up-delay">
            <button
              onClick={() => {
                const productsSection = document.getElementById('products');
                if (productsSection) {
                  productsSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-2xl flex items-center gap-2"
            >
              Shop Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => {
                const featuredSection = document.getElementById('featured');
                if (featuredSection) {
                  featuredSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="group bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-2xl backdrop-blur-sm"
            >
              Explore Featured
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Secure Shopping</h3>
              <p className="text-blue-100 text-sm">100% secure payment processing</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Fast Delivery</h3>
              <p className="text-blue-100 text-sm">Free shipping on orders over UGX 350,000</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Headphones className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">24/7 Support</h3>
              <p className="text-blue-100 text-sm">Always here to help you</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </div>

      {/* Add custom CSS for animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </section>
  );
}
