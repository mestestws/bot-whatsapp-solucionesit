const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
})); 

app.options('*', cors());
app.use(express.json()); 

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ] 
    }
});

let isClientReady = false;

client.on('qr', (qr) => {
    const url = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=' + encodeURIComponent(qr);
    console.log('\n=================================================');
    console.log('HAZ CLIC EN ESTE ENLACE PARA VER TU CÓDIGO QR:');
    console.log(url);
    console.log('=================================================\n');
});

client.on('ready', () => {
    isClientReady = true;
    console.log('✅ ¡Conexión exitosa! El bot está listo.');
});

client.on('authenticated', () => {
    console.log('✅ ¡Autenticado correctamente!');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Error de autenticación:', msg);
});

client.initialize();

app.post('/enviar-mensaje', async (req, res) => {
    const { numero, mensaje } = req.body;
    if (!numero || !mensaje) {
        return res.status(400).json({ success: false, error: 'Faltan datos (número o mensaje)' });
    }

    if (!isClientReady) {
        return res.status(500).json({ 
            success: false, 
            error: 'El bot aún no está conectado a WhatsApp. Revisa los logs de Render y escanea el QR.' 
        });
    }

    try {
        const numeroLimpio = numero.replace(/\D/g, '');
        const numeroDestino = `${numeroLimpio}@c.us`; 
        
        // Verificamos si el contacto está registrado en WhatsApp antes de enviar
        const isValid = await client.isRegisteredUser(numeroDestino);
        if (!isValid) {
            return res.status(400).json({ success: false, error: 'El número no está registrado en WhatsApp.' });
        }

        await client.sendMessage(numeroDestino, mensaje);
        console.log(`✅ Mensaje enviado exitosamente a ${numeroLimpio}`);
        res.json({ success: true, message: 'Enviado correctamente' });
        
    } catch (error) {
        console.error('❌ Error detallado al enviar:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
