/**
 * LÓGICA DE INTERACCIÓN - CAFÉ DE ESPECIALIDAD "ORIGEN"
 * Control de Carrito de Compras, Quiz de Café y Filtros de Productos
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. VARIABLES GENERALES Y ELEMENTOS DEL DOM
    // ==========================================
    
    // Header & Mobile Nav
    const header = document.getElementById('main-header');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Carrito
    const cartToggleBtn = document.getElementById('cart-toggle-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartEmptyView = document.getElementById('cart-empty-view');
    const cartBadgeCount = document.getElementById('cart-badge-count');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotalPrice = document.getElementById('cart-total-price');
    const checkoutSubmitBtn = document.getElementById('checkout-submit-btn');
    
    // Filtros de Productos
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    
    // Quiz de Café
    const quizIntroScreen = document.getElementById('quiz-intro-screen');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const quizSteps = document.querySelectorAll('.quiz-steps');
    const quizOptions = document.querySelectorAll('.quiz-option');
    const quizResultScreen = document.getElementById('quiz-result-screen');
    const recommendedProductCard = document.getElementById('recommended-product-card');
    const restartQuizBtn = document.getElementById('restart-quiz-btn');
    
    // Modal Checkout
    const checkoutSuccessModal = document.getElementById('checkout-success-modal');
    const summaryOrderId = document.getElementById('summary-order-id');
    const summaryItemsCount = document.getElementById('summary-items-count');
    const summaryTotalPrice = document.getElementById('summary-total-price');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // Estado del Carrito
    let cart = JSON.parse(localStorage.getItem('origen_cart')) || [];

    // ==========================================
    // 2. CABECERA & DISEÑO RESPONSIVE
    // ==========================================
    
    // Efecto scroll en la cabecera
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Menú móvil toggle
    mobileMenuBtn.addEventListener('click', () => {
        mainNav.classList.toggle('open');
        const icon = mobileMenuBtn.querySelector('i');
        if (mainNav.classList.contains('open')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars';
        }
    });

    // Cerrar menú móvil al hacer click en enlaces
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Remover active de todos y agregar al clickeado
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Cerrar nav móvil
            mainNav.classList.remove('open');
            mobileMenuBtn.querySelector('i').className = 'fa-solid fa-bars';
        });
    });

    // ==========================================
    // 3. LÓGICA DEL CARRITO DE COMPRAS
    // ==========================================
    
    // Abrir Carrito
    function openCart() {
        cartDrawer.classList.add('open');
        cartOverlay.classList.add('open');
        document.body.style.overflow = 'hidden'; // Evita scroll de fondo
    }

    // Cerrar Carrito
    function closeCart() {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('open');
        document.body.style.overflow = 'auto';
    }

    cartToggleBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Guardar carrito en LocalStorage
    function saveCart() {
        localStorage.setItem('origen_cart', JSON.stringify(cart));
        updateCartUI();
    }

    // Añadir artículo al carrito
    function addToCart(id, name, price, img) {
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id,
                name,
                price: parseFloat(price),
                img,
                quantity: 1
            });
        }
        saveCart();
        
        // Micro-animación en el icono de carrito del header
        cartToggleBtn.classList.add('pulse-anim');
        setTimeout(() => cartToggleBtn.classList.remove('pulse-anim'), 400);
    }

    // Cambiar cantidad de un artículo
    function updateQuantity(id, change) {
        const item = cart.find(item => item.id === id);
        if (item) {
            item.quantity += change;
            if (item.quantity <= 0) {
                cart = cart.filter(item => item.id !== id);
            }
            saveCart();
        }
    }

    // Eliminar artículo
    function removeFromCart(id) {
        cart = cart.filter(item => item.id !== id);
        saveCart();
    }

    // Actualizar UI del Carrito
    function updateCartUI() {
        // Limpiar items existentes excepto el empty view
        const items = cartItemsContainer.querySelectorAll('.cart-item');
        items.forEach(item => item.remove());

        if (cart.length === 0) {
            cartEmptyView.style.display = 'flex';
            cartBadgeCount.classList.remove('has-items');
            cartBadgeCount.textContent = '0';
            cartSubtotal.textContent = '$0.00';
            cartTotalPrice.textContent = '$0.00';
        } else {
            cartEmptyView.style.display = 'none';
            
            let totalCount = 0;
            let subtotal = 0;

            cart.forEach(item => {
                totalCount += item.quantity;
                subtotal += item.price * item.quantity;

                // Crear HTML del Item
                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.name}</h4>
                        <span class="cart-item-price">$${item.price.toFixed(2)}</span>
                        <div class="cart-item-actions">
                            <div class="quantity-controller">
                                <button class="qty-btn minus-btn" data-id="${item.id}"><i class="fa-solid fa-minus"></i></button>
                                <span class="qty-val">${item.quantity}</span>
                                <button class="qty-btn plus-btn" data-id="${item.id}"><i class="fa-solid fa-plus"></i></button>
                            </div>
                            <button class="remove-item-btn" data-id="${item.id}" aria-label="Eliminar artículo"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </div>
                `;
                cartItemsContainer.appendChild(itemEl);
            });

            // Actualizar Contadores y Precios
            cartBadgeCount.textContent = totalCount;
            cartBadgeCount.classList.add('has-items');
            cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
            cartTotalPrice.textContent = `$${subtotal.toFixed(2)}`;
        }
    }

    // Delegación de Eventos en el contenedor del carrito
    cartItemsContainer.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const id = parseInt(target.getAttribute('data-id'));
        if (target.classList.contains('plus-btn')) {
            updateQuantity(id, 1);
        } else if (target.classList.contains('minus-btn')) {
            updateQuantity(id, -1);
        } else if (target.classList.contains('remove-item-btn')) {
            removeFromCart(id);
        }
    });

    // Manejar clicks en botones "Añadir al carrito" de la tienda
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart-btn');
        if (!btn) return;

        const id = parseInt(btn.getAttribute('data-id'));
        const name = btn.getAttribute('data-name');
        const price = btn.getAttribute('data-price');
        const img = btn.getAttribute('data-img');

        addToCart(id, name, price, img);
        openCart(); // Opcional: abre el carrito tras añadir
    });

    // ==========================================
    // 4. DYNAMIC FILTERING DE PRODUCTOS
    // ==========================================
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const category = btn.getAttribute('data-category');

            productCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                
                // Animación de ocultar/mostrar fluida
                if (category === 'all' || cardCategory === category) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // ==========================================
    // 5. QUIZ DE RECOMENDACIÓN DE CAFÉ
    // ==========================================
    
    let currentQuizStep = 0;
    const quizAnswers = {
        type: '',     // hot, cold, grains
        flavor: '',   // sweet, acid, strong
        addons: ''    // pastry, pure
    };

    // Comenzar Quiz
    startQuizBtn.addEventListener('click', () => {
        quizIntroScreen.style.display = 'none';
        currentQuizStep = 1;
        document.getElementById(`quiz-step-${currentQuizStep}`).classList.add('active');
    });

    // Al seleccionar una opción en el Quiz
    quizOptions.forEach(option => {
        option.addEventListener('click', () => {
            const stepContainer = option.closest('.quiz-steps');
            const stepIndex = parseInt(stepContainer.id.replace('quiz-step-', ''));
            const answer = option.getAttribute('data-answer');

            // Guardar Respuesta
            if (stepIndex === 1) quizAnswers.type = answer;
            if (stepIndex === 2) quizAnswers.flavor = answer;
            if (stepIndex === 3) quizAnswers.addons = answer;

            // Highlight visual
            stepContainer.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');

            // Retraso corto antes de cambiar para ver el feedback de selección
            setTimeout(() => {
                stepContainer.classList.remove('active');
                
                if (stepIndex < quizSteps.length) {
                    currentQuizStep = stepIndex + 1;
                    document.getElementById(`quiz-step-${currentQuizStep}`).classList.add('active');
                } else {
                    // Fin del quiz, calcular recomendación
                    showQuizRecommendation();
                }
            }, 350);
        });
    });

    // Algoritmo de recomendación
    function showQuizRecommendation() {
        quizResultScreen.style.display = 'block';
        
        let recommendation = {};

        // Lógica de decisiones
        if (quizAnswers.type === 'grains') {
            recommendation = {
                id: 1,
                name: 'Etiopía Yirgacheffe (250g)',
                desc: 'Un café de especialidad con perfil cítrico, notas florales limpias de jazmín y acidez brillante. Perfecto para amantes del café de filtro.',
                price: '24.00',
                img: 'assets/coffee_bag.png'
            };
        } else if (quizAnswers.type === 'cold') {
            if (quizAnswers.addons === 'pastry') {
                recommendation = {
                    id: 6,
                    name: 'Croissant de Pistacho',
                    desc: 'Perfecto acompañamiento crujiente. Relleno de una densa crema de pistachos sicilianos, ideal con cualquier café frío sin endulzar.',
                    price: '6.00',
                    img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=350&auto=format&fit=crop'
                };
            } else {
                recommendation = {
                    id: 5,
                    name: 'Cold Brew Infundido',
                    desc: 'Extraído en frío pacientemente. Sabor redondo, baja acidez y cuerpo ligero. Ideal para hidratar tus tardes soleadas.',
                    price: '5.00',
                    img: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?q=80&w=350&auto=format&fit=crop'
                };
            }
        } else { // caliente
            if (quizAnswers.flavor === 'sweet') {
                recommendation = {
                    id: 3,
                    name: 'Capuchino Italiano',
                    desc: 'Con una crema aterciopelada y dulce por el propio vaporizado de la leche. Consistencia perfecta para abrazar tus mañanas.',
                    price: '4.50',
                    img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=350&auto=format&fit=crop'
                };
            } else if (quizAnswers.flavor === 'strong') {
                recommendation = {
                    id: 2,
                    name: 'Espresso Doble',
                    desc: 'Intenso, aromático y con una rica capa de crema color avellana. Para quienes aprecian la fuerza pura del grano.',
                    price: '3.50',
                    img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?q=80&w=350&auto=format&fit=crop'
                };
            } else {
                recommendation = {
                    id: 4,
                    name: 'Flat White Velvet',
                    desc: 'Doble ristretto suavemente mezclado con microespuma de leche sedosa. Un balance exquisito entre fuerza y textura cremosa.',
                    price: '4.80',
                    img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=350&auto=format&fit=crop'
                };
            }
        }

        // Renderizar tarjeta recomendada
        recommendedProductCard.innerHTML = `
            <img src="${recommendation.img}" alt="${recommendation.name}" class="result-image">
            <span class="product-category">Nuestra Recomendación</span>
            <div class="result-name">${recommendation.name}</div>
            <p class="result-desc">${recommendation.desc}</p>
            <div class="result-price">${recommendation.price}</div>
            <button class="btn btn-primary" id="add-quiz-recommendation-btn" 
                data-id="${recommendation.id}" 
                data-name="${recommendation.name}" 
                data-price="${recommendation.price}" 
                data-img="${recommendation.img}">
                Añadir a mi Orden
            </button>
        `;

        // Event listener para el botón dinámico de añadir al carrito
        document.getElementById('add-quiz-recommendation-btn').addEventListener('click', (e) => {
            const btn = e.target;
            addToCart(
                parseInt(btn.getAttribute('data-id')),
                btn.getAttribute('data-name'),
                btn.getAttribute('data-price'),
                btn.getAttribute('data-img')
            );
            openCart();
        });
    }

    // Reiniciar Quiz
    restartQuizBtn.addEventListener('click', () => {
        quizResultScreen.style.display = 'none';
        quizOptions.forEach(opt => opt.classList.remove('selected'));
        quizIntroScreen.style.display = 'block';
        currentQuizStep = 0;
    });

    // ==========================================
    // 6. LÓGICA DE CHECKOUT E IMITACIÓN DE PAGO
    // ==========================================
    
    checkoutSubmitBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert('Añade productos a tu orden antes de realizar el pedido.');
            return;
        }

        // Crear resumen en el modal
        const randomOrderId = '#ORG-' + Math.floor(1000 + Math.random() * 9000);
        let itemsCount = 0;
        let total = 0;
        
        cart.forEach(item => {
            itemsCount += item.quantity;
            total += item.price * item.quantity;
        });

        summaryOrderId.textContent = randomOrderId;
        summaryItemsCount.textContent = `${itemsCount} producto(s)`;
        summaryTotalPrice.textContent = `$${total.toFixed(2)}`;

        // Cerrar carrito
        closeCart();

        // Abrir Modal
        checkoutSuccessModal.classList.add('open');

        // Limpiar Carrito del Estado y LocalStorage
        cart = [];
        saveCart();
    });

    // Cerrar Modal
    modalCloseBtn.addEventListener('click', () => {
        checkoutSuccessModal.classList.remove('open');
    });

    // ==========================================
    // 7. INICIALIZACIONES
    // ==========================================
    
    // Iniciar UI del carrito por si tiene datos en LocalStorage
    updateCartUI();
});

// Estilos de animación personalizados para pulso del botón
const style = document.createElement('style');
style.textContent = `
    @keyframes pulseBtn {
        0% { transform: scale(1); }
        50% { transform: scale(1.15); box-shadow: 0 0 15px var(--color-accent); }
        100% { transform: scale(1); }
    }
    .pulse-anim {
        animation: pulseBtn 0.4s ease;
    }
`;
document.head.appendChild(style);
