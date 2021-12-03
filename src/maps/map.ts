import ArcGISMap from "@arcgis/core/Map";
import Basemap from "@arcgis/core/Basemap";
import MapView from "@arcgis/core/views/MapView";
import Layer from "@arcgis/core/layers/Layer";
import TileLayer from "@arcgis/core/layers/TileLayer";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer";
import * as echarts from "echarts";
import $ from "jquery";
import { tzqh } from "../data/tzqh";
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
});
export const map = new ArcGISMap({
  basemap: basemap_cn,
});
export const view = new MapView({
  map,
  center: [116.75, 39.85], // 通州经纬度
  zoom: 10, // zoom level
});

function genSmpSym(color: string) {
  return {
    type: "simple-fill", // autocasts as new SimpleFillSymbol()
    color: color,
    style: "solid",
    outline: {
      width: 0.5,
      color: [120, 120, 120, 0.5],
    },
  };
}

//分级渲染
export const choroRenderer = new ClassBreaksRenderer({
  field: "number",
  legendOptions: {
    title: "number",
  },
  classBreakInfos: [
    {
      minValue: 10,
      maxValue: 20,
      symbol: genSmpSym("#edf8e9"),
      label: "10 – 20",
    },
    {
      minValue: 20.1,
      maxValue: 40,
      symbol: genSmpSym("#bae4b3"),
      label: "> 20 – 40",
    },
    {
      minValue: 40.1,
      maxValue: 55,
      symbol: genSmpSym("#74c476"),
      label: "> 40 – 55",
    },
    {
      minValue: 55.1,
      maxValue: 70,
      symbol: genSmpSym("#31a354"),
      label: "> 55 – 70",
    },
    {
      minValue: 70.1,
      maxValue: 100,
      symbol: genSmpSym("#006d2c"),
      label: "> 70 – 100",
    },
  ],
});

//popup模板
export const popupTemplt = {
  // autocasts as new PopupTemplate()
  title: "{pname}, {XZQMC}",
  content: [
    {
      type: "fields",
      fieldInfos: [
        {
          fieldName: "pname",
          label: "区",
        },
        {
          fieldName: "XZQMC",
          label: "乡镇",
        },
        {
          fieldName: "number",
          label: "number",
        },
        {
          fieldName: "pcode",
          label: "pcode",
        },
      ],
    },
  ],
};

//通州区划
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
 * Assigns the container element to the View
 * @param container
 */
export async function initialize(container: HTMLDivElement) {
  view.container = container;
  try {
    await view.when();
    console.log("Map and View are ready");
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

// ----------------------------------
// Using Echarts to add bar charts as symbols to the map
// ----------------------------------

//视图加载完成
view.when(function () {
  console.log(tzqh);
  //地图加载完，初始化统计图
  const _echartsInfos = echartsMapInit();
  //监听地图变化事件，对应刷新统计图位置
  view.watch("extent", function () {
    relocatePopup(_echartsInfos);
  });
  view.watch("rotation", function () {
    relocatePopup(_echartsInfos);
  });
});

//初始化写入统计图的数据
function echartsMapInit() {
  const echartsInfos: any[] = [];
  tzqh.forEach((item, idx) => {
    echartsInfos.push({
      x: item.x,
      y: item.y,
      content: `<div id="info${idx}" style="height:100px;width:20px;position:absolute;"></div>`,
      id: `info${idx}`,
      echartsObj: {},
      option: {
        title: {
          text: "",
        },
        tooltip: {
          trigger: "item",
          formatter: "<div style='font-weight:700;'>{a}</div>{b}：{c}",
        },
        label: {
          show: true, //开启显示
          position: "top", //在上方显示
        },
        grid: {
          bottom: 0,
          height: "80%",
        },
        xAxis: [
          {
            type: "category",
            boundaryGap: false,
            data: [item.name],
            show: false,
          },
        ],
        yAxis: [
          {
            type: "value",
            show: false,
            max: 100,
          },
        ],
        series: [
          {
            name: "number",
            type: "bar",
            barWidth: "8px",
            data: [item.number],
          },
        ],
      },
    });
  });

  for (let i = 0; i < echartsInfos.length; i++) {
    const echartsInfo = echartsInfos[i];
    //坐标转换
    const mapPoint = {
      x: echartsInfo.x,
      y: echartsInfo.y,
      // spatialReference: view.spatialReference,
      spatialReference: {
        wkid: 4326,
      },
    };
    const screenPoint = view.toScreen(mapPoint as __esri.Point);
    const obj = {
      x: screenPoint.x,
      y: screenPoint.y,
      content: echartsInfo.content,
      id: echartsInfo.id,
      option: echartsInfo.option,
      echartsObj: echartsInfo.echartsObj,
    };

    echartsInfos[i].echartsObj = loadEchartsMap(obj);
    //刷新统计图窗口位置
    //positionEchartsMap(obj);
  }
  return echartsInfos;
}
function loadEchartsMap(obj: any) {
  //动态添加气泡窗口DIV
  $("#viewDiv").append(obj.content);
  //统计图加载
  const dom = document.getElementById(obj.id);
  const myChart = echarts.init(dom as HTMLElement);
  myChart.setOption(obj.option);
  //刷新统计图窗口位置
  positionEchartsMap(obj);
  return myChart;
}
//刷新统计图窗口大小和位置
function positionEchartsMap(obj: any) {
  //动态改变echarts统计图div大小
  switch (view.zoom) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
      $("#" + obj.id).css("height", "0");
      break;
    case 9:
    case 10:
      $("#" + obj.id).css("height", "100px");
      $("#" + obj.id).css("width", "20px");
      break;
    case 11:
    case 12:
      $("#" + obj.id).css("height", "200px");
      $("#" + obj.id).css("width", "20px");
      break;
    case 13:
    case 14:
    case 15:
    case 16:
    case 17:
    case 18:
      $("#" + obj.id).css("height", "300px");
      $("#" + obj.id).css("width", "20px");
      break;
    default:
      $("#" + obj.id).css("height", "0");
  }
  //动态改变echarts统计图div位置
  const offset_x = obj.x - 10;
  const offset_y = obj.y - parseInt($("#" + obj.id).css("height"));
  $("#" + obj.id).css(
    "transform",
    "translate3d(" + offset_x + "px, " + offset_y + "px, 0)"
  );

  if (Object.keys(obj.echartsObj).length !== 0) {
    console.log(obj);
    obj.echartsObj.resize();
  }
}

//统计图窗口位置
function relocatePopup(_echartsInfos: any) {
  for (let i = 0; i < _echartsInfos.length; i++) {
    const echartsInfo = _echartsInfos[i];
    //坐标转换
    const mapPoint = {
      x: echartsInfo.x,
      y: echartsInfo.y,
      // spatialReference: view.spatialReference,
      spatialReference: {
        wkid: 4326,
      },
    };
    const screenPoint = view.toScreen(mapPoint as __esri.Point);
    const obj = {
      x: screenPoint.x,
      y: screenPoint.y,
      option: echartsInfo.option,
      id: echartsInfo.id,
      echartsObj: echartsInfo.echartsObj,
    };

    //刷新统计图窗口位置
    positionEchartsMap(obj);
  }
}

// // 防抖节流
// function throttle(fn: any, delay: number, debounce: boolean) {
//   let currCall;
//   let lastCall = 0;
//   let lastExec = 0;
//   let timer: number | null | undefined = null;
//   let diff;
//   let scope: any;
//   let args: any;

//   delay = delay || 0;

//   function exec() {
//     lastExec = new Date().getTime();
//     timer = null;
//     fn.apply(scope, args || []);
//   }

//   const cb = function (this: any, ...rest: any[]) {
//     currCall = new Date().getTime();
//     scope = this;
//     args = rest;
//     diff = currCall - (debounce ? lastCall : lastExec) - delay;

//     clearTimeout(timer as number);

//     if (debounce) {
//       timer = setTimeout(exec, delay);
//     } else {
//       if (diff >= 0) {
//         exec();
//       } else {
//         timer = setTimeout(exec, -diff);
//       }
//     }

//     lastCall = currCall;
//   };

//   return cb;
// }

// const throttledRelocatePopup = throttle(relocatePopup, 0, false);
