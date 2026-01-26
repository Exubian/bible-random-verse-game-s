<script>
  import CustomDropdown from './CustomLangDropdown.svelte';

</script>

<header class="site-header">
  <div class="header-container">
    <nav class="nav-section">
      <div class="links">
        <a href="/viewer" class="nav-link">Bible</a>
        <a href="/" class="nav-link active">Game</a>
      </div>
    </nav>

    <div class="title-section">
      <h1 class="site-title">Библейская викторина</h1>
    </div>

    <div class="action-section">
      <CustomDropdown />
    </div>
  </div>
</header>

<style lang="scss">
  .site-header {
    background: #ffffff;
    height: 70px;
    display: flex;
    align-items: center;
    padding: 0 32px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    position: sticky;
    top: 0;
    z-index: 1000;

    @media (prefers-color-scheme: dark) {
      background: #2a2a2a;
      border-color: #444;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }
  }

  .header-container {
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 20px;

    @media (max-width: 768px) {
      display: flex;
      justify-content: space-between;
    }
  }

  .nav-section {
    display: flex;
    justify-content: flex-start;

    .links {
      display: flex;
      gap: 12px;
      background: #f3f4f6;
      padding: 6px;
      border-radius: 12px;

      @media (prefers-color-scheme: dark) {
        background: #3f3f3f;
      }
    }

    .nav-link {
      text-decoration: none;
      color: #6b7280;
      font-size: 14px;
      font-weight: 600;
      padding: 8px 16px;
      border-radius: 8px;
      transition: all 0.2s;

      &:hover {
        color: #4f46e5;
      }

      &.active {
        background: #ffffff;
        color: #6366f1;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

        @media (prefers-color-scheme: dark) {
          background: #555;
          color: #fff;
        }
      }

      @media (prefers-color-scheme: dark) {
        color: #bbb;
      }
    }
  }

  .title-section {
    .site-title {
      font-size: 20px;
      font-weight: 800;
      margin: 0;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      white-space: nowrap;

      @media (max-width: 600px) {
        display: none;
      }
    }
  }

  .action-section {
    display: flex;
    justify-content: flex-end;
  }
</style>