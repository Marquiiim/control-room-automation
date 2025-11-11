import { useEffect, useState } from 'react'
import { IoMdTime } from "react-icons/io";
import styles from './sass/Alternative.module.css'

function Dashboard() {
    const [data, setData] = useState(null)

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

    const filterData = data ? Object.values(data).filter(item => item.TIPO !== "TOTAL") : []

    const lojaData = data ? Object.entries(data)
        .filter(([key, value]) => value && value.TIPO && value.TIPO.startsWith('1 - Separador Loja'))
        .sort((A, B) => Number(B[1]?.QTDE_ITENS || 0) - Number(A[1]?.QTDE_ITENS || 0))
        : []

    const extData = data ? Object.entries(data)
        .filter(([key, value]) => value && value.TIPO && value.TIPO.startsWith('2 - Separador Externa'))
        .sort((A, B) => Number(B[1]?.QTDE_ITENS || 0) - Number(A[1]?.QTDE_ITENS || 0))
        : []

    return (
        <section className={styles.container}>
            <div className={styles.content}>
                <div className={styles.titles_page}>
                    <h2 className={styles.subtitle_date}>
                        <IoMdTime /> {data?.timestamp || '00/00/0000, 00:00:00'}
                    </h2>
                    <h2 className={styles.title}>
                        Produtividade separação
                    </h2>
                </div>

                <section className={styles.sep_dashboard}>
                    <div className={styles.sep_loja}>
                        <h3>Separação Loja</h3>
                        <div className={styles.list_container}>
                            <ol>
                                {lojaData.map(([index, value]) => (
                                    <div className={styles.user} key={index}>
                                        <li>{value?.USUARIO || 'N/A'}</li>
                                        <span className={styles.itens_loja}>
                                            {value?.QTDE_ITENS || 0}
                                        </span>
                                    </div>
                                ))}
                            </ol>
                        </div>
                    </div>

                    <div className={styles.sep_ext}>
                        <h3>Separação Externa</h3>
                        <div className={styles.list_container}>
                            <ol>
                                {extData.map(([key, value]) => (
                                    <div className={styles.user} key={key}>
                                        <li>{value?.USUARIO || 'N/A'}</li>
                                        <span className={styles.itens_ext}>
                                            {value?.QTDE_ITENS || 0}
                                        </span>
                                    </div>
                                ))}
                            </ol>
                        </div>

                        <div className={styles.others}>
                            <div>
                                Itens: {filterData.reduce((total, item) =>
                                    total + (Number(item.QTDE_ITENS) || 0), 0)}
                            </div>
                            <div>
                                Objetos: {filterData.reduce((total, item) =>
                                    total + (Number(item.QTDE_OBJETOS) || 0), 0)}
                            </div>
                            <div>
                                Volume: {filterData.reduce((total, item) =>
                                    total + (Number(item.VOLUME) || 0), 0).toFixed(3)}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </section>
    )
}

export default Dashboard