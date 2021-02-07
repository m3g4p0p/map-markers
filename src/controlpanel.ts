import { Select, Translate } from 'ol/interaction'
import { Marker } from './map'
import { toLonLat } from 'ol/proj'
import { SelectEvent, SelectEventType } from 'ol/interaction/Select'
import VectorLayer from 'ol/layer/Vector'

const SELECT = 'select' as SelectEventType

function getInfo (marker: Marker) {
  const info = marker.get('info')
  return info ? info.innerHTML : ''
}

function setInfo (marker: Marker, value: string) {
  const info = marker.get('info')
  info.innerHTML = value
  return value.trim().length > 0
}

function setLocation (marker, form) {
  const lon = Number(form.elements['lon'].value)
  const lat = Number(form.elements['lat'].value)

  marker.set('location', [lon, lat])
}

export function initControls (form: HTMLFormElement, select: Select) {
  const addButton = form.elements['add-marker'] as HTMLButtonElement
  const removeButton = form.elements['remove-marker'] as HTMLButtonElement

  const translate = new Translate({
    features: select.getFeatures()
  })

  const map = select.getMap()
  let marker: Marker = null

  map.addInteraction(translate)

  select.on('select', event => {
    [marker = null] = event.selected as Marker[]

    if (!marker) {
      addButton.disabled = false
      removeButton.disabled = true

      return form.reset()
    }

    const [lon, lat] = marker.get('location')

    form.elements['name'].value = marker.get('name')
    form.elements['info'].value = getInfo(marker)
    form.elements['lon'].value = lon
    form.elements['lat'].value = lat
    addButton.disabled = true
    removeButton.disabled = false
  })

  translate.on('translateend', event => {
    const [lon, lat] = toLonLat(event.coordinate)

    form.elements['lon'].value = lon
    form.elements['lat'].value = lat
    marker.set('location', [lon, lat])
  })

  addButton.addEventListener('click', () => {
    const center = map.getView().getCenter()

    const layer = map.getLayers().getArray().find(layer =>
      layer instanceof VectorLayer) as VectorLayer

    const marker = new Marker({
      name: form.elements['name'].value,
      location: toLonLat(center),
      infoHTML: form.elements['info'].value
    })

    const event = new SelectEvent(SELECT, [marker], [], null)

    layer.getSource().addFeature(marker)
    select.dispatchEvent(event)
  })

  removeButton.addEventListener('click', () => {
    const source = select.getLayer(marker).getSource()
    const event = new SelectEvent(SELECT, [], [marker], null)

    source.removeFeature(marker)
    select.dispatchEvent(event)
  })

  form.addEventListener('input', event => {
    if (!marker) {
      return
    }

    const { name, value } = event.target as HTMLInputElement

    switch (name) {
      case 'name': {
        marker.set(name, value)
        break
      }

      case 'info': {
        const show = setInfo(marker, value)
        marker.toggleInfo(map, show)
        break
      }

      case 'lon':
      case 'lat': {
        setLocation(marker, form)
      }
    }
  })
}
