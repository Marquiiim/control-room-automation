import { useEffect, useState } from 'react'
import styles from './sass/Dashboard.module.css'

function Dashboard() {

    const [data, setData] = useState(null)
    const [warning, setWarning] = useState(false)

    const loadData = () => {
        const savedData = localStorage.getItem('dashboardData')

        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData)
                setData(parsedData)
            } catch (error) {
                alert(`[SISTEMA] Erro ao ler dados e atualizar dashboard.`)
            }
        }
    }

    useEffect(() => {
        const mainInterval = setInterval(() => {
            setWarning(true)

            setTimeout(() => {
                setWarning(false)
            }, 4000)

        }, 900000)

        return () => {
            clearInterval(mainInterval)
        }
    }, [])

    useEffect(() => {
        loadData()

        const handleStorageChange = (e) => {
            if (e.key === 'dashboardData') {
                loadData()
            }
        }

        window.addEventListener('storage', handleStorageChange)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [])

    return (
        <section className={styles.container}>
            <div className={styles.content}>
                {warning ? (
                    <div className={styles.warning}>
                        <h1 className={styles.text_warning}>
                            !!!SISTEMA DE DASHBOARD EM FASE DE TESTES!!!
                        </h1>
                    </div>
                ) : (
                    <>
                        <header className={styles.header}>
                            <h2 className={styles.title}>
                                Produtividade separação
                            </h2>
                            <h3 className={styles.subtitle_date}>
                                {data?.timestamp || '00/00/0000, 00:00:00'}
                            </h3>
                        </header>
                        <div className={styles.others}>
                            <div>
                                Itens: {data?.forDash.metrics[0].QTDE_ITENS || 0}
                            </div>
                            <div>
                                Objetos: {data?.forDash.metrics[0].QTDE_OBJETOS || 0}
                            </div>
                            <div>
                                Volume: {data?.forDash.metrics[0].VOLUME || 0}
                            </div>
                        </div>
                        <section className={styles.sep_dashboard}>
                            <div className={styles.sep_loja}>
                                <h3>
                                    Separação Loja
                                </h3>
                                <ol>
                                    {data && Object.entries(data.forDash.loja)
                                        .map(([index, value]) =>
                                        (
                                            <li key={index}>
                                                {value?.USUARIO || 'N/A'}
                                                <span className={styles.itens_loja}>
                                                    {value?.ITEMSEPARADO || 0}
                                                </span>
                                            </li>
                                        ))}
                                </ol>
                            </div>
                            <div className={styles.sep_ext}>
                                <h3>
                                    Separação Externa
                                </h3>
                                <ol>
                                    {data && Object.entries(data.forDash.externa)
                                        .map(([key, value]) => (
                                            <li key={key}>
                                                {value?.USUARIO || 'N/A'}
                                                <span className={styles.itens_ext}>
                                                    {value?.ITEMSEPARADO || 0}
                                                </span>
                                            </li>
                                        ))}
                                </ol>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </section>
    )
}

export default Dashboard