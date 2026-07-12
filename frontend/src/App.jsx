import React, { useState, useEffect } from 'react';
import './App.css';

// Product list matching data-id attributes in HTML
const productsData = {
  1: {
    id: 1,
    name: 'Plan START',
    price: 49.00,
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=350&auto=format&fit=crop'
  },
  2: {
    id: 2,
    name: 'Plan GROWTH',
    price: 69.00,
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=350&auto=format&fit=crop'
  },
  3: {
    id: 3,
    name: 'Plan ENTERPRISE',
    price: 99.00,
    img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=350&auto=format&fit=crop'
  },
  4: {
    id: 4,
    name: 'Add-on Redes Sociales',
    price: 300.00,
    img: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=350&auto=format&fit=crop'
  }
};

function App() {
  // ==========================================
  // STATE DEFINITIONS
  // ==========================================
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('inicio');
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Page view state: 'landing' or 'dashboard-trial'
  const [currentPage, setCurrentPage] = useState('landing');
  const [activeTab, setActiveTab] = useState('registro'); // 'acceso' or 'registro'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('Todas las sucursales');

  const handleRegistrationSubmit = (e) => {
    e.preventDefault();
    alert('¡Registro Exitoso! Tu prueba gratuita de 14 días ha comenzado. Bienvenido a tu panel de administración.');
    setCurrentPage('dashboard-active');
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginEmail === 'u3058171184@gmail.com' && loginPassword === '123456') {
      setCurrentPage('dashboard-active');
      setLoginEmail('');
      setLoginPassword('');
    } else {
      alert('Credenciales incorrectas. Por favor, utiliza u3058171184@gmail.com y 123456.');
    }
  };
  
  // Cart state persisted in localStorage
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('2gr_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [cartPulse, setCartPulse] = useState(false);

  // Quiz state
  const [quizStep, setQuizStep] = useState(0); // 0: intro, 1: Q1, 2: Q2, 3: Q3, 4: result
  const [quizAnswers, setQuizAnswers] = useState({ type: '', flavor: '', addons: '' });
  const [recommendedPlan, setRecommendedPlan] = useState(null);

  // Success Modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successSummary, setSuccessSummary] = useState({ orderId: '', itemsCount: 0, total: 0 });

  // ==========================================
  // SIDE EFFECTS
  // ==========================================
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsHeaderScrolled(true);
      } else {
        setIsHeaderScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem('2gr_cart', JSON.stringify(cart));
  }, [cart]);

  // ==========================================
  // CART ACTIONS
  // ==========================================
  const openCart = () => {
    setIsCartOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeCart = () => {
    setIsCartOpen(false);
    document.body.style.overflow = 'auto';
  };

  const addToCart = (id) => {
    const data = productsData[id];
    if (!data) return;

    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === id);
      if (existing) {
        return prevCart.map(item =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...data, quantity: 1 }];
      }
    });

    // Trigger cart toggle button pulse animation
    setCartPulse(true);
    setTimeout(() => setCartPulse(false), 400);
    openCart();
  };

  const updateQuantity = (id, change) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === id) {
          const newQty = item.quantity + change;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Añade un plan o módulos a tu suscripción antes de contratar.');
      return;
    }

    const randomOrderId = '#2GR-' + Math.floor(1000 + Math.random() * 9000);
    const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    setSuccessSummary({
      orderId: randomOrderId,
      itemsCount,
      total
    });

    closeCart();
    setIsSuccessModalOpen(true);
    setCart([]);
  };

  // ==========================================
  // QUIZ LOGIC
  // ==========================================
  const startQuiz = () => {
    setQuizStep(1);
    setQuizAnswers({ type: '', flavor: '', addons: '' });
  };

  const selectQuizAnswer = (stepKey, value) => {
    const updatedAnswers = { ...quizAnswers, [stepKey]: value };
    setQuizAnswers(updatedAnswers);

    setTimeout(() => {
      if (quizStep < 3) {
        setQuizStep(prev => prev + 1);
      } else {
        calculateQuizRecommendation(updatedAnswers);
      }
    }, 350);
  };

  const calculateQuizRecommendation = (answers) => {
    let recommendation = {};
    if (answers.type === 'grains' || answers.flavor === 'strong') {
      recommendation = {
        id: 3,
        name: 'Plan ENTERPRISE',
        desc: 'La solución definitiva para franquicias y multi-sucursales. Sucursales y clientes ilimitados, geo localización global y control corporativo total.',
        price: '99.00',
        img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=350&auto=format&fit=crop'
      };
    } else if (answers.flavor === 'acid') {
      recommendation = {
        id: 2,
        name: 'Plan GROWTH',
        desc: 'El más popular. Hasta 5 sucursales y 5,000 clientes. Incluye envío de ofertas, cupones y geo localización por sucursal. Perfecto para negocios en expansión.',
        price: '69.00',
        img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=350&auto=format&fit=crop'
      };
    } else {
      recommendation = {
        id: 1,
        name: 'Plan START',
        desc: 'El impulso inicial para digitalizar tu negocio. 1 sucursal, hasta 500 clientes, tarjetas de sellos y regalo, notificaciones push y dashboard en tiempo real.',
        price: '49.00',
        img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=350&auto=format&fit=crop'
      };
    }
    setRecommendedPlan(recommendation);
    setQuizStep(4);
  };

  const restartQuiz = () => {
    setQuizStep(0);
    setRecommendedPlan(null);
  };

  // Helper getters
  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (currentPage === 'dashboard-active') {
    return (
      <div className="min-h-screen flex bg-graylight text-charcoal font-body text-left">
        {/* SIDEBAR */}
        <aside className="w-64 bg-primary shrink-0 flex flex-col justify-between p-6 text-white min-h-screen">
          <div className="space-y-8 text-left">
            {/* Logo Link to Landing */}
            <a 
              href="#inicio" 
              className="flex items-center gap-3 font-heading font-black text-xl tracking-tight text-white"
              onClick={() => setCurrentPage('landing')}
            >
              <img src="/logo-handshake-white.png" alt="2Gether Rewards Logo" className="h-7 w-auto" />
              <div className="leading-none text-left">
                <span className="block text-sm font-black tracking-wider">2GETHER</span>
                <span className="block text-[0.65rem] font-light tracking-widest mt-0.5">REWARDS</span>
              </div>
            </a>
            
            {/* Nav links */}
            <nav className="flex flex-col gap-1">
              {[
                { name: 'Vista General', icon: 'fa-table-cells-large', active: true },
                { name: 'Miembros', icon: 'fa-users' },
                { name: 'Diseño Wallet', icon: 'fa-palette', arrow: true },
                { name: 'Escáner', icon: 'fa-qrcode' },
                { name: 'Gift Cards', icon: 'fa-gift' },
                { name: 'Configuración del Sistema', icon: 'fa-gear', arrow: true }
              ].map((link) => (
                <button
                  key={link.name}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${link.active ? 'bg-white/15 text-white shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <i className={`fa-solid ${link.icon} text-base shrink-0`}></i>
                    <span>{link.name}</span>
                  </div>
                  {link.arrow && <i className="fa-solid fa-chevron-right text-[0.7rem] opacity-60"></i>}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="text-xs text-white/40 text-left">
            &copy; 2026 2GetherRewards
          </div>
        </aside>

        {/* MAIN BODY CONTENT */}
        <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
          {/* TOP BAR */}
          <header className="bg-white border-b border-gray-150 py-4 px-8 flex items-center justify-between shrink-0">
            {/* Welcome header */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-heading font-black text-primary text-sm shadow-sm">
                D
              </div>
              <div className="text-left leading-tight">
                <h3 className="text-sm font-semibold text-gray-500">Bienvenido, <span className="text-charcoal font-black">Daniel</span></h3>
                <span className="text-[0.75rem] text-gray-400 font-medium">lunes, 13 de julio de 2026</span>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-4">
              {/* Branch dropdown */}
              <div className="relative">
                <select 
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-charcoal bg-white focus:outline-none focus:border-primary shadow-sm cursor-pointer"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                >
                  <option value="Todas las sucursales">Todas las sucursales</option>
                  <option value="Casa (Juan Bravo 62)">Casa (Juan Bravo 62)</option>
                  <option value="Cancha Lope de Rueda 30">Cancha Lope de Rueda 30</option>
                  <option value="Cancha La Castellana">Cancha La Castellana</option>
                </select>
              </div>
              
              {/* Language */}
              <span className="h-8 w-8 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-xs font-bold text-charcoal shadow-sm">
                ES
              </span>
              
              {/* Log out */}
              <button 
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors bg-white shadow-sm"
                onClick={() => setCurrentPage('landing')}
              >
                <i className="fa-solid fa-right-from-bracket"></i>
                <span>Cerrar sesión</span>
              </button>
            </div>
          </header>

          {/* DASHBOARD VIEWPORT */}
          <main className="flex-1 p-8 text-left space-y-8 bg-graylight">
            <h1 className="font-heading text-3xl font-black text-gray-900 leading-none">Vista General</h1>
            
            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: 'MIEMBROS TOTALES', value: '22', icon: 'fa-users' },
                { name: 'NUEVOS MIEMBROS (30 DÍAS)', value: '15', sub: '68% del total', icon: 'fa-user-plus' },
                { name: 'MIEMBROS ACTIVOS', value: '4', sub: '18% de retención', icon: 'fa-wave-square' },
                { name: 'ESCANEOS TOTALES', value: '24', sub: '~6.0 por miembro activo', icon: 'fa-qrcode' },
                { name: 'PREMIOS CANJEADOS', value: '8', sub: '36% de conversión', icon: 'fa-gift' },
                { name: 'MIEMBROS SIN VISITAS', value: '17', sub: '77% inactivos', icon: 'fa-user-slash' }
              ].map((card) => (
                <div key={card.name} className="bg-white rounded-3xl border border-gray-150 p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
                  <div className="h-12 w-12 rounded-2xl bg-gray-100/80 text-gray-500 flex items-center justify-center text-lg shrink-0">
                    <i className={`fa-solid ${card.icon}`}></i>
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[0.65rem] font-bold text-gray-400 tracking-wider uppercase">{card.name}</span>
                    <span className="block text-2xl font-black text-gray-900 leading-none">{card.value}</span>
                    {card.sub && <span className="block text-xs font-bold text-primary mt-0.5">{card.sub}</span>}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Centered Income card */}
            <div className="flex justify-center pt-2">
              <div className="w-full md:max-w-sm bg-white rounded-3xl border border-gray-150 p-6 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow text-left">
                <div className="h-12 w-12 rounded-2xl bg-gray-100/80 text-gray-500 flex items-center justify-center text-lg shrink-0">
                  <i className="fa-solid fa-sack-dollar"></i>
                </div>
                <div className="space-y-1 text-left">
                  <span className="block text-[0.65rem] font-bold text-gray-400 tracking-wider uppercase">INGRESOS TOTALES</span>
                  <span className="block text-2xl font-black text-gray-900 leading-none">3565$</span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (currentPage === 'dashboard-trial') {
    return (
      <div className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col lg:flex-row font-body bg-graylight text-charcoal">
        {/* Left Column (Showcase) */}
        <div className="hidden lg:flex lg:w-1/2 lg:h-full bg-black flex-col justify-between p-12 text-white relative text-left overflow-hidden">
          {/* Glowing blur background effects */}
          <div className="absolute top-[-20%] left-[-20%] w-[450px] h-[450px] bg-primary/20 rounded-full blur-[140px] pointer-events-none"></div>
          <div className="absolute bottom-[-15%] right-[-15%] w-[400px] h-[400px] bg-accent/20 rounded-full blur-[120px] pointer-events-none"></div>

          <a href="#inicio" className="flex items-center gap-3 font-heading font-black text-2xl tracking-tight text-white relative z-10" onClick={() => setCurrentPage('landing')}>
            <img src="/logo-handshake-white.png" alt="2Gether Rewards Logo" className="h-8 w-auto" />
            2Gether<span className="text-primary">Rewards</span>
          </a>
          
          <div className="space-y-6 max-w-lg my-auto relative z-10">
            <h2 className="font-heading text-4xl lg:text-5xl font-black leading-tight text-white">
              Tarjetas digitales<br />
              <span className="text-primary">Para Apple Wallet y Google Wallet</span>
            </h2>
            <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
              Simplifica tu programa de fidelización. Crea y distribuye pases directamente en el móvil de tus clientes, sin descargas obligatorias.
            </p>
            
            <div className="space-y-6 pt-6">
              {/* Feature 1 */}
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary text-md">
                  <i className="fa-solid fa-stamp"></i>
                </div>
                <div className="space-y-1">
                  <h4 className="font-heading font-black text-sm text-white tracking-wide">Fidelización Directa</h4>
                  <p className="text-gray-400 text-xs leading-relaxed text-left">Crea tarjetas de sellos, cashback y regalo digitales compatibles con Wallet de forma nativa sin que tus clientes tengan que descargar apps.</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary text-md">
                  <i className="fa-solid fa-bell"></i>
                </div>
                <div className="space-y-1">
                  <h4 className="font-heading font-black text-sm text-white tracking-wide">Notificaciones Segmentadas</h4>
                  <p className="text-gray-400 text-xs leading-relaxed text-left">Envía ofertas personalizadas, promociones de campaña y alertas automáticas directamente a la pantalla de bloqueo de tus clientes.</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-4">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary text-md">
                  <i className="fa-solid fa-chart-line"></i>
                </div>
                <div className="space-y-1">
                  <h4 className="font-heading font-black text-sm text-white tracking-wide">Dashboard en Tiempo Real</h4>
                  <p className="text-gray-400 text-xs leading-relaxed text-left">Monitorea la frecuencia de visitas, el ticket promedio y el retorno de inversión detallado de cada campaña en tiempo real.</p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 relative z-10">&copy; 2026 2GetherRewards. Todos los derechos reservados.</p>
        </div>

        {/* Right Column (Form) */}
        <div className="w-full lg:w-1/2 lg:h-full lg:overflow-y-auto bg-graylight flex flex-col justify-start items-center p-6 sm:p-12 py-16 sm:py-24 relative min-h-screen lg:min-h-0">
          {/* Back button */}
          <button 
            className="absolute top-6 left-6 text-xs font-bold text-gray-400 hover:text-charcoal flex items-center gap-1.5"
            onClick={() => setCurrentPage('landing')}
          >
            <i className="fa-solid fa-arrow-left"></i> Volver a Inicio
          </button>
          
          {/* Language selector */}
          <div className="absolute top-6 right-6">
            <span className="h-8 w-8 border border-gray-200 bg-white rounded-full flex items-center justify-center text-xs font-bold text-charcoal shadow-sm">
              ES
            </span>
          </div>

          {/* Form Box */}
          <div className="w-full max-w-[440px] bg-white rounded-3xl border border-gray-200/50 shadow-xl p-8 space-y-6">
            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              <button 
                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'acceso' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                onClick={() => setActiveTab('acceso')}
              >
                Acceso
              </button>
              <button 
                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'registro' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                onClick={() => setActiveTab('registro')}
              >
                Registro
              </button>
            </div>

            {/* Subtitle */}
            <p className="text-xs font-bold text-primary tracking-wide text-center">
              {activeTab === 'registro' ? '¡Comience hoy su prueba gratuita de 14 días!' : '¡Bienvenido de vuelta! Ingresa tus credenciales'}
            </p>

            {/* Form */}
            {activeTab === 'registro' ? (
              <form className="space-y-4" onSubmit={handleRegistrationSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider mb-1 text-left">Primer Nombre</label>
                    <input type="text" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-xs" placeholder="Ej. Juan" />
                  </div>
                  <div>
                    <label className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider mb-1 text-left">Apellido</label>
                    <input type="text" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-xs" placeholder="Ej. Pérez" />
                  </div>
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider mb-1 text-left">Nombre de empresa</label>
                  <input type="text" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-xs" placeholder="Ej. Mi Tienda S.L." />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider mb-1 text-left">Correo electrónico</label>
                  <input type="email" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-xs" placeholder="juan@correo.com" />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider mb-1 text-left">Teléfono</label>
                  <div className="flex gap-2">
                    <select className="px-2 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-primary bg-white">
                      <option value="+34">ES +34</option>
                      <option value="+1">US +1</option>
                      <option value="+52">MX +52</option>
                      <option value="+54">AR +54</option>
                    </select>
                    <input type="tel" required className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-xs" placeholder="600 000 000" />
                  </div>
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider mb-1 text-left">Contraseña</label>
                  <input type="password" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-xs" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider mb-1 text-left">Repita la contraseña</label>
                  <input type="password" required className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-xs" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider mb-1 text-left">Plan</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary bg-white text-xs">
                    <option>Plan START - $49/mes</option>
                    <option>Plan GROWTH - $69/mes</option>
                    <option>Plan ENTERPRISE - $99/mes</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg mt-2 transition-all duration-200 active:scale-95 text-xs uppercase tracking-wider">
                  Registro
                </button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleLoginSubmit}>
                <div>
                  <label className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider mb-1 text-left">Correo electrónico</label>
                  <input 
                    type="email" 
                    required 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-xs" 
                    placeholder="juan@correo.com" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider mb-1 text-left">Contraseña</label>
                  <input 
                    type="password" 
                    required 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-primary text-xs" 
                    placeholder="••••••••" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <button type="submit" className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg mt-4 transition-all duration-200 active:scale-95 text-xs uppercase tracking-wider">
                  Acceso
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-graylight text-charcoal font-body">
      {/* CABECERA (Header) */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isHeaderScrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-3' : 'bg-transparent py-5'}`} id="main-header">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <a 
            href="#inicio" 
            className="flex items-center gap-3 font-heading font-black text-2xl tracking-tight text-gray-900" 
            id="logo-brand" 
            onClick={() => { setCurrentPage('landing'); setActiveNav('inicio'); }}
          >
            <img src="/logo-handshake.png" alt="2Gether Rewards Logo" className="brand-handshake-img" />
            2Gether<span>Rewards</span>
          </a>
          
          <nav className={`lg:flex items-center gap-8 ${isMobileMenuOpen ? 'flex flex-col absolute top-full left-0 w-full bg-white border-b border-gray-100 py-6 px-8 shadow-lg gap-4' : 'hidden'}`} id="main-nav">
            {['inicio', 'beneficios', 'menu', 'tarjetas', 'quiz', 'opiniones'].map((nav) => (
              <a 
                key={nav}
                href={`#${nav}`} 
                className={`text-[0.95rem] font-semibold transition-colors duration-200 py-1 hover:text-primary ${activeNav === nav ? 'text-primary border-b-2 border-primary' : 'text-gray-600'}`}
                onClick={() => { setActiveNav(nav); setIsMobileMenuOpen(false); }}
              >
                {nav === 'inicio' ? 'Inicio' : 
                 nav === 'beneficios' ? 'Beneficios' : 
                 nav === 'menu' ? 'Planes' : 
                 nav === 'tarjetas' ? 'Tarjetas' : 
                 nav === 'quiz' ? '¿Cuál es mi Plan?' : 'Casos de Éxito'}
              </a>
            ))}
            {isMobileMenuOpen && (
              <button 
                className="w-full mt-2 py-3 bg-primary hover:bg-primary-hover text-white font-bold text-sm rounded-full shadow flex items-center justify-center gap-1.5"
                onClick={() => { setCurrentPage('dashboard-trial'); setIsMobileMenuOpen(false); }}
              >
                <i className="fa-solid fa-gauge-high"></i> Probar Dashboard
              </button>
            )}
          </nav>
          
          <div className="flex items-center gap-4">
            <button 
              className="hidden sm:inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold text-xs rounded-full shadow transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
              onClick={() => { setCurrentPage('dashboard-trial'); setIsMobileMenuOpen(false); }}
            >
              <i className="fa-solid fa-gauge-high"></i> Probar Dashboard
            </button>
            <button 
              className={`relative p-3 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-transform duration-200 active:scale-95 ${cartPulse ? 'animate-bounce' : ''}`} 
              id="cart-toggle-btn" 
              onClick={openCart} 
              aria-label="Abrir configurador de suscripción"
            >
              <i className="fa-solid fa-sliders text-gray-600 text-lg"></i>
              <span className={`absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-[0.7rem] font-bold text-white transition-opacity duration-200 ${cartTotalItems > 0 ? 'bg-primary opacity-100' : 'bg-transparent opacity-0'}`} id="cart-badge-count">
                {cartTotalItems}
              </span>
            </button>
            <button 
              className="lg:hidden p-3 rounded-full border border-gray-200 bg-white hover:bg-gray-50" 
              id="mobile-menu-btn" 
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              aria-label="Abrir menú de navegación móvil"
            >
              <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'} text-gray-600 text-lg`}></i>
            </button>
          </div>
        </div>
      </header>

      {/* SECCIÓN HÉROE (Hero) */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 bg-gradient-to-b from-emerald-50/40 via-white to-gray-50" id="inicio">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 text-left space-y-6">
            <span className="inline-block text-[0.8rem] tracking-wider uppercase font-black text-primary bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
              Plataforma de Fidelización Digital
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
              Fideliza. Conecta. <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Haz crecer tu negocio.</span>
            </h1>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl leading-relaxed">
              Crea tarjetas de sellos, cashback y regalo 100% digitales compatibles con Apple Wallet y Google Wallet. Sin aplicaciones de terceros, sin hardware complejo. Aumenta la recompra y fideliza a tus clientes habituales desde hoy.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <a href="#menu" className="px-8 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-full shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:-translate-y-0.5" onClick={() => setActiveNav('menu')}>Ver Planes</a>
              <a href="#quiz" className="px-8 py-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold rounded-full shadow-sm flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5" onClick={() => { setActiveNav('quiz'); startQuiz(); }}>
                <i className="fa-solid fa-wand-magic-sparkles text-primary"></i> ¿Cuál es mi Plan Ideal?
              </a>
            </div>
          </div>
          
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-[360px] bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col justify-between min-h-[520px]">
              <div>
                {/* Card Header matching Padel Pro layout structure */}
                <div className="p-5 flex items-center gap-3">
                  <img src="/logo-handshake.png" alt="2Gether Rewards Logo" className="h-10 w-10 object-contain" />
                  <div className="text-left leading-none">
                    <span className="block font-heading font-black text-sm text-gray-900 tracking-wider">2GETHER</span>
                    <span className="block font-heading font-light text-[0.7rem] text-gray-500 tracking-widest mt-0.5">REWARDS</span>
                  </div>
                </div>
                
                {/* Card Banner Image (Cloudinary layout with stamps) */}
                <div className="w-full">
                  <img 
                    src="https://res.cloudinary.com/dvmrbrrba/image/upload/v1781316175/LOGO_2GETHER_REWARDS-13_rlmvfq.png" 
                    alt="2Gether Rewards Banner" 
                    className="w-full h-auto object-cover" 
                  />
                </div>

                {/* Card Info Body (Jon Doe & Premio 0) */}
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="text-left">
                      <span className="block text-[0.65rem] font-bold text-gray-400 tracking-widest uppercase">TÍTULAR</span>
                      <span className="block text-xl font-normal text-gray-800 tracking-wide mt-1 uppercase">JON DOE</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[0.65rem] font-bold text-gray-400 tracking-widest uppercase">PREMIO</span>
                      <span className="block text-xl font-normal text-gray-800 mt-1">0</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* QR Code Section (Centered at the bottom with white space spacing) */}
              <div className="flex justify-center pb-8 pt-4">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://2getherrewards.com" 
                  alt="2Gether Rewards QR Code" 
                  className="h-32 w-32 rounded-lg border border-gray-100 bg-white p-1" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN BENEFICIOS (Features) */}
      <section className="py-20 bg-white" id="beneficios">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl border border-gray-100 bg-gray-50/50 text-left space-y-4 hover:shadow-xl hover:border-emerald-100 transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-primary flex items-center justify-center text-xl">
                <i className="fa-solid fa-wallet"></i>
              </div>
              <h3 className="font-heading font-black text-xl text-gray-900">Tarjetas Digitales</h3>
              <p className="text-gray-600 text-[0.95rem] leading-relaxed">Tarjetas de sellos, cashback, regalo, descuento y membresías 100% digitales, sin apps. Compatible con Apple y Google Wallet.</p>
            </div>
            
            <div className="p-8 rounded-3xl border border-gray-100 bg-gray-50/50 text-left space-y-4 hover:shadow-xl hover:border-emerald-100 transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-primary flex items-center justify-center text-xl">
                <i className="fa-solid fa-bell"></i>
              </div>
              <h3 className="font-heading font-black text-xl text-gray-900">Notificaciones Push</h3>
              <p className="text-gray-600 text-[0.95rem] leading-relaxed">Envía alertas, ofertas, cupones y recordatorios directamente al móvil de tus clientes sin que tengan que abrir ninguna aplicación.</p>
            </div>
            
            <div className="p-8 rounded-3xl border border-gray-100 bg-gray-50/50 text-left space-y-4 hover:shadow-xl hover:border-emerald-100 transition-all duration-300">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-primary flex items-center justify-center text-xl">
                <i className="fa-solid fa-chart-line"></i>
              </div>
              <h3 className="font-heading font-black text-xl text-gray-900">Dashboard en Tiempo Real</h3>
              <p className="text-gray-600 text-[0.95rem] leading-relaxed">Visualiza el comportamiento de compra, frecuencia de visitas y el retorno de cada cliente desde tu panel de control en vivo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN PLANES (Shop) */}
      <section className="py-20 bg-gray-50 border-t border-b border-gray-100" id="menu">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="font-heading text-3xl sm:text-4xl font-black text-gray-900">Elige tu <span className="text-primary">Plan 2GetherRewards</span></h2>
            <p className="text-gray-600">Selecciona el plan que mejor se adapta al tamaño y objetivos de tu negocio. Sin permanencias, cancela cuando quieras.</p>
          </div>

          {/* Grid de Planes */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-16">

            {/* Plan START */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
              <div className="space-y-6">
                <div className="text-left space-y-2">
                  <h3 className="font-heading font-black text-2xl text-gray-800">START</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-gray-900">$49</span>
                    <span className="text-gray-500 font-semibold">/ mes</span>
                  </div>
                  <p className="text-gray-500 text-sm">El impulso inicial para digitalizar tu negocio</p>
                </div>
                <hr className="border-gray-100" />
                <ul className="space-y-3 text-left text-[0.95rem] text-gray-600">
                  <li className="flex items-start gap-2.5"><i className="fa-solid fa-check text-primary mt-1"></i> <span><strong>1 Sucursal</strong></span></li>
                  <li className="flex items-start gap-2.5"><i className="fa-solid fa-check text-primary mt-1"></i> <span>Hasta <strong>500 Clientes</strong></span></li>
                  <li className="flex items-start gap-2.5"><i className="fa-solid fa-check text-primary mt-1"></i> <span>Tarjetas de Sellos <em>(Wallet)</em></span></li>
                  <li className="flex items-start gap-2.5"><i className="fa-solid fa-check text-primary mt-1"></i> <span>Tarjetas de Regalo <em>(Wallet)</em></span></li>
                  <li className="flex items-start gap-2.5"><i className="fa-solid fa-check text-primary mt-1"></i> <span>Notificaciones Push</span></li>
                  <li className="flex items-start gap-2.5"><i className="fa-solid fa-check text-primary mt-1"></i> <span>Dashboard en Tiempo Real</span></li>
                </ul>
              </div>
              <div className="space-y-6 mt-8">
                <div className="bg-gray-50 rounded-2xl p-4 flex gap-3 text-left text-xs text-gray-600">
                  <i className="fa-solid fa-store text-primary text-base"></i>
                  <div>
                    <strong>Ideal para:</strong> Negocios locales, cafeterías y pequeños comercios.
                  </div>
                </div>
                <button 
                  className="w-full py-4 bg-gray-900 hover:bg-gray-850 text-white font-bold rounded-full transition-transform duration-200 active:scale-95" 
                  onClick={() => addToCart(1)}
                >
                  Contratar Plan START
                </button>
              </div>
            </div>

            {/* Plan GROWTH (Más Popular) */}
            <div className="bg-white rounded-3xl border-2 border-primary shadow-xl p-8 flex flex-col justify-between relative hover:shadow-2xl transition-shadow duration-300">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white font-bold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider">
                ★ MÁS POPULAR
              </span>
              <div className="space-y-6">
                <div className="text-left space-y-2">
                  <h3 className="font-heading font-black text-2xl text-gray-800">GROWTH</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-gray-900">$69</span>
                    <span className="text-gray-500 font-semibold">/ mes</span>
                  </div>
                  <p className="text-gray-500 text-sm">Aumenta la frecuencia de compra y segmenta como los grandes</p>
                </div>
                <hr className="border-gray-100" />
                <ul className="space-y-3 text-left text-[0.95rem] text-gray-600">
                  <li className="flex items-start gap-2.5"><i className="fa-solid fa-check text-primary mt-1"></i> <span>Hasta <strong>5 Sucursales</strong></span></li>
                  <li className="flex items-start gap-2.5"><i className="fa-solid fa-check text-primary mt-1"></i> <span>Hasta <strong>5,000 Clientes</strong></span></li>
                  <li className="flex items-start gap-2.5"><i className="fa-solid fa-check text-primary mt-1"></i> <span>Tarjetas de Sellos y Regalo <em>(Wallet)</em></span></li>
                  <li className="flex items-start gap-2.5"><i className="fa-solid fa-check text-primary mt-1"></i> <span>Notificaciones Push Ilimitadas</span></li>
                  <li className="flex items-start gap-2.5"><i className="fa-solid fa-check text-primary mt-1"></i> <span>Envío de Ofertas y Cupones</span></li>
                  <li className="flex items-start gap-2.5"><i className="fa-solid fa-check text-primary mt-1"></i> <span>Dashboard en Tiempo Real</span></li>
                </ul>
              </div>
              <div className="space-y-6 mt-8">
                <div className="bg-emerald-50/50 rounded-2xl p-4 flex gap-3 text-left text-xs text-gray-600">
                  <i className="fa-solid fa-building text-primary text-base"></i>
                  <div>
                    <strong>Ideal para:</strong> Cadenas locales y negocios en pleno crecimiento.
                  </div>
                </div>
                <button 
                  className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-full shadow-lg shadow-emerald-500/15 transition-transform duration-200 active:scale-95" 
                  onClick={() => addToCart(2)}
                >
                  Contratar Plan GROWTH
                </button>
              </div>
            </div>

            {/* Plan ENTERPRISE */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
              <div className="space-y-6">
                <div className="text-left space-y-2">
                  <h3 className="font-heading font-black text-2xl text-gray-800">ENTERPRISE</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-gray-900">$99</span>
                    <span className="text-gray-500 font-semibold">/ mes</span>
                  </div>
                  <p className="text-gray-500 text-sm">Conectividad total, control corporativo y marketing integral</p>
                </div>
                <hr className="border-gray-100" />
                <ul className="space-y-3 text-left text-[0.95rem] text-gray-600">
                  <li className="flex items-start gap-2.5"><i className="fa-solid fa-check text-primary mt-1"></i> <span><strong>Sucursales Ilimitadas</strong></span></li>
                  <li className="flex items-start gap-2.5"><i className="fa-solid fa-check text-primary mt-1"></i> <span><strong>Clientes Ilimitados</strong></span></li>
                  <li className="flex items-start gap-2.5"><i className="fa-solid fa-check text-primary mt-1"></i> <span>Tarjetas de Sellos y Regalo <em>(Wallet)</em></span></li>
                  <li className="flex items-start gap-2.5"><i className="fa-solid fa-check text-primary mt-1"></i> <span>Envío de Ofertas y Cupones</span></li>
                  <li className="flex items-start gap-2.5"><i className="fa-solid fa-check text-primary mt-1"></i> <span>Geo Localización Ilimitada</span></li>
                  <li className="flex items-start gap-2.5"><i className="fa-solid fa-check text-primary mt-1"></i> <span>Soporte Prioritario</span></li>
                </ul>
              </div>
              <div className="space-y-6 mt-8">
                <div className="bg-gray-50 rounded-2xl p-4 flex gap-3 text-left text-xs text-gray-600">
                  <i className="fa-solid fa-city text-primary text-base"></i>
                  <div>
                    <strong>Ideal para:</strong> Franquicias y empresas con múltiples sedes.
                  </div>
                </div>
                <button 
                  className="w-full py-4 bg-gray-900 hover:bg-gray-850 text-white font-bold rounded-full transition-transform duration-200 active:scale-95" 
                  onClick={() => addToCart(3)}
                >
                  Contratar Plan ENTERPRISE
                </button>
              </div>
            </div>
          </div>

          {/* ADD-ON EXCLUSIVO: Redes Sociales */}
          <div className="rounded-3xl overflow-hidden text-left shadow-2xl border border-emerald-800/10" id="addon-social">
            <div className="p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-gradient-to-br from-charcoal via-emerald-950 to-emerald-900 text-white">
              <div className="lg:col-span-8 space-y-6">
                <span className="inline-block text-[0.65rem] uppercase tracking-wider font-extrabold bg-lime/10 text-lime px-3 py-1.5 rounded-md border border-lime/20">
                  ADD-ON EXCLUSIVO
                </span>
                <h3 className="font-heading text-3xl lg:text-4xl font-black text-white leading-tight">
                  Impulsa tus <span className="text-lime">Redes Sociales</span>
                </h3>
                <p className="text-emerald-100/90 max-w-3xl text-sm sm:text-base leading-relaxed">
                  Definimos tu estrategia, editamos y publicamos tu contenido. Solo nos entregas el contenido bruto y nosotros nos encargamos de transformarlo en publicaciones de alto impacto.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex gap-3 bg-white/5 border border-white/10 p-4 rounded-xl items-start">
                    <i className="fa-solid fa-bullseye text-lime text-lg mt-0.5"></i>
                    <span className="text-xs sm:text-sm font-semibold text-emerald-50">Estrategia digital personalizada</span>
                  </div>
                  <div className="flex gap-3 bg-white/5 border border-white/10 p-4 rounded-xl items-start">
                    <i className="fa-solid fa-comments text-lime text-lg mt-0.5"></i>
                    <span className="text-xs sm:text-sm font-semibold text-emerald-50">Sesiones constantes de brainstorming</span>
                  </div>
                  <div className="flex gap-3 bg-white/5 border border-white/10 p-4 rounded-xl items-start">
                    <i className="fa-solid fa-video text-lime text-lg mt-0.5"></i>
                    <span className="text-xs sm:text-sm font-semibold text-emerald-50">Pautas de grabación guiadas</span>
                  </div>
                  <div className="flex gap-3 bg-white/5 border border-white/10 p-4 rounded-xl items-start">
                    <i className="fa-solid fa-rocket text-lime text-lg mt-0.5"></i>
                    <span className="text-xs sm:text-sm font-semibold text-emerald-50">Optimización y publicación profesional</span>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4 text-center space-y-6 bg-white/5 border border-white/10 p-8 rounded-3xl w-full">
                <div>
                  <span className="block text-emerald-300 text-xs font-bold uppercase tracking-widest">PRECIO ADICIONAL</span>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-black text-white">+ $300</span>
                    <span className="text-emerald-300 text-sm">/ mes</span>
                  </div>
                </div>
                <button 
                  className="w-full py-4 bg-lime hover:bg-lime/90 text-charcoal font-black rounded-full transition-transform duration-200 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-lime-500/10" 
                  onClick={() => addToCart(4)}
                >
                  <i className="fa-brands fa-instagram"></i> Añadir Add-on Redes Sociales
                </button>
              </div>
            </div>
          </div>

          {/* Incluye en todos los planes */}
          <div className="mt-12 bg-white rounded-3xl border border-gray-100 p-6 flex flex-col md:flex-row md:items-center gap-6 text-left" id="includes-all">
            <h4 className="flex items-center gap-2 font-heading font-black text-gray-900 text-md shrink-0">
              <i className="fa-solid fa-circle-check text-primary"></i> Incluido en todos los planes:
            </h4>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-600 font-semibold">
              <span className="flex items-center gap-1.5"><i className="fa-solid fa-wallet text-gray-400"></i> Apple/Google Wallet</span>
              <span className="flex items-center gap-1.5"><i className="fa-solid fa-bell text-gray-400"></i> Notificaciones Push</span>
              <span className="flex items-center gap-1.5"><i className="fa-solid fa-users text-gray-400"></i> Registro de clientes</span>
              <span className="flex items-center gap-1.5"><i className="fa-solid fa-arrow-trend-up text-gray-400"></i> Herramientas de recompra</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN TIPOS DE TARJETA */}
      <section className="py-20 bg-white" id="tarjetas">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="font-heading text-3xl sm:text-4xl font-black text-gray-900">¡Tu programa, <span className="text-primary">tus reglas!</span></h2>
            <p className="text-gray-600">Nuestra plataforma es compatible con 8 tipos de lógicas comerciales para que utilices la que mejor se adapte a tu tipo de negocio.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { id: 'sellos', icon: 'fa-stamp', title: 'Tarjeta de Sellos', desc: 'El clásico e infalible "Compra 10 cafés" y obtén 1 gratis.' },
              { id: 'cashback', icon: 'fa-coins', title: 'Tarjeta de Cashback', desc: 'Recibe un porcentaje de lo pagado como saldo para tu próxima compra.' },
              { id: 'afiliacion', icon: 'fa-id-card', title: 'Tarjeta de Afiliación', desc: 'Registra clientes capturando sus datos a cambio de promociones exclusivas.' },
              { id: 'descuento', icon: 'fa-percent', title: 'Tarjeta de Descuento', desc: 'Premia la lealtad otorgando un porcentaje de descuento progresivo.' },
              { id: 'cupon', icon: 'fa-ticket', title: 'Tarjeta de Cupón', desc: 'Regala un cupón digital de un solo uso en el instante de registro.' },
              { id: 'regalo', icon: 'fa-gift', title: 'Tarjeta de Regalo', desc: 'Emite y gestiona certificados de regalo 100% digitales y transferibles.' },
              { id: 'membresia', icon: 'fa-crown', title: 'Membresía PREMIUM', desc: 'Crea un club exclusivo para miembros VIP y acepta pagos recurrentes.', premium: true },
              { id: 'multipase', icon: 'fa-layer-group', title: 'Multipase PREMIUM', desc: 'Mejora tu flujo de caja cobrando por adelantado con tarjetas prepagadas.', premium: true }
            ].map((type) => (
              <div key={type.id} className={`p-6 rounded-3xl border text-left flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 ${type.premium ? 'border-amber-200 bg-amber-50/10' : 'border-gray-100 bg-gray-50/30'}`}>
                <div className="space-y-4">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-lg ${type.premium ? 'bg-amber-100 text-amber-600' : 'bg-emerald-50/80 text-primary'}`}>
                    <i className={`fa-solid ${type.icon}`}></i>
                  </div>
                  <h4 className="font-heading font-black text-lg text-gray-900 flex items-center gap-2">
                    {type.title}
                    {type.premium && <span className="text-[0.6rem] bg-amber-100 text-amber-700 font-extrabold px-1.5 py-0.5 rounded">PREMIUM</span>}
                  </h4>
                  <p className="text-gray-600 text-[0.88rem] leading-relaxed">{type.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN QUIZ */}
      <section className="py-20 bg-gray-50 border-t border-b border-gray-100" id="quiz">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="font-heading text-3xl sm:text-4xl font-black text-gray-900">¿Cuál es tu <span className="text-primary">Plan Ideal?</span></h2>
            <p className="text-gray-600">Responde 3 preguntas rápidas y te recomendamos el plan 2GetherRewards perfecto para tu negocio.</p>
          </div>
          
          <div className="max-w-xl mx-auto bg-white rounded-3xl border border-gray-100 p-8 shadow-xl min-h-[300px] flex items-center justify-center">
            {/* Pantalla Inicial */}
            {quizStep === 0 && (
              <div className="space-y-6 w-full text-center">
                <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-primary text-2xl mx-auto animate-pulse">
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                </div>
                <div className="space-y-2">
                  <h3 className="font-heading font-black text-xl text-gray-900">Encontremos tu plan perfecto</h3>
                  <p className="text-gray-600 text-sm max-w-md mx-auto">Analizaremos tu tipo de negocio, volumen de clientes y tus objetivos para recomendarte la combinación idónea.</p>
                </div>
                <button className="px-8 py-3.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-full shadow-md" onClick={startQuiz}>
                  Comenzar
                </button>
              </div>
            )}
            
            {/* Pregunta 1 */}
            {quizStep === 1 && (
              <div className="w-full text-left space-y-6">
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full transition-all duration-300" style={{ width: '33%' }}></div>
                </div>
                <h3 className="font-heading font-black text-lg text-gray-900">1. ¿Qué tipo de negocio tienes?</h3>
                <div className="space-y-3">
                  {[
                    { val: 'hot', icon: 'fa-utensils', label: 'Restauración y Hostelería', desc: 'Cafeterías, bares, restaurantes o catering.' },
                    { val: 'cold', icon: 'fa-store', label: 'Comercio Local y Retail', desc: 'Tiendas, estéticas, barberías o salones.' },
                    { val: 'grains', icon: 'fa-building', label: 'Franquicia o Cadena', desc: 'Múltiples sucursales o en expansión.' }
                  ].map((opt) => (
                    <div 
                      key={opt.val} 
                      className={`p-4 rounded-2xl border cursor-pointer flex gap-4 items-center transition-all duration-200 ${quizAnswers.type === opt.val ? 'border-primary bg-emerald-50/20' : 'border-gray-100 hover:border-gray-300 bg-gray-50/20'}`}
                      onClick={() => selectQuizAnswer('type', opt.val)}
                    >
                      <i className={`fa-solid ${opt.icon} text-lg text-primary`}></i>
                      <div>
                        <span className="block font-bold text-gray-900 text-sm">{opt.label}</span>
                        <span className="block text-xs text-gray-500">{opt.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pregunta 2 */}
            {quizStep === 2 && (
              <div className="w-full text-left space-y-6">
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full transition-all duration-300" style={{ width: '66%' }}></div>
                </div>
                <h3 className="font-heading font-black text-lg text-gray-900">2. ¿Cuántos clientes frecuentes tienes al mes?</h3>
                <div className="space-y-3">
                  {[
                    { val: 'sweet', icon: 'fa-users-line', label: 'Menos de 500', desc: 'Comercio de barrio o negocio en inicio.' },
                    { val: 'acid', icon: 'fa-people-group', label: '500 a 5,000', desc: 'Negocio consolidado y en crecimiento.' },
                    { val: 'strong', icon: 'fa-city', label: 'Más de 5,000', desc: 'Gran volumen o múltiples ubicaciones.' }
                  ].map((opt) => (
                    <div 
                      key={opt.val} 
                      className={`p-4 rounded-2xl border cursor-pointer flex gap-4 items-center transition-all duration-200 ${quizAnswers.flavor === opt.val ? 'border-primary bg-emerald-50/20' : 'border-gray-100 hover:border-gray-300 bg-gray-50/20'}`}
                      onClick={() => selectQuizAnswer('flavor', opt.val)}
                    >
                      <i className={`fa-solid ${opt.icon} text-lg text-primary`}></i>
                      <div>
                        <span className="block font-bold text-gray-900 text-sm">{opt.label}</span>
                        <span className="block text-xs text-gray-500">{opt.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pregunta 3 */}
            {quizStep === 3 && (
              <div className="w-full text-left space-y-6">
                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full transition-all duration-300" style={{ width: '100%' }}></div>
                </div>
                <h3 className="font-heading font-black text-lg text-gray-900">3. ¿Cuál es tu prioridad principal?</h3>
                <div className="space-y-3">
                  {[
                    { val: 'pastry', icon: 'fa-arrows-spin', label: 'Hacer que vuelvan más seguido', desc: 'Retención y automatización de visitas.' },
                    { val: 'pure', icon: 'fa-chart-pie', label: 'Analizar y crecer a escala', desc: 'Control de múltiples puntos de venta y datos.' }
                  ].map((opt) => (
                    <div 
                      key={opt.val} 
                      className={`p-4 rounded-2xl border cursor-pointer flex gap-4 items-center transition-all duration-200 ${quizAnswers.addons === opt.val ? 'border-primary bg-emerald-50/20' : 'border-gray-100 hover:border-gray-300 bg-gray-50/20'}`}
                      onClick={() => selectQuizAnswer('addons', opt.val)}
                    >
                      <i className={`fa-solid ${opt.icon} text-lg text-primary`}></i>
                      <div>
                        <span className="block font-bold text-gray-900 text-sm">{opt.label}</span>
                        <span className="block text-xs text-gray-500">{opt.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resultados */}
            {quizStep === 4 && recommendedPlan && (
              <div className="w-full text-center space-y-6">
                <h3 className="font-heading font-black text-xl text-gray-900">¡Recomendación Lista!</h3>
                <div className="p-6 rounded-2xl border-2 border-emerald-100 bg-emerald-50/10 text-left space-y-4">
                  <div className="flex justify-between items-start">
                    <span className="text-xs uppercase font-extrabold tracking-widest text-primary">PLAN PERFECTO</span>
                    <span className="text-xl font-black text-gray-900">${recommendedPlan.price}/mes</span>
                  </div>
                  <h4 className="font-heading font-black text-lg text-gray-900">{recommendedPlan.name}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{recommendedPlan.desc}</p>
                  <button 
                    className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-bold rounded-full text-sm" 
                    onClick={() => { addToCart(recommendedPlan.id); openCart(); }}
                  >
                    Contratar este Plan
                  </button>
                </div>
                <button className="text-sm font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1.5 mx-auto" onClick={restartQuiz}>
                  <i className="fa-solid fa-rotate-left"></i> Repetir Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SECCIÓN NOSOTROS */}
      <section className="py-20 bg-white" id="nosotros">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative">
            <img src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?q=80&w=600&auto=format&fit=crop" alt="Dashboard 2GetherRewards" className="rounded-3xl border border-gray-100 shadow-xl" />
            <div className="absolute -bottom-6 -right-6 bg-primary text-white p-6 rounded-2xl shadow-xl flex flex-col items-center">
              <span className="text-2xl font-black leading-none">+35%</span>
              <span className="text-[0.65rem] font-bold uppercase tracking-wider">Retención</span>
            </div>
          </div>
          <div className="text-left space-y-6">
            <span className="text-xs font-black uppercase tracking-widest text-primary bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">
              NUESTRA PLATAFORMA
            </span>
            <h3 className="font-heading text-3xl sm:text-4xl font-black text-gray-900 leading-tight">Tecnología de fidelización al <span className="text-primary">alcance de tu negocio</span></h3>
            <p className="text-gray-600 text-[0.95rem] leading-relaxed">
              En 2GetherRewards creemos que todo negocio, sin importar su tamaño, merece acceso a herramientas de fidelización de primer nivel. Sin aplicaciones adicionales, sin hardware costoso, sin complicaciones técnicas.
            </p>
            <p className="text-gray-600 text-[0.95rem] leading-relaxed">
              Nuestras tarjetas digitales funcionan de manera nativa en Apple Wallet y Google Wallet, facilitando que tus clientes las lleven siempre con ellos, sin necesidad de descargas.
            </p>
            <div className="grid grid-cols-2 gap-6 pt-2 border-t border-gray-100">
              <div>
                <span className="block text-3xl font-black text-gray-900">2.5M+</span>
                <span className="text-xs font-bold text-gray-400 uppercase">Tarjetas creadas</span>
              </div>
              <div>
                <span className="block text-3xl font-black text-gray-900">1,200+</span>
                <span className="text-xs font-bold text-gray-400 uppercase">Negocios activos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN TESTIMONIOS */}
      <section className="py-20 bg-gray-50 border-t border-b border-gray-100" id="opiniones">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="font-heading text-3xl sm:text-4xl font-black text-gray-900">Casos de Éxito: <span className="text-primary">Clientes Reales</span></h2>
            <p className="text-gray-600">Negocios como el tuyo ya están fidelizando clientes y aumentando sus ventas recurrentes con 2GetherRewards.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-amber-400 text-sm">
                  <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                </div>
                <p className="text-gray-600 italic text-[0.95rem] leading-relaxed">
                  "Desde que implementamos el Plan GROWTH con las tarjetas de sellos digitales, nuestros clientes vuelven un 40% más seguido. Las notificaciones push marcan una diferencia enorme."
                </p>
              </div>
              <div className="flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150" alt="Cliente Sofía" className="h-11 w-11 rounded-full object-cover border border-gray-100" />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Sofía Martínez</h4>
                  <span className="text-xs text-gray-400">Dueña de Cafetería Origen</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-amber-400 text-sm">
                  <i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i><i className="fa-solid fa-star"></i>
                </div>
                <p className="text-gray-600 italic text-[0.95rem] leading-relaxed">
                  "Con el Plan ENTERPRISE manejamos 8 sucursales desde un solo panel. Las tarjetas de regalo digitales se han convertido en nuestro mejor producto de temporada navideña."
                </p>
              </div>
              <div className="flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150" alt="Cliente Alejandro" className="h-11 w-11 rounded-full object-cover border border-gray-100" />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Alejandro Ruiz</h4>
                  <span className="text-xs text-gray-400">Director de Gourmet Garden (8 sedes)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-300 py-16 text-left" id="main-footer">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-6 space-y-4">
              <a href="#inicio" className="flex items-center gap-3 font-heading font-black text-xl text-white">
                <img src="/logo-handshake-white.png" alt="2Gether Rewards Logo" className="h-6 w-auto" />
                2Gether<span className="text-primary">Rewards</span>
              </a>
              <p className="text-sm text-gray-400 max-w-md leading-relaxed">
                Fideliza. Conecta. Haz crecer tu negocio. La plataforma de fidelización digital más completa del mercado, sin apps y compatible con Apple y Google Wallet.
              </p>
              <div className="flex gap-3">
                <a href="#" className="h-9 w-9 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white text-sm"><i className="fa-brands fa-facebook-f"></i></a>
                <a href="#" className="h-9 w-9 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white text-sm"><i className="fa-brands fa-instagram"></i></a>
                <a href="#" className="h-9 w-9 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-white text-sm"><i className="fa-brands fa-linkedin-in"></i></a>
              </div>
            </div>
            <div className="lg:col-span-3 space-y-4">
              <h4 className="font-bold text-white text-sm">Plataforma</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li><a href="#tarjetas" className="hover:text-white" onClick={() => setActiveNav('tarjetas')}>Tipos de Tarjeta</a></li>
                <li><a href="#quiz" className="hover:text-white" onClick={() => { setActiveNav('quiz'); startQuiz(); }}>Encuentra tu Plan</a></li>
                <li><a href="#nosotros" className="hover:text-white" onClick={() => setActiveNav('nosotros')}>Sobre Nosotros</a></li>
                <li><a href="#opiniones" className="hover:text-white" onClick={() => setActiveNav('opiniones')}>Casos de Éxito</a></li>
              </ul>
            </div>
            <div className="lg:col-span-3 space-y-4">
              <h4 className="font-bold text-white text-sm">Contacto</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
                <li className="flex gap-2"><i className="fa-solid fa-envelope text-gray-500 mt-1"></i> info@2getherrewards.com</li>
                <li className="flex gap-2"><i className="fa-solid fa-globe text-gray-500 mt-1"></i> www.2getherrewards.com</li>
              </ul>
            </div>
          </div>
          <hr className="border-gray-800" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>&copy; 2026 2GetherRewards. Todos los derechos reservados.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white">Privacidad</a>
              <a href="#" className="hover:text-white">Términos de Servicio</a>
            </div>
          </div>
        </div>
      </footer>

      {/* DRAWER CONFIGURADOR (CARRITO) */}
      {isCartOpen && <div className="fixed inset-0 bg-black/50 z-[99] backdrop-blur-sm" onClick={closeCart} id="cart-overlay"></div>}
      <div className={`fixed top-0 right-0 h-full w-full max-w-[400px] bg-white z-[100] shadow-2xl flex flex-col justify-between transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`} id="cart-drawer">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-heading font-black text-lg text-gray-900 flex items-center gap-2">
            <i className="fa-solid fa-sliders text-primary"></i> Tu Suscripción
          </h3>
          <button className="h-8 w-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50" onClick={closeCart} aria-label="Cerrar configurador">
            <i className="fa-solid fa-xmark text-gray-500"></i>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-400">
              <i className="fa-solid fa-handshake text-4xl text-gray-300"></i>
              <div className="space-y-1">
                <p className="font-bold text-gray-700 text-sm">Configurador Vacío</p>
                <p className="text-xs">Selecciona un plan arriba para comenzar.</p>
              </div>
            </div>
          ) : (
            cart.map(item => (
              <div className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100" key={item.id}>
                <img src={item.img} alt={item.name} className="h-14 w-14 rounded-xl object-cover border border-gray-200 shrink-0" />
                <div className="flex-1 text-left flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                    <span className="text-xs font-bold text-primary">${item.price.toFixed(2)} <small className="text-gray-400 font-normal">/mes</small></span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <button className="px-2 py-1 hover:bg-gray-50 text-gray-500 text-xs" onClick={() => updateQuantity(item.id, -1)}><i className="fa-solid fa-minus"></i></button>
                      <span className="px-3 font-bold text-gray-700 text-xs">{item.quantity}</span>
                      <button className="px-2 py-1 hover:bg-gray-50 text-gray-500 text-xs" onClick={() => updateQuantity(item.id, 1)}><i className="fa-solid fa-plus"></i></button>
                    </div>
                    <button className="text-gray-400 hover:text-red-500 text-xs" onClick={() => removeFromCart(item.id)}><i className="fa-solid fa-trash-can"></i></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-6">
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-bold text-gray-800">${cartSubtotalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Soporte e Instalación</span>
              <span className="font-bold text-primary text-xs uppercase tracking-wider">Gratis</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between text-base font-black text-gray-900">
              <span>Total Mensual</span>
              <span>${cartSubtotalPrice.toFixed(2)}</span>
            </div>
          </div>
          <button className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-full shadow-lg" onClick={handleCheckout}>
            Contratar Plan
          </button>
        </div>
      </div>

      {/* MODAL ÉXITO */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 text-center space-y-6 animate-scaleUp">
            <div className="h-14 w-14 bg-emerald-50 text-primary rounded-full flex items-center justify-center text-xl mx-auto border border-emerald-100">
              <i className="fa-solid fa-check"></i>
            </div>
            <div className="space-y-2">
              <h3 className="font-heading font-black text-xl text-gray-900">¡Bienvenido a 2GetherRewards!</h3>
              <p className="text-gray-500 text-xs leading-relaxed">Tu suscripción fue procesada correctamente. Recibirás un correo en breve con las credenciales de acceso a tu panel corporativo.</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2.5 text-left text-xs">
              <div className="flex justify-between text-gray-600">
                <span>ID Licencia:</span>
                <span className="font-bold text-gray-900">{successSummary.orderId}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Planes:</span>
                <span className="font-bold text-gray-900">{successSummary.itemsCount} plan(es) / módulo(s)</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between font-black text-gray-900 text-sm">
                <span>Total mensual:</span>
                <span>${successSummary.total.toFixed(2)}</span>
              </div>
            </div>
            <button className="w-full py-4.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-full text-sm" onClick={() => setIsSuccessModalOpen(false)}>
              Acceder a mi Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
