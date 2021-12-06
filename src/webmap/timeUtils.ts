//timeUtils module
import MapView from "@arcgis/core/views/MapView";
import TimeSlider from "@arcgis/core/widgets/TimeSlider";

// 时间区间 2000-2021
export const initialTimeExtent = {
  start: new Date(2000, 0, 1), // 2000.1.1 new Date(year, monthIndex, day)
  end: new Date(2021, 0, 1), //  2021.1.1  new Date(year, monthIndex, day)
};

// 配置时间滚动轴
export const initTimeSlider = (view: MapView) => {
  const timeSlider = new TimeSlider({
    container: document.createElement("div"),
    playRate: 100,
    loop: true,
    viewModel: {
      view: view,
      mode: "instant", //instant time value instead of time window
      fullTimeExtent: initialTimeExtent,
      timeExtent: {
        start: initialTimeExtent.end, //start equals end, since the instant mode is used
        end: initialTimeExtent.end,
      },
    },
    stops: {
      interval: {
        value: 1,
        unit: "years",
      } as __esri.TimeInterval,
    },
    //配置时间的显示格式，只显示年份
    labelFormatFunction: (
      value: Date | Date[],
      type: string | undefined,
      element: HTMLElement | undefined
    ) => {
      const normal = new Intl.DateTimeFormat("en-us");
      switch (type) {
        case "min":
        case "max":
          (element as HTMLElement).innerText = `${(value as Date)
            .getFullYear()
            .toString()}年`;
          break;
        case "extent":
          (element as HTMLElement).innerText = `${(value as Date[])[0]
            .getFullYear()
            .toString()}年`;
          break;
      }
    },
  });
  return timeSlider;
};
