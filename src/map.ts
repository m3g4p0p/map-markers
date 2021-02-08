import 'ol/ol.css'
import { Map, View } from 'ol'
import { fromLonLat } from 'ol/proj'
import { Select } from 'ol/interaction'
import { click } from 'ol/events/condition'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import OSM from 'ol/source/OSM'
import { Marker, markerStyle } from './marker'

export function initMarkerMap (target: HTMLElement, markers: any[]) {
  const center = markers.length
    ? markers[0].location
    : [Math.random() * 180, Math.random() * 90]

  const map = new Map({
    target,
    layers: [
      new TileLayer({
        source: new OSM()
      })
    ],
    view: new View({
      center: fromLonLat(center),
      zoom: markers.length ? 15 : 5
    })
  })

  const markerLayer = new VectorLayer({
    source: new VectorSource({
      features: markers.map(data => new Marker(data))
    }),
    style: feature => markerStyle(feature)
  })

  const markerSelect = new Select({
    condition: click,
    style: feature => markerStyle(feature, true)
  })

  map.addLayer(markerLayer)
  map.addInteraction(markerSelect)

  return { markerLayer, markerSelect }
}
