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

const performance_columns = [
    'USUARIO',
    'QTDE_ITENS',
    'QTDE_OBJETOS',
    'VOLUME',
    'TIPO'
]

const base_columns = [
    'USUARIO',
    'ITEMSEPARADO'
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

app.post('/datareading', upload.fields([
    { name: 'base_archive', maxCount: 1 },
    { name: 'performance_archive', maxCount: 1 }
]), async (req, res) => {

    let baseFile = null
    let performanceFile = null

    try {
        if (!req.files) throw new Error('Nenhum arquivo enviado')

        baseFile = req.files['base_archive']?.[0] || null
        performanceFile = req.files['performance_archive']?.[0] || null

        if (!baseFile) throw new Error('[SISTEMA] Arquivo da base não enviado')
        if (!performanceFile) throw new Error('[SISTEMA] Arquivo de performance não enviado')

        const reportDate = new Date().toLocaleString('pt-BR')

        const baseData = await workBook(baseFile)
        const performanceData = await workBook(performanceFile)

        const baseResult = filterData(baseData, base_columns, 'base')
        const performanceResult = filterData(performanceData, performance_columns, 'performance')

        await clearUploads()

        const log = await registerLog(
            `Base archive: ${baseFile?.originalname}, Performance archive: ${performanceFile?.originalname}`,
            'success'
        )

        res.status(200).json({
            success: true,
            timestamp: reportDate,
            message: '[SISTEMA] Consulta de dados concluída com sucesso.',
            log: log,
            result: {
                base: baseResult,
                performance: performanceResult
            }
        })

    } catch (error) {
        const baseFileName = baseFile?.originalname || 'Não carregado'
        const performanceFileName = performanceFile?.originalname || 'Não carregado'

        const log = await registerLog(
            `Base: ${baseFileName}, Performance: ${performanceFileName}`,
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

async function workBook(file) {
    const workbook = XLSX.readFile(file.path)
    const firstSheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[firstSheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    return data
}

async function filterData(data, columns, filetype) {

    console.log(`=== FILTER DATA ${filetype} ===`) // DEBUG
    console.log('Dados recebidos:', data.length, 'linhas') // DEBUG
    console.log('Primeira linha:', data[0]) // DEBUG

    if (!data || data.length === 0) {
        throw new Error('[SISTEMA] Planilha vazia ou sem dados')
    }

    const totalColumns = Object.keys(data[0] || {})
    console.log('Colunas totais:', totalColumns) // DEBUG

    const columnsFound = totalColumns.filter(column => {
        return columns.some(columnDesired => column.toUpperCase().includes(columnDesired))
    })

    console.log('Colunas encontradas:', columnsFound) // DEBUG

    const minColumns = filetype === 'performance' ? 3 : 1

    if (columnsFound.length === 0 || columnsFound.length < minColumns) {
        throw new Error(`[SISTEMA] O arquivo tem pendência de dados para realizar construção da dashboard, colunas buscadas: ${base_columns.join(', ')} e ${performance_columns.join(', ')}`)
    }

    const filteredData = data.map((line, index) => {
        const lineFiltered = { id: index + 1 }

        columnsFound.forEach(column => {
            lineFiltered[column] = line[column]
        });
        return lineFiltered
    })

    console.log('Dados filtrados:', filteredData.length, 'linhas') // DEBUG
    console.log('Primeira linha filtrada:', filteredData[0]) // DEBUG

    return filteredData
}

async function registerLog(archiveName, status, errorReason = null) {

    const dataLog = {
        status: status,
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