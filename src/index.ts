import { initMarkerMap } from './map'

function readMarkerCSV (element) {
  const lines = element.textContent.trim().split('\n')

  return lines.map(line => line.split(',').map(value => {
    const number = Number(value)
    return Number.isNaN(number) ? value : number
  }))
}

const markers = readMarkerCSV(document.getElementById('markers'))
const selected = document.getElementById('selected')
const { textContent: defaultText } = selected
const markerSelect = initMarkerMap(markers)

markerSelect.on('select', event => {
  const [current] = event.selected

  selected.textContent = current
    ? ` ${current.get('name')}!`
    : defaultText

  if (current) {
    event.target.getMap().getView().animate({
      center: current.get('geometry').getCoordinates(),
      duration: 200
    })
  }
})
