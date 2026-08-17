const express = require('express');
const cors = require('cors');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();

// Configuración de seguridad (CORS) permitiendo TODO para que no te bloquee
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST']
})); 

app.use(express.json()); 

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    }
});

client.on('qr', (qr) => {
    console.log('\n==================================================');
    console.log('ESCANEA ESTE CÓDIGO QR CON TU WHATSAPP:');
    console.log('==================================================\n');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('✅ ¡Conexión exitosa! El bot está listo.');
});

client.initialize();

app.post('/enviar-mensaje', async (req, res) => {
    const { numero, mensaje } = req.body;
    if (!numero || !mensaje) return res.status(400).json({ error: 'Faltan datos' });

    try {
        const numeroLimpio = numero.replace(/[\s+\-]/g, '');
        const numeroDestino = `${numeroLimpio}@c.us`; 
        
        await client.sendMessage(numeroDestino, mensaje);
        res.json({ success: true, message: 'Enviado' });
        console.log(`✅ Mensaje enviado a ${numeroLimpio}`);
    } catch (error) {
        console.error('❌ Error al enviar:', error);
        res.status(500).json({ error: 'Error al enviar' });
    }
});

app.listen(3000, () => console.log(`🚀 Servidor en http://localhost:3000`));