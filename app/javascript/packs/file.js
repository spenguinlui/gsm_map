import EXIF from 'exif-js'

// EXIF 中取得 度分秒 Object
const getDegree = (gpsArray) => {
  if (gpsArray.length < 3) {
    return null;
  } else {
    return {
      degree: gpsArray[0].numerator / gpsArray[0].denominator,
      minute: gpsArray[1].numerator / gpsArray[1].denominator,
      second: gpsArray[2].numerator / gpsArray[2].denominator
    }
  }
}

// DMS 換算成 10進位
const convertDMStoDec = (degree, minute, second) => degree + minute / 60 + second / (60 * 60);
// 四捨五入至小數點 n 位數
const roundToDecPoint = (point, number) => Math.round(number * Math.pow(10, point)) / Math.pow(10, point);

// 座標轉換: DMS 轉十進制
const convertDMSToDD = ({degree, minute, second, direction}) => {
  let dd = roundToDecPoint(6, convertDMStoDec(degree, minute, second));
  return direction === 'S' || direction === 'W' ? dd * -1 : dd;
};

document.addEventListener('DOMContentLoaded', () => {
  // DOM
  const imgElement1 = document.getElementById("img1");
  const imgElement2 = document.getElementById("img2");
  const contextElement = document.getElementById("context");
  const getDataBtn1 = document.getElementById("getExifBtn1");
  const getDataBtn2 = document.getElementById("getExifBtn2");

  // 取得 EXIF
  const getExif = (element) => {
    EXIF.getData(element, () => {
      const exifData = EXIF.getAllTags(element);

      // EXIF 無資料跳出
      if (Object.keys(exifData).length === 0) {
        contextElement.innerHTML = "此照片無座標";
        return;
      }
      const { GPSLatitude, GPSLongitude, GPSLatitudeRef, GPSLongitudeRef } = exifData;

      const latitudeObj = getDegree(GPSLatitude);
      const longitudeObj = getDegree(GPSLongitude);

      // 無座標資料跳出
      if (latitudeObj === null || longitudeObj === null) {
        contextElement.innerHTML = "此照片無座標";
        return;
      }

      const latitude = convertDMSToDD(latitudeObj, GPSLatitudeRef);
      const longitude = convertDMSToDD(longitudeObj, GPSLongitudeRef);

      element.dataset.latitude = latitude;
      element.dataset.longitude = longitude;
      contextElement.innerHTML = `經緯度是： ${longitude} ${latitude}`;
    });
  };

  // 監聽按鈕
  getDataBtn1.addEventListener("click", () => getExif(imgElement1), false);
  getDataBtn2.addEventListener("click", () => getExif(imgElement2), false);
})