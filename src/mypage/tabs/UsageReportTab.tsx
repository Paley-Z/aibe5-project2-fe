import type { Project } from '../../store/appProjectStore';
import type { ReviewRecord } from '../../store/appReviewStore';
import type { Proposal } from '../../store/appProposalStore';
import type { Freelancer } from '../../store/appFreelancerStore';

interface Props {
  projects: Project[];
  reviews: ReviewRecord[];
  proposals: Proposal[];
  freelancers: Freelancer[];
}

const PROJECT_STATUS_LABEL: Record<string, string> = {
  REQUESTED: '요청',
  ACCEPTED: '수락됨',
  IN_PROGRESS: '진행 중',
  COMPLETED: '완료',
  CANCELLED: '취소',
};

const PROJECT_TYPE_LABEL: Record<string, string> = {
  HOSPITAL: '병원 동행',
  GOVERNMENT: '관공서',
  OUTING: '외출',
  DAILY: '일상 지원',
  OTHER: '기타',
};

const STATUS_COLOR: Record<string, string> = {
  REQUESTED: '#6c8ebf',
  ACCEPTED: '#82b366',
  IN_PROGRESS: '#d6b656',
  COMPLETED: 'var(--green-accent)',
  CANCELLED: '#666',
};

function BarRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  return (
    <div className="report-bar-row">
      <span className="report-bar-label">{label}</span>
      <div className="report-bar-track">
        <div className="report-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="report-bar-count">{count} <span className="report-bar-pct">({pct}%)</span></span>
    </div>
  );
}

export default function UsageReportTab({ projects, reviews, proposals, freelancers }: Props) {
  const totalProjects = projects.length;
  const completedProjects = projects.filter((p) => p.status === 'COMPLETED').length;
  const activeProjects = projects.filter((p) => p.status === 'IN_PROGRESS').length;

  const totalReviews = reviews.length;
  const avgRating = totalReviews === 0
    ? 0
    : reviews.reduce((s, r) => s + r.rating, 0) / totalReviews;
  const reportedReviews = reviews.filter((r) => r.reported).length;
  const blindedReviews = reviews.filter((r) => r.blinded).length;

  const totalProposals = proposals.length;
  const pendingProposals = proposals.filter((p) => p.status === 'PENDING').length;
  const acceptedProposals = proposals.filter((p) => p.status === 'ACCEPTED').length;
  const rejectedProposals = proposals.filter((p) => p.status === 'REJECTED').length;

  const verifiedFreelancers = freelancers.filter((f) => f.verified).length;

  const statusKeys: Array<Project['status']> = ['REQUESTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
  const typeKeys: Array<Project['type']> = ['HOSPITAL', 'GOVERNMENT', 'OUTING', 'DAILY', 'OTHER'];

  return (
    <div className="tab-content usage-report">
      <h2 className="report-section-title">핵심 지표</h2>
      <div className="admin-grid report-summary-grid">
        <div className="metric-card">
          <span className="metric-label">전체 프로젝트</span>
          <strong className="metric-value">{totalProjects}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">완료 프로젝트</span>
          <strong className="metric-value">{completedProjects}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">진행 중</span>
          <strong className="metric-value">{activeProjects}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">전체 리뷰</span>
          <strong className="metric-value">{totalReviews}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">평균 별점</span>
          <strong className="metric-value">{totalReviews === 0 ? '—' : avgRating.toFixed(2)}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">전체 제안</span>
          <strong className="metric-value">{totalProposals}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">검증 헬퍼</span>
          <strong className="metric-value">{verifiedFreelancers} / {freelancers.length}</strong>
        </div>
        <div className="metric-card">
          <span className="metric-label">신고·블라인드</span>
          <strong className="metric-value">{reportedReviews} / {blindedReviews}</strong>
        </div>
      </div>

      <h2 className="report-section-title">프로젝트 상태별</h2>
      <div className="report-bars-card">
        {statusKeys.map((status) => (
          <BarRow
            key={status}
            label={PROJECT_STATUS_LABEL[status]}
            count={projects.filter((p) => p.status === status).length}
            total={totalProjects}
            color={STATUS_COLOR[status]}
          />
        ))}
      </div>

      <h2 className="report-section-title">프로젝트 유형별</h2>
      <div className="report-bars-card">
        {typeKeys.map((type) => (
          <BarRow
            key={type}
            label={PROJECT_TYPE_LABEL[type]}
            count={projects.filter((p) => p.type === type).length}
            total={totalProjects}
            color="var(--green-accent)"
          />
        ))}
      </div>

      <h2 className="report-section-title">제안 현황</h2>
      <div className="report-bars-card">
        <BarRow label="대기 중" count={pendingProposals} total={totalProposals} color="#d6b656" />
        <BarRow label="수락됨" count={acceptedProposals} total={totalProposals} color="var(--green-accent)" />
        <BarRow label="거절됨" count={rejectedProposals} total={totalProposals} color="#c0392b" />
      </div>

      <h2 className="report-section-title">헬퍼 통계</h2>
      <div className="admin-list">
        {freelancers.map((f) => (
          <div key={f.id} className="admin-item">
            <div>
              <strong>{f.name}</strong>
              <p className="admin-subtext">{f.skills.join(' · ')}</p>
            </div>
            <div className="admin-item-right">
              <span className="skill-tag">{f.verified ? '검증 완료' : '미검증'}</span>
              <span className="admin-subtext">
                평점 {f.rating.toFixed(1)} · 리뷰 {f.reviewCount}개 · 프로젝트 {f.projectCount}개
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
