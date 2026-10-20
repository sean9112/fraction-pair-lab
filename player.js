(async () => {
  const id = new URLSearchParams(location.search).get('game')
  const example = (window.PhaserExamples || []).find(item => item.id === id)
  const message = document.querySelector('#player-message')
  let failed = false
  let pendingLoads = 0
  let instance
  let muted = true
  let active = true
  const send = (type, detail = '') => {
    document.body.dataset.status = type
    if (window.parent !== window) window.parent.postMessage({ channel:'phaser-official', id, type, detail }, location.origin)
  }
  const fail = detail => {
    failed = true
    message.textContent = '載入遇到問題，請用上方重新載入按鈕再試一次'
    message.classList.add('error')
    message.hidden = false
    send('error',detail)
  }
  if (!example) { fail('無法辨識遊戲索引')
    return }
  try {
    await new Promise((resolve,reject) => {
      const engine = document.createElement('script')
      const compatibleEngines = { memory:'build/3.90.0.js', puzzle:'build/4.0.0-rc.6.js' }
      engine.src = compatibleEngines[id] ? new URL(compatibleEngines[id],document.baseURI).href : 'https://cdn.jsdelivr.net/npm/phaser@4.2.1/dist/phaser.min.js'
      engine.onload = resolve
      engine.onerror = reject
      document.head.append(engine)
    })
  } catch { fail('Phaser 引擎無法載入')
    return }
  document.title = example.game + '｜Phaser 官方範例'
  document.body.dataset.game = example.game
  document.body.dataset.version = Phaser.VERSION
  const repoRoot = document.baseURI
  const originalSetBaseURL = Phaser.Loader.LoaderPlugin.prototype.setBaseURL
  Phaser.Loader.LoaderPlugin.prototype.setBaseURL = function () {
    return originalSetBaseURL.call(this, repoRoot)
  }
  const originalStart = Phaser.Loader.LoaderPlugin.prototype.start
  Phaser.Loader.LoaderPlugin.prototype.start = function () {
    pendingLoads++
    if (!failed) send('loading')
    this.on('loaderror', file => fail('素材載入失敗：' + file.key))
    this.once('complete', () => {
      pendingLoads = Math.max(0,pendingLoads - 1)
      if (!failed && pendingLoads === 0) send('ready', 'Phaser ' + Phaser.VERSION)
    })
    return originalStart.apply(this, arguments)
  }
  const NativeGame = Phaser.Game
  Phaser.Game = class extends NativeGame {
    constructor(config) {
      super({ ...config, parent:'phaser-example', autoFocus:true,
        scale:{ ...config.scale, mode:Phaser.Scale.FIT, autoCenter:Phaser.Scale.CENTER_BOTH, width:config.width, height:config.height },
        loader:{ ...config.loader, baseURL:repoRoot },
        callbacks:{ ...config.callbacks, postBoot:game => {
          instance = game
          game.sound.mute = muted
          if (config.callbacks?.postBoot) config.callbacks.postBoot(game)
        } }
      })
      instance = this
      this.events.once('postrender', () => {
        message.hidden = !failed
        const canvas = document.querySelector('canvas')
        canvas.tabIndex = 0
        canvas.setAttribute('aria-label',example.game + ' 原版遊戲')
        canvas.addEventListener('pointerdown', () => {
          canvas.focus({preventScroll:true})
        })
        canvas.addEventListener('contextmenu', event => event.preventDefault())
        if (!failed && pendingLoads === 0) send('ready','Phaser ' + Phaser.VERSION)
        if (!active) this.loop.sleep()
      })
    }
  }
  window.addEventListener('message',event => {
    if (event.origin !== location.origin || event.source !== window.parent || event.data?.channel !== 'phaser-control') return
    if (event.data.type === 'audio') {
      muted = event.data.muted
      if (instance?.sound) instance.sound.mute = muted
    }
    if (event.data.type === 'active') {
      active = event.data.active
      if (!instance?.loop) return
      if (active) instance.loop.wake(true)
      else instance.loop.sleep()
      if (instance.sound) instance.sound.mute = !active || muted
    }
  })
  window.addEventListener('error',event => fail(event.message || '遊戲執行錯誤'))
  window.addEventListener('unhandledrejection',event => fail(String(event.reason?.message || event.reason || '遊戲載入錯誤')))
  if (id === 'memory') window.go = []
  const script = document.createElement('script')
  if (example.module) script.type = 'module'
  script.src = new URL('src/games/' + example.entry,repoRoot).href
  script.onerror = () => fail('無法讀取 repo 中的遊戲入口')
  document.head.append(script)
})()
