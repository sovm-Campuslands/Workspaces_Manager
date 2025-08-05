import { Factory } from '../Entities/EntityFactory.js';
import { DB } from '../utils/db.js';
import { iList, iInput as input } from '../utils/inquirerPrompt.js';
import { findWorkSpace, getTasks, getUsersFromWorkspace } from './manageWorkspaces.js';


const priorities = [{ name: '🔴 Urgente', value: 'high' }, { name: `🔵 Ma'O'Menos'`, value: 'medium' }, { name: '😏 Suave', value: 'low' }]
const states = [{ name: '🟢 Terminado', value: 'finished' }, { name: '🔵 En Progreso', value: 'in-progress' }, { name: '⚫ Pendiente', value: 'pending' }]

async function getDate() {

    let since = 2000
    let to = 2025

    // Array.from({length}) = Papi, creame un pedazo array con estos espacios accesibles pa meterle vainas
    // Una manera de hacer un for COMO UN PEDAZO SENIOR ELEGANTE! ✍🏼
    // el callback que recibe este pedazo metodo convierte el numero que es desde el año hasta el numero de posiciones
    // y por cada uno, vuelve string la suma de la posicion por la de since.

    const years = Array.from({ length: to - since + 1 }, (value, i) => String(since + i))
    const months = Array.from({ length: 12 }, (val, i) => String(i + 1).padStart(2, '0'))
    const days = Array.from({ length: 31 }, (val, i) => String(i + 1).padStart(2, '0'))

    const diasPorMes = {
        '01': 31, '02': 28, '03': 31, '04': 30,
        '05': 31, '06': 30, '07': 31, '08': 31,
        '09': 30, '10': 31, '11': 30, '12': 31
    }

    const year = await iList('\n🗓️ Año 🗓️\n', years)
    const month = await iList('\n🗓️ Mes 🗓️\n', months)

    let day

    while (true) {
        day = await iList('\n🗓️ Día 🗓️\n', days)
        let max = diasPorMes[month]

        // Si es bisiesto jiij
        if (month === '02' && (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0))) {
            max = 29
            continue
        }

        if (Number(day) > diasPorMes[month]) {
            console.log(`🚩 El mes ${month} no tiene más de ${diasPorMes[month]} días`)
            continue
        }
        break
    }
    console.log(year.option, month.option, day.option)
    return new Date(`${year.option}-${month.option}-${day.option}`)
}

export async function createTask() {

    console.clear()

    const workspace = await findWorkSpace()
    if (workspace === 'kill') {
        console.log('🚩 Cancelado')
        return
    }

    const name = await input('💎 Nombre de la tarea: ', 'none')
    if (!name) return
    const description = await input('📃 Descripción', 'none')
    if (!description) return

    console.log('🗓️ Fecha Inicial')
    const startDate = await getDate()
    console.log('🗓️ Fecha Final')
    const endDate = await getDate()

    let status = await iList('🎏 Prioridad de la tarea', states)
    if (!status) return
    let priority = await iList('🎏 Prioridad de la tarea', priorities)
    if (!priority) return

    let usuarios = await getUsersFromWorkspace(workspace)

    let user
    if (usuarios.length <= 0) {
        console.log('🚩 Agrega usuarios para asignar esta tarea mas adelante..')
        user = 'pending assignation'
    } else {
        // sin el ? mandaria un error que extiende el capturarlo
        usuarios = usuarios[0]?.usuarios


        let choices = usuarios.map((name) => ({ name: name.name, value: name._id }))

        choices.push({ name: '⚫ Asignar Luego ⚫', value: 'none' })

        user = await iList('👦🏼 Asignación', choices)
        user = user === 'none' ? 'assign-pending' : user
    }

    status = status.option
    priority = priority.option

    const newTask = Factory.create('task', { name, description, startDate, endDate, status, priority })

    newTask.setWorkspace(workspace._id)
    console.log(user)
    newTask.addResponsable(user)

    let insertedId
    try {
        const insertedTask = await DB.insertOne('tasks', newTask)
        if (insertedTask.acknowledged) {
            console.log('🟢 Tarea Creada Correctamente 🟢\n', insertedTask)
            insertedId = insertedTask.insertedId
        }
    } catch (error) {
        console.error(error)
    }
    try {
        const addedToWorkspace = await DB.updateOne('workspaces', { _id: workspace._id }, { $push: { tasks: insertedId } })
        if (!addedToWorkspace.acknowledged) {
            console.log('🚩 Algo sucedió', addedToWorkspace)
        }
    } catch (error) {
        console.error(error)

    }
}

export async function addResponsables() {

    const savedWorkspace = await findWorkSpace()

    if (savedWorkspace === 'kill') {
        return
    }

    let choiceTask = await getTasks(savedWorkspace)

    choiceTask = choiceTask.map((element) => ({
        name: element.tarea, description: `${element.description} || Responsables: ${element.responsables.length > 0 ? element.responsables.map(e => `${e.name} (${e.email})`).join(", ") : "No Asignado"}`, value: element._id
    }))

    choiceTask.push({ name: '🚩 Cancelar 🚩', value: 'kill' })
    const task = await iList('📃 Tarea 📃', choiceTask)

    if (task.option === 'kill') {
        console.log('🚩 Cancelado.')
        return
    }

    const users = await DB.getAll('users')

    let choices = users.map((name) => ({ name: name.name, value: name._id }))
    choices.push({ name: '🚩 Cancelar 🚩', value: 'kill' })

    const user = await iList('👦🏼 Selecciona el usuario Responsable', choices)

    if (user.option === 'kill') {
        console.log('🚩 Cancelado.')
        return
    }

    try {
        const result = await DB.updateOne('tasks', { _id: task.option }, { $addToSet: { responsables: user.option } })
        if (result.modifiedCount > 0) {
            console.log('🟢 Responsable Asignado Correctamente')
        } else if (!result.acknowledged) {
            console.log('🚩 Algo Sucedió', result)
        } else {
            console.log('⚫ El usuario ya estaba asignado.')
        }
    } catch (error) {
        console.error(error)
    }

}

