<script>
  import VerseCard from './verse/VerseCard.svelte';
  import SelectMultiple from '../ui/SelectMultiple.svelte';
  import Icon from '../ui/Icon.svelte';
  
  import { getContext } from 'svelte';
  import { methods } from '../../utils/mixin.js';
  import {
    default as bibleStructure,
    plainStructure,
  } from '../../constants/bible_structure_expected.mjs';
  import {
    progress,
  } from '../../store/progress.svelte';
  import { settings } from '../../store/settings.svelte';

  /** @type { any | object } */
  let isVerseVisible = $state(true);
  let isRestartGame = $state(false);
  let selectedPart = $state(null);

  const lxContext = getContext('lx');

  const lx = $derived(lxContext.current);
  const partsList = $derived.by(() => {
    let parts = Object.keys(bibleStructure)
    if (progress.step === 0) {
      return settings.language === 'en' ? parts : Object.keys(progress.partMapping)
    } else if (progress.step === 1) {
      return settings.language === 'en'
        ? bibleStructure[progress.currentVerse.part].map((item) => item.name)
        : Object.values(progress.bookMapping)
    } else if (progress.step === 2) {
      let bookName = progress.getBookName(progress.currentVerse.book, false);
      let chaptersCount = bibleStructure[progress.currentVerse.part].find(
        (item) => item.name === bookName
      ).chapters
      return Array.from({ length: chaptersCount }, (_, i) => i + 1)
    } else if (progress.step === 3) {
      return Array.from({ length: progress.currentVerse.versesCount }, (_, i) => i + 1)
    }
  })
  

  function handleToggleVisibility() {
    isVerseVisible = !isVerseVisible;
  }

  function checkAnswerLocal() {
    progress.checkAnswer(selectedPart);
    if (![null, 4].includes(progress.step)) {
      selectedPart = null;
    } else {
      setTimeout(() => {
        isRestartGame = true;
      }, 1000);
    }
  }

  function restartGame() {
    progress.resetProgress();
    selectedPart = null;
    isRestartGame = false;
  }

  $effect(async() => {
    await progress.fetchRandomVerse();
    await progress.fetchBookMapping();
  });
</script>

<div class="game-wrapper">
  <div class="game-card">
    <header class="game-header">
      <h2 class="title">{lx.guess_bible_verse}</h2>
      <div
        class="stats-badge"
        class:failed={progress.step === null}
        class:success={progress.step === 4}
      >
        <span class="label">{lx.your_score}:</span>
        <span class="value">{progress.score}</span>
      </div>
    </header>

    <div class="action-bar">
      <button
        class="icon-button refresh-btn"
        onclick={() => progress.fetchRandomVerse()}
        disabled={progress.isLoading}
        title={`${lx.refresh} ${lx.verse}`}
      >
        <i class="material-icons {progress.isLoading ? 'spinning' : ''}">
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
        {isVerseVisible ? `${lx.hide}` : `${lx.show}`}
        {lx.verse}
      </button>
    </div>

    <div
      class="verse-display-area"
      class:active={isVerseVisible && progress.currentVerse}
    >
      {#if isVerseVisible && progress.currentVerse}
        <div class="fade-in">
          <VerseCard verseData={progress.currentVerse} />
        </div>
      {:else if progress.isLoading}
        <div class="loader-placeholder">
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      {:else}
        <div class="empty-state">
          <i class="material-icons">menu_book</i>
          <p>
            {lx.here_will_be} {lx.verse}
          </p>
        </div>
      {/if}
    </div>

    <footer class="game-footer">
      <div class="input-group">
        <label
          for="partInput"
          class:failed={progress.step === null}
          class:success={progress.step === 4}
        >
          {#if progress.currentLevel()}
            {progress.step === 3 ? lx.which_one : lx.which}
            {lx?.[progress.currentLevel()]}?
          {:else}
            {lx.game_over}
          {/if}
        </label>
        <div class="input-wrapper">
          {#if progress.currentLevel()}
          <SelectMultiple
            title={lx.start_typing}
            array={partsList}
            value={selectedPart}
            isMultiple={false}
            closeOnSelect={true}
            setValue={(val) => selectedPart = val}
            heightLimit="250px"
            itemBackground="transparent"
          />
          {:else if progress.currentLevel() === null}
            <div>
              <span class="selected-part">{selectedPart}</span>
            </div>
          {/if}
        </div>
      </div>

      {#if isRestartGame && progress.currentLevel() === null}
        <button
          class="check-button"
          class:failed={progress.step === null}
          class:success={progress.step === 4}
          onclick={restartGame}
        >
          {progress.step === null ? lx.try : lx.start} {lx.again}
          <Icon name="refresh"/>
        </button>
      {:else}
        <button
          id="check"
          class="check-button"
          class:failed={progress.step === null}
          class:success={progress.step === 4}
          onclick={checkAnswerLocal}
          disabled={!selectedPart || progress.step === null}
        >
          {lx.check} {lx.answer}
        </button>
      {/if}
    </footer>
  </div>
</div>

<style lang="scss">
  @use 'sass:color';
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
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .stats-badge {
          background: #f0f4ff;
          padding: 8px 16px;
          border-radius: 12px;
          display: flex;
          gap: 8px;
          font-weight: 600;

          @media (prefers-color-scheme: dark) {
            background: #3730a3;
            .label {
              color: #c7d2fe;
            }
            .value {
              color: #fff;
            }
          }
          &.failed {
            background: #ff4c4c;
            .label {
              color: #fff;
            }
          }
          &.success {
            background: #4ade80;
            .label {
              color: #fff;
            }
          }

          .label {
            color: #6366f1;
            font-size: 14px;
          }
          .value {
            color: #1e1b4b;
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
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: linear-gradient(
                90deg,
                transparent,
                rgba(255, 255, 255, 0.5),
                transparent
              );
              animation: shiver 1.5s infinite;
            }
            &.short {
              width: 60%;
            }
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
            &.failed {
              color: color.adjust(#ff4c4c, $lightness: -15%);
            }
            &.success {
              color: color.adjust(#4ade80, $lightness: -15%);
            }
          }

          .input-wrapper {
            position: relative;
            .selected-part {
              background: steelblue;
              color: white;
              padding: 3px 8px 5px;
              border-radius: 12px;
            }
          }
        }

        .check-button {
          display: flex;
          justify-content: center;
          padding: 16px;
          border-radius: 14px;
          border: none;
          background: #6366f1;
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: #4f46e5;
            transform: translateY(-2px);
          }
          &:active {
            transform: translateY(0);
          }
          &:disabled {
            transform: none;
            opacity: 0.5;
            cursor: not-allowed;
          }
          &.failed {
            background: #ff4c4c;
          }
          &.success {
            background: #4ade80; //#10b981;
            &:hover {
              background: #10b981; //#059669;
            }
          }
        }
      }

      button {
        font-size: 18px;
      }

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes shiver {
        from {
          transform: translateX(-100%);
        }
        to {
          transform: translateX(100%);
        }
      }
    }
  }
</style>
