import { addResponsables, createTask } from '../managers/manageTasks.js'
import { iList } from '../utils/inquirerPrompt.js'

const choices = [
    { name: '➕ Crear Tarea', value: createTask },
    { name: '📧 Agregar más responsables', value: addResponsables },
    { name: '🔙 Volver', value: 'kill' },
]

export async function tasksMenu() {

    while (true) {
        const { option } = await iList('🎭 Gestión de Tareas 🎭', choices)

        if (option === 'kill') {
            console.log('🚩 Cancelado.')
            return
        }

        await option()
    }
}