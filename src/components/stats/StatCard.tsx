interface StatCardProps {
  label: string;
  value: string | number;
  description: string;
}

export function StatCard({ label, value, description }: StatCardProps) {
  return (
    <article className="stat-card">
      <p className="stat-label">{label}</p>
      <strong className="stat-value">{value}</strong>
      <p className="stat-description">{description}</p>
    </article>
  );
}
