export default function Marco({ children }) {
  return (
    <main className="desktop">
      <div className="flex min-h-dvh items-center justify-center">
        <section className="window">
          <div className="titlebar" aria-hidden="true">
            <span className="title-button">
              <span className="mark-min" />
            </span>
            <span className="title-button">
              <span className="mark-max" />
            </span>
            <span className="title-button">
              <span className="mark-close" />
            </span>
          </div>

          <div className="panel flex flex-col">{children}</div>
        </section>
      </div>
    </main>
  )
}
