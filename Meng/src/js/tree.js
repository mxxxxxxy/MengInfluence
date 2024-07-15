import * as d3 from 'd3';
import { concatName } from '@/js/utils'

export default function(book){
    var hier = new d3.hierarchy(book).sum(d=> d.is_leaf ? 1 : 0);
    
    // console.log(hier.__proto__)
    // 给引用梦溪笔谈的书加上引用的数据
    if(book.name !== "meng"){
        hier.each( n => n.cite = [[],[],[],[]])
        // 统计引用梦的条目
        hier.eachAfter( (current) => {
            if(current.data.is_leaf == true){
                current.cite[3] = current.data.value.map(d=>d['梦溪笔谈条目序数']);
            }
            if(current.parent){
                current.parent.cite[3] = current.parent.cite[3].concat(current.cite[3]);
            }
        })
        // 统计引用梦的卷题
        hier.eachAfter( (current, idx) => { 
            if(current.data.is_leaf == true){
                current.cite[2] = current.data.value.map(d=>d['卷题']);
            }
            if(current.parent){
                current.parent.cite[2] = current.parent.cite[2].concat(current.cite[2]);
            }
        })

        // 统计引用梦的卷题类
        hier.eachAfter( (current, idx) => { 
            if(current.data.is_leaf == true){
                current.cite[1] = current.data.value.map(d=>d['卷题类']);
            }
            if(current.parent){
                current.parent.cite[1] = current.parent.cite[1].concat(current.cite[1]);
            }
        })
    }

    //获取某一层的节点
    hier.__proto__.get_nodes_by_depth = function(depth){
        return this.descendants().filter(_ => _.depth == depth);
    }

    // 获取某一层cite了梦m_depth的query的节点
    hier.__proto__.get_cited_nodes_by_depth = function(depth, m_depth, query){
        return this.descendants().filter(_ => _.depth == depth && _.cite[m_depth].includes(query));
    }

    hier.__proto__.find_node_and_get_first_descendants = function(_node){
        const found = this.find(node => concatName(node) === concatName(_node));
        return found.children ? [found, ...found.children] : [found]
    }
    
    return hier
}
