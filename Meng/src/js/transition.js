import * as d3 from "d3"

function rectWidth(d) {
    if(d.x1 < d.x0) d.x1 = d.x0 = (d.x0 + d.x1) / 2
    return d.x1 - d.x0;
}

function rectHeight(d) {
    if(d.y1 < d.y0) d.y1 = d.y0 = (d.y0 + d.y1) / 2;
    return d.y1 - d.y0;
  }

// function labelVisible(d) {
//   return d.y1 <= width && d.y0 >= 0 && d.x1 - d.x0 > 16;
// }

export default function(group, that){

    const levelTransition = d3.transition().duration(750);
    // group.transition(levelTransition).attr("transform", d => `translate(${d.target.x0},${d.target.y0})`);
    
    group.transition(levelTransition).attr("transform", d => `translate(${d.x0},${d.y0})`);
    // group.select("rect")
    //     .transition(levelTransition)
    //     .attr("width", d => rectWidth(d.target))
    //     .attr("height", d => rectHeight(d.target))
    //     .attr("opacity", d=>{
    //         if(d.depth == that.meng_depth) return "1"
    //         else if(d.depth == that.meng_depth + 1) return "0.2"
    //         else return "0"
    //     })
    group.select("rect")
        .transition(levelTransition)
        .attr("width", d => rectWidth(d))
        .attr("height", d => rectHeight(d))
        .attr("opacity", d=>{
            if(d.depth == that.meng_depth) return "1"
            else if(d.depth == that.meng_depth + 1) return "0.2"
            else return "0"
        })
}