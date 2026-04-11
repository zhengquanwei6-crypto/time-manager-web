interface PageHeaderProps {
  title: string;
  description: string;
  kicker?: string;
}

export function PageHeader({ title, description, kicker }: PageHeaderProps) {
  return (
    <header className="page-header">
      {kicker ? <p className="page-kicker">{kicker}</p> : null}
      <h2 className="page-title">{title}</h2>
      <p className="page-description">{description}</p>
    </header>
  );
}
