<template>
    <header>《梦溪笔谈》影响可视化</header>
    <div ref="main" id="main" style="width: 100%; height: 99%; overflow: scroll;">
        <svg width="100%" height="100%">
            <g id="canvas"></g>
        </svg>
        <!-- <MainView></MainView> -->
    </div>
</template>


<script>
// import MainView from './components/MainView.vue';
import * as d3 from 'd3';
import book_data from '@/assets/book_tree_full.json';
// import book_data from '@/assets/book_tree.json';
import meng_data from '@/assets/meng.json';
import packedSquare from "@/js/packedSquare"
import tree from "@/js/tree"
import { getRandomNumber } from '@/js/utils'
var h_books = book_data.map(book => tree(book));
// console.log(h_books[0].data.name)
// console.log(h_books.map(b => b.get_cited_nodes_by_depth(3,0,"故事二")).flat())
export default{
    data() {
        return {
            totalWidth: 0,
            totalHeight: 0,
            bottomHeightRatio: 0.1,
            book_height: 0,
            padding: 2,
            current_depth: 0,
        }
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
    components:{
        // MainView: MainView
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
        init(){
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
                .attr("width", d => d.x1 - d.x0)
                .attr("height", d => d.y1 - d.y0)
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", "1px")
                .attr("opacity", d=>d.depth == 1 ? "0.2" : "1");

            // svg.selectAll(".meng")
            //     .data(level1_meng)
            //     .join("rect")
            //     .attr("x", d => totalWidth * (d.value / meng_root.value))
            //     .attr("y", 100)
            //     .attr("width", d => totalWidth * (d.value / meng_root.value))
            //     .attr("height", 100)
            //     .attr('fill', d=>color(d.name));
                    
            // const h_books = book_data.map(book => d3.hierarchy(book).sum(d=> d.is_leaf ? d.value.length : 0));
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
                .on("click", (event, d) => {
                    console.log(event.target, d)
                })
        },

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
