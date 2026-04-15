import type React from 'react';
import './index.css';

const path = window.location.pathname;

const reactPages: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  '/login': () => import('./loginpage/Login'),
  '/mypage': () => import('./mypage/MyPage'),
};

if (path in reactPages) {
  const { createRoot } = await import('react-dom/client');
  const { default: Component } = await reactPages[path]();
  const { StrictMode, createElement } = await import('react');

  createRoot(document.getElementById('root')!).render(
    createElement(StrictMode, null, createElement(Component))
  );
} else {
  const { mount } = await import('svelte');
  const { default: MainPage } = await import('./mainpage/main.svelte');

  mount(MainPage, { target: document.getElementById('root')! });
}
