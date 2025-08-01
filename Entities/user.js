export class User {
    constructor({ name, email, password, groups = [] }) {
        this.name = name,
            this.email = email,
            this.password = password,
            this.groups = groups
    }
}
