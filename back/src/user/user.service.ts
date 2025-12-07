import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuarios } from '../entitiesies/checklist_online/entities/Usuarios';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { DashboardService } from '../dashboard/dashboard.service';
import { In } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Usuarios, 'checklistsConnection')
    private readonly userRepository: Repository<Usuarios>,
    private readonly dashboardService: DashboardService,
  ) {}

  // Obtener usuarios por conexiones usando el DashboardService
  async getUsers(token: string) {
    try {
      // Obtener las conexiones para el usuario basado en el token
      const { conexiones } = await this.dashboardService.getConexiones(token);

      if (!conexiones || conexiones.length === 0) {
        throw new HttpException('No connections found for user', HttpStatus.NOT_FOUND);
      }

      // Extraer los nombres de las conexiones (suponiendo que 'nombreConexion' es el campo por el cual filtrar)
      const connectionNames = conexiones.map(conexion => conexion.nombreConexion);

      // Obtener los usuarios que pertenecen a estas conexiones
      const users = await this.userRepository.find({
        where: {
          local: In(connectionNames), // Filtrar por conexiones
        },
      });

      return users;
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException('Error al obtener los usuarios', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Crear un nuevo usuario
  async createUser(user: { usuario: string; local: string; contrasena: string }) {
    try {
      // Comprobar si el usuario ya existe
      const existingUser = await this.userRepository.findOne({ 
        where: { 
          usuario: user.usuario,
          local: user.local 
        } 
      });
      
      if (existingUser) {
        throw new HttpException('El usuario ya existe', HttpStatus.CONFLICT);
      }

      // Hash pass
      const hashedPassword = await bcrypt.hash(user.contrasena, 10);
      
      // Crear y guardar el nuevo usuario - NOTA: mapeando contrasena al campo password
      const newUser = this.userRepository.create({
        usuario: user.usuario,
        local: user.local,
        password: hashedPassword  // Usar campo password en lugar de contrasena
      });
      
      const savedUser = await this.userRepository.save(newUser);
      return { 
        usuario: savedUser.usuario,
        local: savedUser.local
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Error al crear el usuario', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Actualizar un usuario
  async updateUser(usuario: string, updateData: { local?: string; contrasena?: string }) {
    try {
      // Encontrar el usuario por su nombre y local
      const user = await this.userRepository.findOne({ 
        where: { 
          usuario: usuario,
          local: updateData.local  // Incluir local en la búsqueda
        } 
      });
      
      if (!user) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }

      // Crear un objeto para almacenar los cambios
      const updatedUser: Partial<Usuarios> = {};
      
      // Solo actualizar pass si se proporciona
      if (updateData.contrasena && updateData.contrasena.trim() !== '') {
        updatedUser.password = await bcrypt.hash(updateData.contrasena, 10);  // Usar campo password
      }
      
      // Aplicar los cambios al usuario
      Object.assign(user, updatedUser);
      
      // Guardar el usuario actualizado
      await this.userRepository.save(user);
      
      return { 
        usuario: user.usuario,
        local: user.local
      };
    } catch (error) {
      console.error('Update error details:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException('Error al actualizar el usuario', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Borrar un usuario
  async deleteUser(usuario: string) {
    try {
      const result = await this.userRepository.delete({ usuario });
      if (result.affected === 0) {
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
      }
      return { success: true };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Error al eliminar el usuario', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
