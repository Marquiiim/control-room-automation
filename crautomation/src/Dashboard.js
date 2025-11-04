import { useLocation } from 'react-router-dom'
import styles from './sass/Dashboard.module.css'

function Dashboard() {

    const location = useLocation()
    const data = location.state.data

    const filterData = Object.values(data).filter(item => item.TIPO !== "TOTAL")

    return (
        <section className={styles.container}>
            <div className={styles.content}>
                <h2 className={styles.title}>
                    Produtividade separação
                </h2>
                <div className={styles.others}>
                    <div>
                        Itens: {filterData.reduce((total, item) => {
                            return total + (Number(item.QTDE_ITENS) || 0)
                        }, 0)}
                    </div>
                    <div>
                        Objetos: {filterData.reduce((total, item) => {
                            return total + (Number(item.QTDE_OBJETOS) || 0)
                        }, 0)}
                    </div>
                    <div>
                        Volume: {filterData.reduce((total, item) => {
                            return total + (Number(item.VOLUME) || 0)
                        }, 0).toFixed(3)}
                    </div>
                </div>
                <section className={styles.sep_dashboard}>
                    <div className={styles.sep_loja}>
                        <h3>
                            Separação Loja
                        </h3>
                        <ol>
                            {data && Object.entries(data)
                                .filter(([key, value]) => value.TIPO && value.TIPO.startsWith('1 - Separador Loja'))
                                .sort((A, B) => Number(B.QTDE_ITENS) - Number(A.QTDE_ITENS)
                                )
                                .map(([index, value]) =>
                                (
                                    <li key={index}>
                                        {value.USUARIO} <span className={styles.itens_loja}>{value.QTDE_ITENS}</span>
                                    </li>
                                ))}
                        </ol>
                    </div>
                    <div className={styles.sep_ext}>
                        <h3>
                            Separação Externa
                        </h3>
                        <ol>
                            {data && Object.entries(data)
                                .filter(([key, value]) => value.TIPO && value.TIPO.startsWith('2 - Separador Externa'))
                                .sort(([keyA, valueA], [keyB, valueB]) => {
                                    return Number(valueB.QTDE_ITENS) - Number(valueA.QTDE_ITENS)
                                })
                                .map(([key, value]) => (
                                    <li key={key}>
                                        {value.USUARIO} <span className={styles.itens_ext}>{value.QTDE_ITENS}</span>
                                    </li>
                                ))}
                        </ol>
                    </div>
                </section>
            </div>
        </section>
    )
}

export default Dashboard