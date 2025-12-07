import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'src/libs/bcrypt';
import { Loginclientes } from 'src/entitiesies/clientes/entities/Loginclientes';
import { enviarmail } from 'src/utils/enviarmail';
import * as crypto from 'crypto';
import { Usuarios } from 'src/entitiesies/checklist_online/entities/Usuarios';

const ENCRYPT_KEY = 'MikelSuperSaiyan';
const ENCRYPT_IV = '1234567812345678';
const ENCRYPT_METHOD = 'aes-128-cbc';

export enum Provider {
    GOOGLE = 'google'
}

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(Loginclientes, 'clientesConnection')
        private readonly loginclientesRepository: Repository<Loginclientes>,
        private jwtService: JwtService,
        @InjectRepository(Usuarios, 'checklistsConnection')
        private readonly usuariosRepository: Repository<Usuarios>
    ) { }

    // Función para hacer login
    async logIn(email: string, password: string) {
        try {
            // Buscar si existe el email en la base de datos (IdCliente mappeado a propiedad 'nombre')
            const user = await this.loginclientesRepository.findOne({
                where: { nombre: email },
            });

            if (!user) {
                throw new BadRequestException('Email o contraseña inválidos');
            }

            // Validado puede venir como Buffer (bit) o como número/booleano
            const validado = (Buffer.isBuffer(user.validado) ? user.validado[0] : Number(user.validado)) === 1;
            if (!validado) {
                throw new BadRequestException('Usuario no validado. Por favor, revisa tu correo electrónico.');
            }

            // Usuario creado por Google
            if (user.password === '**__[[Google Account]]__**') {
                throw new UnauthorizedException('Tu cuenta está vinculada a Google. Por favor, inicia sesión con Google.');
            }

            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) {
                throw new BadRequestException('Email o contraseña inválidos');
            }

            // Generar token sin la contraseña
            const { password: _, ...userWithoutPassword } = user as any;
            const access_token = await this.jwtService.signAsync({ ...userWithoutPassword });

            return { access_token };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
                throw error;
            }
            console.error('logIn error', error);
            throw new InternalServerErrorException('Error al hacer log in');
        }
    }

    // Función para hacer signup
    async signUp(email: string, name: string, password: string) {
        try {
            // Buscar por 'nombre' (mapea a IdCliente)
            const userFound = await this.loginclientesRepository.findOne({
                where: { nombre: email },
            });

            if (userFound) throw new BadRequestException('El usuario ya existe');

            // Encripta la contraseña
            const hashedPassword = await bcrypt.encrypt(password);

            // Crear entidad con tipos compatibles (activo: number, validado/condAceptadas: Buffer)
            const user = this.loginclientesRepository.create({
                nombre: email,
                nombreCompleto: name,
                password: hashedPassword,
                activo: 0,
                validado: Buffer.from([0]),
                condAceptadas: Buffer.from([0]),
                idioma: null,
                fotico: null,
            } as any);

            await this.loginclientesRepository.save(user);

            // Generar link de verificación
            const paramMail = encodeURIComponent(this.encriptar(email));
            const verifyLink = `http://localhost:4200/auth/verify?np=${paramMail}`;

            const asunto = 'Verifica tu cuenta de Bartolomé Consultores';
            const mensaje = `<a href="${verifyLink}">Pulse aquí para validar su cuenta.</a><br><br>
            Si no funcionara el enlace, copie y pegue en la barra de direcciones la siguiente dirección:<br>${verifyLink}<br><br>
            Si tiene alguna duda respecto responda a este correo y nuestro servicio técnico se pondrá en contacto con usted lo antes posible.`;

            try {
                await enviarmail(email, asunto, mensaje);
            } catch (mailErr) {
                console.error('SIGN-UP: fallo al enviar email de verificación', { email, mailErr });
                // No abortamos el registro por fallo en el correo
            }

            return { message: 'Registro exitoso. Revisa tu correo para validar tu cuenta.' };

        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            console.error('signUp error', error);
            throw new InternalServerErrorException('Error al registrar usuario');
        }
    }

    encriptar(cadena: string): string {
        const cipher = crypto.createCipheriv(ENCRYPT_METHOD, ENCRYPT_KEY, ENCRYPT_IV);
        let encrypted = cipher.update(cadena, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return encrypted;
    }

    desencriptar(cadena: string): string {
        const decipher = crypto.createDecipheriv(ENCRYPT_METHOD, ENCRYPT_KEY, ENCRYPT_IV);
        let decrypted = decipher.update(cadena, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    async forgotPassword(email: string) {
        const user = await this.loginclientesRepository.findOne({ where: { nombre: email } });
        if (!user) throw new BadRequestException('El correo no existe en la BD!!!');

        const paramPlano = `${email}|${Date.now() / 1000 | 0}`;
        const paramMail = encodeURIComponent(this.encriptar(paramPlano));
        const resetLink = `http://localhost:4200/auth/reset-password?np=${paramMail}`;

        const asunto = 'Recuperar contraseña de Bartolome';
        const mensaje = `<a href="${resetLink}">Pulse aquí para introducir una nueva contraseña.</a><br><br>
        Si no funcionara el enlace, copie y pegue en la barra de direcciones la siguiente dirección:<br>${resetLink}<br><br>
        Si tiene alguna duda respecto responda a este correo y nuestro servicio técnico se pondrá en contacto con usted lo antes posible.`;

        await enviarmail(email, asunto, mensaje);
    }

    async resetPassword(np: string, password: string) {
        let param: string;
        try {
            param = this.desencriptar(decodeURIComponent(np));
        } catch {
            throw new BadRequestException('Invalid link');
        }
        const [email, timestamp] = param.split('|');
        const now = Date.now() / 1000 | 0;
        if (now - parseInt(timestamp) > 1800) {
            throw new BadRequestException('Link ha expirado, vuelva a solicitarlo');
        }

        const user = await this.loginclientesRepository.findOne({ where: { nombre: email } });
        if (!user) throw new BadRequestException('Invalid link');

        const isSame = await bcrypt.compare(password, user.password);
        if (isSame) throw new BadRequestException('La nueva contraseña no puede ser igual a la actual.');

        user.password = await bcrypt.encrypt(password);
        await this.loginclientesRepository.save(user);
    }

    async verifyUser(np: string) {
        const email = this.desencriptar(decodeURIComponent(np));
        const user = await this.loginclientesRepository.findOne({ where: { nombre: email } });
        if (!user) throw new BadRequestException('Usuario no encontrado');

        const validado = (Buffer.isBuffer(user.validado) ? user.validado[0] : Number(user.validado)) === 1;
        if (validado) {
            return { message: 'El usuario ya había sido validado. Si no puede iniciar sesión por favor contacte con nosotros.' };
        }

        // Marcar como validado y guardar
        user.validado = Buffer.from([1]);
        await this.loginclientesRepository.save(user);
        return { message: 'Usuario validado con éxito' };
    }

    async validateOAuthLogin(email: string, name: string, fotico: string): Promise<{ access_token: string }> {
        try {
            let user = await this.loginclientesRepository.findOne({ where: { nombre: email } });

            if (!user) {
                // crear entidad en variable intermedia para evitar inferencias de arreglo y posibles nulls
                const newUser = this.loginclientesRepository.create({
                    nombre: email,
                    nombreCompleto: name,
                    password: '**__[[Google Account]]__**',
                    fotico: fotico,
                    // tipos compatibles con la tabla
                    activo: 1,
                    validado: Buffer.from([1]),
                    condAceptadas: Buffer.from([1]),
                    idioma: null,
                } as any);
                // guardar y asignar a 'user' (newUser no es null)
                await this.loginclientesRepository.save(newUser as any);
                user = newUser as any;
            } else if (user.password !== '**__[[Google Account]]__**') {
                user.password = '**__[[Google Account]]__**';
                user.fotico = fotico;
                user.validado = Buffer.from([1]);
                (user as any).activo = 1;
                await this.loginclientesRepository.save(user as any);
            }

            const { password: _, ...userWithoutPassword } = user as any;
            const access_token = await this.jwtService.signAsync({ ...userWithoutPassword });
            return { access_token };
        } catch (err) {
            console.error('validateOAuthLogin ERROR', err);
            throw new InternalServerErrorException('Error en OAuth login');
        }
    }

    async loginLocales(usuario: string, password: string) {
        const user = await this.usuariosRepository.findOne({ where: { usuario } });
        if (!user) throw new BadRequestException('Usuario incorrecto');
        if (!user.password || !(await bcrypt.compare(password, user.password))) throw new BadRequestException('Contraseña incorrecta');
        return { success: true };
    }

    async getLocalesForUser(usuario: string): Promise<string[]> {
        const locales = await this.usuariosRepository
            .createQueryBuilder('usuarios')
            .select('usuarios.local')
            .where('usuarios.usuario = :usuario', { usuario })
            .getMany();
        return locales.map((l: any) => l.local);
    }

}