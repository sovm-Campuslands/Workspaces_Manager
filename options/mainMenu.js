import inquirer from 'inquirer'
import { usersMenu } from './usersMenu.js'
import { DB } from '../utils/db.js'
import { workspacesMenu } from './workpacesMenu.js'
import { iList } from '../utils/inquirerPrompt.js'
import { tasksMenu } from './tasksMenu.js'
import { reportWorkspace } from '../managers/manageReports.js'

const choices = [
    { name: '👱🏿 Gestión Usuarios', value: async () => await usersMenu() },
    { name: '🎭 Gestión Grupos de trabajo', value: async () => await workspacesMenu() },
    { name: '📃 Gestión de Tareas', value: async () => await tasksMenu() },
    { name: '💳 Hacer un Reporte', value: async () => await reportWorkspace() },
    { name: '⭕ Salir\n\n------', value: 'exit' }
]


export async function start() {
    await DB.openDB()
    try {
        while (true) {
            console.clear()
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
            console.log('[🔴 error]', error)
        }
        return
    } finally {
        await DB.closeDB()
        process.exit(0)
    }
}