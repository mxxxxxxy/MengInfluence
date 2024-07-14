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
