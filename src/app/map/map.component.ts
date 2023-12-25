import { Component, AfterViewInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import {fromLonLat} from 'ol/proj.js';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})

export class MapComponent implements AfterViewInit {
  map: Map | undefined;

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
      }
  }
}
