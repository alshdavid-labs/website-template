// @ts-ignore
import Worker from 'worker-loader?inline=no-fallback!./index.worker'
import './index.scss'

// @ts-ignore
const worker = new Worker()

document.getElementById('app')!.innerHTML = /* html */`
  <h1>Hello World</h1>
`