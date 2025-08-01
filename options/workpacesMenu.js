import inquirer from "inquirer";
import { assingUsers, createWorkspace, deleteFromWorkspace } from "../managers/manageWorkspaces.js";
import { iList } from "../utils/inquirerPrompt.js";

const choices = [
    { name: '📃 Crear grupo de trabajo', value: createWorkspace, description: 'Crea un grupo de trabajo nuevo (vacio)' },
    { name: '✍🏼 Asignar Usuarios', value: assingUsers },
    { name: '🚩 Eliminar Usuarios de un grupo de trabajo', value: deleteFromWorkspace },
    { name: '🚧 Salir', value: 'kill' },

]


export async function workspacesMenu() {
    while (true) {
        const { option } = await iList('\n📄 Gestión de Workspaces 📄\n', choices)

        if (option === 'kill') {
            console.log('🚩 Cancelado.')
            return
        }

        await option()
    }
}