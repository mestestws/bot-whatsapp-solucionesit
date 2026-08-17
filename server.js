app.post('/enviar-mensaje', async (req, res) => {
    const { numero, mensaje } = req.body;
    if (!numero || !mensaje) return res.status(400).json({ error: 'Faltan datos' });

    try {
        // Limpiamos todo lo que no sea número
        const numeroLimpio = numero.replace(/\D/g, ''); 
        const numeroDestino = `${numeroLimpio}@c.us`; 
        
        // Verificamos si el cliente está listo
        if (!client.info) {
             return res.status(500).json({ error: 'El bot no ha iniciado sesión, escanea el QR en los logs.' });
        }

        await client.sendMessage(numeroDestino, mensaje);
        res.json({ success: true, message: 'Enviado' });
    } catch (error) {
        console.error('❌ Error al enviar:', error);
        res.status(500).json({ error: error.message }); // Enviamos el error real al navegador
    }
});
