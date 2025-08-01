import inquirer from 'inquirer'
import { usersMenu } from './usersMenu.js'
import { DB } from '../utils/db.js'
import { workspacesMenu } from './workpacesMenu.js'
import { iList } from '../utils/inquirerPrompt.js'

const choices = [
    { name: '👱🏿 Gestión Usuarios', value: async () => await usersMenu() },
    { name: '🎭 Gestión Grupos de trabajo', value: async () => await workspacesMenu() },
    { name: '⭕ Salir\n\n------', value: 'exit' }
]


export async function start() {
    await DB.openDB()
    try {
        while (true) {
            const { option } = await iList('\n------\n🎏 Elige una opción -->\n', choices)

            if (option === 'exit') {
                return
            }

            await option()
        }
    } catch (error) {
        if (error?.isTtyError || error?.message?.includes('User force closed')) {
            // no hace nada mi bro, no es error
        } else {
            console.log('[error]', error)
        }
        return
    } finally {
        await DB.closeDB()
        process.exit(0)
    }
}