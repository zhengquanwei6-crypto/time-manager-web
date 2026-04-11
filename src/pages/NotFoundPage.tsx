import { Link } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';

export function NotFoundPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="页面不存在"
        description="你访问的页面不存在，请检查地址是否正确，或返回主要页面继续使用。"
      />

      <section className="panel">
        <h3 className="section-title">返回首页</h3>
        <p className="section-description">
          你可以点击下方按钮回到任务仪表盘，继续安排今天的工作。
        </p>
        <Link className="button button-primary inline-link-button" to="/">
          回到任务仪表盘
        </Link>
      </section>
    </div>
  );
}
