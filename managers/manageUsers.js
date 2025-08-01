import inquirer from "inquirer";
import bcrypt from 'bcrypt'
import { iInput as input } from "../utils/inquirerPrompt.js";
import { DB } from '../utils/db.js'
import { Factory } from "../Entities/EntityFactory.js";
import { login } from "../utils/handlers.js";
import { fieldLabels, inputSchemas } from "../utils/dummys.js";

export async function createAccount() {

    const name = await input('📃 Nombres y Apellidos 📃\n(con espacios)\n-->  ', 'name')
    if (!name) return
    const email = await input('💌 Correo Electronico 💌\n(con el te reconoceré)\n--> ', 'email')
    if (!email) return
    const pass = await input("✍🏼 Contraseña ✍🏼\n(deberá recordarla siempre)\n-->", 'password')
    if (!pass) return

    const password = bcrypt.hashSync(pass, 10)

    const user = Factory.create('user', { name, email, password })

    const created = await DB.insertOne('users', user)

    console.log(`${created.acknowledged ? `💫 Usuario ${name} creado correctamente` : `🚩 Algo falló ${created}`}`)
}

export async function updateUser() {
    while (true) {
        const success = await login()

        if (!success.ok) {
            return
        }
        const keys = Object.keys(success.user).filter(k => !['_id', 'groups'].includes(k)).map(key => ({
            name: fieldLabels[key] || key,
            value: key
        }))
        keys.push({ name: '🚩 CANCELAR 🚩', value: 'kill' })

        const { option } = await inquirer.prompt([
            {
                type: 'list',
                name: 'option',
                message: '🎏 Que campo desea editar? ',
                choices: keys
            }
        ])

        if (option === 'kill') {
            console.log('🚩 Cancelado')
            return
        }

        const validateType = Object.hasOwn(inputSchemas, option) ? option : 'none'

        let newValue

        if (option === 'password') {
            const newPassword = await input(`🚧 Estás a punto de cambiar tu contraseña\n🚩 Nueva Contraseña: `, validateType)
            newValue = bcrypt.hashSync(newPassword, 10)
        } else {
            newValue = await input(`💫 Nuevo valor para ${option}`, validateType)
        }

        const result = await DB.updateOne('users', { _id: success.user._id }, { $set: { [option]: newValue } })
        if (!result || result.modifiedCount === 0) {
            console.log('🎏 Algo Falló en la actualización..', result)
        } else {
            console.log(`${fieldLabels[option]} Modificada Correctamente\n(🚩Sí lo olvidas deberás solicitar cambio de información a soporte)`)
        }
        return

    }

}

export async function deleteAccount() {

}

export async function searchByName() {
    const name = await input('Nombre del usuario')
    const results = await DB.findByIndex('users', { name: name })
    console.log(results)
}