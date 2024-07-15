
export default function() {
  var dx = 1,
      dy = 1,
      depth = 1,
      padding = 0,
      round = false;

  function partition(root) {
    // var n = root.height + 1;
    root.x0 = root.y0 = padding;
    root.x1 = dx - padding;
    root.y1 = dy - padding;
    root.eachBefore(positionNode(dy));
    if (round) root.eachBefore(roundNode);
    return root;
  }

  function positionNode(dy) {
    return function(node) {
      if (node.children && depth > 0) {
        depth -= 1
        Dice(node, node.x0 + padding, node.y0 + padding, node.x1 - padding, node.y1 - padding, padding);
      }
      var x0 = node.x0 ,
          y0 = node.y0 ,
          x1 = node.x1,
          y1 = node.y1;
      if (x1 < x0) x0 = x1 = (x0 + x1); //padding大于width的情况下让width = 0
      if (y1 < y0) y0 = y1 = (y0 + y1); //padding大于height的情况下让height = 0
      node.x0 = x0;
      node.y0 = y0;
      node.x1 = x1;
      node.y1 = y1;
    };
  }

  partition.round = function(x) {
    return arguments.length ? (round = !!x, partition) : round;
  };

  partition.set_depth = function(x) {
    return arguments.length ? (depth = x, partition) : depth;
  };

  partition.size = function(x) {
    return arguments.length ? (dx = +x[0], dy = +x[1], partition) : [dx, dy];
  };

  partition.padding = function(x) {
    return arguments.length ? (padding = +x, partition) : padding;
  };

  partition.find_node_and_get_first_descendants = function(_node){
    const found = this.find(node => concatName(node) === concatName(_node));
    return [found, ...found.children]
}

  return partition;
}



function Dice(parent, x0, y0, x1, y1, padding) {
    var nodes = parent.children,
    node,
    i = -1,
    n = nodes.length,
    k = parent.value && (x1 - x0 - (n-1) * padding) / parent.value;
    while (++i < n) {
        node = nodes[i];
        node.y0 = y0;
        node.y1 = y1;
        node.x0 = x0;
        node.x1 = x0 + node.value * k;
        x0 = node.x1 + padding;
    }
}

function roundNode(node) {
    node.x0 = Math.round(node.x0);
    node.y0 = Math.round(node.y0);
    node.x1 = Math.round(node.x1);
    node.y1 = Math.round(node.y1);
}