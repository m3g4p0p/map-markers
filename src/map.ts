import { Feature, Map, Overlay, View } from 'ol'
import { Point } from 'ol/geom'
import { fromLonLat } from 'ol/proj'
import { Select } from 'ol/interaction'
import { click } from 'ol/events/condition'
import { Fill, Text, Circle, Stroke } from 'ol/style'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import OSM from 'ol/source/OSM'
import Style from 'ol/style/Style'
import GeometryType from 'ol/geom/GeometryType'
import OverlayPositioning from 'ol/OverlayPositioning'
import 'ol/ol.css'

export class Marker extends Feature {
  public readonly popup: Overlay = null

  constructor ({ location, name, info }) {
    super({
      type: GeometryType.POINT,
      geometry: new Point(fromLonLat(location)),
      name
    })

    if (info) {
      this.popup = new Overlay({
        element: info,
        position: fromLonLat(location),
        positioning: 'center-left' as OverlayPositioning,
        offset: [20, 0]
      })
    }
  }

  public showInfo (map: Map) {
    if (this.popup) {
      map.addOverlay(this.popup)
    }
  }

  public hideInfo (map: Map) {
    if (this.popup) {
      map.removeOverlay(this.popup)
    }
  }
}

class MarkerText extends Text {
  constructor ({ feature }) {
    super({
      text: feature.get('name'),
      textAlign: 'top',
      backgroundFill: new Fill({ color: 'white' }),
      padding: [4, 4, 4, 4],
      offsetY: 25
    })
  }
}

export function initMarkerMap (target, markers) {
  const map = new Map({
    target,
    layers: [
      new TileLayer({
        source: new OSM()
      })
    ],
    view: new View({
      center: fromLonLat(markers[0].location),
      zoom: 15
    })
  })

  const markerLayer = new VectorLayer({
    source: new VectorSource({
      features: markers.map(data => new Marker(data))
    }),
    style: feature => new Style({
      image: new Circle({
        radius: 10,
        fill: new Fill({ color: 'purple' })
      }),
      text: new MarkerText({ feature })
    })
  })

  const markerSelect = new Select({
    condition: click,
    style: feature => new Style({
      image: new Circle({
        radius: 10,
        fill: new Fill({ color: 'yellow' }),
        stroke: new Stroke({ color: 'purple', width: 3 })
      }),
      text: new MarkerText({ feature })
    })
  })

  map.addLayer(markerLayer)
  map.addInteraction(markerSelect)

  return markerSelect
}
