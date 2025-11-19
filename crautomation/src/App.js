import { useState } from 'react'
import axios from 'axios'
import styles from './sass/App.module.css'
import Mateus from './images/grupo-mateus.svg'

function App() {
  const [openDashboard, setOpenDashboard] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const base_archive = e.target.elements.base_archive.files[0]
      const performance_archive = e.target.elements.performance_archive.files[0]

      const formData = new FormData()
      formData.append('base_archive', base_archive)
      formData.append('performance_archive', performance_archive)

      const response = await axios.post('http://localhost:3001/datareading', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
      )

      if (response?.data && response?.data.success === true) {
        localStorage.removeItem('dashboardData')
        localStorage.setItem('dashboardData', JSON.stringify(response.data))

        alert('[SISTEMA] Dados enviados com sucesso.')
        setOpenDashboard(true)

        e.target.reset()
      }

    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message
      alert(`${errorMessage}, leia as regras e tente novamente.`)
      setOpenDashboard(false)
    }
  }

  return (
    <section className={styles.container}>
      <div className={styles.content}>
        <div className={styles.title}>
          <img src={Mateus} alt='Logo Grupo Mateus' />
          <h1>
            Ranking de produtividade - Sala de Controle
          </h1>
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="base_archive">
            <span>
              Arquivo da base
            </span>
            <input type='file'
              className={styles.file}
              name='base_archive'
              accept='.xlsx, .xls, .csv'
              required
            />
          </label>

          <label htmlFor="performance_archive">
            <span>
              Arquivo de performance
            </span>
            <input type='file'
              className={styles.file}
              name='performance_archive'
              accept='.xlsx, .xls, .csv'
              required
            />
          </label>

          <button type='submit' className={styles.report_submission}>
            Enviar para Dashboard
          </button>

          {openDashboard &&
            <button
              className={styles.view_dashboard}
              onClick={(e) => {
                e.preventDefault()
                window.open('/dashboard')
              }}>
              Abrir Dashboard
            </button>
          }

        </form>
      </div>
    </section>
  );
}

export default App;
