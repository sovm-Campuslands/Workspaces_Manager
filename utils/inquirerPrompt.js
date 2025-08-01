import inquirer from "inquirer";
import { inputSchemas } from "./dummys.js";

export function buildValidator(regex, errorMessage) {
    return input => {
        if (input === '0') return true // sale papá
        return regex.test(input) ? true : errorMessage
    }
}

export async function iInput(message, validate) {
    const { regex, error } = inputSchemas[validate]
    const { value } = await inquirer.prompt([
        {
            type: 'input',
            name: 'value',
            message: `\n----------\n(0 para cancelar)\n${message}`,
            validate: buildValidator(regex, error)
        }
    ])

    return value === '0' ? null : value
}

export async function iList(title, choices) {
    const { option } = await inquirer.prompt([
        {
            type: 'list',
            name: 'option',
            message: title,
            choices
        }
    ])
    return { option }
}