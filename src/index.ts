import { initMarkerMap, Marker } from './map'
import './index.css'

function readMarkerCSV (element) {
  const lines = element.textContent.trim().split('\n')

  return lines.map(line => line.split(',').map(value => {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? value : parsed
  }))
}

function getPixelValue (params: URLSearchParams, prop: string) {
  const value = params.get(prop)
  return value ? value + 'px' : ''
}

const params = new URLSearchParams(window.location.search)
const target = document.getElementById('map')

Object.assign(target.style, {
  width: getPixelValue(params, 'width'),
  height: getPixelValue(params, 'height')
})

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

const markerSelect = initMarkerMap(target, markers)
const map = markerSelect.getMap()
const view = map.getView()

markerSelect.on('select', event => {
  const [current] = event.selected

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

if (window.parent === window && !params.has('noedit')) {
  import('./controlpanel').then(({ initControls }) => {
    const controlForm = document.getElementById('controls')

    initControls(controlForm as HTMLFormElement, markerSelect)
    controlForm.hidden = false
  }).catch(console.error)
}
