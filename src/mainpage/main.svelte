<script lang="ts">
  import './main.css';
  import Header from '../components/Header.svelte';

  let video: HTMLVideoElement;
  let rafId: number;

  function handleMouseMove(e: MouseEvent) {
    if (!video?.duration) return;
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      video.currentTime = (e.clientX / window.innerWidth) * video.duration;
    });
  }
</script>

<svelte:window onmousemove={handleMouseMove} />

<div class="main-page">
  <Header activePage="home" />

  <section class="hero-section">
    <div class="hero-content">
      <div class="text-container">
        <h1 class="greeting">Hej !</h1>
        <p class="description">
          좋은 서비스로 즐겁고 편합니다. 여러가지 서비스를 서비스 것 보실 걸 합니다.
          이 여러 치매 주문을 사용해 드릴 관심이 있습니다. 이 여러 치매 주문을 사용해 주시겠어요?
        </p>
        <div class="button-group">
          <button class="btn-primary">시작하기</button>
          <button class="btn-secondary">자세히 보기</button>
        </div>
      </div>

      <div class="character-container">
        <div class="character-placeholder">
          <video bind:this={video} muted preload="auto" playsinline class="character-video">
            <source src="/stella-main.webm" type="video/webm" />
          </video>
        </div>
      </div>
    </div>
  </section>
</div>