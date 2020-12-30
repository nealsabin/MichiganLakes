require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/renderers/UniqueValueRenderer",
    "esri/PopupTemplate",
    "esri/popup/content/CustomContent",
    "esri/widgets/Search",
    "esri/widgets/LayerList",
    "esri/widgets/Expand",
    "esri/widgets/Search"
  ], function(Map, MapView, FeatureLayer, UniqueValueRenderer, PopupTemplate, CustomContent, Search, LayerList, Expand) {

    // layer symbology
    const lakeRenderer = {
      type: "simple",
        symbol:{
          type: "simple-fill",
          color: "#94c3ea",
          outline: {
            width: 0
          }
        }
    };

    const contourRenderer = {
      type: "simple",
      symbol:{
        type: "simple-line",
        color: "#286ea8",
        width: "1px"
      }
    };

    // const cityRenderer = {
    //   type: "simple",
    //   symbol: {
    //     type: "simple-fill",
    //     color: "#ccc48a"
    //   }
    // };

    const countyRenderer = {
      type: "simple",
      symbol: {
        type: "simple-fill",
        color: "#64875f"
      }
    };

    // popups 
    const lakePopup = {
      title: "{Name}",
      content: "{expression/lakeInfo}",
      expressionInfos: [
        {
          name: "lakeInfo",
          title: "Lake Info",
          expression:`
          var contours = FeatureSetByName($map,'Contours');
          var contourIntersect = Intersects(contours, $feature);
          var cnt = Count(contourIntersect);

          var deepestContour = Top(OrderBy(contourIntersect,"DEPTH DESC"),1);

          var lakeArea = $feature.ACRES_GIS;

          if (cnt > 1){
            var output = "";
            var num = 0;

            for (var item in deepestContour){
            num++;
            var lakeDepth = item.DEPTH;
            output += "Approximate Lake Depth: " + lakeDepth + " feet";
            }
          }
          else { 
            output = "Lake depth data not avaiable.";
          }

          return \` 
          \${output}

          Lake Surface Area: \${Text(lakeArea, "#,###")} acres

          \`
          `
        }
      ]
    };

    const countyPopup = {
      title: "{LABEL}",
      content: "{expression/countyInfo}",
      expressionInfos: [
      {
        name: "countyInfo",
        title: "County Info",
        expression: `
        // lake count
        var lake = FeatureSetByName($map,'Lakes');
        var lakeIntersect = Intersects(lake, $feature);
        var cnt = Count(lakeIntersect);

        // largest lakes
        var largestLakes = Top(OrderBy(lakeIntersect,"ACRES_GIS DESC"),3);

        var output = "";
        var num = 0;

        for (var item in largestLakes){
          num++;
          var lakeName = item.NAME;
          var lakeArea = Text(item.ACRES_GIS,"#,###");
          output += num + ". " + lakeName + " (" + lakeArea + " acres)" + TextFormatting.NewLine;
        }

        // lake area per county
        var totalLakeArea = Round(AreaGeodetic(lakeIntersect, 'acre'));
        var lakeAreaPercentage = Round(totalLakeArea / $feature.ACRES * 100,1);
        var countyName = $feature.LABEL;

        // deepest lake
        // var contour = FeatureSetByName($map, 'Contours');
        // var contourIntersect2 = Intersects(contour, $feature);
        // var deepestContour = Top(OrderBy(contourIntersect2,"DEPTH DESC"),1);
        //  var deepestContourIntersect = Intersects(deepestContour, lake);

        // var output2 = "";
        // var num2 = "";

        // for (var item2 in deepestContour){
        //    num2++;
        //    var depth = item2.DEPTH;
        //    output2 += depth;
        // }
    
        // return
        return \` 
        Number of lakes: \${Text(cnt, "#,###")}

        Largest Lakes by Surface Area:
         \${output}
        Surface Area of lakes: \${Text(totallakeArea, "#,###")} acres

        \${lakeAreaPercentage}% of the surface area of \${countyName} is lake surface
        \`
        `
      }
      ]
    };

    // Contour Service
    const miContours = new FeatureLayer({
      url: "https://gisago.mcgi.state.mi.us/arcgis/rest/services/OpenData/hydro/MapServer/4",
      title: "Contours",
      renderer: contourRenderer,
      mode: FeatureLayer.MODE_SELECTION,
      minScale: 300000,
      opacity: 0.4,
      renderer: contourRenderer,
      outFields: ["*"]
      });

    // Lake Michigan Contour Service
    const lakeMichiganContours = new FeatureLayer({
      url: "https://gisago.mcgi.state.mi.us/arcgis/rest/services/OpenData/elevation/MapServer/1",
      title: "MichiganContours",
      renderer: contourRenderer,
      mode: FeatureLayer.MODE_SELECTION,
      minScale: 1000000,
      opacity: 0.2,
      renderer: contourRenderer,
      outFields: ["*"]
      });

    // Lake Huron Contour Service
    const lakeHuronContours = new FeatureLayer({
      url: "https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis/rest/services/Lake_Huron_Bathymetric_Contours/FeatureServer",
      title: "HuronContours",
      renderer: contourRenderer,
      labelingInfo: "",
      mode: FeatureLayer.MODE_SELECTION,
      minScale: 1000000,
      opacity: 0.2,
      renderer: contourRenderer,
      outFields: ["*"]
      });
    
    // Lake Erie Contour Service
    const lakeErieContours = new FeatureLayer({
      url: "https://services2.arcgis.com/FiaPA4ga0iQKduv3/arcgis/rest/services/Lake_Erie_and_Lake_Charles_Bathymetric_Contours/FeatureServer",
      title: "ErieContours",
      renderer: contourRenderer,
      labelingInfo: "",
      mode: FeatureLayer.MODE_SELECTION,
      minScale: 1000000,
      opacity: 0.2,
      renderer: contourRenderer,
      outFields: ["*"]
      });

    // Lake Service
    const miLakes = new FeatureLayer({
      url: "https://gisago.mcgi.state.mi.us/arcgis/rest/services/OpenData/hydro/MapServer/23",
      title: "Lakes",
      renderer: lakeRenderer,
      popupTemplate: lakePopup,
      mode: FeatureLayer.MODE_SELECTION,
      minScale: 3000000,
      outFields: ["*"]
    });

    // City Service
    // const miCities = new FeatureLayer({
    //   url: "https://gisago.mcgi.state.mi.us/arcgis/rest/services/OpenData/michigan_geographic_framework/MapServer/1",
    //   title: "Cities",
    //   renderer: cityRenderer,
    //   mode: FeatureLayer.MODE_SELECTION,
    //   opacity: 0.2,
    //   minScale: 900000,
    //   outFields: ["*"]
    //   });

    // County Service
    const miCounties = new FeatureLayer({
      url: "https://gisago.mcgi.state.mi.us/arcgis/rest/services/OpenData/michigan_geographic_framework/MapServer/0",
      title: "Counties",
      renderer: countyRenderer,
      popupTemplate: countyPopup,
      mode: FeatureLayer.MODE_SELECTION,
      opacity: 0.2,
      outFields: ["*"]
      });

    const map = new Map({
      basemap: "gray-vector",
      layers: [miLakes,lakeMichiganContours,lakeHuronContours,lakeErieContours,miContours,miCounties]
    });

    const view = new MapView({  
      container: "viewDiv",
      map: map,
      center: [-84.930666,44.317797], 
      zoom: 6
      // popup: {
      //   defaultPopupTemplateEnabled: false,
      //   dockEnabled: true,
      //   dockOptions: {
      //     buttonEnabled: false,
      //     breakpoint: false
      //   }
      // }
    });

    // Search Widget
    // var searchWidget = new Search({
    //   view: view,
    //   allPlaceholder: "Search by County",
    //   sources: [
    //     {
    //       layer: miCounties,
    //       searchFields: ["LABEL"],
    //       displayField: "LABEL",
    //       exactMatch: false,
    //       outFields: ["LABEL"],
    //       name: "County Name",
    //       placeholder: "Marquette County"
    //     }
    //   ]
    // });

    // view.ui.add(searchWidget, {
    //   position: "top-right"
    // });

    // add expandable layer list icon
    layerList = new LayerList({
      container: document.createElement("div"),
      view: view
    });
    layerListExpand = new Expand({
      expandIconClass: "esri-icon-layer-list",
      view: view,
      content: layerList
    });
    view.ui.add(layerListExpand, "top-left");
    
  });