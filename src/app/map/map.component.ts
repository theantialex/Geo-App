import { Component, AfterViewInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {fromLonLat, toLonLat} from 'ol/proj.js';
import { Feature, Overlay } from 'ol';
import { TitleCasePipe } from '@angular/common'
import GeoJSON from 'ol/format/GeoJSON.js';
import { TileWMS, Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { defaults } from 'ol/interaction/defaults';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import {getLength} from 'ol/sphere.js'


@Component({
  selector: 'app-map',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})

export class MapComponent implements AfterViewInit {
  map: Map | undefined;
  popup: Overlay | undefined;
  title: string = 'Not found';
  content: string = '';
  vectorSource: VectorSource;
  vectorLayer: VectorLayer<VectorSource>;
  wmsLayer: TileLayer<TileWMS>;
  wmsSetting: boolean = false;

  constructor() {
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: {
        'stroke-color': 'red',
        'stroke-width': 2,
      }
    });

    this.wmsLayer = new TileLayer({
              source: new TileWMS({
                url: "https://gitc.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi",
                params: {
                  'layers':'MODIS_Terra_L3_Land_Surface_Temp_Monthly_Day'
                },
                serverType: 'geoserver',
                transition: 0
              }),
              visible: true
    })
  }

  ngAfterViewInit(): void {
      if (typeof document != 'undefined') {

        this.map = new Map({
          interactions: defaults({ doubleClickZoom: false }),
          view: new View({
            center: fromLonLat([7.0839985, 50.7378408]), // Coordinates for Eifel Str. 20, Bonn, Germany
            zoom: 19 // Default zoom level
          }),
          layers: [
            new TileLayer({
              source: new OSM(),
            }),
            this.vectorLayer
          ],
          target: 'map'
        });

        let elem = document.getElementById('popup');
        if (elem) {
          this.popup = new Overlay({
            element: elem
          });
          this.map.addOverlay(this.popup);
        }
    
        this.map.on('click', (event) => {
          if (this.map) {
            var point = this.map.getCoordinateFromPixel(event.pixel);
            this.displayPopup(point);
            this.removeVectorLayer();
          }
        });

        this.map.on('dblclick', (event) => {
          if (this.map) {
            var point = this.map.getCoordinateFromPixel(event.pixel);
            this.refreshData(point);
          }
        });

      }
  }

  removeVectorLayer() {
    this.map?.removeLayer(this.vectorLayer);
  }

  async getInfo(coordinate: number[]) {
    const responce = await fetch('https://api.geoapify.com/v1/geocode/reverse?lon=' + coordinate[0] + '&lat=' + coordinate[1] + '&format=json&apiKey=6a72d6b8fafa4062acb947e892b30b0d')
    return responce.json();
  }

  displayPopup(coordinate: number[]): void {
      this.getInfo(toLonLat(coordinate)).then(
        (result) => { 
          this.title = result['results'][0]['result_type'];
          this.content = "Address: " + result['results'][0]['formatted'];

          if (this.popup != undefined) {
            this.popup.setPosition(coordinate);
          }
      }).catch((error) => {
        console.error('Error fetching location information:', error);
      });
  }
    
  closePopup(): void {
    if (this.popup != undefined) {
      this.popup.setPosition(undefined);
    }
  }

  getColor(feature: any) {
    let colors = ['green', 'black']
    let ind = 0;
    let geom = feature.getGeometry()
    if (geom) {
      ind = Math.round(getLength(geom)) % 2
    }
    return colors[ind];
  }


  async refreshData(coordinate: number[]) {
    let lastLocation = toLonLat(coordinate);
    let newVectorLayer = new VectorLayer({
      source: new VectorSource({
      url: 'https://api.geoapify.com/v1/isoline?lon='+ lastLocation[0] + '&lat=' + lastLocation[1] + '&type=time&mode=walk&range=200&range=500&range=1000'
            + '&apiKey=6a72d6b8fafa4062acb947e892b30b0d',
            format: new GeoJSON(),
      }),
      style:  (feature: any) => {
        return new Style({
          stroke: new Stroke({
            color: this.getColor(feature),
            width: 3,
          }),
        });
      }
    })
        
    this.map?.addLayer(newVectorLayer);
    this.vectorLayer = newVectorLayer;
  }

  toggleWMSLayerVisibility() {
    if (this.wmsSetting) {
      this.map?.removeLayer(this.wmsLayer)
    } else {
      this.map?.addLayer(this.wmsLayer)
    }
    this.wmsSetting = !this.wmsSetting;
  }
}
