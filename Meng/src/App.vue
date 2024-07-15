<template>
    <!-- <header>《梦溪笔谈》影响可视化</header> -->
    <div id="main" style="width: 100%; height: 99%; overflow: scroll; display:flex;">
        <div ref="main" style="width: 90%; height: 100%;">
            <svg width="100%" height="100%">
                <g id="canvas"></g>
            </svg>
        </div>
        <div style="width: 6%; height: 100%;">
            <Timeline @book-hover="highlightBook" @book-unhover="unhighlightBook" />
        </div>
        <div style="width: 4%; height: 100%;">
            <Title @level-selected="updateLevel" @level-selected-meng="updateMengLevel"/>
        </div>
        <!-- <MainView></MainView> -->
    </div>
</template>


<script>
import * as d3 from 'd3';
import book_data from '@/assets/book_tree_full.json';
// import book_data from '@/assets/book_tree.json';
import meng_data from '@/assets/meng_full.json';
import packedSquare from "@/js/packedSquare"
import tree from "@/js/tree"
import { getRandomNumber, concatName } from '@/js/utils'
import Timeline from './components/timeline.vue';
import Title from './components/title.vue';
// var h_books = book_data.map(book => tree(book));
export default{
    data() {
        return {
            totalWidth: 0,
            totalHeight: 0,
            bottomHeightRatio: 0.1,
            book_height: 0,
            padding: 2,
            current_depth: 1,
            meng_depth: 1,
            selectedNodes: []
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
        mainGTranslate(){
            return `translate(${this.padding, this.padding})`
        }
    },
    methods:{
        assign_x_pos(children){
            // const interval = this.
        },
        find_cited_book_by_level(meng_item, level){
            meng_item = "故事二"
            level = 1;
            return 
        },
        highlightBook(bookName) {
            // 高亮显示名为 bookName 的书籍
            const book = d3.select(`.${bookName.replace(/\s+/g, '-')}`);
            book.select("rect").style("fill", "red");
        },
        unhighlightBook(bookName) {
            // 取消高亮显示名为 bookName 的书籍
            const book = d3.select(`.${bookName}`);
            book.select("rect").style("fill", "none");
        },
        updateLevel(level) {
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
        init(){
            book_data.sort((a, b) => b.writing_year - a.writing_year);
            var h_books = book_data.map(book => tree(book));
            const book2date = Object.fromEntries(new Map(book_data.map(d=>[d.name, d.writing_year])));
            const Years = Object.values(book2date)
            const timeScale = d3.scaleLinear().domain([d3.min(Years),d3.max(Years)]).range([100, this.upperHeight])
            const svg = d3.select("#canvas");
            const meng_root = d3.hierarchy(meng_data).sum(d=>d.is_leaf? 1: 0);
            let meng_padding = 5;
            const partition = packedSquare()
                            .size([this.totalWidth, this.bottomHeight - meng_padding])
                            .padding(meng_padding);
            const root = partition(meng_root);

            const cell = svg.append('g')
                            .attr('class',"meng")
                            .attr("transform",`translate(0, ${this.upperHeight})`)
                            .selectAll('g')
                            .data(root.descendants())
                            .join("g")
                            .attr("transform", d => `translate(${d.x0},${d.y0})`);

            cell.append("rect")
                .attr("class", d=>`m${d.depth}`)
                .attr("width", d => d.x1 - d.x0)
                .attr("height", d => d.y1 - d.y0)
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", "1px")
                .attr("opacity", d=>d.depth == 1 ? "0.2" : "1")
                .attr('cursor', 'pointer')
                .on("mouseover", (_e, d) => {
                    if(d.depth === 0){
                        return null;
                    }
                    const all_cited_nodes = h_books.map(b=>b.get_cited_nodes_by_depth(this.current_depth, d.depth, d.data.name)).flat();
                    const all_names = all_cited_nodes.map(d=> concatName(d))
                    this.selectedNodes = d3.selectAll(`.l${this.current_depth}`).filter( d => all_names.includes(concatName(d))).attr("fill", "red");
                })
                .on("mouseout", (_e, d) => {
                    if(d.depth === 0) return null;
                    this.selectedNodes.attr("fill", "none");
                    this.selectedNodes = [];
                })

            const real_w_calculator = (h_books) => {
                const all_values = h_books.map(d=>d.value);
                return (value) => {
                    return value / d3.max(all_values) * (this.totalWidth - this.padding);
                }
            }
            const calculator = real_w_calculator(h_books)
            const upperCell = svg.selectAll(".line_container")
                                .data(h_books)
                                .join('g')
                                .attr("class","line_container")
                                .attr('class', h_book => `${h_book.data.name}`)
                                .attr("transform", (h_book, i) => {
                                    return `translate(${Math.floor(getRandomNumber(0, this.totalWidth - calculator(h_book.value)))}, ${32 * i})`})
                                .selectAll('g')
                                .data(h_book => {
                                    const partition = packedSquare()
                                                    .size([calculator(h_book.value), 30]) // [width, height]
                                                    .padding(5);
                                    const root = partition(h_book);
                                    return root.descendants();
                                })
                                .join("g")
                                .attr("transform", d => `translate(${d.x0},${d.y0})`);

            upperCell.append("rect")
                .attr("width", d => d.x1 - d.x0)
                .attr("height", d => d.y1 - d.y0)
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", "1px")
                .attr("opacity", d=>d.depth == this.current_depth  ? "1" : "0.1")
                .style("cursor", "pointer")
                .attr("class", (d, i)=>{
                    return `l${d.data.level}`;
                })
                .on("mouseover", (event, d) => {
                    this.selectedNodes = d3.selectAll(`.m${this.meng_depth}`)
                    .filter(node=> d.cite[this.meng_depth].includes(node.data.name))
                    .attr("fill","red");
                    console.log(this.selectedNodes)
                })
                .on("mouseout", (event, d) => {
                    this.selectedNodes.attr("fill", "none");
                    this.selectedNodes = [];
                })

        },
        test(){
            d3.select("#canvas").append("")
        }

    },
    mounted(){
        this.totalHeight = this.$refs['main'].clientHeight;
        this.totalWidth = this.$refs['main'].clientWidth - this.padding;
        this.minimum_book_height = this.totalHeight / book_data.length;
        this.init();
    },
}
</script>


<style scoped>

</style>
