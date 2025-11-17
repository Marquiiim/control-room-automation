import { useState } from 'react'
import axios from 'axios'
import styles from './sass/App.module.css'
import Mateus from './images/grupo-mateus.svg'

function App() {
  const [openDashboard, setOpenDashboard] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const archive = e.target.elements.archive.files[0]

      const formData = new FormData()
      formData.append('archive', archive)

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
      alert(`${errorMessage}", leia as regras e tente novamente.`)
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
          <h3>
            Se atente as regras antes de importar o arquivo para o sistema!
          </h3>
        </div>
        <ul className={styles.system_rules}>
          <li>
            Selecione um arquivo nos formatos: .xlsx, .xls ou .csv - formatos compatíveis com Excel.
          </li>
          <li>
            Verifique se o arquivo contém dados - arquivos vazios não podem ser processados.
          </li>
          <li>
            Verifique se já há uma dashboard aberta em outra aba antes de abrir mais uma.
          </li>
        </ul>
        <form onSubmit={handleSubmit}>
          <div>
            <input type='file'
              className={styles.file}
              name='archive'
              accept='.xlsx, .xls, .csv'
              required
            />
          </div>
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
