import './mypage.css';
import Header from '../components/Header';

export default function MyPage() {
  return (
    <div className="mypage">
      <Header activePage="mypage" />

      <main className="mypage-content">
        <div className="profile-section">
          <div className="avatar">
            <span>U</span>
          </div>
          <div className="profile-info">
            <h1 className="username">사용자 이름</h1>
            <p className="email">user@example.com</p>
          </div>
        </div>

        <div className="cards-grid">
          <div className="card">
            <h2>계정 정보</h2>
            <ul>
              <li><span>이름</span><span>홍길동</span></li>
              <li><span>이메일</span><span>user@example.com</span></li>
              <li><span>가입일</span><span>2025.01.01</span></li>
            </ul>
            <button className="btn-edit">수정하기</button>
          </div>

          <div className="card">
            <h2>이용 내역</h2>
            <ul>
              <li><span>이번 달 사용</span><span>12회</span></li>
              <li><span>총 사용</span><span>48회</span></li>
              <li><span>현재 플랜</span><span>Basic</span></li>
            </ul>
            <button className="btn-edit">플랜 변경</button>
          </div>

          <div className="card">
            <h2>보안</h2>
            <ul>
              <li><span>비밀번호</span><span>최근 변경: 30일 전</span></li>
              <li><span>2단계 인증</span><span>미설정</span></li>
            </ul>
            <button className="btn-edit">보안 설정</button>
          </div>
        </div>
      </main>
    </div>
  );
}
