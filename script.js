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

// Comisiones de plataforma (Zelle 0%, PayPal 5%)
const platformCommissions = {
    'zelle': 0.00,  // 0%
    'paypal': 0.05   // 5%
};

// Función para calcular nuestra comisión según el monto
function calcularNuestraComision(monto) {
    if (monto < 70) {
        return 5; // Comisión fija de $5 para montos menores a $70
    } else if (monto < 100) {
        return 10; // Comisión fija de $10 para montos entre $70 y $100
    } else {
        return monto * 0.10; // 10% para montos de $100 o más
    }
}

// Función para verificar y ajustar comisiones en modo RECIBIR
function verificarAjusteComisiones(montoBase, platformCommissionRate) {
    let nuestraComision = calcularNuestraComision(montoBase);
    
    // Verificamos si al sumar nuestra comisión inicial se supera el límite de $70
    if (montoBase + nuestraComision >= 70 && montoBase < 70) {
        // Si supera $70, aplicar comisión de $10
        nuestraComision = 10;
    }
    
    // Verificamos si al sumar nuestra comisión ajustada se supera el límite de $100
    if (montoBase + nuestraComision >= 100 && montoBase < 100) {
        // Si supera $100, aplicar comisión del 10% sobre el monto base
        nuestraComision = montoBase * 0.10;
    }
    
    // Calculamos el monto después de nuestra comisión
    let montoConNuestraComision = montoBase + nuestraComision;
    
    // Aplicamos comisión de plataforma como porcentaje adicional
    let comisionPlataforma = montoConNuestraComision * platformCommissionRate;
    let montoFinal = montoConNuestraComision + comisionPlataforma;
    
    return {
        montoFinal: montoFinal,
        nuestraComision: nuestraComision,
        comisionPlataforma: comisionPlataforma
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
    let result, platformCommission, finalAmount, ourCommission;
    
    if (mode === 'send') {
        // Modo ENVIAR: Primero aplicamos comisión de plataforma, luego la nuestra
        platformCommission = amount * platformCommissionRate;
        const amountAfterPlatform = amount - platformCommission;
        
        // Aplicar nuestra comisión
        if (amountAfterPlatform < 70) {
            // Comisión fija para montos menores a $70
            ourCommission = 5;
            finalAmount = amountAfterPlatform - ourCommission;
        } else if (amountAfterPlatform < 100) {
            // Comisión fija para montos entre $70 y $100
            ourCommission = 10;
            finalAmount = amountAfterPlatform - ourCommission;
        } else {
            // Comisión porcentual para montos de $100 o más
            ourCommission = amountAfterPlatform * 0.10;
            finalAmount = amountAfterPlatform - ourCommission;
        }
        
        result = finalAmount;
        
        // Actualizar UI
        resultTitle.textContent = "Resultado del cálculo:";
        resultValue.textContent = result.toFixed(2);
        resultText.textContent = `Recibirás: $${result.toFixed(2)} USD en Cuba`;
        
    } else {
        // Modo RECIBIR: Nueva lógica - primero nuestra comisión, luego plataforma como adicional
        const ajuste = verificarAjusteComisiones(amount, platformCommissionRate);
        result = ajuste.montoFinal;
        ourCommission = ajuste.nuestraComision;
        platformCommission = ajuste.comisionPlataforma;
        
        // Actualizar UI
        resultTitle.textContent = "Resultado del cálculo:";
        resultValue.textContent = result.toFixed(2);
        resultText.textContent = `Debes enviar: $${result.toFixed(2)} USD`;
    }
    
    // Actualizar desglose (común para ambos modos)
    if (mode === 'send') {
        document.getElementById('breakdownOriginalLabel').textContent = "Cantidad enviada:";
        document.getElementById('breakdownOriginal').textContent = `$${amount.toFixed(2)} USD`;
        document.getElementById('breakdownCommission').textContent = `$${ourCommission.toFixed(2)} USD`;
        document.getElementById('breakdownPlatform').textContent = `$${platformCommission.toFixed(2)} USD`;
        document.getElementById('breakdownFinalLabel').textContent = "Monto que recibirás:";
        document.getElementById('breakdownFinal').textContent = `$${result.toFixed(2)} USD`;
    } else {
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
});

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
        } else {// script.js

// Inicializar EmailJS (reemplaza con tu User ID)
emailjs.init("YOUR_USER_ID");

// Cambio entre WhatsApp y Email
const whatsappOption = document.getElementById('whatsappOption');
const emailOption = document.getElementById('emailOption');
const submitBtn = document.getElementById('submitBtn');

function activateWhatsApp() {
    whatsappOption.classList.add('active');
    emailOption.classList.remove('active');
    submitBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Enviar por WhatsApp';
    submitBtn.className = 'btn whatsapp-active';
}

function activateEmail() {
    emailOption.classList.add('active');
    whatsappOption.classList.remove('active');
    submitBtn.innerHTML = '<i class="fas fa-envelope"></i> Enviar por Correo';
    submitBtn.className = 'btn email-active';
}

whatsappOption.addEventListener('click', activateWhatsApp);
emailOption.addEventListener('click', activateEmail);

// Envío del formulario
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const amount = document.getElementById('amount').value;
    const description = document.getElementById('description').value;
    
    // Determinar el método activo
    const isWhatsAppActive = whatsappOption.classList.contains('active');
    
    if (isWhatsAppActive) {
        // Enviar por WhatsApp
        const message = `Hola, me llamo ${name}. Quiero enviar $${amount} a Cuba. Información: ${description}. Teléfono de contacto en Cuba: ${phone}`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    } else {
        // Enviar por Email
        emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', {
            from_name: name,
            from_email: email,
            phone: phone,
            amount: amount,
            description: description
        }).then(function(response) {
            alert('Correo enviado con éxito');
        }, function(error) {
            alert('Error al enviar el correo: ' + JSON.stringify(error));
        });
    }
});

// Calculadora
const calculationMode = document.getElementById('calculationMode');
const amountLabel = document.getElementById('amountLabel');
const initialAmount = document.getElementById('initialAmount');
const paymentPlatform = document.getElementById('paymentPlatform');
const calculateBtn = document.getElementById('calculateBtn');
const fillContactBtn = document.getElementById('fillContactBtn');
const resultValue = document.getElementById('resultValue');
const resultText = document.getElementById('resultText');
const breakdownContainer = document.getElementById('breakdownContainer');
const breakdownOriginal = document.getElementById('breakdownOriginal');
const breakdownCommission = document.getElementById('breakdownCommission');
const breakdownPlatform = document.getElementById('breakdownPlatform');
const breakdownFinal = document.getElementById('breakdownFinal');
const breakdownOriginalLabel = document.getElementById('breakdownOriginalLabel');
const breakdownFinalLabel = document.getElementById('breakdownFinalLabel');
const fromInfo = document.getElementById('fromInfo');
const toInfo = document.getElementById('toInfo');

calculationMode.addEventListener('change', function() {
    if (this.value === 'send') {
        amountLabel.textContent = 'Cantidad a enviar (USD)';
        breakdownOriginalLabel.textContent = 'Cantidad original:';
        breakdownFinalLabel.textContent = 'Monto final:';
    } else {
        amountLabel.textContent = 'Cantidad a recibir (USD)';
        breakdownOriginalLabel.textContent = 'Cantidad a recibir:';
        breakdownFinalLabel.textContent = 'Monto a enviar:';
    }
});

calculateBtn.addEventListener('click', function() {
    calculate();
});

fillContactBtn.addEventListener('click', function() {
    document.getElementById('amount').value = initialAmount.value;
});

function calculate() {
    const mode = calculationMode.value;
    let amount = parseFloat(initialAmount.value);
    const platform = paymentPlatform.value;

    if (isNaN(amount) || amount <= 0) {
        alert('Por favor, ingrese una cantidad válida.');
        return;
    }

    // Comisión nuestra
    let ourCommission = 0;
    if (amount < 70) {
        ourCommission = 5;
    } else if (amount >= 70 && amount <= 100) {
        ourCommission = 10;
    } else {
        ourCommission = amount * 0.10;
    }

    // Comisión de la plataforma
    let platformCommission = 0;
    if (platform === 'paypal') {
        platformCommission = amount * 0.05;
    }

    let totalCommission = ourCommission + platformCommission;

    let result = 0;
    if (mode === 'send') {
        // Enviar: cantidad original - comisiones
        result = amount - totalCommission;
        resultValue.textContent = result.toFixed(2);
        resultText.textContent = `El destinatario recibirá: $${result.toFixed(2)} USD`;
        
        breakdownOriginal.textContent = `$${amount.toFixed(2)}`;
        breakdownCommission.textContent = `-$${ourCommission.toFixed(2)}`;
        breakdownPlatform.textContent = `-$${platformCommission.toFixed(2)}`;
        breakdownFinal.textContent = `$${result.toFixed(2)}`;
        
        fromInfo.textContent = `Comisión nuestra: $${ourCommission.toFixed(2)}`;
        toInfo.textContent = `Comisión plataforma: $${platformCommission.toFixed(2)}`;
    } else {
        // Recibir: cantidad original + comisiones
        result = amount + totalCommission;
        resultValue.textContent = result.toFixed(2);
        resultText.textContent = `Usted debe enviar: $${result.toFixed(2)} USD`;
        
        breakdownOriginal.textContent = `$${amount.toFixed(2)}`;
        breakdownCommission.textContent = `+$${ourCommission.toFixed(2)}`;
        breakdownPlatform.textContent = `+$${platformCommission.toFixed(2)}`;
        breakdownFinal.textContent = `$${result.toFixed(2)}`;
        
        fromInfo.textContent = `Comisión nuestra: $${ourCommission.toFixed(2)}`;
        toInfo.textContent = `Comisión plataforma: $${platformCommission.toFixed(2)}`;
    }

    breakdownContainer.style.display = 'block';
}

// Inicializar calculadora
calculate();
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