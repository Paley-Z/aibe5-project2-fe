import { useState, useEffect } from 'react';
import './aimatch.css';
import AppHeader from '../components/AppHeader';
import { FREELANCERS } from '../store/appFreelancerStore';
import type { Freelancer } from '../store/appFreelancerStore';
import { getUser } from '../store/appAuth';
import { makeConvId, registerConversation, CHAT_OPEN_EVENT } from '../store/chatStore';
import type { Conversation } from '../store/chatStore';

// ── Types ──

interface RegionSelection {
  city: string;
  district: string;
  dong: string;
}

interface MatchForm {
  service: string;
  region: RegionSelection;
  timeSlot: string;
}

interface ScoredFreelancer {
  freelancer: Freelancer;
  score: number;
  matchReasons: string[];
  reHireRate: number;
}

// ── Region data ──

const REGION_DATA: Record<string, Record<string, string[]>> = {
  '서울특별시': {
    '강남구': ['역삼동', '삼성동', '논현동', '청담동', '개포동', '대치동', '도곡동', '수서동'],
    '서초구': ['서초동', '반포동', '잠원동', '방배동', '양재동', '내곡동'],
    '송파구': ['잠실동', '가락동', '문정동', '방이동', '오금동', '마천동'],
    '강동구': ['천호동', '성내동', '길동', '둔촌동', '암사동', '고덕동'],
    '마포구': ['합정동', '상수동', '연남동', '서교동', '망원동', '성산동', '상암동', '공덕동'],
    '서대문구': ['신촌동', '홍제동', '연희동', '북가좌동', '남가좌동', '천연동'],
    '은평구': ['불광동', '갈현동', '구산동', '역촌동', '녹번동', '응암동', '진관동'],
    '용산구': ['이태원동', '한남동', '후암동', '원효로동', '청파동', '효창동'],
    '중구': ['명동', '을지로동', '충무로동', '신당동', '황학동', '회현동'],
    '종로구': ['삼청동', '통인동', '창신동', '숭인동', '평창동', '부암동', '청운동'],
    '강서구': ['화곡동', '방화동', '마곡동', '등촌동', '염창동', '개화동'],
    '양천구': ['목동', '신정동', '신월동'],
    '영등포구': ['여의도동', '영등포동', '당산동', '문래동', '양평동', '도림동'],
    '동작구': ['사당동', '대방동', '노량진동', '상도동', '신대방동', '흑석동'],
    '관악구': ['신림동', '봉천동', '남현동', '낙성대동'],
    '성동구': ['왕십리동', '금호동', '옥수동', '행당동', '마장동', '성수동'],
    '광진구': ['구의동', '광장동', '중곡동', '화양동', '자양동', '건대입구동'],
    '동대문구': ['장안동', '답십리동', '전농동', '이문동', '회기동', '청량리동'],
    '중랑구': ['중화동', '묵동', '상봉동', '면목동', '신내동', '망우동'],
    '성북구': ['성북동', '삼선동', '안암동', '길음동', '종암동', '월곡동'],
    '강북구': ['번동', '수유동', '미아동', '우이동'],
    '도봉구': ['쌍문동', '방학동', '창동', '도봉동'],
    '노원구': ['상계동', '중계동', '하계동', '공릉동', '월계동'],
    '강남구(전체)': [],
  },
  '경기도': {
    '성남시 분당구': ['정자동', '서현동', '이매동', '야탑동', '수내동', '판교동'],
    '성남시 수정구': ['신흥동', '태평동', '수진동', '단대동'],
    '성남시 중원구': ['성남동', '하대원동', '도촌동'],
    '수원시 영통구': ['영통동', '매탄동', '원천동', '망포동'],
    '수원시 팔달구': ['인계동', '매산동', '지동', '화서동'],
    '고양시 일산동구': ['마두동', '정발산동', '장항동', '식사동'],
    '고양시 일산서구': ['주엽동', '대화동', '탄현동'],
    '용인시 수지구': ['죽전동', '동천동', '고기동', '상현동'],
    '부천시': ['중동', '상동', '원미동', '소사동'],
    '안양시 동안구': ['평촌동', '비산동', '호계동', '관양동'],
    '화성시': ['동탄동', '병점동', '봉담동', '향남읍'],
    '남양주시': ['다산동', '별내동', '퇴계원읍', '오남읍'],
  },
  '인천광역시': {
    '연수구': ['연수동', '청학동', '선학동', '송도동', '옥련동'],
    '남동구': ['구월동', '간석동', '만수동', '논현동'],
    '부평구': ['부평동', '십정동', '산곡동', '갈산동'],
    '미추홀구': ['주안동', '도화동', '용현동', '학익동'],
    '서구': ['청라동', '검단동', '가좌동', '석남동'],
    '계양구': ['계산동', '효성동', '작전동', '귤현동'],
  },
  '부산광역시': {
    '해운대구': ['우동', '중동', '좌동', '반여동', '반송동'],
    '수영구': ['수영동', '광안동', '망미동', '민락동'],
    '남구': ['대연동', '용호동', '용당동', '문현동'],
    '부산진구': ['전포동', '부전동', '범전동', '양정동'],
    '동래구': ['온천동', '명륜동', '낙민동', '수안동'],
    '강서구': ['명지동', '강동동', '눌차동'],
  },
  '대구광역시': {
    '수성구': ['범어동', '만촌동', '황금동', '수성동'],
    '중구': ['동인동', '삼덕동', '남산동', '대봉동'],
    '달서구': ['월성동', '상인동', '도원동', '죽전동'],
    '북구': ['칠성동', '복현동', '산격동', '검단동'],
  },
};

const CITIES = Object.keys(REGION_DATA);

// ── Constants ──

const SERVICE_TYPES = [
  { label: '병원 동행', icon: '🏥' },
  { label: '외출 보조', icon: '🚶' },
  { label: '생활 지원', icon: '🏠' },
  { label: '관공서 업무', icon: '🏛️' },
];

const TIME_SLOTS = ['평일 오전', '평일 오후', '주말 오전', '주말 오후'];

const LOADING_STEPS = [
  { label: '조건 필터 적용 중...', doneLabel: '조건 필터 완료', delay: 0 },
  { label: '유사 클라이언트 패턴 분석 중...', doneLabel: '협업 필터링 완료', delay: 1200 },
  { label: '프로필 유사도 계산 중...', doneLabel: '임베딩 매칭 완료', delay: 2500 },
  { label: '최적 순위 결정 중...', doneLabel: '매칭 완료!', delay: 3800 },
];

// ── Scoring ──

function normalizeCity(city: string): string {
  return city.replace('특별시', '').replace('광역시', '').replace('도', '').trim();
}

function matchesRegion(availableRegions: string[], region: RegionSelection): boolean {
  if (!region.city) return false;
  const cityShort = normalizeCity(region.city);
  return availableRegions.some(r => {
    if (r.includes('전지역')) return r.startsWith(cityShort);
    if (!region.district) return r.startsWith(cityShort);
    // district may contain city prefix like "성남시 분당구" → check substring
    return r.startsWith(cityShort) && (
      r.includes(region.district) ||
      region.district.split(' ').every(part => r.includes(part))
    );
  });
}

function matchesTime(availableHours: string, timeSlot: string): boolean {
  if (availableHours.includes('주 7일')) return true;
  if (timeSlot.startsWith('평일') && (availableHours.includes('평일') || availableHours.includes('주중'))) return true;
  if (timeSlot.startsWith('주말') && availableHours.includes('주말')) return true;
  return false;
}

function regionLabel(region: RegionSelection): string {
  const parts = [region.district];
  if (region.dong && region.dong !== '전체') parts.push(region.dong);
  return parts.filter(Boolean).join(' ');
}

function scoreFreelancer(f: Freelancer, form: MatchForm): ScoredFreelancer {
  const ratingScore   = f.rating * 12;
  const verifiedScore = f.verified ? 15 : 0;
  const skillScore    = Math.min(f.skills.filter(s => s === form.service).length * 5, 15);
  const regionScore   = matchesRegion(f.availableRegions, form.region) ? 10 : 0;
  const timeScore     = matchesTime(f.availableHours, form.timeSlot) ? 5 : 0;
  const expScore      = f.projectCount >= 30 ? 5 : f.projectCount >= 15 ? 3 : 1;

  const raw   = ratingScore + verifiedScore + skillScore + regionScore + timeScore + expScore;
  const score = Math.min(Math.round((raw / 110) * 100), 100);

  const reasons: string[] = [];
  if (regionScore > 0) reasons.push(`${regionLabel(form.region) || form.region.city} 활동`);
  if (skillScore  > 0) reasons.push(`${form.service} 전문가`);
  if (f.rating >= 4.9) reasons.push(`평점 ${f.rating.toFixed(1)}`);
  if (f.verified)      reasons.push('신원 인증');
  if (f.projectCount >= 30) reasons.push(`${f.projectCount}건 경험`);

  const reHireRate = Math.min(Math.round(60 + (f.reviewCount / Math.max(f.projectCount, 1)) * 40), 97);
  return { freelancer: f, score, matchReasons: reasons, reHireRate };
}

function rankFreelancers(form: MatchForm): ScoredFreelancer[] {
  return [...FREELANCERS].map(f => scoreFreelancer(f, form)).sort((a, b) => b.score - a.score);
}

// ── Score ring ──

function ScoreRing({ score }: { score: number }) {
  const r = 26, circ = 2 * Math.PI * r;
  return (
    <svg className="am-score-ring" width="68" height="68" viewBox="0 0 68 68">
      <circle cx="34" cy="34" r={r} fill="none" stroke="var(--line-color)" strokeWidth="5" />
      <circle
        cx="34" cy="34" r={r} fill="none"
        stroke="var(--green-accent)" strokeWidth="5"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - score / 100)}
        strokeLinecap="round" transform="rotate(-90 34 34)" className="am-score-arc"
      />
      <text x="34" y="36" textAnchor="middle" className="am-score-text">{score}</text>
      <text x="34" y="48" textAnchor="middle" className="am-score-pct">%</text>
    </svg>
  );
}

// ── Region selector sub-component ──

function RegionSelector({
  value,
  onChange,
}: {
  value: RegionSelection;
  onChange: (r: RegionSelection) => void;
}) {
  const districts = value.city ? Object.keys(REGION_DATA[value.city] ?? {}) : [];
  const dongs     = value.district ? REGION_DATA[value.city]?.[value.district] ?? [] : [];

  function selectCity(city: string) {
    onChange({ city, district: '', dong: '' });
  }
  function selectDistrict(district: string) {
    onChange({ ...value, district, dong: '' });
  }
  function selectDong(dong: string) {
    onChange({ ...value, dong });
  }

  return (
    <div className="am-region-selector">
      {/* 시/도 */}
      <div className="am-region-level">
        <div className="am-region-level-label">시 / 도</div>
        <div className="am-chip-group">
          {CITIES.map(c => (
            <button
              key={c}
              className={`am-chip ${value.city === c ? 'selected' : ''}`}
              onClick={() => selectCity(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* 시군구 */}
      {value.city && (
        <div className="am-region-level">
          <div className="am-region-level-label">시 / 군 / 구</div>
          <div className="am-chip-group">
            {districts.map(d => (
              <button
                key={d}
                className={`am-chip ${value.district === d ? 'selected' : ''}`}
                onClick={() => selectDistrict(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 동/읍면리 */}
      {value.district && dongs.length > 0 && (
        <div className="am-region-level">
          <div className="am-region-level-label">동 / 읍 / 면</div>
          <div className="am-chip-group">
            <button
              className={`am-chip ${value.dong === '전체' || value.dong === '' ? 'selected' : ''}`}
              onClick={() => selectDong('전체')}
            >
              전체
            </button>
            {dongs.map(d => (
              <button
                key={d}
                className={`am-chip ${value.dong === d ? 'selected' : ''}`}
                onClick={() => selectDong(d)}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main ──

const EMPTY_REGION: RegionSelection = { city: '', district: '', dong: '' };

export default function AiMatchPage() {
  const [step, setStep]             = useState<1 | 2 | 3>(1);
  const [form, setForm]             = useState<MatchForm>({ service: '', region: EMPTY_REGION, timeSlot: '' });
  const [results, setResults]       = useState<ScoredFreelancer[]>([]);
  const [loadingIdx, setLoadingIdx] = useState(-1);
  const [doneSteps, setDoneSteps]   = useState<Set<number>>(new Set());
  const user = getUser();

  useEffect(() => {
    if (step !== 2) return;
    setLoadingIdx(0);
    setDoneSteps(new Set());
    const timers: ReturnType<typeof setTimeout>[] = [];
    LOADING_STEPS.forEach((s, i) => {
      timers.push(setTimeout(() => setLoadingIdx(i), s.delay));
      const markDoneAt = LOADING_STEPS[i + 1]?.delay ?? 4300;
      timers.push(setTimeout(() => setDoneSteps(prev => new Set([...prev, i])), markDoneAt - 80));
    });
    timers.push(setTimeout(() => { setResults(rankFreelancers(form)); setStep(3); }, 4500));
    return () => timers.forEach(clearTimeout);
  }, [step]);

  const canStart = !!(form.service && form.region.city && form.region.district && form.timeSlot);

  function handleReset() {
    setStep(1);
    setForm({ service: '', region: EMPTY_REGION, timeSlot: '' });
    setDoneSteps(new Set());
    setLoadingIdx(-1);
  }

  function handleStartChat(f: Freelancer) {
    if (!user) return;
    const conv: Conversation = {
      id: makeConvId(user.email, f.id),
      userEmail: user.email,
      userName: user.name,
      freelancerId: f.id,
      freelancerName: f.name,
      freelancerEmail: f.accountEmail ?? '',
    };
    registerConversation(conv);
    window.dispatchEvent(new CustomEvent(CHAT_OPEN_EVENT, { detail: conv }));
  }

  const selectedRegionText = [
    form.region.city,
    form.region.district,
    form.region.dong && form.region.dong !== '전체' ? form.region.dong : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="am-page">
      <AppHeader activePage="freelancers" />
      <main className="am-content">

        {/* ── Step 1 ── */}
        {step === 1 && (
          <>
            <div className="am-page-title">
              <h1>AI 헬퍼 매칭</h1>
              <p>조건을 입력하면 AI가 가장 적합한 헬퍼를 추천해드립니다.</p>
            </div>

            <div className="am-section">
              <div className="am-section-label">어떤 서비스가 필요하신가요?</div>
              <div className="am-service-grid">
                {SERVICE_TYPES.map(s => (
                  <button
                    key={s.label}
                    className={`am-service-card ${form.service === s.label ? 'selected' : ''}`}
                    onClick={() => setForm(f => ({ ...f, service: s.label }))}
                  >
                    <span className="am-service-icon">{s.icon}</span>
                    <span className="am-service-label">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="am-section">
              <div className="am-section-label">
                어느 지역에서 활동하는 헬퍼를 원하시나요?
                {form.region.district && (
                  <span className="am-region-breadcrumb">
                    {selectedRegionText}
                  </span>
                )}
              </div>
              <RegionSelector
                value={form.region}
                onChange={r => setForm(f => ({ ...f, region: r }))}
              />
            </div>

            <div className="am-section">
              <div className="am-section-label">선호하는 시간대를 선택해주세요.</div>
              <div className="am-chip-group">
                {TIME_SLOTS.map(t => (
                  <button
                    key={t}
                    className={`am-chip ${form.timeSlot === t ? 'selected' : ''}`}
                    onClick={() => setForm(f => ({ ...f, timeSlot: t }))}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <button className="am-start-btn" onClick={() => setStep(2)} disabled={!canStart}>
              AI 매칭 시작
            </button>
          </>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <div className="am-loading-wrap">
            <div className="am-spinner" />
            <p className="am-loading-title">AI가 최적의 헬퍼를 찾고 있습니다</p>
            <ul className="am-step-list">
              {LOADING_STEPS.map((s, i) => {
                const isDone   = doneSteps.has(i);
                const isActive = loadingIdx === i && !isDone;
                return (
                  <li key={i} className={`am-step-item ${isDone ? 'done' : isActive ? 'active' : 'pending'}`}>
                    <span className="am-step-icon">{isDone ? '✓' : isActive ? '⏳' : '○'}</span>
                    <span>{isDone ? s.doneLabel : s.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* ── Step 3 ── */}
        {step === 3 && (
          <>
            <div className="am-result-header">
              <div>
                <h2 className="am-result-title">매칭 결과</h2>
                <p className="am-result-subtitle">
                  {results.length}명 분석 완료 · {form.service} · {selectedRegionText} · {form.timeSlot}
                </p>
              </div>
              <button className="am-reset-btn" onClick={handleReset}>다시 검색</button>
            </div>

            <div className="am-result-list">
              {results.map((r, rank) => (
                <div key={r.freelancer.id} className="am-result-card">
                  <div className="am-card-top">
                    <ScoreRing score={r.score} />
                    <div className="am-card-photo-wrap">
                      {r.freelancer.photo
                        ? <img src={r.freelancer.photo} alt={r.freelancer.name} className="am-card-photo" />
                        : <div className="am-card-photo-fallback">{r.freelancer.name[0]}</div>
                      }
                    </div>
                    <div className="am-card-info">
                      <div className="am-card-name-row">
                        {rank === 0 && <span className="am-rank-badge">AI 추천</span>}
                        <span className="am-card-name">{r.freelancer.name}</span>
                        {r.freelancer.verified && <span className="am-verified-dot">✦ 인증</span>}
                      </div>
                      <div className="am-badge-row">
                        <span className="am-stat-chip">재고용률 {r.reHireRate}%</span>
                        <span className="am-stat-chip">완료 {r.freelancer.projectCount}건</span>
                        <span className="am-stat-chip">★ {r.freelancer.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  {r.matchReasons.length > 0 && (
                    <div className="am-reasons">
                      {r.matchReasons.map(reason => (
                        <span key={reason} className="am-reason-tag">{reason}</span>
                      ))}
                    </div>
                  )}

                  <div className="am-card-actions">
                    {user?.role === 'ROLE_USER' && (
                      <button className="am-btn-chat" onClick={() => handleStartChat(r.freelancer)}>
                        채팅하기
                      </button>
                    )}
                    <button
                      className="am-btn-profile"
                      onClick={() => window.location.href = `/freelancers/${r.freelancer.id}`}
                    >
                      프로필 보기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </main>
    </div>
  );
}
