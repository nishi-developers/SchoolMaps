<template>
  <div>
    <div class="page">
      <h1>データ配置</h1>
      <div id="flow">
        <div class="position">
          <p class="title">File</p>
          <p class="desc">
            Nuxtのプロジェクトファイルに含まれる、オンライン編集のできない静的ファイル。
          </p>
        </div>
        <div class="process">
          <div class="arrow down clickable">
            <p class="title">FileからDraft作成</p>
            <div class="shape" />
          </div>
        </div>
        <div class="position">
          <p class="title">Draft</p>
          <p class="desc">
            管理者によるオンライン編集が可能なデータ。
          </p>
        </div>
        <div class="process">
          <div class="arrow up clickable">
            <p class="title">ReleaseからDraft作成</p>
            <div class="shape" />
          </div>
          <div class="arrow down clickable">
            <p class="title">Draftの公開</p>
            <div class="shape" />
          </div>
        </div>
        <div class="position">
          <p class="title">Release(-d/-r)</p>
          <p class="desc">
            直接のオンライン編集ができない、ユーザーに提供されるデータ。
          </p>
        </div>
        <div class="process">
          <div class="arrow down">
            <p class="title">データ配信(自動)</p>
            <div class="shape" />
          </div>
        </div>
        <div class="position">
          <p class="title">User</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
useHead({ title: 'データ配置' })
</script>
<style scoped lang="scss">
#flow {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: auto;
  gap: 10px;

  .position {
    border: 1px solid var(--MainBodyColor);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    padding: 5px;
    border-radius: 10px;
    text-align: center;

    .title {
      font-weight: bold;
      font-size: 1rem;
    }

    .desc {
      font-size: 0.8rem;
    }
  }

  .process {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: space-around;

    .arrow {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      width: 30%;
      // box-shadow: 0 0 3px 2px var(--ShadowColor);

      .title {
        position: absolute;
        text-align: center;
        background-color: color-mix(in srgb, var(--MainBaseColor) 80%, transparent);
        z-index: 1;
      }

      .shape {
        display: inline-block;
        width: 73.5px;
        height: 100px;
        background: var(--MainBodyColor);
        clip-path: polygon(0 63.2%, 28.2% 63.2%, 28.2% 0, 71.8% 0, 71.8% 63.2%, 100% 63.2%, 50% 100%);
      }

      &.down {
        p {
          top: 20%;
        }

        .shape {
          rotate: 0deg;
        }
      }

      &.up {
        p {
          bottom: 20%;
        }

        .shape {
          rotate: 180deg;
        }
      }
    }

    & .clickable {
      cursor: pointer;
      box-shadow: 0 0 5px 2px #000;
    }
  }
}
</style>