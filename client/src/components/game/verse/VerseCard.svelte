<script>
  /**
   * @typedef {Object} VerseData
   * @property {string} verse
   * @property {string} book
   * @property {number} chapter
   * @property {number} verseNum
   */

  /** @type {{ verseData: VerseData | null }} */
  let { verseData = null } = $props();
</script>

<div class="rand-verse-card">
  {#if verseData}
    <p class="verse-text">"{verseData.verse}"</p>
    <p class="verse-reference">
      <strong>
        {verseData.book} {verseData.chapter}:{verseData.verseNum}
      </strong>
    </p>
  {/if}
</div>

<style lang="scss">
  .rand-verse-card {
    padding: 24px;
    border: 1px solid #444;
    border-radius: 12px;
    background-color: rgba(255, 255, 255, 0.05);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    text-align: center;
  }

  .verse-text {
    font-size: 21px;
    font-style: italic;
    line-height: 1.5;
    margin-bottom: 16px;
    color: var(--text-color, inherit);
  }

  .verse-reference {
    font-size: 16px;
    color: #888;
    margin: 0;
  }

  /* Support for light theme */
  @media (prefers-color-scheme: light) {
    .rand-verse-card {
      background-color: #f9f9f9;
      border-color: #ddd;
      color: #333;
    }
    .verse-reference {
      color: #666;
    }
  }
</style>