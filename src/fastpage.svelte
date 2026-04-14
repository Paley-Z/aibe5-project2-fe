<script>
  export let title = "Svelte 영역";
</script>

<div style="border: 2px solid #ff3e00; padding: 20px; border-radius: 10px; margin: 10px;">
  <h2 style="color: #ff3e00;">{title}</h2>
  <p>이곳은 Svelte가 직접 제어하는 고성능 구역입니다.</p>
  <button on:click={() => alert('Svelte가 반응합니다!')}>
    클릭해봐!
  </button>
</div>