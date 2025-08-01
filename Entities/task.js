export class Task {
    constructor({ name, description, startDate, endDate, status, priority }) {
        this.name = name
        this.description = description
        this.startDate = startDate
        this.endDate = endDate
        this.status = status
        this.priority = priority
        this.responsables = []
    }
}
