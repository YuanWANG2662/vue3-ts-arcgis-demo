import * as echarts from "echarts";
import $ from "jquery";
import { tzqh_time } from "@/data/tzqh_time";
import MapView from "@arcgis/core/views/MapView";

//初始化写入统计图的数据
export function echartsMapInit(view: MapView, field: string) {
  const echartsInfos: any[] = [];
  tzqh_time.forEach((item, idx) => {
    echartsInfos.push({
      x: item.x,
      y: item.y,
      content: `<div id="info${idx}" style="height:100px;width:20px;position:absolute;"></div>`,
      id: `info${idx}`,
      echartsObj: {},
      //图表配置项
      option: {
        title: {
          text: "",
        },
        tooltip: {
          trigger: "item",
          formatter: "<div style='font-weight:700;'>{a}</div>{b}：{c}",
        },
        label: {
          show: true, //开启标签显示
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
            name: field,
            type: "bar",
            barWidth: "8px",
            data: [item[field as keyof typeof item]],
          },
        ],
      },
    });
  });

  for (let i = 0; i < echartsInfos.length; i++) {
    const echartsInfo = echartsInfos[i];
    //地理坐标
    const mapPoint = {
      x: echartsInfo.x,
      y: echartsInfo.y,
      // spatialReference: view.spatialReference,
      spatialReference: {
        wkid: 4326, //储存的坐标是经纬度，因此这里采用epsg4326
      },
    };
    //地理坐标转换为屏幕坐标
    const screenPoint = view.toScreen(mapPoint as __esri.Point);
    const obj = {
      x: screenPoint.x,
      y: screenPoint.y,
      content: echartsInfo.content,
      id: echartsInfo.id,
      option: echartsInfo.option,
      echartsObj: echartsInfo.echartsObj,
    };
    //加载Echarts
    echartsInfos[i].echartsObj = loadEchartsMap(view, obj);
  }
  return echartsInfos;
}
//加载Echarts
export function loadEchartsMap(view: MapView, obj: any) {
  //动态添加气泡窗口DIV
  $("#viewDiv").append(obj.content);
  //统计图加载
  const dom = document.getElementById(obj.id);
  const myChart = echarts.init(dom as HTMLElement);
  myChart.setOption(obj.option);
  //刷新统计图窗口位置
  positionEchartsMap(view, obj);
  return myChart;
}
//刷新统计图窗口大小和位置
function positionEchartsMap(view: MapView, obj: any) {
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
      $("#" + obj.id).css("height", "0"); //缩放级数过小时不显示图表
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
  const offset_x = obj.x - 10; //减去宽的一半使图表在对应要素里水平居中
  const offset_y = obj.y - parseInt($("#" + obj.id).css("height")); //减去高使柱状图的底部在要素里居中
  $("#" + obj.id).css(
    "transform",
    "translate3d(" + offset_x + "px, " + offset_y + "px, 0)"
  );

  if (Object.keys(obj.echartsObj).length !== 0) {
    obj.echartsObj.resize();
  }
}

//定位统计图窗口位置
export function relocatePopup(view: MapView, _echartsInfos: any) {
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
    positionEchartsMap(view, obj);
  }
}

//更新柱状图以匹配对应字段
export function updateEchartsMap(echartsInfos: any[], field: string) {
  echartsInfos.forEach((echartInfo: any, idx) => {
    echartInfo.echartsObj.setOption({
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
          data: [tzqh_time[idx].name],
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
          name: field,
          type: "bar",
          barWidth: "8px",
          data: [tzqh_time[idx][field as keyof typeof tzqh_time[0]]],
        },
      ],
    });
  });
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
