import { DB } from "./db.js";
import { iInput as input } from "./inquirerPrompt.js";
import bcrypt from 'bcrypt'

export async function login() {
    while (true) {
        const email = await input('💌 Ingresa tu correo electronico\n(el que usaste en tu registro)\n-->', 'email')
        if (!email) {
            break
        }

        const finded = await DB.getByField('users', { email: email })

        if (!finded) {
            console.log('🚧 Usuario no encontrado papá')
            continue
        }

        const pass = await input('✍🏼 Ingresa tu Contraseña\n-->', 'password')
        if (!pass) {
            break
        }

        const compare = bcrypt.compareSync(pass, finded.password)

        if (!compare) {
            console.log('🚩 Contraseña incorrecta')
            continue
        }
        return { ok: true, user: finded }
    }
}