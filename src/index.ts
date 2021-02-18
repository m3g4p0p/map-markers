import './index.css'
import { initMarkerMap } from './map'
import { Marker } from './marker'
import { filterObject } from './util'

function getLocation (element: HTMLElement) {
  return [
    Number(element.dataset.lon),
    Number(element.dataset.lat)
  ]
}

function getColor (element: HTMLElement) {
  return filterObject({
    primary: element.dataset.colorPrimary,
    secondary: element.dataset.colorSecondary
  }, (key, value) => value)
}

const params = new URLSearchParams(window.location.search)
const markerParam = params.get('markers')
const isViewMode = (window.parent !== window) || params.has('noedit')
const target = document.getElementById('map')

function getViewParam (prop: string, viewDefault: string) {
  return params.get(prop) || (isViewMode ? viewDefault : '')
}

Object.assign(target.style, {
  width: getViewParam('width', '100vw'),
  height: getViewParam('height', '100vh')
})

const markers = markerParam
  ? JSON.parse(markerParam)
  : Array.from(
    document.querySelectorAll<HTMLTemplateElement>('.marker'),
    template => ({
      location: getLocation(template),
      color: getColor(template),
      name: template.content.querySelector('.name')?.textContent,
      info: template.content.querySelector('.info')?.cloneNode(true)
    })
  )

const { markerLayer, markerSelect } = initMarkerMap(target, markers)
const map = markerSelect.getMap()
const view = map.getView()

markerSelect.on('select', event => {
  const [current] = event.selected as Marker[]

  event.selected.forEach((marker: Marker) => {
    marker.showInfo(map)
  })

  event.deselected.forEach((marker: Marker) => {
    marker.hideInfo(map)
  })

  if (current && !current.hasInfo) {
    view.animate({
      center: current.get('geometry').getCoordinates(),
      duration: 200
    })
  }
})

if (!isViewMode) {
  import('./controlpanel').then(({ initControls }) => {
    const controlForm = document.getElementById('controls')

    controlForm.style.display = ''
    initControls(controlForm as HTMLFormElement, markerLayer, markerSelect)
  }).catch(console.error)
} else {
  window.addEventListener('keydown', event => {
    if (event.key === 'Enter' && event.ctrlKey) {
      params.delete('noedit')
      window.location.search = `?${params}`
    }
  })
}
