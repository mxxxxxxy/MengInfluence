import * as d3 from 'd3'

export function getRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

export function concatName(tree_data){
    let name = tree_data.data.name;
    let current_node = tree_data;
    while(current_node.parent){
        name = current_node.parent.data.name + "-" + name
        current_node = current_node.parent;
    }
    return name;
}

// 定义一个函数来统计数组中每个元素出现的次数
export function count(arr) {
    // 创建一个空对象来存储每个元素的计数
    let countMap = {};
    
    // 遍历数组中的每个元素
    for (let i = 0; i < arr.length; i++) {
        let element = arr[i];
        
        // 如果元素在计数对象中已经存在，则计数加1，否则将计数设置为1
        if (countMap[element]) {
            countMap[element]++;
        } else {
            countMap[element] = 1;
        }
    }
    
    // 返回计数对象
    return countMap;
}

export function calRelBoundingBox(container, inner){
    let c = container.getBoundingClientRect()
    let i = inner.getBoundingClientRect()
    return {
        x: i.x - c.x,
        y: i.y - c.y,
        width: i.width,
        height: i.height,
    }
}

export function getItemImageUrl(name){
    return new URL('../assets/item_image/' + name + '.png', import.meta.url).href;
}

export function hasImg(pathImg){
    var ImgObj = new Image();
    ImgObj.src = pathImg;
    console.log(ImgObj)
     if(ImgObj.fileSize > 0 || (ImgObj.width > 0 && ImgObj.height > 0))
     {
       return true;
     } else {
       return false;
    }
}

export function curve_generator(main_svg, upper_rect, lower_rect){
    const link = d3.linkVertical();
    const upper_box = calRelBoundingBox(main_svg, upper_rect)
    const lower_box = calRelBoundingBox(main_svg, lower_rect)
    const c1 = link({source: [upper_box.x, upper_box.y + upper_box.height], target: [lower_box.x, lower_box.y]})
    const l1 = `l${lower_box.width},0`
    const c2 = link({source: [lower_box.x + lower_box.width, lower_box.y], target: [upper_box.x + upper_box.width, upper_box.y + upper_box.height]})
    const l2 = `l-${upper_box.width},0`
    return c1 + l1 + c2 + l2;
}

export function groupBy(array, key_f) {
    return array.reduce((result, currentItem) => {
      // 获取当前项的分组属性值
      const groupKey = key_f(currentItem);
      // 如果结果对象中没有当前分组，创建一个空数组
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      // 将当前项添加到对应分组数组中
      result[groupKey].push(currentItem);
      return result;
    }, {}); // 初始化结果为一个空对象
  };


  export function angleWithNegativeXAxis(start ,end) { //start end
    // 计算向量 AB 的坐标
    const [x1, y1] = start;
    const [x2, y2] = end;
    let dx = x1 - x2;
    let dy = y1 - y2;
    // 计算向量 AB 与 x 轴正方向的夹角 θ
    let theta = Math.atan2(dy, dx);
    
    // 计算与 x 负半轴的夹角
    let angleWithNegativeXAxis = Math.abs(Math.PI - theta);
    // console.log(theta)
    return angleWithNegativeXAxis; // 如果需要弧度则返回 angleWithNegativeXAxis
}




