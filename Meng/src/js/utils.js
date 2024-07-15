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


