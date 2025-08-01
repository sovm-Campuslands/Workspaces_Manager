import { Task } from "./task.js"
import { User } from "./user.js"
import { Workspace } from "./Workspace.js"

export class Factory {
    static create(entity, data) {
        const type = entity.toLowerCase()

        switch (type) {
            case 'user':
                return new User(data)
            case 'workspace':
                return new Workspace(data)
            case 'task':
                return new Task(data)
            default:
                throw new Error(`🚧 Tipo de entidad no valida: ${entity}`)
        }
    }
}
