app.post('/enviar-mensaje', async (req, res) => {
    const { numero, mensaje } = req.body;
    if (!numero || !mensaje) return res.status(400).json({ error: 'Faltan datos' });

    try {
        const numeroLimpio = numero.replace(/\D/g, ''); 
        const numeroDestino = `${numeroLimpio}@c.us`; 
        
        // Verificamos si el cliente está conectado
        if (client.info === undefined) {
             return res.status(500).json({ error: 'El bot no está conectado. Por favor, escanea el QR en los logs de Render.' });
        }

        await client.sendMessage(numeroDestino, mensaje);
        res.json({ success: true, message: 'Enviado' });
    } catch (error) {
        console.error('❌ Error al enviar:', error);
        // AQUÍ ESTÁ EL CAMBIO: Enviamos el mensaje del error al navegador para verlo en pantalla
        res.status(500).json({ error: error.message || 'Error desconocido' });
    }
});
