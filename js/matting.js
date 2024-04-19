function getId(id) {
  return document.getElementById(id);
}

var showBefore = getId('showBefore');
var showAfter = getId('showAfter');
var canvas = getId('canvas');
var canvas1 = getId('canvas1');
var showBetween = getId('showBetween');
var ctx = canvas.getContext('2d');
var ctx1 = canvas1.getContext('2d');
var imgFile;
var imgFile1;
var blobUrl;
var outline = 50;

getId('input').addEventListener('click', function(){
  getId('headimg').click();
});
getId('input1').addEventListener('click', function(){
  getId('headimg1').click();
});
//图片预览
getId('headimg').onchange = function(e) {
  imgFile = this.files[0];
  let d_src = URL.createObjectURL(imgFile); 
  showBefore.src = d_src;
  showBefore.onload = function(){
    URL.revokeObjectURL(d_src);
  }
}
getId('headimg1').onchange = function(e) {
  imgFile1 = this.files[0];
  let d_src = URL.createObjectURL(imgFile1);
  showBetween.src = d_src;
  showBetween.onload = function(){
    URL.revokeObjectURL(d_src);
  }
}
getId('download').addEventListener('click', function() {
  if(blobUrl) {
    let a = document.createElement('a');
    a.href = blobUrl;
    a.download = '换背景图.png';
    a.click();
  } else {
    alert('请先选择换背景图噢');
    return;
  }
})
/*纯色换背景*/
getId('matting').addEventListener('click', function (event) {
  if(!imgFile) {
    alert('请先选择图片噢');
    return;
  }

  let imgReader = new FileReader();
  if(!rightFix()) {
    alert("图片的格式需要为png/jpg/jpeg噢~");
    return;
  }

  imgReader.readAsDataURL(imgFile);
  imgReader.onload = (e) => {
    let originImg = new Image();
    originImg.src = e.target.result;
    originImg.onload = () => {
      let width = originImg.width;
      let height = originImg.height;
      dealImg(width, height, originImg);

    }
  }
});

/*图片换背景*/
/*getId('matting1').addEventListener('click', function (event) {
  if(!imgFile) {
    alert('请先选择图片噢');
    return;
  }

  let imgReader = new FileReader();
  if(!rightFix()) {
    alert("图片的格式需要为png/jpg/jpeg噢~");
    return;
  }

  imgReader.readAsDataURL(imgFile);
  imgReader.onload = (e) => {
    let originImg = new Image();
    originImg.src = e.target.result;
    originImg.onload = () => {
      let width = originImg.width;
      let height = originImg.height;
      if(!imgFile1) {
        alert('请先选择图片噢');
        return;
      }

      let imgReader1 = new FileReader();
      if(!rightFix()) {
        alert("图片的格式需要为png/jpg/jpeg噢~");
        return;
      }
      imgReader1.readAsDataURL(imgFile1);
      let originImg1 = new Image();
      originImg.src = imgReader1.target.result;
      changeImg(width, height, originImg,originImg1);

  }}
});*/
getId('matting1').addEventListener('click', function (event) {
  if (!imgFile) {
    alert('请先选择图片噢');
    return;
  }

  if (!rightFix()) { // 假设 rightFix 现在接受一个参数来检查格式
    alert("图片的格式需要为png/jpg/jpeg噢~");
    return;
  }

  let imgReader = new FileReader();
  imgReader.readAsDataURL(imgFile);
  imgReader.onload = function (e) {
    let originImg = new Image();
    originImg.src = e.target.result;
    originImg.onload = function () {
      let width = originImg.width;
      let height = originImg.height;

      if (!imgFile1) {
        alert('请先选择第二张图片噢');
        return;
      }

      if (!rightFix(imgFile1)) { // 假设 rightFix 现在接受一个参数来检查格式
        alert("第二张图片的格式需要为png/jpg/jpeg噢~");
        return;
      }

      let imgReader1 = new FileReader();
      imgReader1.readAsDataURL(imgFile1);
      imgReader1.onload = function (e1) {
        let originImg1 = new Image();
        originImg1.src = e1.target.result; // 这里应该是 originImg1.src
        originImg1.onload = function () {
          // 现在两个图片都加载好了，可以调用 changeImg 函数
          changeImg(width, height, originImg, originImg1);
        };
      };
    };
  };
});
/**
* function 抠图完整逻辑
* @param {number} width
* @param {number} height
* @param {Image} originImg
*/
/*function dealImg(width, height, originImg) {
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(originImg, 0, 0);

  let tl = Array.prototype.slice.call(ctx.getImageData(0, 0, 1, 1).data);
  let tr = Array.prototype.slice.call(ctx.getImageData(width - 1, 0, 1, 1).data);
  let br = Array.prototype.slice.call(ctx.getImageData(width - 1, height - 1, 1, 1).data);
  let bl = Array.prototype.slice.call(ctx.getImageData(0, height - 1, 1, 1).data);

  if(tl[3] === 0 || tr[3] === 0 || br[3] === 0 || bl[3] === 0) {
    alert('此图已经被抠过了哦');
    return;
  }

  let avgPixel = [];
  for(let i = 0; i < 4; i++){
    avgPixel[i] = (tl[i] + tr[i] + br[i] + bl[i]) / 4;
  }

  let imgPixel = ctx.getImageData(0, 0, width, height);
  let imgPixelData = imgPixel.data;
  for (let i = 0; i < imgPixelData.length; i += 4) {
    let pixelR = imgPixelData[i];
    let pixelG = imgPixelData[i + 1];
    let pixelB = imgPixelData[i + 2];

    let outFlag = [pixelR, pixelG, pixelB].every((item, index) => {
      return item > ( avgPixel[index] - outline ) && item < ( avgPixel[index] + outline )
    })
    if(outFlag) {
      imgPixelData[i + 3] = 152;
    }
  }
  ctx.putImageData(imgPixel, 0, 0);
  // dataUrl = canvas.toDataURL("image/png");
  // 由于浏览器实现，a标签href无法承载过长base64，所以对于大图片需要转bloburl下载，否则会出现network error
  canvas.toBlob(function(blob) {
    blobUrl = URL.createObjectURL(blob);
    showAfter.src = blobUrl;
  });

}*/
function changeImg(width, height, originImg, originImg1){

  // 假设 canvas 和 ctx 已经在外部定义并初始化
  canvas.width = width;
  canvas.height = height;
  canvas1.width = width;
  canvas1.height = height;
  ctx.drawImage(originImg, 0, 0, width, height);
  let imgPixel = ctx.getImageData(0, 0, width, height);
  let imgPixelData = imgPixel.data;
  ctx1.drawImage(originImg1,0, 0, width, height);
  let imgPixel1 = ctx1.getImageData(0, 0, width, height);
  let imgPixelData1 = imgPixel1.data;
  // 获取四个角点的像素数据
  let tl = ctx.getImageData(0, 0, 1, 1).data;
  let tr = ctx.getImageData(width - 1, 0, 1, 1).data;
  let br = ctx.getImageData(width - 1, height - 1, 1, 1).data;
  let bl = ctx.getImageData(0, height - 1, 1, 1).data;

  // 检查图片是否已经被处理过
  if (tl[3] === 0 || tr[3] === 0 || br[3] === 0 || bl[3] === 0) {
    alert('此图已经被抠过了哦');
    return;
  }

  // 计算RGB的平均值（不包括透明度）
  let avgPixelRGB = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    avgPixelRGB[i] = (tl[i] + tr[i] + br[i] + bl[i]) / 4;
  }

  // 获取图片的全部像素数据

  for (let y1 = 0; y1 < height; y1++){
    var laft=0;
    var right=0;
    for (let x1 = 0; x1 < width; x1++){
      const i1 = (y1 * width + x1) * 4;
      let pixelR = imgPixelData[i1];
      let pixelG = imgPixelData[i1 + 1];
      let pixelB = imgPixelData[i1 + 2];

      const i=(y1 * width + (width-x1-1)) * 4;
      let pixelR1 = imgPixelData[i];
      let pixelG1 = imgPixelData[i + 1];
      let pixelB1 = imgPixelData[i + 2];
      // 检查像素是否在平均值的指定范围内
      let outFlag = !(
          pixelR > (avgPixelRGB[0] - outline) &&
          pixelR < (avgPixelRGB[0] + outline) &&
          pixelG > (avgPixelRGB[1] - outline) &&
          pixelG < (avgPixelRGB[1] + outline) &&
          pixelB > (avgPixelRGB[2] - outline) &&
          pixelB < (avgPixelRGB[2] + outline)
      );
      let outFlag1 = !(
          pixelR1 > (avgPixelRGB[0] - outline) &&
          pixelR1 < (avgPixelRGB[0] + outline) &&
          pixelG1 > (avgPixelRGB[1] - outline) &&
          pixelG1 < (avgPixelRGB[1] + outline) &&
          pixelB1 > (avgPixelRGB[2] - outline) &&
          pixelB1 < (avgPixelRGB[2] + outline)
      );

      if(outFlag){
        laft=1;
      }
      if (!outFlag) {
        if(!laft){
          imgPixelData[i1] = imgPixelData1[i1]; // R
          imgPixelData[i1 + 1] = imgPixelData1[i1 + 1]; // G
          imgPixelData[i1 + 2] = imgPixelData1[i1 + 2]; // B
        }

      }
      if(outFlag1){
        right=1;
      }
      if(!outFlag1) {
        if(!right){
          imgPixelData[i] = imgPixelData1[i]; // R
          imgPixelData[i + 1] = imgPixelData1[i + 1]; // G
          imgPixelData[i + 2] = imgPixelData1[i + 2]; // B

        }
      }
      // 如果不在范围内，将像素设置为红色
    }
  }

  // 将处理后的像素数据放回画布
  ctx.putImageData(imgPixel, 0, 0);

  // 转换图片为Blob URL并显示在img元素上
  canvas.toBlob(function(blob) {
    blobUrl = URL.createObjectURL(blob);
    let showAfter = document.getElementById('showAfter'); // 假设showAfter是img元素的ID
    showAfter.src = blobUrl;
  });
}

function dealImg(width, height, originImg) {
  // 获取颜色选择器的DOM元素
  var backgroundColorPicker = document.getElementById('backgroundColorPicker');
// 监听颜色选择器变化的事件
    var hexColor = backgroundColorPicker.value; // 获取当前选中的颜色值，例如：#ffffff
    // 去掉#号
    hexColor = hexColor.slice(1);

    // 将十六进制颜色转换为RGB
    var r = parseInt(hexColor.substring(0, 2), 16);
    var g = parseInt(hexColor.substring(2, 4), 16);
    var b = parseInt(hexColor.substring(4, 6), 16);


  // 假设 canvas 和 ctx 已经在外部定义并初始化
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(originImg, 0, 0, width, height);

  // 获取四个角点的像素数据
  let tl = ctx.getImageData(0, 0, 1, 1).data;
  let tr = ctx.getImageData(width - 1, 0, 1, 1).data;
  let br = ctx.getImageData(width - 1, height - 1, 1, 1).data;
  let bl = ctx.getImageData(0, height - 1, 1, 1).data;

  // 检查图片是否已经被处理过
  if (tl[3] === 0 || tr[3] === 0 || br[3] === 0 || bl[3] === 0) {
    alert('此图已经被抠过了哦');
    return;
  }

  // 计算RGB的平均值（不包括透明度）
  let avgPixelRGB = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    avgPixelRGB[i] = (tl[i] + tr[i] + br[i] + bl[i]) / 4;
  }

  // 获取图片的全部像素数据
  let imgPixel = ctx.getImageData(0, 0, width, height);
  let imgPixelData = imgPixel.data;


  for (let y1 = 0; y1 < height; y1++){
    var laft=0;
    var right=0;
    for (let x1 = 0; x1 < width; x1++){
      const i1 = (y1 * width + x1) * 4;
      let pixelR = imgPixelData[i1];
      let pixelG = imgPixelData[i1 + 1];
      let pixelB = imgPixelData[i1 + 2];

      const i=(y1 * width + (width-x1-1)) * 4;
      let pixelR1 = imgPixelData[i];
      let pixelG1 = imgPixelData[i + 1];
      let pixelB1 = imgPixelData[i + 2];
      // 检查像素是否在平均值的指定范围内
      let outFlag = !(
          pixelR > (avgPixelRGB[0] - outline) &&
          pixelR < (avgPixelRGB[0] + outline) &&
          pixelG > (avgPixelRGB[1] - outline) &&
          pixelG < (avgPixelRGB[1] + outline) &&
          pixelB > (avgPixelRGB[2] - outline) &&
          pixelB < (avgPixelRGB[2] + outline)
      );
      let outFlag1 = !(
          pixelR1 > (avgPixelRGB[0] - outline) &&
          pixelR1 < (avgPixelRGB[0] + outline) &&
          pixelG1 > (avgPixelRGB[1] - outline) &&
          pixelG1 < (avgPixelRGB[1] + outline) &&
          pixelB1 > (avgPixelRGB[2] - outline) &&
          pixelB1 < (avgPixelRGB[2] + outline)
      );

      if(outFlag){
        laft=1;
      }
      if (!outFlag) {
        if(!laft){
          imgPixelData[i1] = r; // R
          imgPixelData[i1 + 1] = g; // G
          imgPixelData[i1 + 2] = b; // B
        }

      }
      if(outFlag1){
        right=1;
      }
      if(!outFlag1) {
        if(!right){
          imgPixelData[i] = r; // R
          imgPixelData[i + 1] = g; // G
          imgPixelData[i + 2] = b; // B
        }
      }
      // 如果不在范围内，将像素设置为红色
    }
  }

  // 将处理后的像素数据放回画布
  ctx.putImageData(imgPixel, 0, 0);

  // 转换图片为Blob URL并显示在img元素上
  canvas.toBlob(function(blob) {
    blobUrl = URL.createObjectURL(blob);
    let showAfter = document.getElementById('showAfter'); // 假设showAfter是img元素的ID
    showAfter.src = blobUrl;
  });
}


/**
* function 判断图片是否为以下格式之一，若是则返回true
* @return {boolean}
*/
function rightFix() {
  let suffix = imgFile.name.substring(imgFile.name.lastIndexOf('.')+1);
  if(suffix !== 'png' && suffix !== 'PNG' && suffix !== 'jpg' && suffix !== 'JPG' && suffix !== 'jpeg') {
    return false;
  }
  return true;
}