export class Workspace {
    constructor({ name, description }) {
        this.name = name
        this.description = description
        this.workgroup = []
        this.tasks = []
    }

}