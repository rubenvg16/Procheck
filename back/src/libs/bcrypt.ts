import * as bcrypt from 'bcryptjs';

// Funcion para encriptar una contraseña
export const encrypt = async (password: string, salt = 10) => {
    return await bcrypt.hash(password, salt);
}

// Funcion para comparar una contraseña con un hash
export const compare = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
}