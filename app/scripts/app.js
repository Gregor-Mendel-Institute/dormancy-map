/* global google */
(function (document) {
  'use strict';

  var app = document.querySelector('#app');
  app.showSpinner = true;
  app.loaddata = true;
  app.mapLoaded = false;

  app.apiKey = 'AIzaSyB1GbyVSIOK12RJbFMkaIJjwhVNG-b8fjc';
  app.dataSources = {
    haplotype: {
      id:'1j4WGDHT4znA4OQrMNLXVH8xbFNtakHEZXYln2HiI',
      columns:['class_1','class_2','class_3','class_4','class_5','class_6','class_7','class_8'],
      colors:['#36648b','#5cacee','#cd6600','#ff7f00','#ee9a49','#d2b48c','#999999','#cccccc'],
      labels:['WD1','WD2','SD1','SD2','SD3','SD4','UD1','UD2'],
      label: 'DOG1 Haplotype'
      },
    dormancy: {
      id:'1BiFr02lzhCYVzIk6S1cnS4mF4h0mAqOunVCbfhp-',
      columns:['class_1','class_2','class_3','class_4','class_5'],
      colors:['#EE7F00','#FFA54F','#CCCCCC','#63B8FF','#4F94CD'],
      labels:['0 - 20','20 - 40','40 - 60','60 - 80',' 80 - 100'],
      label: 'Germination Rate (GR21)'
    }
  };

  app.displayInstalledToast = function () {
    // Check to make sure caching is actually enabled—it won't be in the dev environment.
    if (!document.querySelector('platinum-sw-cache').disabled) {
      document.querySelector('#caching-complete').show();
    }
  };
  app._getColors = function(route) {
    return this._getCurrentDataSource(route).colors;
  };

  app._getCurrentDataSource = function(route) {
    return this.dataSources[route];
  };

  app._getMarkers = function(response) {
    var markers = [];
    if (response === null) {
      return markers;
    }
    if (this.loaddata) {
      this.$.localstorage.value = response;
    }
    this.loaddata = false;
    var numRows = response.rows.length;
    for (var i = 0; i < numRows; i++) {
      var row = response.rows[i];
      var pieValues = [];
      var accId = row[0];
      var name = row[1];
      var lng = row[2];
      var lat = row[3];
      var coordinate = new google.maps.LatLng(lat, lng);
      var gr21 = row[5];
      for (var j = 6; j < row.length; j++) {
        pieValues.push(row[j] * 100);
      }
      var marker = document.createElement('admixture-marker');
      marker.position = coordinate;
      marker.data = pieValues;
      marker.accId = accId;
      marker.colors = this._getColors(this.route);
      marker.name = name;
      marker.gr21 = gr21;
      markers.push(marker);
    }
    this.showSpinner = false;
    return markers;
  };


  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  app.addEventListener('dom-change', function () {

  });

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function () {

  });

  app._getFusionParams = function(route) {
    var datasource = this.dataSources[route];
    var query = 'SELECT id,name,longitude,latitude,class_col,GR21,' + datasource.columns.join(',') + ' FROM ' + datasource.id;
    return { sql: query, key: this.apiKey };
  };
  app.openInfoWindow = function() {
    app.$.infoDialog.open();
  };
  app.googleMapLoaded = function() {
     if (this.loaddata) {
       this.$.datasource.generateRequest();
     } else {
       this.fusionresponse = this.$.localstorage.value;
     }
     this.mapLoaded = true;
  };
  app.loadDataFromBackend = function() {
    this.loaddata = true;
    if (this.mapLoaded) {
       this.$.datasource.generateRequest();
    }
  };
  app.onLoadDataFromCache = function() {
    this.loaddata = false;
    if (this.mapLoaded) {
      this.fusionresponse = this.$.localstorage.value;
    }
  };
})(document);
