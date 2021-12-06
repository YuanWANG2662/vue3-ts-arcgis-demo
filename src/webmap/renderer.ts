//renderer module
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import ClassBreaksRenderer from "@arcgis/core/renderers/ClassBreaksRenderer";
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

//初始化分级渲染renderer
export function getRenderer(field: string) {
  //分级渲染
  const choroRenderer = new ClassBreaksRenderer({
    field: field,
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
  return choroRenderer;
}

//更新分级渲染renderer以匹配对应字段
export function updateRenderer(layer: FeatureLayer, field: string) {
  const renderer = getRenderer(field);
  layer.renderer = renderer;
}
