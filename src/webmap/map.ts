import ArcGISMap from "@arcgis/core/Map";
import Basemap from "@arcgis/core/Basemap";
import MapView from "@arcgis/core/views/MapView";
import TileLayer from "@arcgis/core/layers/TileLayer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import Expand from "@arcgis/core/widgets/Expand";
import Legend from "@arcgis/core/widgets/Legend";
import Home from "@arcgis/core/widgets/Home";
import ScaleBar from "@arcgis/core/widgets/ScaleBar";

import * as renderer from "@/webmap/renderer";
import * as popupUtils from "@/webmap/popupUtils";
import * as timeUtils from "@/webmap/timeUtils";
import * as chart from "@/webmap/chart";

// ----------------------------------
// Public Properties
// ----------------------------------

//中文底图
const basemap_cn = new Basemap({
  baseLayers: [
    new TileLayer({
      url: "http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer",
    }),
  ],
});

const map = new ArcGISMap({
  basemap: basemap_cn,
});

const view = new MapView({
  map,
  center: [116.75, 39.85], // 通州经纬度
  zoom: 10, // zoom level
});

//初始化renderer
const choroRenderer = renderer.getRenderer("number_2021");
//初始化popup模板
const popupTemplt = popupUtils.getPopupTemplate("number_2021");
//初始化time slider
const timeSlider = timeUtils.initTimeSlider(view);

//通州区划矢量图层
export const tzqhLayer = new FeatureLayer({
  title: "通州行政区划",
  url: "https://services.arcgis.com/Sf0q24s0oDKgX14j/arcgis/rest/services/tzqh_time/FeatureServer/0",
  copyright:
    'App and maps by <a href="https://github.com/YuanWANG2662">Yuan Wang</a>',
  outFields: ["*"],
  renderer: choroRenderer,
  popupTemplate: popupTemplt,
});

// ----------------------------------
// Public methods
// ----------------------------------

/**
 * Using Echarts to add bar charts as symbols to the map
 */
let _echartsInfos: any[];
//视图加载完成
view.when(function () {
  //地图加载完，初始化统计图
  _echartsInfos = chart.echartsMapInit(view, "number_2021");
  //监听地图变化事件，对应刷新统计图位置
  view.watch("extent", function () {
    chart.relocatePopup(view, _echartsInfos);
  });
  view.watch("rotation", function () {
    chart.relocatePopup(view, _echartsInfos);
  });
});

/**
 * Assigns the container element to the View
 * @param container
 */
export async function initialize(container: HTMLDivElement) {
  view.container = container;
  try {
    await view.when();
    console.log("Map and View are ready");

    //添加home按钮
    view.ui.add(
      new Home({
        view: view,
      }),
      "top-left"
    );

    //添加比例尺
    view.ui.add(
      new ScaleBar({
        view: view,
        unit: "metric",
      }),
      "bottom-right"
    );

    //添加可折叠的图例组件
    const lgd = new Legend({
      container: document.createElement("div"),
      view: view,
    });
    view.ui.add(
      new Expand({
        expandIconClass: "esri-icon-legend",
        view,
        content: lgd,
        expanded: true,
      }),
      "top-right"
    );

    //添加可折叠的时间滚动轴组件
    view.ui.add(
      new Expand({
        expandIconClass: "esri-icon-time-clock",
        view,
        content: timeSlider,
        expanded: true,
      }),
      "bottom-left"
    );
  } catch (error) {
    console.warn("An error in creating the map occurred:", error);
  }
}

/**
 * Adds a FeatureLayer to the map
 * @param layer
 */

export async function addLayerToMap(layer: __esri.FeatureLayer) {
  await layer.load();
  map.add(layer);
}

// 当用户拖动时间滚动轴时，调用更新地图的函数updateMap()
timeSlider.watch("values", () => {
  updateMap();
});

// function to update the map
function updateMap() {
  // 时间滚动轴上被选中的值
  const activeDate = timeSlider.values[0];
  //改为feature layer里储存的对应的字段名称
  const year_field = `number_${activeDate.getFullYear().toString()}`;
  console.log(year_field);
  //对应地更新renderer里显示的字段
  renderer.updateRenderer(tzqhLayer, year_field);
  //对应地更新popup模板里显示的字段
  popupUtils.updatePopupTemplate(tzqhLayer, year_field);
  //对应地更新Echarts的柱状图里显示的字段
  chart.updateEchartsMap(_echartsInfos, year_field);
}
