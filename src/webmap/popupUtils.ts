//popupUtils module

import FeatureLayer from "@arcgis/core/layers/FeatureLayer";

//初始化弹窗模板
export function getPopupTemplate(field: string) {
  //popup模板
  const popupTemplt = {
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
            fieldName: field,
            label: field,
          },
          {
            fieldName: "pcode",
            label: "pcode",
          },
        ],
      },
    ],
  };
  return popupTemplt;
}

//更新弹窗模板以匹配对应字段
export function updatePopupTemplate(layer: FeatureLayer, field: string) {
  const template = getPopupTemplate(field);
  layer.popupTemplate = template as unknown as __esri.PopupTemplate;
}
