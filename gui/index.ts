import './styles.scss'

void async function main() {
  const outlet = document.createElement('div')

  outlet.innerHTML = /* html */`
    <h1>Hello World</h1>
  `

  document.body.appendChild(outlet)
}()
