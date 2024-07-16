<template>
    <header style="display: flex;">
        <div @click="this.cite_depth = 0" style="width: 20px; height: 20px; cursor: pointer; margin-right: 5px;">0</div>
        <div @click="this.cite_depth = 1" style="width: 20px; height: 20px; cursor: pointer;margin-right: 5px;">1</div>
        <div @click="this.cite_depth = 2" style="width: 20px; height: 20px; cursor: pointer;margin-right: 5px;">2</div>
        <div @click="this.cite_depth = 3" style="width: 20px; height: 20px; cursor: pointer;margin-right: 5px;">3</div>
        <!-- <div @click="this.showNextLevel = false" style="width: 20px; height: 20px; cursor: pointer;margin-right: 5px;">F</div>
        <div @click="this.showNextLevel = true" style="width: 20px; height: 20px; cursor: pointer;margin-right: 5px;">T</div> -->
    </header>
    <div id="main">
        <div ref="main" style="width: 90%; height: 100%;">
            <svg id="main_svg" width="100%" height="100%">
                <svg id="canvas" style="overflow: scroll;"></svg>
            </svg>
        </div>
        <div style="width: 6%; height: 100%;">
            <Timeline @book-hover="highlightBook" @book-unhover="unhighlightBook" />
        </div>
        <div style="width: 4%; height: 100%;">
            <Title @level-selected="updateLevel" @level-selected-meng="updateMengLevel"/>
        </div>
    </div>
</template>


<script>
import * as d3 from 'd3';
import book_data from '@/assets/cited_tree.json';
import meng_data from '@/assets/meng_full.json';
import packedSquare from "@/js/packedSquare"
import tree from "@/js/tree"
import { getRandomNumber, concatName, count, curve_generator} from '@/js/utils'
import Timeline from '@/components/timeline.vue';
import transition from '@/js/transition.js'

import Title from './components/title.vue';

var h_books = book_data.map(book => tree(book)).sort((a, b) => b.writing_year - a.writing_year);
var meng_root = tree(meng_data);

export default{
    data() {
        return {
            totalWidth: 0,
            totalHeight: 0,
            bottomHeightRatio: 0.1,
            book_height: 0,
            padding: 2,
            cite_depth: 1,
            meng_depth: 1,
            selectedNodes: [],
            showNextLevel: false,
        }
    },
    components:{
        Timeline: Timeline,
        Title: Title
    },
    computed:{
        bottomHeight(){
            return this.totalHeight * this.bottomHeightRatio;
        },
        upperHeight(){
            return this.totalHeight * (1 - this.bottomHeightRatio);
        },
    },
    methods:{
        assign_position(meng_root, meng_padding = 3){
            return packedSquare()
                .set_depth(100)
                .size([this.totalWidth, this.bottomHeight])
                .padding(meng_padding)(meng_root);
        },
        mengInit(){
            const meng_container = d3.select("#main_svg").append('g')
                            .attr('class',"meng")
                            .attr("transform",`translate(0, ${this.upperHeight})`)
            const root = this.assign_position(meng_root);
            const cell = meng_container.selectAll('g')
                            .data(root.find_node_and_get_first_descendants(root))
                            .join("g")
                            .attr("transform", d => `translate(${d.x0},${d.y0})`)
            const addMengTexts = (cell) =>{
                    cell.append("text")
                        .filter( d=> d.depth == this.meng_depth)
                        .text(d => d.data.name ? d.data.name : "")
                        .classed("vertcal_text_meng",true)
                        .attr("x", d => "0.45rem")
                        .attr("y", d =>0)
                        .attr("cursor", "default");
            }

            cell.append("rect")
                .attr("class", d=>`m${d.depth}`)
                .attr("width", d => d.x1 - d.x0)
                .attr("height", d => d.y1 - d.y0)
                .attr("name", d=>d.data.name ? d.data.name : "null")
                .attr("fill", d=>this.$color[d.data.name ? d.data.name : "null"])
                .attr("stroke", "black")
                .attr("stroke-width", "0px")
                .attr("opacity", d=>{
                    if(d.depth == this.meng_depth) return "1"
                    else if(d.depth == this.meng_depth + 1) return "0.2"
                    else return "0"
                })
                .attr('cursor', 'pointer')
                .on("click", this.mengChange);
            cell.call(addMengTexts);
        },
        mengChange(event, current_meng){
            let focus = meng_root;
            console.log(meng_root)
            this.remove_sankey()
            const meng_container = d3.select(".meng")
            if(current_meng.data.is_leaf){
                return
            }
            this.meng_depth = focus === current_meng ? (current_meng.depth - 1 > 0 ? current_meng.depth - 1 : 0) : current_meng.depth + 1;
            focus = focus === current_meng ? current_meng = current_meng.parent : current_meng;
            // console.log(current_meng)
            const new_root = this.assign_position(current_meng);
            console.log(new_root)
            const new_d = new_root.children ? [new_root, ...new_root.children] : [new_root]
            meng_container.selectAll("g").remove();

            const cell = meng_container.selectAll("g").data(new_d)
                    .join("g")
                    .attr("transform", d => `translate(${d.x0},${d.y0})`);

            cell.append("rect")
                .attr("class", d=>`m${d.depth}`)
                .attr("width", d => d.x1 - d.x0)
                .attr("height", d => d.y1 - d.y0)
                .attr("name", d=>d.data.name)
                .attr("fill", (d, i)=>{
                    return i == 0 ? "none": this.$color[d.find_parent_by_level(1).data.name]
                })
                .attr("stroke", "black")
                .attr("stroke-width", "0px")
                .attr("opacity", d=>{
                    if(d.depth == this.meng_depth) return "1"
                    else if(d.depth == this.meng_depth + 1) return "0.2"
                    else return "0"
                })
                .attr('cursor', 'pointer')
                .on("mouseenter", (_e, d) => {
                    d3.select(_e.target).attr("stroke", "red");
                    if(d.depth === 0){
                        return null;
                    }
                    const all_cited_nodes = h_books.map(b=>b.get_cited_nodes_by_depth(this.cite_depth, d.depth, d.data.name)).flat();
                    const all_names = all_cited_nodes.map(d=> concatName(d))
                    this.selectedNodes = d3.selectAll(`.l${this.cite_depth}`).filter( d => all_names.includes(concatName(d))).attr("fill", "red");
                })
                .on("mouseleave", (_e, d) => {
                    d3.select(_e.target).attr("stroke", "black")
                    if(d.depth === 0) return null;
                    this.selectedNodes.attr("fill", "none");
                    this.selectedNodes = [];
                })
                .on("click", this.mengChange)
            // cell.call(addMengTexts);
        },
        lengthCal(v){
            const nodes_arr = h_books.map(node => node.get_nodes_by_depth(this.cite_depth));
            const _ = nodes_arr.flat().map(d=>d.value);
            const length_arr = nodes_arr.map(d=>d.length);
            const value_range = [d3.min(_), d3.max(_)];

            let max_length = this.totalWidth / d3.max(length_arr);
            let min_length = max_length * 0.2 > 50 ? max_length * 0.2 : 50;

            return d3.scaleLinear().domain(value_range).range([min_length, max_length])(v);
        },
        initUpper(){
            const svg = d3.select("#canvas");

            const citeBooksContainer = svg.selectAll(".line_container")
                                .data(h_books)
                                .join('g')
                                .attr('class', book => `${book.data.name}`)
                                .attr("transform", (node, i, arr) => {
                                    return `translate(0, ${this.upperHeight*0.9 / arr.length * i})`})

            this.addNodes = (citeBooksContainer) => citeBooksContainer.selectAll('g')
                                .attr("class", "node_container")
                                .data(book => book.get_nodes_by_depth(this.cite_depth))
                                .join("g")
                                .attr("name", d=>d.data.name)
                                .attr("transform", (d, i, arr) => `translate(${this.totalWidth / arr.length * i}, 0)`)
                                .selectAll("g")
                                .data(node => {
                                    const assign_position = packedSquare()
                                                    .set_depth(1)
                                                    .size([this.lengthCal(node.value), 30]) // [width, height]
                                                    .padding(2);
                                    const root = assign_position(node);
                                    return root.children ? [root, ...root.children] : [root];
                                })
                                .join("g")
                                .attr("transform", d => `translate(${d.x0},${d.y0})`);
            this.addText = (upperCell) => {
                return upperCell.append("text")
                    .text(d => d.data.name ? d.data.name : "空")
                    .attr("y", 0)
                    .attr("x", -4)
                    .classed("vertcal_text_upper",true)
                    .classed("hide_text",true)

            }
            this.openDetail = (event, d) => {
                console.log("openDetail")
            }
            this.addRect = (upperCell) => {
                return upperCell.append("rect")
                    .attr("width", d => (d.x1 - d.x0)/2)
                    .attr("height", d => (d.y1 - d.y0)/2)
                    .attr("fill", "transparent")
                    .attr("stroke", "black")
                    .attr("stroke-width", "0px")
                    .attr("opacity", d=>{
                        if(d.depth == this.cite_depth) return "1"
                        else if(d.depth == this.cite_depth + 1) return "0.2"
                        else return "0"
                    })
                    .style("display", d=> d.depth == this.cite_depth || this.showNextLevel ? null : "none")
                    .style("cursor", "pointer")
                    .attr("class", (d, i)=>{
                        return `l${d.data.level}`;
                    })
                    .on("click", this.openDetail)
            }

            const upperCell = this.addNodes(citeBooksContainer);
            const upperRect = this.addRect(upperCell);
            const upperText = this.addText(upperCell);
            return [citeBooksContainer, upperCell, upperRect, upperText]
        },
        init_sankey(){
            const meng_g = d3.select(".meng").selectAll(`.m${this.meng_depth}`);
            const all_cited_rect = d3.selectAll(`.l${this.cite_depth}`);

            all_cited_rect.each((d,i,nodes) => {
                const n = nodes[i];
                const parent = d3.select(n.parentNode);
                let bbox = n.getBBox();
                const cite_num = count(d.cite[this.meng_depth]);
                let _start = 0;
                d.cite_rect = {}
                for (const [key, value] of Object.entries(cite_num)) {
                    d.cite_rect[key] = {
                        x: _start, y:0, w: value / d.cite[this.meng_depth].length  * bbox.width, h: bbox.height, num: value
                    }
                    _start += d.cite_rect[key].w;
                    parent.append("rect")
                        .attr("x", d.cite_rect[key].x)
                        .attr("y", d.cite_rect[key].y)
                        .attr("width", d.cite_rect[key].w)
                        .attr("height", d.cite_rect[key].h)
                        .attr("stroke", "none")
                        .attr("stroke-width", "0")
                        .attr("fill", this.$color[key ? key : "null"])
                        .attr("class", key ? key : "null")
                        .attr("pointer-events", "none")
                }
            })

            all_cited_rect
            .on("mouseover", (event, d) => {
                d3.select(event.target.parentNode).select("text").classed("hide_text", false).raise();
                const lower_rects = d3.select(".meng")
                                    .selectAll(`.${concatName(d)}`)
                                    .classed("hl", true).raise();
                const upper_rects = d3.select(event.target.parentNode).selectAll("rect").filter((_, i) => i != 0);
                let curves = []
                for(let lr of lower_rects){
                    let lower_name = d3.select(lr).data()[0].data.name;
                    lower_name = lower_name ? lower_name : "null";
                    let upper_rect = upper_rects.filter(function(){
                        return d3.select(this).attr("class") == lower_name;
                    }).node()
                    curves.push({
                        d: curve_generator(this.main_svg.node(), upper_rect, lr),
                        color: this.$color[lower_name]
                    })
                }
                this.draw_sankey(d.data.name, curves)        
            })
            .on("mouseout", (event, d) => {
                d3.select(event.target.parentNode).select("text").classed("hide_text", true);
                d3.selectAll(".hl").classed("hl", false);
                this.remove_sankey(d.data.name)        
            })

            meng_g.each((d,i,nodes) => {
                    const bbox = nodes[i].getBBox();
                    const parent = d3.select(nodes[i].parentNode);
                    const all_citation = d.count_cited_nodes_by_cite_depth(h_books, this.cite_depth)
                    const cited_num = count(all_citation);
                    let _start = 0;
                    d.cite_rect = {}
                    for(let [key, value] of Object.entries(cited_num)){
                        d.cite_rect[key] = {
                            x: _start, y:0, w: value / all_citation.length  * bbox.width, h: bbox.height, num: value
                        }
                        _start += d.cite_rect[key].w;
                        parent.append("rect")
                            .attr("x", d.cite_rect[key].x)
                            .attr("y", d.cite_rect[key].y)
                            .attr("width", d.cite_rect[key].w)
                            .attr("height", d.cite_rect[key].h)
                            .attr("stroke", "none")
                            .attr("fill", "none")
                            .attr("class", key)
                            .attr("pointer-events", "none")
                    }
            })
            meng_g.on("mouseover",(event,d)=>{
                    let curves = []
                    d.get_cited_doms_by_m_node(h_books, this.cite_depth)
                    .each((_d, i, nodes) => {
                        const selected_node = d3.select(nodes[i].parentNode).select(`.${d.data.name ? d.data.name : "null"}`)
                        .classed("hl",true).raise();
                        const meng_node = d3.select(".meng")
                            .selectAll(`.${concatName(_d)}`)
                            .filter(meng_node=>meng_node.data.name == d.data.name)
                            .node();
                        d3.select(nodes[i].parentNode).select("text").classed("hide_text", false);
                        curves.push({
                            d: curve_generator(this.main_svg.node(),selected_node.node(), meng_node),
                            color: this.$color[d.data.name]
                        })
                    })
                    this.draw_sankey(d.data.name, curves)
                
                })
                .on("mouseout", (e, d) => {
                    d3.select("#canvas").selectAll("text").classed("hide_text", true);
                    d3.selectAll(".hl").classed("hl", false);
                    this.remove_sankey(d.data.name)
                })
        },
        draw_sankey(sankey_name, curves){
            this.main_svg.selectAll(`.${sankey_name}sankey`)
                        .data(curves)
                        .join("path")
                        .attr("d", _d=>_d.d)
                        .classed(`${sankey_name}sankey`, true)
                        .classed("sankey", true)
                        .attr("fill", _d => _d.color)
                        .attr("opacity", 0.3)
        },
        remove_sankey(sankey_name){
            if(!sankey_name){
                this.main_svg.selectAll(".sankey").remove();
                this.main_svg.selectAll(".hl").classed("hl", false);
                return 
            }
            this.main_svg.selectAll(`.${sankey_name}sankey`).remove();
            this.main_svg.selectAll(".hl").classed("hl", false);
        }
    },
    watch:{
        cite_depth(){
            this.upperCell.remove();
            this.upperCell = this.addNodes(this.citeBooksContainer);
            this.upperRect = this.addRect(this.upperCell);
            this.upperText = this.addText(this.upperCell);
            this.init_sankey();
        },
        showNextLevel(){
            this.upperRect
                .attr("opacity", d => {
                    if(d.depth == this.cite_depth) return "1"
                    else if(d.depth == this.cite_depth + 1) return "0.2"
                    else return "0"
                })
                .style("display", d=> d.depth == this.cite_depth || this.showNextLevel ? null : "none");
        },
        meng_depth(){

        }
    },
    mounted(){
        this.totalHeight = this.$refs['main'].clientHeight;
        this.totalWidth = this.$refs['main'].clientWidth - this.padding;
        this.minimum_book_height = this.totalHeight / book_data.length;
        this.canvas = d3.select("#canvas").attr("width", this.totalWidth).attr("height", this.upperHeight);
        this.main_svg = d3.select("#main_svg");
        this.mengInit();
        [this.citeBooksContainer, this.upperCell, this.upperRect, this.upperText] = this.initUpper();
        this.init_sankey()
    },
}
</script>


<style>
#main{
    width: 100%; 
    height: 99%; 
    overflow: scroll; 
    display:flex; 
}

.node_container{

}

.hl{
    filter: drop-shadow(3px 2px 2px rgb(0 0 0 / 0.6));
    stroke: black;
    stroke-width: 0.5px;
    z-index: 100;
}

.vertcal_text_upper{
    writing-mode: tb;
    text-anchor: start;
    alignment-baseline: hanging;
}

.vertcal_text_meng{
    writing-mode: tb;
    text-anchor: start;
    alignment-baseline: ba;
}

.hide_text{
    display: none;
}

</style>
