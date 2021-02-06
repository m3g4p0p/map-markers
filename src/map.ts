import { Feature, Map, View } from 'ol'
import { Point } from 'ol/geom'
import { fromLonLat } from 'ol/proj'
import { Select } from 'ol/interaction'
import { click } from 'ol/events/condition'
import { Fill, Icon, Text } from 'ol/style'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import OSM from 'ol/source/OSM'
import Style from 'ol/style/Style'
import GeometryType from 'ol/geom/GeometryType'
import 'ol/ol.css'

class Marker extends Feature {
  constructor ({ location, name }) {
    super({
      type: GeometryType.POINT,
      geometry: new Point(fromLonLat(location)),
      name
    })
  }
}

class MarkerText extends Text {
  constructor ({ text }) {
    super({
      text,
      textAlign: 'top',
      backgroundFill: new Fill({ color: 'white' }),
      padding: [4, 4, 4, 4],
      offsetY: 15
    })
  }
}
const markerAnchor = [0.5, 1]

export function initMarkerMap (markers) {
  const map = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new OSM()
      })
    ],
    view: new View({
      center: fromLonLat(markers[0].slice(1)),
      zoom: 15
    })
  })

  const markerLayer = new VectorLayer({
    source: new VectorSource({
      features: markers.map(([name, ...location]) => new Marker({
        location,
        name
      }))
    }),
    style: feature => new Style({
      image: new Icon({
        src: require('./marker-silver.png'),
        anchor: markerAnchor
      }),
      text: new MarkerText({ text: feature.get('name') })
    })
  })

  const markerSelect = new Select({
    condition: click,
    style: new Style({
      image: new Icon({
        src: require('./marker-pink.png'),
        anchor: markerAnchor
      }),
      text: new MarkerText({ text: 'Whooo!' })
    })
  })

  map.addLayer(markerLayer)
  map.addInteraction(markerSelect)

  return markerSelect
}
