import type { FreelancerDetailResponse, FreelancerProfileUpsertRequest } from '../api/freelancers';
import type { User } from '../store/appAuth';

export type UserTab = 'account' | 'reviews' | 'reports' | 'certify';
export type AdminTab = 'dashboard' | 'freelancers' | 'projects' | 'verify' | 'reports' | 'usage-report';
export type Tab = UserTab | AdminTab;
export type AdminDataKey = 'dashboard' | 'freelancers' | 'projects' | 'verifications' | 'reviews' | 'reports';
export type AdminLoadErrors = Partial<Record<AdminDataKey, string>>;

export const ADMIN_LOAD_ERROR_MESSAGES: Record<AdminDataKey, string> = {
  dashboard: '관리자 대시보드 정보를 불러오지 못했습니다.',
  freelancers: '관리자 프리랜서 목록을 불러오지 못했습니다.',
  projects: '관리자 프로젝트 목록을 불러오지 못했습니다.',
  verifications: '관리자 인증 목록을 불러오지 못했습니다.',
  reviews: '관리자 리뷰 목록을 불러오지 못했습니다.',
  reports: '관리자 신고 목록을 불러오지 못했습니다.',
};

export interface ProfileFormState {
  name: string;
  phone: string;
  intro: string;
}

export interface FreelancerFormState {
  careerDescription: string;
  caregiverYn: boolean;
  publicYn: boolean;
  activityRegionCodes: string[];
  availableTimeSlotCodes: string[];
  projectTypeCodes: string[];
}

export const EMPTY_PROFILE_FORM: ProfileFormState = {
  name: '',
  phone: '',
  intro: '',
};

export const EMPTY_FREELANCER_FORM: FreelancerFormState = {
  careerDescription: '',
  caregiverYn: false,
  publicYn: true,
  activityRegionCodes: [],
  availableTimeSlotCodes: [],
  projectTypeCodes: [],
};

export const EMPTY_REVIEW_EDITOR = {
  rating: 5,
  tagCodes: [] as string[],
  content: '',
};

function readRequestedTab(): string | null {
  return new URLSearchParams(window.location.search).get('tab');
}

export function updateTabQuery(tab: Tab): void {
  const url = new URL(window.location.href);
  url.searchParams.set('tab', tab);
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
}

export function toFreelancerForm(profile: FreelancerDetailResponse | null): FreelancerFormState {
  if (!profile) {
    return EMPTY_FREELANCER_FORM;
  }

  return {
    careerDescription: profile.careerDescription ?? '',
    caregiverYn: profile.caregiverYn,
    publicYn: profile.publicYn,
    activityRegionCodes: profile.activityRegionCodes,
    availableTimeSlotCodes: profile.availableTimeSlotCodes,
    projectTypeCodes: profile.projectTypeCodes,
  };
}

export function toFreelancerRequest(form: FreelancerFormState): FreelancerProfileUpsertRequest {
  return {
    careerDescription: form.careerDescription.trim() || undefined,
    caregiverYn: form.caregiverYn,
    publicYn: form.publicYn,
    activityRegionCodes: form.activityRegionCodes,
    availableTimeSlotCodes: form.availableTimeSlotCodes,
    projectTypeCodes: form.projectTypeCodes,
  };
}

export function toggleSelection(values: string[], code: string): string[] {
  return values.includes(code)
    ? values.filter((value) => value !== code)
    : [...values, code];
}

export function resolveRequestedTab(user: User | null): Tab {
  const requestedTab = readRequestedTab();

  if (!user) {
    return 'account';
  }

  if (user.role === 'ROLE_ADMIN') {
    const adminTabs: AdminTab[] = ['dashboard', 'freelancers', 'projects', 'verify', 'reports', 'usage-report'];
    return requestedTab && adminTabs.includes(requestedTab as AdminTab)
      ? (requestedTab as AdminTab)
      : 'dashboard';
  }

  const userTabs: UserTab[] = user.role === 'ROLE_FREELANCER'
    ? ['account', 'reviews', 'reports', 'certify']
    : ['account', 'reviews', 'reports'];

  return requestedTab && userTabs.includes(requestedTab as UserTab)
    ? (requestedTab as UserTab)
    : 'account';
}

