// Inicializar EmailJS con tu Public Key
emailjs.init('KQwj_Sm-penUoskR0');

// Número de contacto fijo para WhatsApp
const whatsappContactNumber = "+5356096338";

// Elementos del DOM para el formulario
const whatsappOption = document.getElementById('whatsappOption');
const emailOption = document.getElementById('emailOption');
const whatsappField = document.getElementById('whatsappField');
const emailField = document.getElementById('emailField');
const formSection = document.getElementById('formSection');
const submitBtn = document.getElementById('submitBtn');
const contactForm = document.getElementById('contactForm');
const contactCurrency = document.getElementById('contactCurrency');

// Elementos del DOM para la calculadora
const calculatorForm = document.getElementById('calculatorForm');
const fromCurrency = document.getElementById('fromCurrency');
const paymentPlatform = document.getElementById('paymentPlatform');
const desiredAmount = document.getElementById('initialAmount'); // Cantidad deseada en Cuba
const calculateBtn = document.getElementById('calculateBtn');
const fillContactBtn = document.getElementById('fillContactBtn');
const resultValue = document.getElementById('resultValue');
const resultText = document.getElementById('resultText');
const fromInfo = document.getElementById('fromInfo');
const toInfo = document.getElementById('toInfo');
const breakdownContainer = document.getElementById('breakdownContainer');

// Elementos del DOM para el header y navegación
const mainHeader = document.getElementById('mainHeader');
const navLinks = document.querySelectorAll('nav a');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

// Variables globales
let eurotousd = { tasa: 1.0 }; // Valor por defecto
let exchangeRates = {};
let platformCommissions = {};

// Función para obtener tasa de cambio
async function obtenerTasaCambioEURUSD() {
    try {
        console.log('🔄 Obteniendo tasa de cambio EUR/USD...');
        
        const response = await fetch('https://api.frankfurter.app/latest?from=EUR&to=USD');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        const tasaEURUSD = data.rates.USD;
        const fechaActualizacion = new Date().toLocaleString('es-ES');
        
        console.log('✅ Tasa de cambio obtenida exitosamente:');
        console.log(`💰 1 EUR = ${tasaEURUSD} USD`);
        console.log(`🕒 Actualizado: ${fechaActualizacion}`);
        
        return {
            tasa: tasaEURUSD,
            fecha: fechaActualizacion,
            monedaOrigen: 'EUR',
            monedaDestino: 'USD'
        };
        
    } catch (error) {
        console.error('❌ Error obteniendo la tasa de cambio:', error);
        
        // Retornar un valor por defecto en caso de error
        return {
            tasa: 1.08, // Valor por defecto razonable
            fecha: new Date().toLocaleString('es-ES'),
            error: error.message
        };
    }
}

// Función para inicializar las tasas y comisiones
function inicializarTasas() {
    exchangeRates = {
        'EUR': { 
            rate: eurotousd.tasa, // 1 EUR = X USD
            commission: 0.10 // 10% de comisión nuestra
        },
        'USD': { 
            rate: 1.0, // 1 USD = 1 USD
            commission: 0.10 // 10% de comisión nuestra
        }
    };
    
    platformCommissions = {
        'zelle': 0.015,  // 1.5%
        'paypal': 0.05   // 5%
    };
}

// Función para cambiar entre WhatsApp y Email
function toggleContactMethod(method) {
    if (method === 'whatsapp') {
        whatsappOption.classList.add('active');
        emailOption.classList.remove('active');
        whatsappField.classList.add('active');
        emailField.classList.remove('active');
        formSection.classList.remove('email-active');
        formSection.classList.add('whatsapp-active');
        submitBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Enviar por WhatsApp';
        submitBtn.classList.remove('email-active');
        submitBtn.classList.add('whatsapp-active');
    } else {
        emailOption.classList.add('active');
        whatsappOption.classList.remove('active');
        emailField.classList.add('active');
        whatsappField.classList.remove('active');
        formSection.classList.remove('whatsapp-active');
        formSection.classList.add('email-active');
        submitBtn.innerHTML = '<i class="fas fa-envelope"></i> Enviar por Correo';
        submitBtn.classList.remove('whatsapp-active');
        submitBtn.classList.add('email-active');
    }
}

// Función para calcular el monto necesario basado en la moneda de origen
async function calculateAmount() {
    const from = fromCurrency.value;
    const platform = paymentPlatform.value;
    const targetAmount = parseFloat(desiredAmount.value) || 0;
    
    if (targetAmount <= 0) {
        resultValue.textContent = "0.00";
        resultText.textContent = "Ingrese una cantidad válida";
        fromInfo.textContent = "Tasa de cambio: 0.00";
        toInfo.textContent = "Comisión total: 0.00";
        if (breakdownContainer) breakdownContainer.style.display = 'none';
        return null;
    }
    
    // Asegurar que las tasas estén inicializadas
    if (!exchangeRates[from] || !platformCommissions[platform]) {
        console.log('⏳ Esperando inicialización de tasas...');
        return null;
    }
    
    const exchangeRate = exchangeRates[from].rate;
    const ourCommission = exchangeRates[from].commission; // 10%
    const platformCommission = platformCommissions[platform];
    
    let amountNeeded, currencySymbol, resultCurrency;
    
    if (from === 'USD') {
        // Si la moneda de origen es USD, calcular directamente en USD
        amountNeeded = targetAmount / ((1 - ourCommission) * (1 - platformCommission));
        currencySymbol = 'USD';
        resultCurrency = 'USD';
    } else {
        // Si la moneda de origen es EUR, calcular EUR necesarios para obtener los USD deseados
        amountNeeded = targetAmount / (exchangeRate * (1 - ourCommission) * (1 - platformCommission));
        currencySymbol = 'EUR';
        resultCurrency = 'EUR';
    }
    
    // Calcular desglose
    const ourCommissionAmount = amountNeeded * ourCommission;
    const amountAfterOurCommission = amountNeeded - ourCommissionAmount;
    
    let amountInUSD, platformCommissionAmount;
    
    if (from === 'USD') {
        amountInUSD = amountAfterOurCommission;
        platformCommissionAmount = amountInUSD * platformCommission;
    } else {
        amountInUSD = amountAfterOurCommission * exchangeRate;
        platformCommissionAmount = amountInUSD * platformCommission;
    }
    
    const finalAmountAfterCommissions = amountInUSD * (1 - platformCommission);
    
    // Mostrar resultados
    resultValue.textContent = amountNeeded.toFixed(2);
    resultText.textContent = `Necesita transferir: ${amountNeeded.toFixed(2)} ${resultCurrency}`;
    fromInfo.textContent = `Para recibir: ${targetAmount} USD en Cuba`;
    
    if (from === 'EUR') {
        toInfo.textContent = `Tasa: 1 EUR = ${exchangeRate.toFixed(4)} USD`;
    } else {
        toInfo.textContent = `Transacción directa en USD`;
    }
    
    // Mostrar desglose del cálculo
    if (breakdownContainer) {
        document.getElementById('breakdownOriginal').textContent = `${targetAmount.toFixed(2)} USD`;
        document.getElementById('breakdownCommission').textContent = `${ourCommissionAmount.toFixed(2)} ${resultCurrency} (${(ourCommission * 100).toFixed(0)}%)`;
        document.getElementById('breakdownSubtotal').textContent = `${amountAfterOurCommission.toFixed(2)} ${resultCurrency}`;
        
        if (from === 'EUR') {
            document.getElementById('breakdownRate').textContent = `1 EUR = ${exchangeRate.toFixed(4)} USD`;
            document.getElementById('breakdownPlatform').textContent = `${platformCommissionAmount.toFixed(2)} USD (${(platformCommission * 100).toFixed(1)}%)`;
        } else {
            document.getElementById('breakdownRate').textContent = `Transacción directa en USD`;
            document.getElementById('breakdownPlatform').textContent = `${platformCommissionAmount.toFixed(2)} USD (${(platformCommission * 100).toFixed(1)}%)`;
        }
        
        document.getElementById('breakdownFinal').textContent = `${amountNeeded.toFixed(2)} ${resultCurrency}`;
        breakdownContainer.style.display = 'block';
    }
    
    return {
        targetAmount: targetAmount,
        amountNeeded: amountNeeded,
        currency: resultCurrency,
        platform: platform,
        exchangeRate: exchangeRate,
        ourCommission: ourCommissionAmount,
        platformCommission: platformCommissionAmount,
        finalAmountUSD: finalAmountAfterCommissions
    };
}

// Event listener para el botón de calcular
if (calculateBtn) {
    calculateBtn.addEventListener('click', calculateAmount);
}

// Event listener para el botón de rellenar contacto
if (fillContactBtn) {
    fillContactBtn.addEventListener('click', function() {
        const calculation = calculateAmount();
        
        if (calculation && calculation.amountNeeded > 0) {
            // Rellenar el formulario de contacto
            document.getElementById('amount').value = calculation.amountNeeded.toFixed(2);
            document.getElementById('contactCurrency').value = calculation.currency;
            
            // Crear una descripción automática
            const platformNames = {
                'paypal': 'PayPal',
                'zelle': 'Zelle'
            };
            
            const description = `Deseo enviar ${calculation.amountNeeded.toFixed(2)} ${calculation.currency} para recibir ${calculation.targetAmount} USD en Cuba mediante ${platformNames[calculation.platform]}. Cálculo realizado con la calculadora.`;
            document.getElementById('description').value = description;
            
            // Desplazar al formulario de contacto
            document.querySelector('#form').scrollIntoView({
                behavior: 'smooth'
            });
            
            // Mostrar mensaje de confirmación
            alert(`El formulario ha sido rellenado: debe transferir ${calculation.amountNeeded.toFixed(2)} ${calculation.currency} para recibir ${calculation.targetAmount} USD en Cuba`);
        } else {
            alert("Por favor, calcule primero un monto válido antes de rellenar el formulario de contacto.");
        }
    });
}

// Calcular automáticamente al cambiar valores
if (fromCurrency) fromCurrency.addEventListener('change', calculateAmount);
if (paymentPlatform) paymentPlatform.addEventListener('change', calculateAmount);
if (desiredAmount) desiredAmount.addEventListener('input', calculateAmount);

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', async function() {
    // Obtener tasa de cambio primero
    eurotousd = await obtenerTasaCambioEURUSD();
    console.log('Tasa cargada:', eurotousd);
    
    // Inicializar tasas con el valor obtenido
    inicializarTasas();
    
    // Inicializar calculadora y formulario
    calculateAmount();
    toggleContactMethod('whatsapp');
    
    // Actualizar el placeholder para mayor claridad
    if (desiredAmount) {
        desiredAmount.placeholder = "USD deseados en Cuba";
    }
    
    // Configurar efecto de header al hacer scroll
    if (mainHeader) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                mainHeader.classList.add('scrolled');
            } else {
                mainHeader.classList.remove('scrolled');
            }
            updateActiveNavLink();
        });
    }
    
    // Menú móvil
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('show');
        });
    }
    
    // Cerrar menú móvil al hacer clic en un enlace
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu) navMenu.classList.remove('show');
        });
    });
});

// Función para actualizar el enlace activo en la navegación
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Función para enviar mensaje por WhatsApp
function sendWhatsAppMessage(message) {
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${whatsappContactNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, '_blank');
}

// Función para enviar correo con EmailJS
function sendEmail(name, email, currency, amount, description, phone = '') {
    const templateParams = {
        from_name: name,
        from_email: email,
        user_phone: phone,
        currency: currency,
        amount: amount,
        message: description,
        to_email: "eliclpere@gmail.com"
    };
    
    emailjs.send("service_m6o29ew", "template_6zky109", templateParams)
        .then(function(response) {
            console.log('Correo enviado con éxito:', response);
            alert('¡Correo enviado con éxito! Nos pondremos en contacto contigo pronto.');
        }, function(error) {
            console.log('Error al enviar el correo:', error);
            alert('Hubo un error al enviar el correo. Por favor, inténtalo de nuevo más tarde.');
        });
}

// Manejo del envío del formulario
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const method = whatsappOption.classList.contains('active') ? 'WhatsApp' : 'Correo electrónico';
        const name = document.getElementById('name').value;
        const contact = method === 'WhatsApp' ? document.getElementById('phone').value : document.getElementById('email').value;
        const currency = document.getElementById('contactCurrency').value;
        const amount = document.getElementById('amount').value;
        const description = document.getElementById('description').value;
        
        if (!name || !contact || !amount || !description) {
            alert('Por favor, complete todos los campos requeridos.');
            return;
        }
        
        // Crear mensaje predeterminado
        const message = `Hola, me interesa enviar remesas a Cuba.\n\n*Información del solicitante:*\nNombre: ${name}\n${method === 'WhatsApp' ? 'Teléfono: ' + contact : 'Email: ' + contact}\n\n*Detalles de la transacción:*\nMoneda: ${currency}\nMonto: ${amount}\nDescripción: ${description}\n\nPor favor, contactarme para proceder con la transacción.`;
        
        if (method === 'WhatsApp') {
            sendWhatsAppMessage(message);
        } else {
            sendEmail(name, contact, currency, amount, description);
        }
        
        // Limpiar formulario después del envío
        contactForm.reset();
        toggleContactMethod('whatsapp');
    });
}

// Event listeners para cambiar método de contacto
if (whatsappOption && emailOption) {
    whatsappOption.addEventListener('click', () => toggleContactMethod('whatsapp'));
    emailOption.addEventListener('click', () => toggleContactMethod('email'));
}

// Scroll suave para navegación
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId.startsWith('#')) {
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        }
    });
});