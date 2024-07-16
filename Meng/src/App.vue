<template>
    <header style="display: flex;">
        <div @click="this.cite_depth = 0" style="width: 20px; height: 20px; cursor: pointer; margin-right: 5px;">0</div>
        <div @click="this.cite_depth = 1" style="width: 20px; height: 20px; cursor: pointer;margin-right: 5px;">1</div>
        <div @click="this.cite_depth = 2" style="width: 20px; height: 20px; cursor: pointer;margin-right: 5px;">2</div>
        <div @click="this.cite_depth = 3" style="width: 20px; height: 20px; cursor: pointer;margin-right: 5px;">3</div>
        <div @click="this.showNextLevel = false" style="width: 20px; height: 20px; cursor: pointer;margin-right: 5px;">F</div>
        <div @click="this.showNextLevel = true" style="width: 20px; height: 20px; cursor: pointer;margin-right: 5px;">T</div>
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
import book_data from '@/assets/book_tree_full.json';
// import book_data from '@/assets/book_tree.json';
import meng_data from '@/assets/meng_full_new.json';
import packedSquare from "@/js/packedSquare"
import tree from "@/js/tree"
import { getRandomNumber, concatName } from '@/js/utils'
import Timeline from '@/components/timeline.vue';
import transition from '@/js/transition.js'

var t = d3.transition().duration(750);
import Title from './components/title.vue';
book_data.sort((a, b) => b.writing_year - a.writing_year);
var h_books = book_data.map(book => tree(book));
export default{
    data() {
        return {
            totalWidth: 0,
            totalHeight: 0,
            bottomHeightRatio: 0.1,
            book_height: 0,
            padding: 2,
            cite_depth: 0,
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
        highlightBook(bookName) {
            // 高亮显示名为 bookName 的书籍
            const book = d3.select(`.${bookName.replace(/\s+/g, '-')}`);
            // book.select("rect.l0, rect.l1, rect.l2, rect.l3").style("fill", "red");
            // 放大名为 bookName 的书籍的 rect
            book.selectAll("rect.l0, rect.l1, rect.l2, rect.l3").each(function(d) {
                d3.select(this).attr("height", function(d) { return (d.y1 - d.y0) * 4; });
            });
            // 隐藏其他书的 rect 和 text
            d3.selectAll("rect.l0, rect.l1, rect.l2, rect.l3, text.books").style("opacity", 0);
            book.selectAll("rect.l0, rect.l1, rect.l2, rect.l3, text.books").style("opacity", 1);
        },
        unhighlightBook(bookName) {
            // 取消高亮显示名为 bookName 的书籍
            const book = d3.select(`.${bookName.replace(/\s+/g, '-')}`);
            // book.select("rect.l0, rect.l1, rect.l2, rect.l3").style("fill", "none");
            book.selectAll("rect.l0, rect.l1, rect.l2, rect.l3").attr("height", function(d) { return (d.y1 - d.y0)/2; });
            // 显示所有书的 rect
            d3.selectAll("rect.l0, rect.l1, rect.l2, rect.l3").style("opacity", 1);
            // 将所有书的 text 的透明度设置为 0
            d3.selectAll("text.books").style("opacity", 0);
        },
        updateLevel(level) {
            this.cite_depth = level;
        },
        updateLevelMeng(level) {
            // 清除之前的高亮效果
            d3.selectAll('.l1, .l2, .l3').style('fill', 'none');
            switch (level) {
                case '类':
                    this.current_depth = 1;
                    d3.selectAll('.l1').style('fill', 'red');
                    break;
                case '卷':
                    this.current_depth = 2;
                    d3.selectAll('.l2').style('fill', 'red');
                    break;
                case '条':
                    this.current_depth = 3;
                    d3.selectAll('.l3').style('fill', 'red');
                    break;
            }
            // 更新所有节点的颜色
            // d3.selectAll('rect')
            //     .attr("fill", d => this.current_depth === d.depth ? "red" : "none");
        },
        updateMengLevel(level) {
            switch (level) {
                case '类':
                    this.meng_depth = 1;
                    break;
                case '卷':
                    this.meng_depth = 2;
                    break;
                case '条':
                    this.meng_depth = 3;
                    break;
            }
            // 更新所有与 meng 相关的 rect 的颜色
            d3.selectAll('.m1, .m2, .m3').style('fill', 'none');
            d3.selectAll(`.m${this.meng_depth}`).style('fill', 'red');
        },
        mengInit(){
            // book_data.sort((a, b) => b.writing_year - a.writing_year);
            // var h_books = book_data.map(book => tree(book));
            let meng_padding = 3;
            const meng_container = d3.select("#main_svg").append('g')
                            .attr('class',"meng")
                            .attr("transform",`translate(0, ${this.upperHeight})`)
            const assign_position = packedSquare()
                            .set_depth(100)
                            .size([this.totalWidth, this.bottomHeight])
                            .padding(meng_padding);
            // const book2date = Object.fromEntries(new Map(book_data.map(d=>[d.name, d.writing_year])));
            // const Years = Object.values(book2date)
            // const timeScale = d3.scaleLinear().domain([d3.min(Years),d3.max(Years)]).range([100, this.upperHeight])        
            const meng_root = tree(meng_data);
            const root = assign_position(meng_root);
            const cell = meng_container.selectAll('g')
                            .data(root.find_node_and_get_first_descendants(root))
                            .join("g")
                            .attr("transform", d => `translate(${d.x0},${d.y0})`);
                            // .join(
                            //     enter => enter
                            //             .append("g")
                            //             .attr("transform", d => `translate(${d.x0},${d.y0})`),
                            //     update => update
                            //             .attr("transform", d => `translate(${d.x0},${d.y0})`),
                            //     exit => exit.remove()
                            // );
            const texts = cell.append("text")
                .text(d=>d.data.name ? d.data.name : "空")
                .attr("x", d => (d.x1 - d.x0)/4)
                .attr("y", d => 20 )
                .attr("cursor", "default")
                .style("writing-mode", "tb");

            let focus = root;
            const clickMengEvent = (event, current_meng) => {
                    if(current_meng.data.is_leaf){
                        return
                    }
                    const that = this;
                    this.meng_depth = focus === current_meng ? current_meng.depth - 1 : current_meng.depth;
                    focus = focus === current_meng ? current_meng = current_meng.parent : current_meng;
                    const new_root = assign_position(current_meng);
                    meng_container.selectAll("g").remove();
                    meng_container.selectAll("g").data([new_root, ...new_root.children])
                            .join("g")
                            .attr("transform", d => `translate(${d.x0},${d.y0})`)
                                .append("rect")
                                .attr("class", d=>`m${d.depth}`)
                                .attr("width", d => d.x1 - d.x0)
                                .attr("height", d => d.y1 - d.y0)
                                .attr("name", d=>d.data.name)
                                .attr("fill", "transparent")
                                .attr("stroke", "black")
                                .attr("stroke-width", "1px")
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
                                .on("click", clickMengEvent);
                    
                    // rects.each(function(){
                    //     d3.select(this.parentNode).call(transition, that)
                    // });
            };
            cell.append("rect")
                .attr("class", d=>`m${d.depth}`)
                .attr("width", d => d.x1 - d.x0)
                .attr("height", d => d.y1 - d.y0)
                .attr("name", d=>d.data.name)
                .attr("fill", "transparent")
                .attr("stroke", "black")
                .attr("stroke-width", "1px")
                .attr("opacity", d=>{
                    if(d.depth == this.meng_depth) return "1"
                    else if(d.depth == this.meng_depth + 1) return "0.2"
                    else return "0"
                })
                .attr('cursor', 'pointer')
                .on("mouseover", (_e, d) => {
                    d3.select(_e.target).attr("stroke", "red");
                    if(d.depth === 0){
                        return null;
                    }
                    const all_cited_nodes = h_books.map(b=>b.get_cited_nodes_by_depth(this.cite_depth, d.depth, d.data.name)).flat();
                    const all_names = all_cited_nodes.map(d=> concatName(d))
                    this.selectedNodes = d3.selectAll(`.l${this.cite_depth}`).filter( d => all_names.includes(concatName(d))).attr("fill", "red");
                })
                .on("mouseout", (_e, d) => {
                    d3.select(_e.target).attr("stroke", "black")
                    if(d.depth === 0) return null;
                    this.selectedNodes.attr("fill", "none");
                    this.selectedNodes = [];
                })
                .on("click", clickMengEvent);
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
                    .attr("class", "books")
                    .text(d => d.data.name ? d.data.name + d.value : "空" + d.value)
                    .attr("y", d => d.depth === this.cite_depth ? "0" : "20")
                    .attr("x", d => (d.x1 - d.x0)/4)
                    .attr("opacity", 0)
                    .attr("font-size", d => d.depth === this.cite_depth ? "15" : "0")
                    .style("writing-mode", "tb");
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
                    .attr("stroke-width", "1px")
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
                    .on("mouseover", (event, d) => {
                        this.selectedNodes = d3.selectAll(`.m${this.meng_depth}`)
                        .filter(node=> {
                            return d.cite[this.meng_depth].includes(node.data.name)})
                        .attr("fill","red");
                    })
                    .on("mouseout", (event, d) => {
                        this.selectedNodes.attr("fill", "none");
                        this.selectedNodes = [];
                    })
                    .on("click", this.openDetail)
            }

            const upperCell = this.addNodes(citeBooksContainer);
            const upperRect = this.addRect(upperCell);
            const upperText = this.addText(upperCell);
            return [citeBooksContainer, upperCell, upperRect, upperText]
        }
    },
    watch:{
        cite_depth(){
            this.upperCell.remove();
            this.upperCell = this.addNodes(this.citeBooksContainer);
            this.upperRect = this.addRect(this.upperCell);
            this.upperText = this.addText(this.upperCell);
        },
        showNextLevel(){
            this.upperRect
                .attr("opacity", d => {
                    if(d.depth == this.cite_depth) return "1"
                    else if(d.depth == this.cite_depth + 1) return "0.2"
                    else return "0"
                })
                .style("display", d=> d.depth == this.cite_depth || this.showNextLevel ? null : "none");
        }
    },
    mounted(){
        this.totalHeight = this.$refs['main'].clientHeight;
        this.totalWidth = this.$refs['main'].clientWidth - this.padding;
        this.minimum_book_height = this.totalHeight / book_data.length;
        d3.select("#canvas").attr("width", this.totalWidth).attr("height", this.upperHeight);
        this.svg = this.mengInit();
        [this.citeBooksContainer, this.upperCell, this.upperRect, this.upperText] = this.initUpper();
    },
}
</script>


<style scoped>
#main{
    width: 100%; 
    height: 99%; 
    overflow: scroll; 
    display:flex; 
}

.node_container{

}
</style>
