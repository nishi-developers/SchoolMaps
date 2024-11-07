const SYS_VERSION = '0.1.0'
const MAP_VERSION = '0.1.0'

// バージョン情報を返す
self.addEventListener('message', (event) => {
  if (event.data.type == 'GET_VERSION') {
    event.source.postMessage({ type: 'VERSION', sys: SYS_VERSION, map: MAP_VERSION })
  }
})
