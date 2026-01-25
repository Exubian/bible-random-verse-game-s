<script>
  import { methods } from '../../utils/mixin.js';
  import VerseCard from './verse/VerseCard.svelte';

  /** @type { any | object } */
  let currentVerse = $state(null);
  let isVerseVisible = $state(false);
  let isLoading = $state(false);

  /**
   * Fetches a random verse from the server.
   */
  async function fetchRandomVerse() {
    isLoading = true;
    try {
      const response = await methods.fetch('/verse').get();
      if (response?.verse) {
        currentVerse = response;
      }
    } catch (error) {
      console.error('Error fetching random verse:', error);
    } finally {
      isLoading = false;
    }
  }

  function handleToggleVisibility() {
    isVerseVisible = !isVerseVisible;
  }

  $effect(() => {
    fetchRandomVerse();
  });
</script>

<div class="game-wrapper">
  <div class="game-card">
    <header class="game-header">
      <h2 class="title">Угадай библейский стих</h2>
      <div class="stats-badge">
        <span class="label">Твои очки:</span>
        <span class="value">0</span>
      </div>
    </header>

    <div class="action-bar">
      <button
        class="icon-button refresh-btn"
        onclick={fetchRandomVerse}
        disabled={isLoading}
        title="Обновить стих"
      >
        <i class="material-icons {isLoading ? 'spinning' : ''}">
          refresh
        </i>
      </button>

      <button
        class="primary-button toggle-btn"
        onclick={handleToggleVisibility}
      >
        <i class="material-icons">
          {isVerseVisible ? 'visibility_off' : 'visibility'}
        </i>
        {isVerseVisible ? 'Скрыть стих' : 'Показать стих'}
      </button>
    </div>

    <div
      class="verse-display-area"
      class:active={isVerseVisible && currentVerse}
    >
      {#if isVerseVisible && currentVerse}
        <div class="fade-in">
          <VerseCard verseData={currentVerse} />
        </div>
      {:else if isLoading}
        <div class="loader-placeholder">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      {:else}
        <div class="empty-state">
          <i class="material-icons">menu_book</i>
          <p>Стих скрыт. Нажмите кнопку выше, чтобы увидеть текст.</p>
        </div>
      {/if}
    </div>

    <footer class="game-footer">
      <div class="input-group">
        <label for="partInput">Какая это книга?</label>
        <div class="input-wrapper">
          <input
            list="choiceBP"
            type="text"
            id="partInput"
            placeholder="Начните вводить название..."
          />
          <datalist id="choiceBP"></datalist>
        </div>
      </div>

      <button id="check" class="check-button">
        Проверить ответ
      </button>
    </footer>
  </div>
</div>

<style lang="scss">
  .game-wrapper {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 32px 16px;
    min-height: 80vh;

    .game-card {
      display: flex;
      flex-direction: column;
      background: var(--card-bg, #ffffff);
      color: var(--text-main, #333);
      width: 100%;
      max-width: 600px;
      border-radius: 24px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      padding: 32px;
      border: 1px solid rgba(0, 0, 0, 0.05);
      transition: transform 0.3s ease;

      @media (prefers-color-scheme: dark) {
        background: #2a2a2a;
        color: #eee;
        border-color: #444;
        box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
      }

      .game-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 32px;

        .title {
          font-size: 24px;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(
            135deg,
            #6366f1 0%,
            #a855f7 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .stats-badge {
          background: #f0f4ff;
          padding: 8px 16px;
          border-radius: 12px;
          display: flex;
          gap: 8px;
          font-weight: 600;

          .label { color: #6366f1; font-size: 14px; }
          .value { color: #1e1b4b; }

          @media (prefers-color-scheme: dark) {
            background: #3730a3;
            .label { color: #c7d2fe; }
            .value { color: #fff; }
          }
        }
      }

      .action-bar {
        display: flex;
        gap: 16px;
        margin-bottom: 24px;

        .icon-button {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          border: none;
          background: #f3f4f6;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;

          &:hover:not(:disabled) {
            background: #e5e7eb;
            transform: rotate(15deg);
          }
          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .material-icons.spinning {
            animation: spin 1s linear infinite;
          }

          @media (prefers-color-scheme: dark) {
            background: #3f3f3f;
            color: #fff;
            &:hover:not(:disabled) {
              background: #4f4f4f;
            }
          }
        }

        .primary-button {
          flex: 1;
          height: 48px;
          border-radius: 14px;
          border: none;
          background: #6366f1;
          color: white;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;

          &:hover {
            background: #4f46e5;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          }
          &:active {
            transform: scale(0.98);
          }
        }
      }

      .verse-display-area {
        min-height: 160px;
        background: #fafafa;
        border-radius: 16px;
        margin-bottom: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px dashed #e5e7eb;
        transition: all 0.3s ease;

        &.active {
          border-color: transparent;
          background: transparent;
        }

        @media (prefers-color-scheme: dark) {
          background: #212121;
          border-color: #333;

          &.active {
            background: transparent;
            border-color: transparent;
          }
        }

        .fade-in {
          animation: fadeIn 0.4s ease-out;
          width: 100%;
        }

        .loader-placeholder {
          width: 100%;
          padding: 32px;
          .skeleton-line {
            height: 12px;
            background: #eee;
            border-radius: 6px;
            margin-bottom: 16px;
            position: relative;
            overflow: hidden;
            &::after {
              content: "";
              position: absolute;
              top: 0; left: 0; width: 100%; height: 100%;
              background: linear-gradient(
                90deg,
                transparent,
                rgba(255,255,255,0.5),
                transparent
              );
              animation: shiver 1.5s infinite;
            }
            &.short { width: 60%; }
            @media (prefers-color-scheme: dark) {
              background: #333;
            }
          }
        }

        .empty-state {
          text-align: center;
          color: #9ca3af;
          padding: 32px;
          i {
            font-size: 48px;
            margin-bottom: 8px;
            opacity: 0.5;
          }
          p {
            font-size: 14.4px;
            margin: 0;
            max-width: 250px;
          }
        }
      }

      .game-footer {
        display: flex;
        flex-direction: column;
        gap: 24px;

        .input-group {
          display: flex;
          flex-direction: column;
          text-align: left;
          label {
            display: block;
            font-size: 13.6px;
            font-weight: 600;
            margin-bottom: 8px;
            color: #6b7280;
          }

          .input-wrapper {
            position: relative;
            input {
              width: 100%;
              padding: 12.8px 16px;
              border-radius: 12px;
              border: 2px solid #e5e7eb;
              background: white;
              font-size: 16px;
              transition: border-color 0.2s;

              &:focus {
                outline: none;
                border-color: #6366f1;
              }

              @media (prefers-color-scheme: dark) {
                background: #333;
                border-color: #444;
                color: white;
              }
            }
          }
        }

        .check-button {
          padding: 16px;
          border-radius: 14px;
          border: none;
          background: #10b981;
          color: white;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: #059669;
            transform: translateY(-2px);
          }
          &:active {
            transform: translateY(0);
          }
        }
      }

      @keyframes spin { from {
        transform: rotate(0deg);
      } to {
        transform: rotate(360deg);
      } }
      @keyframes fadeIn { from {
        opacity: 0;
        transform: translateY(10px);
      } to {
        opacity: 1;
        transform: translateY(0);
      } }
      @keyframes shiver { from {
        transform: translateX(-100%);
      } to {
        transform: translateX(100%);
      } }
    }
  }
</style>