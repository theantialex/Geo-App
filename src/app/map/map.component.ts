import { Component, AfterViewInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {fromLonLat, toLonLat} from 'ol/proj.js';
import { Overlay } from 'ol';
import { TitleCasePipe } from '@angular/common'

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

  ngAfterViewInit(): void {
      if (typeof document != 'undefined') {
        this.map = new Map({
          view: new View({
            center: fromLonLat([7.0839985, 50.7378408]), // Coordinates for Eifel Str. 20, Bonn, Germany
            zoom: 19 // Default zoom level
          }),
          layers: [
            new TileLayer({
              source: new OSM(),
            }),
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
          }
        });
      }
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
}
