import { Select, Translate } from 'ol/interaction'
import { Marker } from './map'
import { toLonLat } from 'ol/proj'

function getInfo (marker: Marker) {
  const info = marker.get('info')
  return info ? info.innerHTML.trim() : ''
}

function setInfo (marker: Marker, value: string) {
  const info = marker.get('info')
  info.innerHTML = value.trim()
  return info.textContent.trim().length > 0
}

export function initControls (form: HTMLFormElement, select: Select) {
  const translate = new Translate({
    features: select.getFeatures()
  })

  const map = select.getMap()
  let marker: Marker = null

  map.addInteraction(translate)

  select.on('select', event => {
    [marker = null] = event.selected as Marker[]

    if (!marker) {
      return form.reset()
    }

    const [lon, lat] = marker.get('location')

    form.elements['name'].value = marker.get('name')
    form.elements['info'].value = getInfo(marker)
    form.elements['lon'].value = lon
    form.elements['lat'].value = lat
  })

  translate.on('translateend', event => {
    const [lon, lat] = toLonLat(event.coordinate)

    form.elements['lon'].value = lon
    form.elements['lat'].value = lat
    marker.set('location', [lon, lat])
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
      }
    }
  })
}
