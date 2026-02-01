<script>
  let { size = '50px', height = '100%', width = '100%' } = $props();
</script>

<div class="loader" style="height: {height}; width: {width};">
  <div class="spinner" style="width: {size}; height: {size};"></div>
</div>

<style lang="scss">
  .loader {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid var(--primary-color, #3498db);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  }
</style>