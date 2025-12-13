<template>
  <div>
    <div class="page">
      <h1>データ配置</h1>
      <div id="content">
        <div v-if="isProcessing" id="overlay">
          <p>処理中...</p>
        </div>
        <div id="flow">
          <div class="position">
            <p class="title">File</p>
            <p class="desc">
              Nuxtのプロジェクトファイルに含まれる、オンライン編集のできない静的ファイル。
            </p>
          </div>
          <div class="process">
            <div class="arrow down clickable" @click="doDistribute('file2draft')">
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
            <div class="arrow up clickable" @click="doDistribute('draft2release')">
              <p class="title">ReleaseからDraft作成</p>
              <div class="shape" />
            </div>
            <div class="arrow down clickable" @click="doDistribute('draft2release')">
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
  </div>
</template>
<script setup lang="ts">

useHead({ title: 'データ配置' })
const isProcessing = ref(false);

type distributeAction = "file2draft" | "release2draft" | "draft2release";
function doDistribute(action: distributeAction) {
  let actionName = ''
  switch (action) {
    case 'file2draft':
      actionName = 'FileからDraft作成'
      break
    case 'release2draft':
      actionName = 'ReleaseからDraft作成'
      break
    case 'draft2release':
      actionName = 'Draftの公開'
      break
  }
  if (confirm(`本当に「${actionName}」を実行しますか?`)) {
    isProcessing.value = true
    fetch(`/api/admin/distribute/${action}`, {
      method: 'POST'
    })
      .then((res) => {
        if (res.ok) {
          alert('処理が正常に完了しました。')
        } else {
          alert('処理中にエラーが発生しました。')
        }
        isProcessing.value = false
      })
  }
}
</script>
<style scoped lang="scss">
#content {
  position: relative;
  width: 100%;

  #flow {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin: auto;
    gap: 10px;
    padding: 5px;

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
        padding: 5px;
        width: 40%;
        max-width: 180px;
        border-radius: 15px;

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

      .clickable {
        cursor: pointer;
        box-shadow: 0 0 4px 2px var(--ShadowColor);
      }

      .clickable:hover {
        box-shadow: 0 0 8px 3px var(--ShadowColor);
      }
    }
  }

  #overlay {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    z-index: 2;
    background-color: color-mix(in srgb, var(--MainBaseColor) 60%, transparent);
    display: flex;
    justify-content: center;
    align-items: center;

    p {
      font-size: 2rem;
      font-weight: bold;
    }
  }
}
</style>