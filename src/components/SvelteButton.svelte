<!-- svelte-ignore options_missing_custom_element -->
<svelte:options customElement="svelte-button" />
<script lang="ts">
  export let label: string = 'Click me';
  export let onClick: () => void = () => {};

  let count: number = 0;

  const handleClick = () => {
    count++;
    onClick();
  };
</script>

<button on:click={handleClick}>
  {label} (Svelte count: {count})
</button>

<style>
  button {
    padding: 8px 16px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
    transition: transform 0.2s;
  }

  button:hover {
    transform: scale(1.05);
  }

  button:active {
    transform: scale(0.95);
  }
</style>
