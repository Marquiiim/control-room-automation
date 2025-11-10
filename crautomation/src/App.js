import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import styles from './sass/App.module.css'
import Mateus from './images/grupo-mateus.svg'

function App() {
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const archive = e.target.elements.archive.files[0]
      const author = e.target.elements.author.value

      const formData = new FormData()
      formData.append('archive', archive)
      formData.append('author', author)

      const response = await axios.post('http://localhost:3001/datareading', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
      )

      if (response?.data) {
        navigate('/dashboard', {
          state: { data: response.data }
        })
      }

    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message

      alert(`${errorMessage}", leia as regras e tente novamente.`)
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
            Selecione um arquivo nos formatos: .xlsx, .xls ou .csv - formatos compatíveis com Excel
          </li>
          <li>
            Verifique se o arquivo contém dados - arquivos vazios não podem ser processados.
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
            <input type='text'
              className={styles.name_input}
              name='author'
              placeholder='Autor do relatório'
              required
            >
            </input>
          </div>
          <button type='submit' className={styles.report_submission}>
            Montar Dashboard
          </button>
        </form>
      </div>
    </section>
  );
}

export default App;
