function Home() {
  return (
    <main className="home-page">
      <div className="home-wrapper">
        <section className="hero-panel">
          <span className="eyebrow">Sistema de Agendamento</span>
          <h1 className="hero-title">Base pronta para evoluir seu agendador de aulas.</h1>
          <p className="hero-description">
            O frontend foi iniciado com React + Vite, organizado por páginas,
            rotas, serviços, hooks, contexts e utils. A rota inicial já está
            configurada em <code>/</code>.
          </p>

          <div className="badge-list">
            <span className="badge">React</span>
            <span className="badge">Vite</span>
            <span className="badge">React Router</span>
          </div>
        </section>

        <section className="info-grid">
          <article className="info-card">
            <h2>Frontend</h2>
            <p>
              Estrutura preparada para crescimento com rota principal ativa e
              página Home simples.
            </p>
          </article>

          <article className="info-card">
            <h2>Backend</h2>
            <p>
              API Express com <code>cors</code>, <code>express.json()</code> e
              endpoint <code>GET /</code> retornando <code>API running</code>.
            </p>
          </article>

          <article className="info-card">
            <h2>Próximos passos</h2>
            <ul className="stack-list">
              <li>Adicionar regras de negócio de agendamento.</li>
              <li>Conectar o frontend à API.</li>
              <li>Definir persistência de dados quando necessário.</li>
            </ul>
          </article>
        </section>
      </div>
    </main>
  )
}

export default Home
