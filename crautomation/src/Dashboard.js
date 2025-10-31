import { useLocation } from 'react-router-dom'
import styles from './sass/Dashboard.module.css'

function Dashboard() {

    const location = useLocation()
    const data = location.state.data

    console.log(location)

    return (
        <section className={styles.container}>
            <div className={styles.content}>
                <h2 className={styles.title}>
                    Produtividade separação
                </h2>
                <section className={styles.sep_dashboard}>
                    <div className={styles.sep_loja}>
                        <h3>
                            Separação Loja
                        </h3>
                        <ol>
                            {data && (
                                <>
                                <li>
                                    Colaborador teste <span className={styles.itens_loja}>349 itens</span>
                                </li>
                                <li>
                                    Colaborador teste <span className={styles.itens_loja}>349 itens</span>
                                </li>
                                <li>
                                    Colaborador teste <span className={styles.itens_loja}>349 itens</span>
                                </li>
                                <li>
                                    Colaborador teste <span className={styles.itens_loja}>349 itens</span>
                                </li>
                                </>
                            )}
                        </ol>
                    </div>
                    <div className={styles.sep_ext}>
                        <h3>
                            Separação Externa
                        </h3>
                        <ol>
                            {data && (
                                <li>
                                    Colaborador teste <span className={styles.itens_ext}>349 itens</span>
                                </li>
                            )}
                        </ol>
                    </div>
                </section>
            </div>
        </section>
    )
}

export default Dashboard