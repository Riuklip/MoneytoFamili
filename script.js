// Inicializar EmailJS (reemplaza con tu User ID)
emailjs.init("KQwj_Sm-penUoskR0");
// Menú hamburguesa
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');
const whatsappBusinessNumber = '+5356096338'; // Reemplaza con tu número

// Y luego en la función de envío:

// Función para alternar el menú
function toggleMobileMenu() {
    navMenu.classList.toggle('show');
    
    // Cambiar icono entre hamburguesa y X
    const icon = mobileMenuBtn.querySelector('i');
    if (navMenu.classList.contains('show')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
}

// Evento para el botón del menú
mobileMenuBtn.addEventListener('click', toggleMobileMenu);

// Cerrar menú al hacer clic en un enlace
const navLinks = document.querySelectorAll('#navMenu a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu.classList.contains('show')) {
            toggleMobileMenu();
        }
    });
});

// Cerrar menú al hacer clic fuera de él
document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('show') && 
        !navMenu.contains(e.target) && 
        !mobileMenuBtn.contains(e.target)) {
        toggleMobileMenu();
    }
});

// Cerrar menú al redimensionar la ventana si se vuelve a tamaño desktop
window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navMenu.classList.contains('show')) {
        toggleMobileMenu();
    }
});
// Cambio entre WhatsApp y Email
const whatsappOption = document.getElementById('whatsappOption');
const emailOption = document.getElementById('emailOption');
const submitBtn = document.getElementById('submitBtn');
const formSection = document.getElementById('formSection');

function activateWhatsApp() {
    whatsappOption.classList.add('active');
    emailOption.classList.remove('active');
    submitBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Enviar por WhatsApp';
    submitBtn.className = 'btn whatsapp-active';
    formSection.classList.remove('email-active');
    formSection.classList.add('whatsapp-active');
}

function activateEmail() {
    emailOption.classList.add('active');
    whatsappOption.classList.remove('active');
    submitBtn.innerHTML = '<i class="fas fa-envelope"></i> Enviar por Correo';
    submitBtn.className = 'btn email-active';
    formSection.classList.remove('whatsapp-active');
    formSection.classList.add('email-active');
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
        let contactInfo = "";
        if (phone) contactInfo += `Teléfono del familiar en Cuba: ${phone}. `;
        if (email) contactInfo += `Mi correo: ${email}.`;
        
        const message = `Hola, me llamo ${name}. ${description} ${contactInfo}`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/${whatsappBusinessNumber}?text=${encodedMessage}`, '_blank');
    } else {
        // Enviar por Email
        const currentTime = new Date().toLocaleString();
        emailjs.send('service_m6o29ew', 'template_6zky109', {
            from_name: name,
            from_email: email,
            user_phone: phone,
            amount: amount,
            currency: 'USD',
            message: description,
            time: currentTime
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

// Variables para almacenar los últimos resultados calculados
let lastCalculation = {
    mode: 'send',
    originalAmount: 0,
    resultAmount: 0,
    ourCommission: 0,
    platformCommission: 0
};

// Event listeners para cálculo automático
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
    calculate(); // Recalcular automáticamente
});

initialAmount.addEventListener('input', calculate);
paymentPlatform.addEventListener('change', calculate);

fillContactBtn.addEventListener('click', function() {
    // Rellenar el campo de monto en el formulario de contacto
    document.getElementById('amount').value = initialAmount.value;
    
    // Crear un mensaje predeterminado con la información calculada
    const descriptionField = document.getElementById('description');
    let message = '';
    
    if (lastCalculation.mode === 'send') {
        message = `Quiero enviar $${lastCalculation.originalAmount.toFixed(2)} USD, para recibir $${lastCalculation.resultAmount.toFixed(2)} USD en Cuba. `;
    } else {
        message = `Quiero que se reciban $${lastCalculation.originalAmount.toFixed(2)} USD en Cuba, por lo que debo enviar $${lastCalculation.resultAmount.toFixed(2)} USD. `;
    }
    
    message += `Información del destinatario: `;
    
    // Si ya hay contenido en el campo de descripción, añadimos al final
    if (descriptionField.value.trim() !== '') {
        descriptionField.value = descriptionField.value + '\n\n' + message;
    } else {
        descriptionField.value = message;
    }
    
    // Desplazar el cursor al final del texto
    descriptionField.focus();
    descriptionField.setSelectionRange(descriptionField.value.length, descriptionField.value.length);
    
    // Mostrar mensaje de confirmación
    alert('Información de la calculadora añadida al formulario de contacto');
});

function calculate() {
    const mode = calculationMode.value;
    let amount = parseFloat(initialAmount.value);
    const platform = paymentPlatform.value;

    if (isNaN(amount) || amount <= 0) {
        resultValue.textContent = '0.00';
        resultText.textContent = 'Ingrese una cantidad válida';
        breakdownContainer.style.display = 'none';
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

    let result = 0;
    let platformCommission = 0;

    if (mode === 'send') {
        // Enviar: cantidad original - comisiones
        // Comisión de la plataforma (se aplica al monto original)
        if (platform === 'paypal') {
            platformCommission = amount * 0.05;
        }
        
        result = amount - ourCommission - platformCommission;
        resultValue.textContent = result.toFixed(2);
        resultText.textContent = `El destinatario recibirá: $${result.toFixed(2)} USD`;
        
        breakdownOriginal.textContent = `$${amount.toFixed(2)}`;
        breakdownCommission.textContent = `-$${ourCommission.toFixed(2)}`;
        breakdownPlatform.textContent = `-$${platformCommission.toFixed(2)}`;
        breakdownFinal.textContent = `$${result.toFixed(2)}`;
        
        fromInfo.textContent = `Comisión nuestra: $${ourCommission.toFixed(2)}`;
        toInfo.textContent = `Comisión plataforma: $${platformCommission.toFixed(2)}`;
        
        // Guardar los datos del cálculo
        lastCalculation = {
            mode: 'send',
            originalAmount: amount,
            resultAmount: result,
            ourCommission: ourCommission,
            platformCommission: platformCommission
        };
    } else {
        // Recibir: cantidad deseada + nuestra comisión + comisión plataforma
        // Primero calculamos el monto después de nuestra comisión
        const amountAfterOurCommission = amount + ourCommission;
        
        // Comisión de la plataforma (se aplica al monto después de nuestra comisión)
        if (platform === 'paypal') {
            platformCommission = amountAfterOurCommission * 0.05;
        }
        
        result = amountAfterOurCommission + platformCommission;
        resultValue.textContent = result.toFixed(2);
        resultText.textContent = `Usted debe enviar: $${result.toFixed(2)} USD`;
        
        breakdownOriginal.textContent = `$${amount.toFixed(2)}`;
        breakdownCommission.textContent = `+$${ourCommission.toFixed(2)}`;
        breakdownPlatform.textContent = `+$${platformCommission.toFixed(2)}`;
        breakdownFinal.textContent = `$${result.toFixed(2)}`;
        
        fromInfo.textContent = `Comisión nuestra: $${ourCommission.toFixed(2)}`;
        toInfo.textContent = `Comisión plataforma: $${platformCommission.toFixed(2)}`;
        
        // Guardar los datos del cálculo
        lastCalculation = {
            mode: 'receive',
            originalAmount: amount,
            resultAmount: result,
            ourCommission: ourCommission,
            platformCommission: platformCommission
        };
    }

    breakdownContainer.style.display = 'block';
}

// Inicializar calculadora al cargar la página
calculate();