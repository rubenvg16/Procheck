import { Controller, Get, Post, Put, Delete, Param, Body, Headers } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('usuarios')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers(@Headers('authorization') authHeader: string) {
    const token = authHeader && authHeader.split(' ')[1];
    return this.userService.getUsers(token);
  }

  @Post()
  async createUser(@Body() user: { usuario: string; local: string; contrasena: string }) {
    try {
      const result = await this.userService.createUser(user);
      return { success: true, message: 'Usuario creado correctamente', data: result };
    } catch (error) {
      return { success: false, message: 'Error al crear el usuario. El nombre de usuario podría estar en uso.' };
    }
  }

  @Put(':usuario')
  async updateUser(@Param('usuario') usuario: string, @Body() user: { local: string; contrasena?: string }) {
    try {
      const result = await this.userService.updateUser(usuario, user);
      return { success: true, message: 'Usuario actualizado correctamente', data: result };
    } catch (error) {
      return { success: false, message: 'Error al actualizar el usuario' };
    }
  }

  @Delete(':usuario')
  async deleteUser(@Param('usuario') usuario: string) {
    try {
      await this.userService.deleteUser(usuario);
      return { success: true, message: 'Usuario eliminado correctamente' };
    } catch (error) {
      return { success: false, message: 'Error al eliminar el usuario' };
    }
  }
}

