import * as d3 from 'd3';
import { concatName } from '@/js/utils'

export default function(book){    
    // console.log(hier.__proto__)
    // 给引用梦溪笔谈的书加上引用的数据
    if(book.name !== "meng"){
        var hier = d3.hierarchy(book).sum(d=> d.is_leaf ? 1 : 0);
        hier.each( n => n.cite = [[],[],[],[]])
        // 统计引用梦的条目
        hier.eachAfter( (current) => {
            if(current.data.is_leaf == true){
                // current.cite[3] = current.data.value.map(d=>d['name']);
                current.cite[3] = current.data.name;
            }
            if(current.parent){
                current.parent.cite[3] = current.parent.cite[3].concat(current.cite[3]);
            }
        })
        // 统计引用梦的卷题
        hier.eachAfter( (current, idx) => { 
            if(current.data.is_leaf == true){
                current.cite[2] = current.data.value.map(d=>d['m2']);
            }
            if(current.parent){
                current.parent.cite[2] = current.parent.cite[2].concat(current.cite[2]);
            }
        })

        // 统计引用梦的卷题类
        hier.eachAfter( (current, idx) => { 
            if(current.data.is_leaf == true){
                current.cite[1] = current.data.value.map(d=>d['m1']);
            }
            if(current.parent){
                current.parent.cite[1] = current.parent.cite[1].concat(current.cite[1]);
            }
        })
    }else{
        var hier = d3.hierarchy(book).sum(d=> d.is_leaf ? d.value.length : 0);

        hier.__proto__.get_cited_doms_by_m_node = function(h_books, cite_depth){
            const all_names = h_books
                        .map(b=>b.get_cited_nodes_by_depth(cite_depth, this.depth, this.data.name))
                        .flat()
                        .map(d=> concatName(d));
           
            return d3.selectAll(`.l${cite_depth}`)
                .filter( _d => all_names.includes(concatName(_d)));
        }

        hier.__proto__.count_cited_nodes_by_cite_depth = function(h_books, cite_depth){
            const all_cited = this.leaves().map(n => n.data.value).flat().map(d=>{
                let _ = 0, n = [];
                while(_ <= cite_depth){
                    n.push(d[`l${_}`])
                    _ += 1
                }
                return n.join('-')
            });
            return all_cited;
        }

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

    hier.__proto__.find_node_and_get_its_parent = function(_node){
        const found = this.find(node => concatName(node) === concatName(_node));
        return found.parent;
    }

    hier.__proto__.find_parent_by_level = function(level){
        let current_node = this;
        while(current_node.depth !== level){
            if(!current_node.parent) return undefined;
            current_node = current_node.parent;
        }
        return current_node;
    }

    
    return hier
}
