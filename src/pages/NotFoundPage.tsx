import { Link } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';

export function NotFoundPage() {
  return (
    <div className="page-stack">
      <PageHeader
        title="页面不存在"
        description="你访问的页面不存在，请检查地址是否正确。"
      />

      <section className="panel">
        <h3 className="section-title">返回首页</h3>
        <p className="section-description">
          你可以点击下方按钮回到任务总览页面。
        </p>
        <Link className="button button-primary inline-link-button" to="/">
          回到任务总览
        </Link>
      </section>
    </div>
  );
}
