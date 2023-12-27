import { Component, AfterViewInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj.js';
import { Overlay } from 'ol';
import { TitleCasePipe }  from '@angular/common'
import GeoJSON from 'ol/format/GeoJSON.js';
import { TileWMS, Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { defaults } from 'ol/interaction/defaults';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import { getLength } from 'ol/sphere.js'


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
  title: string = 'Not found'; // popup title
  content: string = ''; // popup content
  vectorSource: VectorSource;
  vectorLayer: VectorLayer<VectorSource>;
  wmsLayer: TileLayer<TileWMS>;
  wmsSetting: boolean = false; // initial WMS layer status (false = not visible)

  constructor() {
    this.vectorSource = new VectorSource();
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource
    });

    this.wmsLayer = new TileLayer({
      source: new TileWMS({
        url: "https://gitc.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi", // WMS map from NASA OGC Web Map Service API
        params: {
          'layers': 'MODIS_Terra_L3_Land_Surface_Temp_Monthly_Day' // Land Surface Tempreture Layer
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
        interactions: defaults({ doubleClickZoom: false }), // removing default double click event
        view: new View({
          center: fromLonLat([7.0839985, 50.7378408]), // coordinates for Eifel Str. 20, Bonn, Germany
          zoom: 19 // default zoom level
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
          var point = this.map.getCoordinateFromPixel(event.pixel); // getting click event coordinates
          this.displayPopup(point);
          this.removeVectorLayer();
        }
      });

      this.map.on('dblclick', (event) => {
        if (this.map) {
          var point = this.map?.getCoordinateFromPixel(event.pixel); // getting click event coordinates
          this.refreshData(point);
        }
      });

    }
  }

  removeVectorLayer(): void {
    this.map?.removeLayer(this.vectorLayer);
  }

  async getInfo(coordinate: number[]) {
    const responce = await fetch('https://api.geoapify.com/v1/geocode/reverse?lon=' + coordinate[0] + '&lat=' + coordinate[1] + '&format=json&apiKey=6a72d6b8fafa4062acb947e892b30b0d') // api key should be removed from public repository - it is left here for the sake of simplicity
    return responce.json();
  }

  displayPopup(coordinate: number[]): void {
    this.getInfo(toLonLat(coordinate)).then( // getting actual map coordinates from click event coordinates
      (result) => {
        this.title = result['results'][0]['result_type']; // parsing API responce
        this.content = "Address: " + result['results'][0]['formatted']; // parsing API responce
        this.popup?.setPosition(coordinate);
      
      }).catch((error) => {
        console.error('Error fetching location information:', error);
      });
  }

  closePopup(): void {
    this.popup?.setPosition(undefined);
  }

  // getting GeoJSON Feature style dynamically based on its geometry length
  getColor(feature: any): string {
    let colors = ['green', 'black'] // random example colors
    let ind = 0; // default color choice
    let geom = feature.getGeometry()
    if (geom) {
      ind = Math.round(getLength(geom)) % 2 // choosing color based on if length is even or odd
    }
    return colors[ind];
  }


  async refreshData(coordinate: number[]) {
    let lastLocation = toLonLat(coordinate); // getting actual map coordinates from click event coordinates
    let newVectorLayer = new VectorLayer({ // updating GeoJSON data from API
      source: new VectorSource({
        url: 'https://api.geoapify.com/v1/isoline?lon=' + lastLocation[0] + '&lat=' + lastLocation[1] + '&type=time&mode=walk&range=300&range=600&range=1800'
          + '&apiKey=6a72d6b8fafa4062acb947e892b30b0d',  // api key should be removed from public repository - it is left here for the sake of simplicity
        format: new GeoJSON(),
      }),
      style: (feature: any) => {
        return new Style({
          stroke: new Stroke({
            color: this.getColor(feature), // getting style dynamically
            width: 3,
          }),
        });
      }
    })

    this.map?.addLayer(newVectorLayer);
    this.vectorLayer = newVectorLayer;
    this.map?.getView().setZoom(15); // zooming out in order to see accessable areas properly
  }

  toggleWMSLayerVisibility(): void {
    if (this.wmsSetting) {
      this.map?.removeLayer(this.wmsLayer)
    } else {
      this.map?.addLayer(this.wmsLayer)
      this.map?.getView().setZoom(1); // zooming out in order to see WMS map properly
    }
    this.wmsSetting = !this.wmsSetting;
  }
}
