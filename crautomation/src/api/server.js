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

async function clearUploads() {
    try {
        const uploadsDir = 'uploads/'
        const files = await fs.readdir(uploadsDir)

        await Promise.all(
            files.map(file => fs.unlink(path.join(uploadsDir, file)))
        )
    } catch (error) {
        console.log(`[SISTEMA] Erro ao limpar cache de uploads: ${error.message}`)
    }
}

app.post('/datareading', upload.single('archive'), async (req, res) => {

    let author

    try {

        if (!req.file) {
            throw new Error('Nenhum arquivo enviado.')
        }

        if (!req.body.author) {
            throw new Error('Autor não informado')
        }

        author = req.body.author
        const reportDate = new Date().toLocaleString('pt-BR')

        const workbook = XLSX.readFile(req.file.path)
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const data = XLSX.utils.sheet_to_json(worksheet)
        const result = filterData(data, columns)

        await clearUploads()

        const log = await registerLog(
            author,
            req.file.originalname,
            'success'
        )

        res.status(200).json({
            success: true,
            timestamp: reportDate,
            message: '[SISTEMA] Consulta de dados concluída com sucesso.',
            author: author,
            log: log,
            ...result
        })

    } catch (error) {
        const log = await registerLog(
            author || req.body?.author,
            req.file?.originalname,
            'error',
            error.message
        )

        res.status(500).json({
            success: false,
            error: error.message,
            log: log
        })
    }
})

function filterData(data, columns) {
    if (!data || data.length === 0) {
        throw new Error('[SISTEMA] Planilha vazia ou sem dados.')
    }

    const totalColumns = Object.keys(data[0] || {})

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

async function registerLog(author, archiveName, status, errorReason = null) {

    const dataLog = {
        status: status,
        author: author,
        archive: archiveName,
        timestamp: new Date().toLocaleString('pt-BR')
    }

    if (status === 'error' && errorReason) {
        dataLog.reason = errorReason
    }

    try {
        const dataNow = await fs.readFile(logPath, 'utf8')
        const jsonData = JSON.parse(dataNow)
        jsonData.push(dataLog)
        await fs.writeFile(logPath, JSON.stringify(jsonData, null, 2))

    } catch (error) {
        console.log(`[SISTEMA] Erro ao registrar os logs: ${error}`)
    }
    return dataLog
}


app.listen(PORT, () => {
    console.log(`[SERVIDOR] Servidor rodando na porta ${PORT}`)
})