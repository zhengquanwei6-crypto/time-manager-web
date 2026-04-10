interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="page-header">
      <p className="page-kicker">MVP 页面</p>
      <h2 className="page-title">{title}</h2>
      <p className="page-description">{description}</p>
    </header>
  );
}
