import EXIF from 'exif-js'

// EXIF 中取得 度分秒 Object
const getDegree = (gpsArray) => {
  if (gpsArray.length < 3) 
    return null;
  else
    return {
      degree: gpsArray[0].numerator / gpsArray[0].denominator,
      minute: gpsArray[1].numerator / gpsArray[1].denominator,
      second: gpsArray[2].numerator / gpsArray[2].denominator
    };
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

// 取得 EXIF 座標資料並回傳
const getExifData = (element) => {
  return new Promise((resolve, reject) => {
    const doEXIFFnc = () => {
      return EXIF.getData(element, () => {
        const exifData = EXIF.getAllTags(element);
        console.log(exifData)
        if (Object.keys(exifData).length === 0) {
          reject('此照片無座標');
          return;
        }
        const { GPSLatitude, GPSLongitude, GPSLatitudeRef, GPSLongitudeRef } = exifData;
        const latitudeObj = getDegree(GPSLatitude || []);
        const longitudeObj = getDegree(GPSLongitude || []);
        if (latitudeObj === null || longitudeObj === null) {
          reject('此照片無座標');
          return;
        }
        const latitude = convertDMSToDD(latitudeObj, GPSLatitudeRef);
        const longitude = convertDMSToDD(longitudeObj, GPSLongitudeRef);
        const data = { latitude: latitude, longitude: longitude };
        resolve(data);
      })
    }
    // 每 0.5 秒遞迴到成功讀取到資料(因為 createElement 的 DOM 會讀取失敗)
    const loopWhileFalse = () => doEXIFFnc() || setTimeout(() => loopWhileFalse(), 500)
    loopWhileFalse();
  })
}

// 將經緯度寫入 DOM
const setLatLonToElement = (data, element) => {
  const { latitude, longitude } = data;
  element.dataset.latitude = latitude;
  element.dataset.longitude = longitude;
}

// 產生 img 文件
const createImgElement = (fileSrc, parentElement) => {
  const newImg = document.createElement("img");
  newImg.src = fileSrc;
  newImg.className = 'image100';
  parentElement.appendChild(newImg);
  return newImg;
}

// 取得 EXIF 資料並加工
const getEXIFAndSetLatLon = (element, textInputElement) => {
  getExifData(element).then((res) => {
    setLatLonToElement(res, element);
    textInputElement.innerHTML = `經緯度是： ${res.longitude} ${res.latitude}`;
  }).catch((res) => {
    textInputElement.innerHTML = res;
  });
};

document.addEventListener('DOMContentLoaded', () => {
  // DOM
  const imgElement1 = document.getElementById("img1");
  const imgElement2 = document.getElementById("img2");
  const imgElement3 = document.getElementById("img3");
  const contextElement = document.getElementById("context");
  const getDataBtn1 = document.getElementById("getExifBtn1");
  const getDataBtn2 = document.getElementById("getExifBtn2");
  const getDataBtn3 = document.getElementById("getExifBtn3");

  // 檔案讀取
  const fileUploader = document.getElementById('fileUploader');
  const imgCategory = document.getElementById('imgCategory');

  fileUploader.addEventListener('change', (e) => {
    const element = e.target;
    if (element.files && element.files[0]) {
      const reader = new FileReader();

      reader.readAsDataURL(element.files[0])
      reader.onload = (e) => {
        // 先建立元素在用元素讀取檔案
        const newImg = createImgElement(e.target.result, imgCategory);
        getEXIFAndSetLatLon(newImg, contextElement);
      };
    }
  });

  // 監聽按鈕
  getDataBtn1.addEventListener("click", () => getEXIFAndSetLatLon(imgElement1, contextElement), false);
  getDataBtn2.addEventListener("click", () => getEXIFAndSetLatLon(imgElement2, contextElement), false);
  getDataBtn3.addEventListener("click", () => getEXIFAndSetLatLon(imgElement3, contextElement), false);
})