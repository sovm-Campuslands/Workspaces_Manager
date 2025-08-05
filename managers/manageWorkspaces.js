import { iList, iInput as input } from "../utils/inquirerPrompt.js"
import { DB } from "../utils/db.js"
import { Factory } from "../Entities/EntityFactory.js"


// AUXILIARES

export async function findWorkSpace() {

    const workspaces = await DB.getAll('workspaces')

    workspaces.push({ name: '🚩 Cancelar 🚩', value: 'kill' })

    let workspace = await iList('📃 SELECCIONE GRUPO DE TRABAJO 📃', workspaces)

    if (workspace.option === 'kill') {
        return 'kill'
    }

    workspace = workspace.option
    const savedWorkspace = await DB.getByField('workspaces', { name: workspace })

    return savedWorkspace

}

export async function getUsersFromWorkspace(savedWorkspace) {

    const users = await DB.aggregation('workspaces', [
        { $match: { _id: savedWorkspace._id } },
        { $unwind: "$workgroup" },
        {
            $lookup: {
                from: 'users',
                localField: 'workgroup',
                foreignField: '_id',
                as: "usuario"
            }
        },
        { $unwind: "$usuario" },
        {
            $group: {
                _id: null,
                usuarios: { $addToSet: "$usuario" }
            }
        },
        {
            $project: {
                _id: 0,
                usuarios: 1
            }
        }
    ])

    return users
}

export async function getTasks(savedWorkspace) {
    const tasks = await DB.aggregation('workspaces', [
        { $match: { _id: savedWorkspace._id } },
        { $unwind: '$tasks' },
        {
            $lookup: {
                from: 'tasks',
                localField: 'tasks',
                foreignField: '_id',
                as: 'task'
            }
        },
        { $unwind: '$task' },
        { $unwind: { path: "$task.responsables", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'users',
                localField: 'task.responsables',
                foreignField: '_id',
                as: 'responsable'
            }
        },
        { $unwind: { path: "$responsable", preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: "$task._id",
                tarea: { $first: "$task.name" },
                description: { $first: "$task.description" },
                responsables: {
                    $push: {
                        $cond: [
                            { $ifNull: ["$responsable", false] },
                            {
                                code: "$responsable._id",
                                name: "$responsable.name",
                                email: "$responsable.email"
                            }, "$$REMOVE"
                        ]
                    }
                }
            }
        },
        {
            $project: {
                _id: 1,
                tarea: 1,
                description: 1,
                responsables: 1
            }
        }
    ])
    return tasks
}

// PRINCIPALES

export async function createWorkspace() {

    const name = await input('📃 Nombre del Espacio de trabajo 📃\n-->  ', 'name')
    if (!name) return
    const description = await input("✍🏼 Descripción del Espacio de trabajo ✍🏼\n-->", 'none')
    if (!description) return


    const workspace = Factory.create('workspace', { name, description })

    const created = await DB.insertOne('workspaces', workspace)

    console.log(`${created.acknowledged ? `💫 Grupo de Trabajo ${name} creado correctamente` : `🚩 Algo falló ${created}`}`)
}


export async function assingUsers() {
    while (true) {
        const times = await input('🕘 Cuantos Usuarios desea agregar?', 'none')
        if (!times) {
            console.log('🚩 Cancelado')
            return
        } else if (isNaN(Number(times))) {
            console.log('🚩 Lo siento, Debes elegir un número de veces valido')
            continue
        }

        const savedWorkspace = await findWorkSpace()

        if (savedWorkspace === 'kill') {
            console.log('🚩 Cancelado.')
            return
        }

        let usersToSet = []

        for (let i = 0; i < Number(times); i++) {
            const users = await DB.getAll('users')

            users.push({ name: '🚩 Cancelar 🚩', value: 'kill' })

            const user = await iList('✍🏼 Asigne un Usuario ✍🏼', users)

            if (user.option === 'kill') {
                console.log('🚩 Cancelado.')
                return
            }
            usersToSet.push(user.option)
        }

        const usuarios = await DB.find('users', { name: { $in: usersToSet } })

        const usersId = usuarios.map(u => u._id)

        const resultWorks = await DB.updateOne('workspaces', { _id: savedWorkspace._id }, { $addToSet: { workgroup: { $each: usersId } } })
        const resultUsers = await DB.updateMany('users', { _id: { $in: usersId } }, { $addToSet: { groups: savedWorkspace._id } })


        if (resultWorks.acknowledged && resultWorks.modifiedCount === 0 && resultUsers.acknowledged && resultUsers.modifiedCount) {
            console.log('✍🏼 Los usuarios ya pertenecían al grupo de trabajo')
        } else if (!resultWorks.acknowledged && !resultUsers.acknowledged) {
            console.log('🚩 Algo sucedió con la operación', resultWorks)
        } else if (resultWorks.modifiedCount > 0 && resultUsers.modifiedCount > 0) {
            console.log('✍🏼 Se han agregado los nuevos usuarios al grupo de trabajo')
        }

        return
    }
}

export async function editWorkSpace() {
}

export async function deleteFromWorkspace() {

    const savedWorkspace = await findWorkSpace()

    if (savedWorkspace === 'kill') {
        console.log('🚩 Cancelado 🚩')
        return
    }

    let users = await getUsersFromWorkspace(savedWorkspace)

    if (users.length === 0) {
        console.log(`❌ El grupo de trabajo no contiene usuarios`)
        return
    }

    users = users[0].usuarios

    const choices = users.map(u => ({ name: u.name, value: u._id }))
    choices.push({ name: '🚩 Cancelar 🚩', value: 'kill' })
    const { option } = await iList('\n🚩 Que usuario desea eliminar? 🚩', choices)

    if (option === 'kill') {
        console.log('🚩 Cancelado 🚩')
        return
    }

    const deletedUser = await DB.updateOne('users', { _id: option }, { $pull: { groups: savedWorkspace._id } })
    const deletedGroup = await DB.updateOne('workspaces', { _id: savedWorkspace._id }, { $pull: { workgroup: option } })

    if (deletedGroup.acknowledged && deletedUser.acknowledged) {
        console.log('Usuario eliminado correctamente')
    } else {
        console.log('Algo ha ocurrido durante el proceso de eliminación', deletedGroup, deletedUser)
    }
}