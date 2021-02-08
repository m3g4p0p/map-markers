import { Feature, Map, Overlay } from 'ol'
import { Circle, Fill, Stroke, Style, Text } from 'ol/style'
import { Point } from 'ol/geom'
import { fromLonLat } from 'ol/proj'
import { FeatureLike } from 'ol/Feature'
import GeometryType from 'ol/geom/GeometryType'
import OverlayPositioning from 'ol/OverlayPositioning'
import { filterObject } from './util'

const COLOR_DEFAULTS = {
  primary: '#ff1493',
  secondary: '#ffff00'
}

function createInfoElement (innerHTML = '') {
  return Object.assign(
    document.createElement('div'),
    { className: 'info', innerHTML }
  )
}

export class Marker extends Feature {
  private popup: Overlay = null

  constructor ({ name, location, info = null, infoHTML = '', color = {} }) {
    super({
      type: GeometryType.POINT,
      geometry: new Point(fromLonLat(location)),
      name
    })

    this.set('location', location)
    this.set('info', info || createInfoElement(infoHTML))
    this.set('color', { ...COLOR_DEFAULTS, ...color })
    this.on('propertychange', this.handleChange)
    this.popup = this.initPopup()
  }

  public get hasInfo () {
    return this.popup.getElement().innerHTML.trim() !== ''
  }

  public showInfo (map: Map) {
    if (this.hasInfo) {
      map.addOverlay(this.popup)
    }
  }

  public hideInfo (map: Map) {
    map.removeOverlay(this.popup)
  }

  public toggleInfo (map: Map, value: boolean) {
    return value ? this.showInfo(map) : this.hideInfo(map)
  }

  public toJSON () {
    return {
      name: this.get('name'),
      location: this.get('location'),
      infoHTML: this.get('info').innerHTML,
      color: filterObject<string>(this.get('color'), (key, value) =>
        value.toLowerCase() !== COLOR_DEFAULTS[key])
    }
  }

  private initPopup () {
    if (this.popup) {
      this.popup.dispose()
    }

    return new Overlay({
      element: this.get('info'),
      position: fromLonLat(this.get('location')),
      positioning: 'center-left' as OverlayPositioning,
      offset: [20, 0],
      autoPan: {
        animation: { duration: 200 }
      }
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

export function markerStyle (feature: FeatureLike, selected = false) {
  const color = feature.get('color')

  return new Style({
    image: new Circle({
      radius: 10,
      fill: new Fill({ color: selected ? color.secondary : color.primary }),
      ...selected ? {
        stroke: new Stroke({
          color: color.primary,
          width: 3
        })
      } : {}
    }),
    text: new Text({
      text: feature.get('name'),
      textAlign: 'top',
      backgroundFill: new Fill({ color: 'white' }),
      padding: [4, 4, 4, 4],
      offsetY: 25
    })
  })
}
