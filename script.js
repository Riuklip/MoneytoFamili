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

// Elementos del DOM para la calculadora
const calculatorForm = document.getElementById('calculatorForm');
const calculationMode = document.getElementById('calculationMode');
const paymentPlatform = document.getElementById('paymentPlatform');
const amountLabel = document.getElementById('amountLabel');
const desiredAmount = document.getElementById('initialAmount');
const calculateBtn = document.getElementById('calculateBtn');
const fillContactBtn = document.getElementById('fillContactBtn');
const resultValue = document.getElementById('resultValue');
const resultText = document.getElementById('resultText');
const resultTitle = document.getElementById('resultTitle');
const fromInfo = document.getElementById('fromInfo');
const toInfo = document.getElementById('toInfo');
const breakdownContainer = document.getElementById('breakdownContainer');

// Elementos del DOM para el header y navegación
const mainHeader = document.getElementById('mainHeader');
const navLinks = document.querySelectorAll('nav a');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

// Comisiones de plataforma
const platformCommissions = {
    'zelle': 0.0,  // 1.5%
    'paypal': 0.05   // 5%
};

// Función para calcular nuestra comisión según el monto
function calcularNuestraComision(monto) {
    if (monto <= 70) {
        return 5; // Comisión fija de $5 para montos menores a $60
    } else if (monto < 100) {
        return 10; // Comisión fija de $10 para montos entre $60 y $100
    } else {
        return monto * 0.10; // 10% para montos de $100 o más
    }
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

// Función para actualizar la etiqueta según el modo
function updateAmountLabel() {
    const mode = calculationMode.value;
    if (mode === 'send') {
        amountLabel.textContent = 'Cantidad a enviar (USD)';
        desiredAmount.placeholder = 'USD a enviar';
    } else {
        amountLabel.textContent = 'Cantidad a recibir (USD)';
        desiredAmount.placeholder = 'USD a recibir';
    }
}

// Función para calcular el monto según el modo seleccionado
function calculateAmount() {
    const mode = calculationMode.value;
    const platform = paymentPlatform.value;
    const amount = parseFloat(desiredAmount.value) || 0;
    
    if (amount <= 0) {
        resultValue.textContent = "0.00";
        resultText.textContent = "Ingrese una cantidad válida";
        fromInfo.textContent = "Comisión nuestra: 0.00";
        toInfo.textContent = "Comisión plataforma: 0.00";
        if (breakdownContainer) breakdownContainer.style.display = 'none';
        return null;
    }
    
    const platformCommissionRate = platformCommissions[platform];
    if(mode==='send'){
    const ourCommission = calcularNuestraComision(amount);
        }else{
            ourCommission = calcularNuestraComision(amount+(0.05*amount));
        }
    let result, platformCommission, finalAmount;
    
    if (mode === 'send') {
        // Modo ENVIAR: Calcular cuánto se recibirá después de las comisiones
        platformCommission = amount * platformCommissionRate;
        const amountAfterPlatform = amount - platformCommission;
        
        // Aplicar nuestra comisión
        if (amount < 100) {
            // Comisión fija para montos menores a $100
            finalAmount = amountAfterPlatform - ourCommission;
        } else {
            // Comisión porcentual para montos de $100 o más
            finalAmount = amountAfterPlatform * (1 - 0.10);
        }
        
        result = finalAmount;
        
        // Actualizar UI
        resultTitle.textContent = "Resultado del cálculo:";
        resultValue.textContent = `${result.toFixed(0)}.00`;
        resultText.textContent = `Recibirás: $${result.toFixed(0)}.00 USD en Cuba`;    
        
        // Actualizar desglose
        document.getElementById('breakdownOriginalLabel').textContent = "Cantidad enviada:";
        document.getElementById('breakdownOriginal').textContent = `$${amount.toFixed(2)} USD`;
        document.getElementById('breakdownCommission').textContent = `$${ourCommission.toFixed(2)} USD`;
        document.getElementById('breakdownPlatform').textContent = `$${platformCommission.toFixed(2)} USD`;
        document.getElementById('breakdownFinalLabel').textContent = "Monto que recibirás:";
        document.getElementById('breakdownFinal').textContent = `$${result.toFixed(0)}.00 USD`;
        
    } else {
        // Modo RECIBIR: Calcular cuánto hay que enviar para recibir la cantidad deseada
        let amountToSend;
        
        if (amount <= 70) {
            // Para recibir menos de $60, nuestra comisión es $5
            amountToSend = (amount + 5) / (1 - platformCommissionRate);
        } else if (amount < 100) {
            // Para recibir entre $60 y $100, nuestra comisión es $10
            amountToSend = (amount + 10) / (1 - platformCommissionRate);
        } else {
            // Para recibir $100 o más, nuestra comisión es 10%
            amountToSend = amount / (0.9 * (1 - platformCommissionRate));
        }
        
        result = amountToSend;
        platformCommission = amountToSend * platformCommissionRate;
        
        // Actualizar UI
        resultTitle.textContent = "Resultado del cálculo:";
        resultValue.textContent = result.toFixed(2);
        resultText.textContent = `Debes enviar: $${result.toFixed(2)} USD`;
        
        // Actualizar desglose
        document.getElementById('breakdownOriginalLabel').textContent = "Cantidad a recibir:";
        document.getElementById('breakdownOriginal').textContent = `$${amount.toFixed(2)} USD`;
        document.getElementById('breakdownCommission').textContent = `$${ourCommission.toFixed(2)} USD`;
        document.getElementById('breakdownPlatform').textContent = `$${platformCommission.toFixed(2)} USD`;
        document.getElementById('breakdownFinalLabel').textContent = "Monto a enviar:";
        document.getElementById('breakdownFinal').textContent = `$${result.toFixed(2)} USD`;
    }
    
    // Mostrar información de comisiones
    fromInfo.textContent = `Comisión nuestra: $${ourCommission.toFixed(2)} USD`;
    toInfo.textContent = `Comisión ${platform}: $${platformCommission.toFixed(2)} USD`;
    
    // Mostrar desglose
    if (breakdownContainer) {
        breakdownContainer.style.display = 'block';
    }
    
    return {
        mode: mode,
        amount: amount,
        platform: platform,
        result: result,
        ourCommission: ourCommission,
        platformCommission: platformCommission
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
        
        if (calculation && calculation.result > 0) {
            // Rellenar el formulario de contacto
            document.getElementById('amount').value = calculation.result.toFixed(2);
            
            // Crear una descripción automática
            const platformNames = {
                'paypal': 'PayPal',
                'zelle': 'Zelle'
            };
            
            let description;
            if (calculation.mode === 'send') {
                description = `Deseo enviar $${calculation.amount.toFixed(2)} USD para recibir $${calculation.result.toFixed(2)} USD en Cuba mediante ${platformNames[calculation.platform]}. Cálculo realizado con la calculadora.`;
            } else {
                description = `Deseo recibir $${calculation.amount.toFixed(2)} USD en Cuba, para lo cual debo enviar $${calculation.result.toFixed(2)} USD mediante ${platformNames[calculation.platform]}. Cálculo realizado con la calculadora.`;
            }
            
            document.getElementById('description').value = description;
            
            // Desplazar al formulario de contacto
            document.querySelector('#form').scrollIntoView({
                behavior: 'smooth'
            });
            
            // Mostrar mensaje de confirmación
            if (calculation.mode === 'send') {
                alert(`El formulario ha sido rellenado: enviarás $${calculation.amount.toFixed(2)} USD para recibir $${calculation.result.toFixed(2)} USD en Cuba`);
            } else {
                alert(`El formulario ha sido rellenado: debes enviar $${calculation.result.toFixed(2)} USD para recibir $${calculation.amount.toFixed(2)} USD en Cuba`);
            }
        } else {
            alert("Por favor, calcule primero un monto válido antes de rellenar el formulario de contacto.");
        }
    });
}

// Calcular automáticamente al cambiar valores
if (calculationMode) {
    calculationMode.addEventListener('change', function() {
        updateAmountLabel();
        calculateAmount();
    });
}
if (paymentPlatform) paymentPlatform.addEventListener('change', calculateAmount);
if (desiredAmount) desiredAmount.addEventListener('input', calculateAmount);

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar calculadora y formulario
    updateAmountLabel();
    calculateAmount();
    toggleContactMethod('whatsapp');
    
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
function sendEmail(name, email, amount, description, phone = '') {
    const templateParams = {
        from_name: name,
        from_email: email,
        user_phone: phone,
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
        const amount = document.getElementById('amount').value;
        const description = document.getElementById('description').value;
        
        if (!name || !contact || !amount || !description) {
            alert('Por favor, complete todos los campos requeridos.');
            return;
        }
        
        // Crear mensaje predeterminado
        const message = `Hola, me interesa enviar remesas a Cuba.\n\n*Información del solicitante:*\nNombre: ${name}\n${method === 'WhatsApp' ? 'Teléfono: ' + contact : 'Email: ' + contact}\n\n*Detalles de la transacción:*\nMonto: $${amount} USD\nDescripción: ${description}\n\nPor favor, contactarme para proceder con la transacción.`;
        
        if (method === 'WhatsApp') {
            sendWhatsAppMessage(message);
        } else {
            sendEmail(name, contact, amount, description);
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


