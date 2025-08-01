import inquirer from "inquirer";
import { createAccount, updateUser, deleteAccount } from "../managers/manageUsers.js";

const choices = [
    { name: '👱🏿 Registrarse', value: createAccount },
    { name: '✍🏼 Editar Información', value: updateUser },
    { name: '🚩 Solicitud de Eliminación', value: deleteAccount },
    { name: '🚧 Salir', value: 'logout' },
]

export async function usersMenu() {
    while (true) {
        const { option } = await inquirer.prompt([
            {
                type: 'list',
                name: 'option',
                message: 'Selecciona una opción',
                choices: choices
            }
        ])

        if (option === 'logout') {
            console.log('💵 Terminando.. 💵')
            return
        }
        await option()
    }
}