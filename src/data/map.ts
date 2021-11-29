import ArcGISMap from "@arcgis/core/Map";
import Basemap from "@arcgis/core/Basemap";
import MapView from "@arcgis/core/views/MapView";
import Layer from '@arcgis/core/layers/Layer';
import TileLayer from "@arcgis/core/layers/TileLayer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer";
// import esriConfig from "@arcgis/core/config";
// import * as intl from "@arcgis/core/intl";

// ----------------------------------
// Public Properties
// ----------------------------------

export const basemap_cn = new Basemap({
      baseLayers: [
        new TileLayer({
          url: "http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer",
        }),
      ],
    })
export const map = new ArcGISMap({
      basemap: basemap_cn,
    })
export const view = new MapView({
      map,
      center: [116.75, 39.85], // 通州经纬度
      zoom: 10, // zoom level
})

function genSmpSym (color: string) {
    return {
          type: "simple-fill", // autocasts as new SimpleFillSymbol()
          color: color,
          style: "solid",
          outline: {
            width: 0.5,
            color: [120, 120, 120, 0.5]
          }
    }                
}
                
export const choroRenderer = new ClassBreaksRenderer({
    field: "number",
    legendOptions: {
        title: "number"
    },
    classBreakInfos: [
            {
              minValue: 10,
              maxValue: 20,
              symbol: genSmpSym("#edf8e9"),
              label: "10 – 20"
            },
            {
              minValue: 20.1,
              maxValue: 40,
              symbol: genSmpSym("#bae4b3"),
              label: "> 20 – 40"
            },
            {
              minValue: 40.1,
              maxValue: 55,
              symbol: genSmpSym("#74c476"),
              label: "> 40 – 55"
            },
            {
              minValue: 55.1,
              maxValue: 70,
              symbol: genSmpSym("#31a354"),
              label: "> 55 – 70"
        },
            {
              minValue: 70.1,
              maxValue: 100,
              symbol: genSmpSym("#006d2c"),
              label: "> 70 – 100"
            }
          ]
    
})

export const popupTemplt = {
  // autocasts as new PopupTemplate()
  title: "{pname}, {XZQMC}",
  content: [
    {
      type: "fields",
      fieldInfos: [
        {
          fieldName: "pname",
          label: "区"
        },
        {
          fieldName: "XZQMC",
          label: "乡镇"
        },
        {
          fieldName: "number",
          label: "number"
        },
        {
          fieldName: "pcode",
          label: "pcode"
        }
      ]
    }
  ]
}

export const tzqhLayer = new FeatureLayer({
    title: "通州行政区划",
    url: "https://services.arcgis.com/Sf0q24s0oDKgX14j/arcgis/rest/services/tzqh/FeatureServer/0",
    copyright: "App and maps by <a href=\"https://github.com/YuanWANG2662\">Yuan Wang</a>",
    outFields: ["*"],
    renderer: choroRenderer,
    popupTemplate:popupTemplt
})


// ----------------------------------
// Public methods
// ----------------------------------

/**
 * Assigns the container element to the View
 * @param container
 */
export async function initialize(container: HTMLDivElement) {
    view.container = container
    try {
        await view.when()
        console.log('Map and View are ready')
    } catch (error) {
        console.warn('An error in creating the map occurred:', error)
    }
}

/**
 * Adds a FeatureLayer to the map
 * @param layer
 */

export async function addLayerToMap(layer: __esri.FeatureLayer) {
    await layer.load()
    map.add(layer)
}

