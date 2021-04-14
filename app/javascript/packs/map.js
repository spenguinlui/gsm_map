import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import { Circle, Fill, Style } from "ol/style";
import { OSM as OSMSource, Vector as VectorSource } from "ol/source";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from "ol/proj";
// import * as turf from '@turf/turf';

// 取得圓形 Style
const getCircleStyle = (radius, color) => {
  return new Circle({
    radius: radius,
    fill: new Fill({ color: color })
  })
}

// 地圖視圖控制
const MapView = new View({ center: fromLonLat([120.41, 25.82]), zoom: 8 });

// 地圖底圖層
const MapBackGroundLayer = new TileLayer({ source: new OSMSource() });

// 地圖 point 圖層的 Layer、Source 與 Style
const pointStyle = new Style({ image: getCircleStyle(10, '#333333') });
const pointSource = new VectorSource();
const PointsLayer = new VectorLayer({ source: pointSource, style: pointStyle });

// 將 經緯度打入 point source -> layer
const addPointToFeature = (longitude, latitude, targetSource = pointSource) => {
  const coordinate = fromLonLat([longitude, latitude]);        // 經緯度 lonlat 轉 座標 coordinate
  targetSource.addFeature(new Feature(new Point(coordinate))); // 把 feature 加入現有 source，需用 ol 方法才會 re-render
}

// 抓出所有圖片的 data-longitude、data-latitude 打到地圖上
const getImageLonLat = () => {
  const elements = document.querySelectorAll('img');
  elements.forEach((e) => {
    const { longitude, latitude} = e.dataset
    if (!(longitude && latitude))
      return;
    else
      addPointToFeature(Number(longitude), Number(latitude));
  })
}

document.addEventListener("DOMContentLoaded", () => {

  // 地圖顯示
  new Map({
    target: "map",
    layers: [
      MapBackGroundLayer,
      PointsLayer
    ],
    view: MapView
  });

  // 點擊按鈕加入 點 在地圖上
  const addPointBtn = document.getElementById("addPointBtn");
  addPointBtn.addEventListener('click', () => getImageLonLat(), false)
});