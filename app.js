(() => {
  const links = [...document.querySelectorAll('.mechanic-link')]
  const sections = [...document.querySelectorAll('.mechanic-section')]
  let expanded = null
  const control = (shell,type,extra = {}) => shell.querySelector('iframe').contentWindow?.postMessage({channel:'phaser-control',type,...extra},location.origin)
  const isExpanded = shell => document.fullscreenElement === shell || shell.classList.contains('is-expanded')
  const load = shell => {
    const frame = shell.querySelector('iframe')
    if (frame.getAttribute('src')) return
    frame.src = frame.dataset.src
    shell.querySelector('.embed-status').textContent = '正在載入遊戲與素材'
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const shell = entry.target.querySelector('.game-shell')
      if (entry.isIntersecting) load(shell)
      control(shell,'active',{active:entry.isIntersecting || isExpanded(shell)})
    })
  },{rootMargin:'180px',threshold:0})
  sections.forEach(section => observer.observe(section))
  const activate = () => {
    let selected = 0
    sections.forEach((section,i) => { if (section.getBoundingClientRect().top < innerHeight*0.48) selected = i })
    links.forEach((link,i) => {
      link.classList.toggle('active',i === selected)
      if (i === selected) link.setAttribute('aria-current','location')
      else link.removeAttribute('aria-current')
    })
  }
  let ticking = false
  window.addEventListener('scroll',() => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => { activate()
      ticking = false })
  },{passive:true})
  activate()
  window.addEventListener('message',event => {
    if (event.origin !== location.origin || event.data?.channel !== 'phaser-official') return
    const shell = document.querySelector('.game-shell[data-example="' + event.data.id + '"]')
    if (!shell || event.source !== shell.querySelector('iframe').contentWindow) return
    const status = shell.querySelector('.embed-status')
    shell.dataset.status = event.data.type
    status.textContent = event.data.type === 'error' ? '載入遇到問題，可重新載入或獨立開啟遊戲' : event.data.type === 'ready' ? '遊戲已載入，可直接遊玩　' + event.data.detail : '正在載入遊戲與素材'
    if (event.data.type === 'ready') {
      const rect = shell.getBoundingClientRect()
      control(shell,'active',{active:isExpanded(shell) || rect.bottom > -180 && rect.top < innerHeight+180})
    }
  })
  const setFullscreenLabel = (shell,isFull) => {
    const button = shell.querySelector('[data-action="fullscreen"]')
    button.textContent = isFull ? '退出全螢幕 ⛶' : '全螢幕 ⛶'
    button.setAttribute('aria-pressed',String(isFull))
  }
  const exitExpanded = () => {
    if (!expanded) return
    expanded.classList.remove('is-expanded')
    setFullscreenLabel(expanded,false)
    expanded = null
    document.body.classList.remove('game-expanded')
  }
  document.querySelectorAll('.game-shell').forEach(shell => {
    shell.querySelector('[data-action="reload"]').addEventListener('click',() => {
      load(shell)
      shell.dataset.status = 'loading'
      shell.querySelector('.embed-status').textContent = '正在重新載入遊戲'
      const frame = shell.querySelector('iframe')
      frame.src = frame.dataset.src
      shell.querySelector('[data-action="audio"]').textContent = '開啟聲音'
      shell.querySelector('[data-action="audio"]').setAttribute('aria-pressed','false')
    })
    shell.querySelector('[data-action="audio"]').addEventListener('click',event => {
      const button = event.currentTarget
      const mute = button.getAttribute('aria-pressed') === 'true'
      document.querySelectorAll('.game-shell').forEach(other => {
        if (other === shell) return
        control(other,'audio',{muted:true})
        const otherButton = other.querySelector('[data-action="audio"]')
        otherButton.textContent = '開啟聲音'
        otherButton.setAttribute('aria-pressed','false')
      })
      control(shell,'audio',{muted:mute})
      button.textContent = mute ? '開啟聲音' : '關閉聲音'
      button.setAttribute('aria-pressed',String(!mute))
    })
    shell.querySelector('[data-action="fullscreen"]').addEventListener('click',async () => {
      load(shell)
      if (document.fullscreenElement) { await document.exitFullscreen()
        return }
      if (expanded === shell) { exitExpanded()
        return }
      try {
        if (!shell.requestFullscreen) throw new Error('使用視窗放大模式')
        await shell.requestFullscreen()
      } catch {
        exitExpanded()
        expanded = shell
        shell.classList.add('is-expanded')
        document.body.classList.add('game-expanded')
        setFullscreenLabel(shell,true)
      }
      control(shell,'active',{active:true})
    })
  })
  document.addEventListener('fullscreenchange',() => document.querySelectorAll('.game-shell').forEach(shell => {
    setFullscreenLabel(shell,document.fullscreenElement === shell)
    const rect = shell.getBoundingClientRect()
    control(shell,'active',{active:isExpanded(shell) || rect.bottom > 0 && rect.top < innerHeight})
  }))
  document.addEventListener('keydown',event => { if (event.key === 'Escape') exitExpanded() })
  window.addEventListener('message',event => { if (event.origin === location.origin && event.data?.channel === 'phaser-exit') exitExpanded() })
  document.querySelectorAll('#navigation .nav-link').forEach(link => link.addEventListener('click',() => {
    const nav = document.querySelector('#navigation')
    if (window.bootstrap && nav.classList.contains('show')) bootstrap.Collapse.getOrCreateInstance(nav).hide()
  }))
})()
