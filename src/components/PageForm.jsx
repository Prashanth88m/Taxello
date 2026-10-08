export default function PageForm({ eyebrow, title, intro, onSubmit, children }) {
  return <main className="page-form-shell">
    <div className="page-form-heading"><span className="page-eyebrow">{eyebrow}</span><h1>{title}</h1><p>{intro}</p></div>
    <form className="page-form" onSubmit={onSubmit}>{children}</form>
  </main>;
}
