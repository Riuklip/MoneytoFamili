
        // Inicializar EmailJS con tu Public Key
        // Reemplaza 'YOUR_PUBLIC_KEY' con tu clave pública de EmailJS
        emailjs.init('YOUR_PUBLIC_KEY');
        
        // Número de contacto fijo para WhatsApp
        const whatsappContactNumber = "+5356096338"; // Cambia este número por el número de contacto real
        
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
        const initialAmount = document.getElementById('initialAmount');
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
        
        // Tasas de cambio y comisiones por plataforma
        const exchangeRates = {
            'USD': { rate: 1.0, commission: 0.03 },
            'EUR': { rate: 1.18, commission: 0.035 }
        };
        
        const platformCommissions = {
            'zelle': 0.015,
            'paypal': 0.05
        };
        
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
        
        // Event listeners para cambiar método de contacto
        whatsappOption.addEventListener('click', () => toggleContactMethod('whatsapp'));
        emailOption.addEventListener('click', () => toggleContactMethod('email'));
        
        // Función para calcular el monto final con el 10% extra
        function calculateAmount() {
            const from = fromCurrency.value;
            const platform = paymentPlatform.value;
            const amount = parseFloat(initialAmount.value) || 0;
            
            if (amount <= 0) {
                resultValue.textContent = "0.00";
                resultText.textContent = "Ingrese una cantidad válida";
                fromInfo.textContent = "Tasa de cambio: 0.00";
                toInfo.textContent = "Comisión total: 0.00";
                breakdownContainer.style.display = 'none';
                return;
            }
            
            // Aplicar 10% extra antes de calcular impuestos
            const extraCommission = amount * 0.10;
            const amountWithExtra = amount + extraCommission;
            
            // Calcular conversión
            const rate = exchangeRates[from].rate;
            const baseAmount = amountWithExtra * rate;
            
            // Calcular comisiones
            const currencyCommission = baseAmount * exchangeRates[from].commission;
            const platformCommission = baseAmount * platformCommissions[platform];
            const totalCommission = currencyCommission + platformCommission;
            
            // Calcular monto final en la moneda de origen
            const finalAmount = (baseAmount + totalCommission) / rate;
            
            // Mostrar resultados
            resultValue.textContent = finalAmount.toFixed(2);
            resultText.textContent = `Monto final en ${from}: ${finalAmount.toFixed(2)}`;
            fromInfo.textContent = `Tasa: 1 ${from} = ${rate.toFixed(4)} USD`;
            toInfo.textContent = `Comisión total: ${(totalCommission/baseAmount*100).toFixed(2)}%`;
            
            // Mostrar desglose del cálculo
            document.getElementById('breakdownOriginal').textContent = `${amount.toFixed(2)} ${from}`;
            document.getElementById('breakdownCommission').textContent = `${extraCommission.toFixed(2)} ${from} (10%)`;
            document.getElementById('breakdownSubtotal').textContent = `${amountWithExtra.toFixed(2)} ${from}`;
            document.getElementById('breakdownRate').textContent = `1 ${from} = ${rate.toFixed(4)} USD`;
            document.getElementById('breakdownPlatform').textContent = `${(totalCommission / rate).toFixed(2)} ${from}`;
            document.getElementById('breakdownFinal').textContent = `${finalAmount.toFixed(2)} ${from}`;
            breakdownContainer.style.display = 'block';
            
            return {
                originalAmount: amount,
                currency: from,
                platform: platform,
                finalAmount: finalAmount,
                extraCommission: extraCommission,
                totalCommission: totalCommission
            };
        }
        
        // Event listener para el botón de calcular
        calculateBtn.addEventListener('click', calculateAmount);
        
        // Event listener para el botón de rellenar contacto
        fillContactBtn.addEventListener('click', function() {
            const calculation = calculateAmount();
            
            if (calculation && calculation.finalAmount > 0) {
                // Rellenar el formulario de contacto
                document.getElementById('amount').value = calculation.finalAmount.toFixed(2);
                document.getElementById('contactCurrency').value = calculation.currency;
                
                // Crear una descripción automática
                const platformNames = {
                    'paypal': 'PayPal',
                    'zelle': 'Zelle'
                };
                
                const description = `Deseo enviar ${calculation.originalAmount} ${calculation.currency} a Cuba mediante ${platformNames[calculation.platform]}. Cálculo realizado con la calculadora (incluye 10% de comisión adicional).`;
                document.getElementById('description').value = description;
                
                // Desplazar al formulario de contacto
                document.querySelector('#form').scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Mostrar mensaje de confirmación
                alert(`El formulario de contacto ha sido rellenado con el monto calculado: ${calculation.finalAmount.toFixed(2)} ${calculation.currency} (incluye 10% de comisión adicional)`);
            } else {
                alert("Por favor, calcule primero un monto válido antes de rellenar el formulario de contacto.");
            }
        });
        
        // Calcular automáticamente al cambiar valores
        fromCurrency.addEventListener('change', calculateAmount);
        paymentPlatform.addEventListener('change', calculateAmount);
        initialAmount.addEventListener('input', calculateAmount);
        
        // Calcular al cargar la página
        document.addEventListener('DOMContentLoaded', function() {
            calculateAmount();
            // Asegurar que el formulario esté en modo WhatsApp al cargar
            toggleContactMethod('whatsapp');
        });
        
        // Función para enviar mensaje por WhatsApp
        function sendWhatsAppMessage(message) {
            // Codificar el mensaje para URL
            const encodedMessage = encodeURIComponent(message);
            
            // Crear el enlace de WhatsApp
            const whatsappURL = `https://wa.me/${whatsappContactNumber}?text=${encodedMessage}`;
            
            // Abrir WhatsApp en una nueva ventana
            window.open(whatsappURL, '_blank');
        }
        
        // Función para enviar correo con EmailJS
        function sendEmail(name, email, currency, amount, description, phone = '') {
            // Parámetros para la plantilla de EmailJS
            const templateParams = {
                from_name: name,
                from_email: email,
                user_phone: phone,
                currency: currency,
                amount: amount,
                message: description,
                to_email: 'info@remesasacuba.com' // Cambia por el email de destino
            };
            
            // Reemplaza 'YOUR_SERVICE_ID' y 'YOUR_TEMPLATE_ID' con tus valores de EmailJS
            emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
                .then(function(response) {
                    console.log('Correo enviado con éxito:', response);
                    alert('¡Correo enviado con éxito! Nos pondremos en contacto contigo pronto.');
                }, function(error) {
                    console.log('Error al enviar el correo:', error);
                    alert('Hubo un error al enviar el correo. Por favor, inténtalo de nuevo más tarde.');
                });
        }
        
        // Manejo del envío del formulario
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const method = whatsappOption.classList.contains('active') ? 'WhatsApp' : 'Correo electrónico';
            const name = document.getElementById('name').value;
            const contact = method === 'WhatsApp' ? document.getElementById('phone').value : document.getElementById('email').value;
            const currency = document.getElementById('contactCurrency').value;
            const amount = document.getElementById('amount').value;
            const description = document.getElementById('description').value;
            
            // Crear mensaje predeterminado
            const message = `Hola, me interesa enviar remesas a Cuba.\n\n*Información del solicitante:*\nNombre: ${name}\n${method === 'WhatsApp' ? 'Teléfono: ' + contact : 'Email: ' + contact}\n\n*Detalles de la transacción:*\nMoneda: ${currency}\nMonto: ${amount}\nDescripción: ${description}\n\nPor favor, contactarme para proceder con la transacción.`;
            
            if (method === 'WhatsApp') {
                // Enviar mensaje por WhatsApp
                sendWhatsAppMessage(message);
            } else {
                // Enviar por correo usando EmailJS
                sendEmail(name, contact, currency, amount, description);
            }
            
            // Limpiar formulario después del envío
            contactForm.reset();
            
            // Restablecer a WhatsApp por defecto
            toggleContactMethod('whatsapp');
        });
        
        // Efecto de header al hacer scroll
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                mainHeader.classList.add('scrolled');
            } else {
                mainHeader.classList.remove('scrolled');
            }
            
            // Actualizar enlace activo según la sección visible
            updateActiveNavLink();
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
        
        // Menú móvil
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('show');
        });
        
        // Cerrar menú móvil al hacer clic en un enlace
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('show');
            });
        });
        
        // Scroll suave para navegación (complementario al CSS)
        document.querySelectorAll('nav a').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
