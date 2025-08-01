import { MongoClient } from "mongodb"


export class DB {
    static uri = 'mongodb://localhost:27017'
    static dbName = 'eantion'
    static client = undefined
    static db = undefined

    static async openDB() {
        console.log('🚧 CONEXIÓN A LA BASE DE DATOS ABIERTA 🚧')
        if (!this.client) {
            this.client = new MongoClient(this.uri)
        }
        await this.client.connect()
        this.db = this.client.db(this.dbName)
    }

    static async closeDB() {
        console.log('🚧 CONEXIÓN A LA BASE DE DATOS CERRADA 🚧')
        await this.client.close()
    }

    static async insertOne(collection, document) {
        const result = await this.db.collection(collection).insertOne(document)
        return result
    }

    static async insertMany(collection, array) {
        const result = await this.db.collection(collection).insertMany(array)
        return result
    }

    static async getByField(collection, filter) {
        const finded = await this.db.collection(collection).findOne(filter)
        return finded
    }

    static async getAll(collection) {
        const list = await this.db.collection(collection).find().toArray()
        return list
    }

    static async getById(collection, id) {
        const finded = await this.db.collection(collection).findOne({ _id: id })
        return finded
    }

    static async updateOne(collectionName, filter, update) {
        const updated = await this.db.collection(collectionName).updateOne(filter, update)
        return updated
    }

    static async updateMany(collectionName, filter, update) {
        const updated = await this.db.collection(collectionName).updateMany(filter, update)
        return updated
    }

    static async deleteOne(collection, filter) {
        const deleted = await this.db.collection(collection).deleteOne(filter)
        return deleted
    }

    static async findMany(collectionName, filter = {}) {
        try {
            const result = await this.db.collection(collectionName).find(filter).toArray()
            return result
        } catch (error) {
            console.error(`❌ Error al buscar en ${collectionName}:`, error)
            throw error
        }
    }


    static async aggregation(collectionName, agregacion = []) {
        try {
            const result = await this.db.collection(collectionName).aggregate(agregacion).toArray()
            return result
        } catch (error) {
            console.log(`❌ Error al buscar en ${collectionName}:`, error)
            throw error
        }
    }

    static async find(collectionName, filter, projection = {}) {
        const result = this.db.collection(collectionName).find(filter, projection).toArray()
        return result
    }

}