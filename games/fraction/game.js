const $ = id => document.getElementById(id)
const embedded = new URLSearchParams(location.search).has('embedded')
document.body.classList.toggle('embedded', embedded)
const stages = [
  {title:'看見分數', goal:'把數字分數與塗色圖形配成一對。塗色表示取出的份量。', pairs:[[1,2,1,2],[1,3,1,3],[1,4,1,4],[3,4,3,4]]},
  {title:'等值分數', goal:'分子與分母同時乘上相同的數，份量不變。找出等值的一對。', pairs:[[1,2,2,4],[1,3,2,6],[2,3,4,6],[3,4,6,8]]},
  {title:'連結小數', goal:'將圖形代表的分數，與相同數值的小數配成一對。', pairs:[[1,2,1,2],[1,4,1,4],[3,4,3,4],[1,5,1,5]]}
]
const state = {stage:0, cards:[], selected:[], matched:0, moves:0, hints:0, mistakes:0, totalMoves:0, totalHints:0, totalMistakes:0, hinting:false, locked:false}
const fraction = card => `${card.n}/${card.d}`
const equal = (a,b) => a.n * b.d === b.n * a.d
const gcd = (a,b) => b ? gcd(b,a%b) : a
const describe = card => card.type === 'decimal' ? String(card.n/card.d) : fraction(card)
let scene
function explain(a,b) {
  if (equal(a,b)) {
    if (a.type === 'decimal' || b.type === 'decimal') return `${fraction(a)} = ${fraction(b)} = ${a.n/a.d}。分子除以分母，就能把分數寫成小數。`
    if (a.d !== b.d) {
      const small = a.d < b.d ? a : b
      const large = small === a ? b : a
      return `${fraction(small)} = ${fraction(large)}。分子與分母同時乘以 ${large.d/small.d}，只是把每份再細分，總份量不變。`
    }
    return `${fraction(a)} 表示把同樣大小的整體平均分成 ${a.d} 份，取其中 ${a.n} 份。圖形與數字代表相同份量。`
  }
  const d = a.d*b.d/gcd(a.d,b.d)
  return `${describe(a)} 與 ${describe(b)} 的份量不同。換成共同分母 ${d}，分別是 ${a.n*d/a.d}/${d} 與 ${b.n*d/b.d}/${d}。請比較取出的份數，再試一次。`
}
function feedback(message) { $('feedback').textContent = message }
function sync() {
  $('pairs').textContent = `已配對 ${state.matched} / 4`
  $('moves').textContent = `翻牌回合 ${state.moves}`
  $('hints').textContent = `提示次數 ${state.hints}`
  $('hint').disabled = state.locked || state.matched === 4
  $('hint').textContent = state.hinting ? '收起提示，開始配對' : '看看提示'
  state.cards.forEach((card,i) => {
    const button = $('accessible-cards').children[i]
    const visible = card.matched || card.open || state.hinting
    button.textContent = `${i+1}${card.matched ? ' ✓' : ''}`
    button.setAttribute('aria-label',`第 ${i+1} 張${visible ? '，'+describe(card)+(card.type === 'diagram' ? ' 圖形' : '') : '，未翻開'}${card.matched ? '，已配對' : ''}`)
    button.disabled = card.matched || card.open || state.locked || state.hinting
  })
  scene?.drawCards()
}
function select(index) {
  const card = state.cards[index]
  if (state.locked || state.hinting || card.open || card.matched) return
  card.open = true
  state.selected.push(index)
  if (state.selected.length === 1) feedback(`已翻開 ${describe(card)}${card.type === 'diagram' ? ' 的圖形' : ''}，找找看哪張代表相同份量。`)
  if (state.selected.length === 2) {
    state.moves++
    const [a,b] = state.selected.map(i => state.cards[i])
    if (equal(a,b)) {
      a.matched = b.matched = true
      state.matched++
      state.selected = []
      feedback('配對成功！'+explain(a,b))
      if (state.matched === 4) {
        feedback(`本關完成！用了 ${state.moves} 回合與 ${state.hints} 次提示。${explain(a,b)}`)
        $('next').hidden = false
        $('next').textContent = state.stage === 2 ? '完成配對，挑戰理解 →' : '前往下一關 →'
      }
    } else {
      state.mistakes++
      state.locked = true
      feedback(explain(a,b))
      $('continue').hidden = false
    }
  }
  sync()
}
function startStage(index) {
  Object.assign(state,{stage:index, selected:[], matched:0, moves:0, hints:0, mistakes:0, hinting:false, locked:false})
  state.cards = stages[index].pairs.flatMap(([n,d,n2,d2]) => [
    {n,d,type:index === 2 ? 'diagram' : 'fraction',open:false,matched:false},
    {n:n2,d:d2,type:index === 2 ? 'decimal' : 'diagram',open:false,matched:false}
  ])
  for (let i = state.cards.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1))
    const card = state.cards[i]
    state.cards[i] = state.cards[j]
    state.cards[j] = card
  }
  $('stage-label').textContent = `第 ${index+1} 關 / 共三關`
  $('stage-title').textContent = stages[index].title
  $('objective').textContent = stages[index].goal
  for (let i=0; i<3; i++) $('step-'+i).classList.toggle('active', i===index)
  $('continue').hidden = $('next').hidden = $('review').hidden = true
  $('board').hidden = $('accessible-cards').hidden = false
  $('hint').hidden = $('restart').hidden = false
  $('accessible-cards').replaceChildren(...state.cards.map((card,i) => {
    const button = document.createElement('button')
    button.addEventListener('click',()=>select(i))
    return button
  }))
  feedback('翻開兩張代表相同份量的卡牌。不確定時可以看看提示，慢慢比較。')
  sync()
}
class PairScene extends Phaser.Scene {
  create() {
    scene = this
    this.drawCards()
    parent.postMessage({channel:'phaser-official',id:'memory',type:'ready',detail:'分數配對實驗室'},location.origin)
  }
  drawCards() {
    this.children.removeAll(true)
    state.cards.forEach((card,i) => {
      const x = 20+(i%4)*195
      const y = 14+Math.floor(i/4)*175
      const face = card.open || card.matched || state.hinting
      const g = this.add.graphics()
      g.fillStyle(card.matched ? 0xd4efda : face ? 0xfffcf2 : 0x185e50)
      g.fillRoundedRect(x,y,175,157,14)
      g.lineStyle(2, card.matched ? 0x5ba478 : face ? 0xb8cbb6 : 0x185e50)
      g.strokeRoundedRect(x,y,175,157,14)
      const text = (tx,ty,value,size,color='#173f39') => this.add.text(tx,ty,value,{fontFamily:'Arial, sans-serif',fontSize:size,color,fontStyle:'bold'}).setOrigin(0.5)
      text(x+18,y+18,String(i+1),13,face ? '#52746b' : '#c5e7d5')
      if (!face) {
        text(x+87,y+72,'?',45,'#c7ecd5')
        text(x+87,y+120,'FLIP TO EXPLORE',10,'#a4ceb9')
      } else if (card.type === 'diagram') {
        const left=x+18, top=y+50, width=140/card.d
        for (let k=0;k<card.d;k++) {
          g.fillStyle(k<card.n ? 0x48aa85 : 0xe6ecdf)
          g.fillRect(left+k*width,top,width-2,50)
        }
        text(x+87,y+126,`${card.n} / ${card.d}`,18)
      } else if (card.type === 'decimal') text(x+87,y+80,String(card.n/card.d),36)
      else {
        text(x+87,y+54,String(card.n),32)
        g.lineStyle(2,0x173f39)
        g.lineBetween(x+59,y+78,x+115,y+78)
        text(x+87,y+105,String(card.d),32)
      }
      if (card.matched) text(x+153,y+18,'✓',18,'#247347')
      const hit = this.add.zone(x,y,175,157).setOrigin(0).setInteractive({useHandCursor:true})
      hit.on('pointerdown',()=>select(i))
    })
  }
}
startStage(0)
const game = new Phaser.Game({type:Phaser.CANVAS,parent:'board',width:800,height:365,backgroundColor:'#fffef9',scale:{expandParent:false,mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:PairScene,audio:{noAudio:true},banner:false})
$('continue').onclick = () => {
  state.selected.forEach(i => state.cards[i].open=false)
  state.selected=[]
  state.locked=false
  $('continue').hidden=true
  feedback('試著用剛剛的線索，再找出代表相同份量的一對。')
  sync()
}
$('hint').onclick = () => {
  state.hinting = !state.hinting
  if (state.hinting) {
    state.hints++
    state.selected.forEach(i => state.cards[i].open=false)
    state.selected=[]
  }
  feedback(state.hinting ? '觀察每張牌的份量與位置。提示期間不能配對，準備好後請收起提示。' : '提示已收起，選擇兩張卡開始配對。')
  sync()
}
$('restart').onclick = () => startStage(state.stage)
$('next').onclick = () => {
  state.totalMoves += state.moves
  state.totalHints += state.hints
  state.totalMistakes += state.mistakes
  if (state.stage < 2) startStage(state.stage+1)
  else showReview()
}
function showReview() {
  $('next').hidden = $('hint').hidden = $('restart').hidden = true
  $('board').hidden = $('accessible-cards').hidden = true
  $('review').hidden = false
  feedback(`三關完成，共 ${state.totalMoves} 回合、${state.totalHints} 次提示、${state.totalMistakes} 次不相等的比較。接下來看看是否理解了份量。`)
  const questions = [
    {q:'把一個整體平均分成 4 份，取其中 3 份，應寫成什麼？',options:['4/3','3/4','1/4'],answer:1,reason:'分母 4 是等分的總份數，分子 3 是取出的份數。'},
    {q:'哪個分數和 2/3 一樣多？',options:['2/6','3/4','4/6'],answer:2,reason:'2/3 的分子與分母同乘 2，就得到 4/6，份量不變。'},
    {q:'1/4 對應哪個小數？',options:['0.25','0.4','0.75'],answer:0,reason:'1 ÷ 4 = 0.25，四個 0.25 合起來剛好是 1。'}
  ]
  let completed=0, firstTry=0
  $('summary').textContent=''
  $('questions').replaceChildren(...questions.map((q,i)=>{
    const wrap=document.createElement('div')
    wrap.className='question'
    const heading=document.createElement('h3')
    heading.textContent=`${i+1}. ${q.q}`
    wrap.append(heading)
    const response=document.createElement('p')
    response.setAttribute('aria-live','polite')
    let attempts=0
    const buttons=q.options.map((option,j)=>{
      const button=document.createElement('button')
      button.className='btn secondary'
      button.textContent=option
      button.onclick=()=>{
        attempts++
        if (j===q.answer) {
          completed++
          if (attempts===1) firstTry++
          response.textContent='答對了！'+q.reason
          buttons.forEach(b=>b.disabled=true)
          if (completed===3) $('summary').textContent=`概念挑戰完成！首次答對 ${firstTry} / 3 題。請試著向別人說明：為什麼 1/2 與 2/4 一樣多？`
        } else {
          response.textContent='再想一想。'+q.reason+' 你可以再選一次。'
          button.disabled=true
        }
      }
      wrap.append(button)
      return button
    })
    wrap.append(response)
    return wrap
  }))
}
$('again').onclick=()=>{
  state.totalMoves=state.totalHints=state.totalMistakes=0
  startStage(0)
}
$('fullscreen').onclick=async()=>{
  try {
    if (document.fullscreenElement) await document.exitFullscreen()
    else await $('play').requestFullscreen()
  } catch { feedback('這個瀏覽器目前無法進入全螢幕，仍可直接遊玩。') }
}
document.addEventListener('fullscreenchange',()=> $('fullscreen').textContent=document.fullscreenElement ? '退出全螢幕 ⛶' : '全螢幕 ⛶')
window.addEventListener('message',event=>{
  if (event.source!==parent || event.origin!==location.origin || event.data?.channel!=='phaser-control') return
  if (event.data.type==='active') {
    if (event.data.active) game.loop.wake()
    else game.loop.sleep()
  }
})
