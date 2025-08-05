import { ObjectId } from "mongodb"

export class Task {
    constructor({ name, description, startDate, endDate, status, priority }) {
        this.name = name
        this.description = description
        this.startDate = startDate
        this.endDate = endDate
        this.status = status
        this.priority = priority
        this.responsables = []
        this.workspace = ''
    }

    addResponsables(array = []) {
        if (array.length === 0) {
            return
        }
        const ids = array.map(u => u._id)
        this.responsables.push(...ids)
        console.log('Usuario Asignado a la tarea.')
    }
    addResponsable(user) {
        if (user.option === 'none') {
            return
        }

        this.responsables.push(user.option)
    }
    setWorkspace(workspaceId) {
        if (workspaceId !== new ObjectId()) {
            this.workspace = 'assignation_incorrect'
        }
        this.workspace = workspaceId
    }
}
