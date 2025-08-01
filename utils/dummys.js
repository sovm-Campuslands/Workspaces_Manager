export const inputSchemas = {
    password: {
        regex: /^[a-zA-Z0-9._\-*]{4,32}$/,
        error: '🚫 Contraseña inválida. Solo puede incluir . _ - *, entre 4 y 32 caracteres.'
    },
    email: {
        regex: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
        error: '📧 Correo inválido.'
    },
    name: {
        regex: /^[A-Za-zÀ-ÿ\s]{2,40}$/,
        error: '🔤 Nombre inválido.'
    },
    none: {
        regex: /.*/,
        error: '🚩 Valor invalido'
    }
}

export const fieldLabels = {
    name: '💁🏼‍♂️ Nombre',
    email: '💌 Correo',
    password: '✍🏼 Contraseña'
}
