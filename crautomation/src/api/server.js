const express = require('express')
const XLSX = require('xlsx')
const multer = require('multer')
const cors = require('cors')
const fs = require('fs').promises
const path = require('path')

const app = express()
const PORT = 3001

const upload = multer({ dest: 'uploads/' })
const logPath = path.join(__dirname, './data/logs.json')

app.use(cors())
app.use(express.json())

const columns = [
    'USUARIO',
    'QTDE_ITENS',
    'QTDE_OBJETOS',
    'VOLUME',
    'TIPO'
]

app.post('/datareading', upload.single('archive'), async (req, res) => {
    try {
        const { author } = req.body

        const workbook = XLSX.readFile(req.file.path)
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        const data = XLSX.utils.sheet_to_json(worksheet)

        const result = await filterData(data, columns)

        const log = await registerLog(author, req.file.originalname)

        res.status(200).json({
            success: true,
            message: '[SISTEMA] Consulta de dados concluída com sucesso.',
            author: author,
            data: filterData,
            log: log,
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

async function filterData(data, columns) {
    if (!data || data.length === 0) {
        throw new Error('[SISTEMA] Planilha vazia ou sem dados.')
    }

    totalColumns = Object.keys(data[0] || {})

    const columnsFound = totalColumns.filter(column => {
        return columns.some(columnDesired => column.toUpperCase().includes(columnDesired))
    })

    if (columnsFound.length === 0) {
        throw new Error(`[SISTEMA] Nenhuma das colunas desejadas foram encontradas, colunas buscadas: ${columns.join(', ')}`)
    }

    const filteredData = data.map((line, index) => {
        const lineFiltered = { id: index + 1 }

        columnsFound.forEach(column => {
            lineFiltered[column] = line[column]
        });
        return lineFiltered
    })

    return filteredData
}

async function registerLog(author, archiveName) {
    try {
        const dataLog = {
            author: author,
            archive: archiveName,
            timestamp: new Date().toLocaleString('pt-BR')
        }

        const dataNow = await fs.readFile(logPath, 'utf8')
        const jsonData = JSON.parse(dataNow)

        jsonData.push(dataLog)

        await fs.writeFile(logPath, JSON.stringify(jsonData, null, 2))

    } catch (error) {
        console.log(`[SISTEMA] Erro ao registrar os logs: ${error}`)
    }
}

app.listen(PORT, () => {
    console.log(`[SERVIDOR] Servidor rodando na porta ${PORT}`)
})