import { iInput, iList } from "../utils/inquirerPrompt.js"
import fs from 'fs'
import { findWorkSpace, getTasks } from "./manageWorkspaces.js"
import { exec } from 'child_process'

const template = fs.readFileSync('template.html', 'utf-8')
const folderPath = './reports'

export async function reportWorkspace() {

    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath)
    }

    const workspace = await findWorkSpace()

    if (workspace === 'kill') {
        return
    }

    const information = await getTasks(workspace)
    console.log(information)
    const write = `<header>
        <h1 class='workspaceName'>Grupo de Trabajo: <span>${workspace.name}</span></h1>
        <h2 class='workspaceDesc'>Descripción: <span>${workspace.description}</span></h2>
    </header>
    <main>
${information.map(tarea => `<section>
        <h1 class='taskName'>Tarea: ${tarea.tarea}</h1>
        <h2 class='taskDesc'>Descripción: ${tarea.description}</h2>
        <h1 class='respons'>Responsables</h1>
        <table>
            <thead>
                <tr>
                    <th>nombre</th>
                    <th>email</th>
                </tr>
            </thead>
            <tbody>
            ${tarea.responsables.map(t => `
                <tr>
                    <td>${t.name}</td>
                    <td>${t.email}</td>
                </tr>`).join('')}
            </tbody>
        </table>
        </section>
        `).join('')}
    </main>
    `
    const writer = template.replace('{{contenido}}', write)
    const path = `${folderPath}/${workspace.name}.html`

    fs.writeFileSync(path, writer)

    console.log('📄 Reporte generado y guardado con el nombre del espacio del trabajo')
    console.log('⌚ Abriendo archivo..')
    setTimeout(async () => {
        await open(path)
    }, 900);
    console.log(write)
    const a = await iInput('', 'none')
}

export async function open(ruta) {
    const comando = process.platform === 'win32'
        ? `start "" "${ruta}"`
        : process.platform === 'darwin'
            ? `open "${ruta}"`
            : `xdg-open "${ruta}"` // Linux

    exec(comando, (err) => {
        if (err) {
            console.error('❌ Error al abrir el archivo:', err)
        } else {
            console.log('🌐 Reporte abierto en el navegador.')
        }
    })
}