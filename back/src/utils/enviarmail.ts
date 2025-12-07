import * as nodemailer from 'nodemailer';

export async function enviarmail(destino: string, asunto: string, mensaje: string) {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.1and1.es',
            port: 587,
            secure: false,
            auth: {
                user: 'reports@tpvs.es',
                pass: '25451855WPA2AES',
            },
        });

        const result = await transporter.sendMail({
            from: '"Notificaciones Bartolomé Consultores" <reports@tpvs.es>',
            to: destino,
            subject: asunto,
            html: mensaje,
        });
        return result;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}