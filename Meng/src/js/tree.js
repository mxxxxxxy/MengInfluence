import * as d3 from 'd3';

export default function(book){
    var hier = d3.hierarchy(book).sum(d=> d.is_leaf ? d.value.length : 0);
    hier.each( n => n.cite = [[],[]])
    // 统计引用梦的条目
    hier.eachAfter( (current) => {
        if(current.data.is_leaf == true){
            current.cite[1] = current.data.value.map(d=>d['梦溪笔谈条目序数']);
        }
        if(current.parent){
            current.parent.cite[1] = current.parent.cite[1].concat(current.cite[1]);
        }
    })
    // 统计引用梦的卷题
    hier.eachAfter( (current, idx) => { 
        if(current.data.is_leaf == true){
            current.cite[0] = current.data.value.map(d=>d['卷题']);
        }
        if(current.parent){
            current.parent.cite[0] = current.parent.cite[0].concat(current.cite[0]);
        }
    })
    hier.get_nodes_by_depth = function(depth){
        return this.descendants().filter(_ => _.depth == depth);
    }
    hier.get_cited_nodes_by_depth = function(depth, m_depth, query){
        return this.descendants().filter(_ => _.depth == depth && _.cite[m_depth].includes(query));
    }
    return hier
}