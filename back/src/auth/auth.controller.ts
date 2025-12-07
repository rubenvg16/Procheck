import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './guards/auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';

interface UserDTO {
    email: string;
    name: string;
    password: string;
}

@Public()
@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) { }

    // Metodo POST para loguear un usuario
    @HttpCode(HttpStatus.OK)
    @Post('log-in')
    logIn(@Body() user: UserDTO) {
        return this.authService.logIn(user.email, user.password);
    }

    // Metodo POST para registrar un usuario 
    @HttpCode(HttpStatus.CREATED)
    @Post('sign-up')
    signUp(@Body() user: UserDTO) {
        return this.authService.signUp(user.email, user.name, user.password);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    googleLogin() {
        // inicia el flujo de login con Google OAuth2
    }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    googleLoginCallback(@Req() req, @Res() res) {
        // maneja el callback de Google OAuth2
        const jwt: string = req.user.jwt;
        if (jwt)
            res.redirect('http://localhost:4200/login/succes/' + jwt);
        else
            res.redirect('http://localhost:4200/login/failure');
    }

    @Get('profile')
    getProfile(@Req() req: Request) {
        // req.user debe estar disponible si usas un guard de JWT
        return req.user;
    }

    //metodo POST para forgot pass
    @Post('forgot-password')
    @HttpCode(200)
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        await this.authService.forgotPassword(dto.email);
        return { message: 'If the email exists, a reset link has been sent.' };
    }

    //metodo POST para reset pass
    @Post('reset-password')
    @HttpCode(200)
    async resetPassword(@Body() dto: ResetPasswordDto) {
        await this.authService.resetPassword(dto.np, dto.password);
        return { message: 'Password updated successfully.' };
    }

    //metodo POST para verificar 
    @Post('verify')
    async verifyUser(@Body('np') np: string) {
        try {
            return await this.authService.verifyUser(np);
        } catch (error) {
            throw error;
        }
    }
    //POST para login simple de LOCALES
    @Post('login-locales')
    async login(@Body() body: { usuario: string; password: string }) {
        return this.authService.loginLocales(body.usuario, body.password);
    }

    @Post('user-locales')// POST para obtener los locales de un usuario
    async getUserLocales(@Body('usuario') usuario: string) {
        return this.authService.getLocalesForUser(usuario);
    }

}
