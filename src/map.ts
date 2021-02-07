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

function createInfoElement (innerHTML = '') {
  return Object.assign(
    document.createElement('div'),
    { className: 'info', innerHTML }
  )
}

export class Marker extends Feature {
  private popup: Overlay = null

  constructor ({ name, location, info = null, infoHTML = '' }) {
    super({
      type: GeometryType.POINT,
      geometry: new Point(fromLonLat(location)),
      name
    })

    this.set('location', location)
    this.set('info', info || createInfoElement(infoHTML))
    this.on('propertychange', this.handleChange)
    this.popup = this.initPopup()
  }

  public showInfo (map: Map) {
    if (this.popup.getElement().innerHTML.trim()) {
      map.addOverlay(this.popup)
    }
  }

  public hideInfo (map: Map) {
    map.removeOverlay(this.popup)
  }

  public toggleInfo (map: Map, value: boolean) {
    return value ? this.showInfo(map) : this.hideInfo(map)
  }

  private initPopup () {
    if (this.popup) {
      this.popup.dispose()
    }

    return new Overlay({
      element: this.get('info'),
      position: fromLonLat(this.get('location')),
      positioning: 'center-left' as OverlayPositioning,
      offset: [20, 0]
    })
  }

  private handleChange = event => {
    switch (event.key) {
      case 'location':
        this.popup.setPosition(fromLonLat(this.get('location')))
        break

      case 'info':
        this.popup.setElement(this.get('info'))
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

export function initMarkerMap (target: HTMLElement, markers: any[]) {
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
