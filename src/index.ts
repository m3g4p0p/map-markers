import { initMarkerMap, Marker } from './map'
import './index.css'

function readMarkerCSV (element) {
  const lines = element.textContent.trim().split('\n')

  return lines.map(line => line.split(',').map(value => {
    const number = Number(value)
    return Number.isNaN(number) ? value : number
  }))
}

const markers = Array.from(
  document.querySelectorAll<HTMLTemplateElement>('.marker'),
  template => ({
    location: [
      Number(template.dataset.lon),
      Number(template.dataset.lat)
    ],
    name: template.content.querySelector('.name')?.textContent,
    info: template.content.querySelector('.info')?.cloneNode(true)
  })
)

const selected = document.getElementById('selected')
const { textContent: defaultText } = selected
const markerSelect = initMarkerMap(markers)
const map = markerSelect.getMap()
const view = map.getView()

markerSelect.on('select', event => {
  const [current] = event.selected

  selected.textContent = current
    ? ` ${current.get('name')}!`
    : defaultText

  event.selected.forEach((marker: Marker) => {
    marker.showInfo(map)
  })

  event.deselected.forEach((marker: Marker) => {
    marker.hideInfo(map)
  })

  if (current) {
    view.animate({
      center: current.get('geometry').getCoordinates(),
      duration: 200
    })
  }
})
