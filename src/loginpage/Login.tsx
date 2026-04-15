import { useState } from 'react';
import './login.css';
import { setUser } from '../store/auth';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    // TODO: POST /api/auth/login { email, password } 로 교체
    setUser({ name: email.split('@')[0], email });
    window.location.href = '/';
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>로그인</h1>
          <p>서비스를 이용하려면 로그인하세요</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">로그인</button>
        </form>

        <div className="login-footer">
          <span>계정이 없으신가요?</span>
          <a href="#">회원가입</a>
        </div>

        <div className="login-test-hint">
          <p>테스트 계정</p>
          <span>user@example.com</span>
          <span>password123</span>
        </div>
      </div>
    </div>
  );
}
