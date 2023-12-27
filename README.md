# GeoApp

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.0.7.

This project implements MapComponent. This Angular component integrates the OpenLayers library to create an interactive map with various features such as vector layers, WMS layers, popups, and event handling.

## Functionality

The MapComponent provides the following functionality:

- Displaying a map with initial view to the given location and a suitable zoom level.
- Fetching location information based on coordinates and displaying it in a popup when clicking on the map.
- Fetching information about 5, 10, 30 minute walking distance areas based on coordinates and displaying these GeoJSON Features with properties-based style when double clicking on the map.
- Adding WMS layer to the map for displaying data from a WMS service when clicking on a sidebar button.

## API Use

For getting location information [Geoapify Reverse Geocoding API](https://apidocs.geoapify.com/docs/geocoding/reverse-geocoding/) is used. This Reverse Geocoding API returns a well-formed complete address and its parts, like city, postcode, and street, for the latitude/longitude coordinates. 

For getting accessable areas [Geopify Isoline API](https://apidocs.geoapify.com/docs/isolines/) is used. The Isoline API is designed to calculate the accessible areas (that you can reach within a specific travel time) from a specific location. 

For getting WMS map [NASA's Global Imagery Browse Services](https://nasa-gibs.github.io/gibs-api-docs/access-basics/) are used, in particular the OGC Web Map Service (WMS). The layer that was chosen to be displayed is Land Surface Temperature (L3, Monthly, Day) that is updated monthly. Land Surface Temperature (LST) is an important indicator for understanding climate change and its impact on the environment. It provides insights into how the surface temperature of the Earth is changing over time, which is crucial for understanding the broader patterns of global warming and climate change.

## Dependencies

This component relies on the following dependencies:

- Angular: The Angular framework for building web applications.
- OpenLayers: A high-performance, feature-packed library for creating interactive maps.
- Bootstrap CSS framework: An open-source CSS framework directed at responsive, front-end web development.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.


