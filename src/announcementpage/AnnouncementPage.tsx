import { useEffect, useState } from 'react';
import './announcement.css';
import AppHeader from '../components/AppHeader';
import { getUser } from '../store/appAuth';
import { canSendAnnouncement } from '../store/accessControl';
import {
  sendAnnouncementWithOptions,
  getAnnouncementHistory,
  type AnnouncementTarget,
  type AnnouncementType,
  type AnnouncementRecord,
} from '../store/notificationStore';

const TYPE_OPTIONS: { value: AnnouncementType; label: string; icon: string }[] = [
  { value: 'GENERAL', label: '일반 공지', icon: '📢' },
  { value: 'URGENT',  label: '긴급 공지', icon: '🚨' },
  { value: 'SYSTEM',  label: '시스템 안내', icon: '⚙️' },
  { value: 'EVENT',   label: '이벤트', icon: '🎉' },
];

const TARGET_OPTIONS: { value: AnnouncementTarget; label: string }[] = [
  { value: 'ALL',              label: '전체' },
  { value: 'ROLE_USER',        label: '보호자만' },
  { value: 'ROLE_FREELANCER',  label: '헬퍼만' },
];

const TYPE_LABEL: Record<AnnouncementType, string> = {
  GENERAL: '일반',
  URGENT:  '긴급',
  SYSTEM:  '시스템',
  EVENT:   '이벤트',
};

const TARGET_LABEL: Record<AnnouncementTarget, string> = {
  ALL:             '전체',
  ROLE_USER:       '보호자',
  ROLE_FREELANCER: '헬퍼',
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

export default function AnnouncementPage() {
  const [annType, setAnnType] = useState<AnnouncementType>('GENERAL');
  const [target, setTarget] = useState<AnnouncementTarget>('ALL');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [scheduleMode, setScheduleMode] = useState<'now' | 'later'>('now');
  const [scheduledAt, setScheduledAt] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'ok' | 'error'>('ok');
  const [history, setHistory] = useState<AnnouncementRecord[]>([]);

  useEffect(() => {
    const user = getUser();
    if (!user || !canSendAnnouncement(user)) {
      window.location.href = '/error?code=403';
      return;
    }
    setHistory(getAnnouncementHistory());
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback('');

    const user = getUser();
    if (!user || !canSendAnnouncement(user)) return;

    const trimTitle = title.trim();
    const trimMessage = message.trim();
    if (!trimTitle || !trimMessage) {
      setFeedback('제목과 내용을 모두 입력해주세요.');
      setFeedbackType('error');
      return;
    }
    if (scheduleMode === 'later' && !scheduledAt) {
      setFeedback('예약 발송 시간을 선택해주세요.');
      setFeedbackType('error');
      return;
    }

    const count = sendAnnouncementWithOptions(
      user.name,
      user.email,
      trimTitle,
      trimMessage,
      target,
      annType,
      scheduleMode === 'later' ? scheduledAt : undefined,
    );

    setTitle('');
    setMessage('');
    setScheduledAt('');
    setScheduleMode('now');
    setHistory(getAnnouncementHistory());

    if (scheduleMode === 'later') {
      setFeedback('예약 발송이 등록되었습니다.');
    } else {
      setFeedback(count > 0 ? `${count}명에게 발송되었습니다.` : '발송 대상이 없습니다.');
    }
    setFeedbackType('ok');
  }

  return (
    <div className="ann-page">
      <AppHeader activePage="announcement" />

      <main className="ann-content">
        <div className="ann-page-head">
          <p className="ann-page-eyebrow">Admin · System Notice</p>
          <h1 className="ann-page-title">공지 발송</h1>
          <p className="ann-page-sub">발송 대상과 공지 유형을 선택하고 공지를 작성하세요.</p>
        </div>

        <div className="ann-grid">
          {/* ── 작성 폼 ── */}
          <div className="ann-card">
            <h2 className="ann-card-title">새 공지 작성</h2>

            <form onSubmit={handleSubmit} style={{ display: 'contents' }}>
              <div className="ann-option-group">
                <span className="ann-option-label">공지 유형</span>
                <div className="ann-option-row">
                  {TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`ann-option-btn type--${opt.value.toLowerCase()}${annType === opt.value ? ' selected' : ''}`}
                      onClick={() => setAnnType(opt.value)}
                    >
                      <span>{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ann-option-group">
                <span className="ann-option-label">발송 대상</span>
                <div className="ann-option-row">
                  {TARGET_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`ann-option-btn${target === opt.value ? ' selected' : ''}`}
                      onClick={() => setTarget(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ann-field">
                <label htmlFor="ann-title">제목</label>
                <input
                  id="ann-title"
                  className="ann-input"
                  type="text"
                  placeholder="공지 제목을 입력하세요"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setFeedback(''); }}
                  required
                />
              </div>

              <div className="ann-field">
                <label htmlFor="ann-message">내용</label>
                <textarea
                  id="ann-message"
                  className="ann-textarea"
                  placeholder="공지 내용을 입력하세요."
                  rows={6}
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); setFeedback(''); }}
                  required
                />
              </div>

              <div className="ann-option-group">
                <span className="ann-option-label">발송 시간</span>
                <div className="ann-schedule-row">
                  <button
                    type="button"
                    className={`ann-radio-btn${scheduleMode === 'now' ? ' selected' : ''}`}
                    onClick={() => setScheduleMode('now')}
                  >
                    즉시 발송
                  </button>
                  <button
                    type="button"
                    className={`ann-radio-btn${scheduleMode === 'later' ? ' selected' : ''}`}
                    onClick={() => setScheduleMode('later')}
                  >
                    예약 발송
                  </button>
                </div>
                {scheduleMode === 'later' && (
                  <div className="ann-datetime-wrap">
                    <input
                      type="datetime-local"
                      className="ann-datetime"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="ann-submit-row">
                <button type="submit" className="ann-submit-btn">
                  {scheduleMode === 'later' ? '예약 등록' : '발송하기'}
                </button>
                {feedback && (
                  <p className={`ann-feedback${feedbackType === 'error' ? ' ann-feedback--error' : ''}`}>
                    {feedback}
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* ── 발송 내역 ── */}
          <div className="ann-card">
            <h2 className="ann-card-title">발송 내역</h2>
            {history.length === 0 ? (
              <p className="ann-empty">발송된 공지가 없습니다.</p>
            ) : (
              <ul className="ann-history-list">
                {history.map((record) => (
                  <li key={record.id} className="ann-history-item">
                    <div className="ann-history-top">
                      <span className={`ann-type-badge ann-type-badge--${record.announcementType.toLowerCase()}`}>
                        {TYPE_LABEL[record.announcementType]}
                      </span>
                      <span className="ann-target-badge">
                        {TARGET_LABEL[record.target]}
                      </span>
                      {record.scheduled && (
                        <span className="ann-scheduled-badge">예약</span>
                      )}
                      <span className="ann-history-date">{formatDate(record.sentAt)}</span>
                    </div>
                    <div className="ann-history-title">{record.title}</div>
                    <p className="ann-history-msg">{record.message}</p>
                    <div className="ann-history-footer">
                      <span>발송자: {record.senderName}</span>
                      {!record.scheduled && (
                        <span className="ann-recipient-count">{record.recipientCount}명 수신</span>
                      )}
                      {record.scheduled && record.scheduledAt && (
                        <span>예약 시간: {formatDate(record.scheduledAt)}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
