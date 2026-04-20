import type React from 'react';
import './index.css';
import { getUser } from './store/appAuth';
import { canAccessRoute } from './store/accessControl';
import { initTheme } from './store/theme';

initTheme();

// Mount chat widget on every page
(async () => {
  const chatRoot = document.createElement('div');
  chatRoot.id = 'chat-widget-root';
  document.body.appendChild(chatRoot);
  const { createRoot } = await import('react-dom/client');
  const { default: ChatWidget } = await import('./components/ChatWidget');
  const { StrictMode, createElement } = await import('react');
  createRoot(chatRoot).render(createElement(StrictMode, null, createElement(ChatWidget)));
})();

const path = window.location.pathname;
const user = getUser();
const routeAccess = canAccessRoute(path, user);

const reactPages: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  '/login':           () => import('./loginpage/Login'),
  '/register':        () => import('./registerpage/RegisterPage'),
  '/announcement':    () => import('./announcementpage/AnnouncementPage'),
  '/mypage':      () => import('./mypage/MyPage2'),
  '/project':     () => import('./projectpage/ProjectPage3'),
  '/freelancers': () => import('./freelancerpage/FreelancerPage'),
  '/ai-match':    () => import('./aimatchpage/AiMatchPage'),
  '/error':       () => import('./errorpage/ErrorPage'),
};

// 동적 라우팅: /freelancers/:id
const freelancerDetailMatch = path.match(/^\/freelancers\/(\d+)$/);

if (!routeAccess.allowed) {
  window.location.href = `/error?code=${routeAccess.code ?? 403}`;
} else if (freelancerDetailMatch) {
  const { createRoot } = await import('react-dom/client');
  const { default: Component } = await import('./freelancerpage/FreelancerDetailPage2');
  const { StrictMode, createElement } = await import('react');
  createRoot(document.getElementById('root')!).render(
    createElement(StrictMode, null, createElement(Component))
  );
} else if (path in reactPages) {
  const { createRoot } = await import('react-dom/client');
  const { default: Component } = await reactPages[path]();
  const { StrictMode, createElement } = await import('react');
  createRoot(document.getElementById('root')!).render(
    createElement(StrictMode, null, createElement(Component))
  );
} else if (path === '/') {
  const { mount } = await import('svelte');
  const { default: MainPage } = await import('./mainpage/main.svelte');
  mount(MainPage, { target: document.getElementById('root')! });
} else {
  window.location.href = '/error?code=404';
}
