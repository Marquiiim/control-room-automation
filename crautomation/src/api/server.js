const express = require('express')
const XLSX = require('xlsx')
const multer = require('multer')
const cors = require('cors')
const fs = require('fs').promises
const path = require('path')

const app = express()
const PORT = 3001

const upload = multer({ dest: 'uploads/' })

app.use(cors())
app.use(express.json())

const columns = [
    'USUARIO',
    'QTDE_ITENS',
    'QTDE_OBJETOS',
    'VOLUME',
    'TIPO'
]

app.post('/datareading', upload.single('archive'), (req, res) => {
    try {
        const { author } = req.body

        const workbook = XLSX.readFile(req.file.path)
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        const data = XLSX.utils.sheet_to_json(worksheet)

        const result = filterData(data, columns)

        res.status(200).json({
            success: true,
            message: '[SISTEMA] Consulta de dados concluída com sucesso.',
            author: author,
            ...result
        })

    } catch (error) {
        console.error(`[SISTEMA] Erro ao processar dados: ${error}`)
        res.status(500).json({
            success: false,
            error: `[SISTEMA] Erro ao processar arquivo: ${error.message}`
        })
    }
})

function filterData(data, columns) {
    if (!data || data.length === 0) {
        throw new Error('[SISTEMA] Planilha vazia ou sem dados.')
    }

    totalColumns = Object.keys(data[0] || {})

    console.log(totalColumns)
}

app.listen(PORT, () => {
    console.log(`[SERVIDOR] Servidor rodando na porta ${PORT}`)
})