<template>
    <header>《梦溪笔谈》影响可视化</header>
    <div ref="main" id="main" style="width: 100%; height: 100%;">
        <svg id="canvas" width="100%" height="100%">
        </svg>
        <!-- <MainView></MainView> -->
    </div>
</template>


<script>
// import MainView from './components/MainView.vue';
import * as d3 from 'd3';
import book_data from '@/assets/book_tree_full.json';
// import book_data from '@/assets/book_tree.json';
import meng_data from '@/assets/meng_full.json';
import packedSquare from "@/js/packedSquare"
import { getRandomNumber } from '@/js/utils'

export default{
    data() {
        return {
            
        }
    },
    components:{
        // MainView: MainView
    },
    methods:{
        hierarchical_packing(tree_data){

        },
        init(){
            const totalWidth = this.$refs['main'].offsetWidth;
            const totalHeight = this.$refs['main'].offsetHeight;
            const book2date = Object.fromEntries(new Map(book_data.map(d=>[d.name, d.writing_year])));
            const Years = Object.values(book2date)
            const timeScale = d3.scaleLinear().domain([d3.min(Years),d3.max(Years)]).range([100,totalHeight - 300])
            const svg = d3.select("#canvas");
            const meng_root = d3.hierarchy(meng_data).sum(d=>d.is_leaf? 1: 0);
            const partition = packedSquare()
                            .size([totalWidth -10, 100])
                            .padding(5);
            const root = partition(meng_root);

            // const color = d3.scaleOrdinal()
            //             .domain(meng_root.leaves().map(d=>d.data.name))
            //             .range(d3.schemeSpectral[10])
            //             .unknown("#ccc");

            const cell = svg.append('g')
                            .attr('class',"meng")
                            .attr("transform",`translate(0, ${totalHeight - 150})`)
                            .selectAll('g')
                            .data(root.descendants())
                            .join("g")
                            .attr("transform", d => `translate(${d.x0},${d.y0})`);

            cell.append("rect")
                .attr("width", d => d.x1 - d.x0)
                .attr("height", d => d.y1 - d.y0)
                .attr("fill", "none")
                // .attr("fill", d => {
                //     if (!d.depth) return "#ccc";
                //     while (d.depth > 1) d = d.parent;
                //     console.log(d)
                //     return color(d.data.name);
                // });
                .attr("stroke", "black")
                .attr("stroke-width", "1px")
                .attr("opacity", d=>d.depth == 1 ? "1" : "0.2");

            // svg.selectAll(".meng")
            //     .data(level1_meng)
            //     .join("rect")
            //     .attr("x", d => totalWidth * (d.value / meng_root.value))
            //     .attr("y", 100)
            //     .attr("width", d => totalWidth * (d.value / meng_root.value))
            //     .attr("height", 100)
            //     .attr('fill', d=>color(d.name));
                    
            const h_books = book_data.map(book => d3.hierarchy(book).sum(d=> d.is_leaf ? d.value.length : 0));
            const real_w_calculator = function(h_books){
                const all_values = h_books.map(d=>d.value);
                return function(value){
                    return value / d3.max(all_values) *totalWidth;
                }
            }(h_books)

            console.log('calculate', real_w_calculator(40))
            let i = 0
            for(const h_book of h_books){
                const real_w = real_w_calculator(h_book.value)
                const partition = packedSquare()
                                .size([real_w, 30])
                                // .size([totalWidth - 10, 30])
                                .padding(5);
                const root = partition(h_book);
                const start_x = getRandomNumber(0, totalWidth - 10 - real_w)
                const cell = svg
                                .append('g')
                                .attr('class',`${h_book.data.name}`)
                                // .attr("transform", `translate(0, ${timeScale(book2date[h_book.data.name])})`)
                                .attr("transform", `translate(${start_x}, ${32 * i})`)
                                .selectAll('g')
                                .data(root.descendants())
                                .join("g")
                                .attr("transform", d => `translate(${d.x0},${d.y0})`);
                console.log(i)
                cell.append("rect")
                    .attr("width", d => d.x1 - d.x0)
                    .attr("height", d => d.y1 - d.y0)
                    .attr("fill", "none")
                    .attr("stroke", "black")
                    .attr("stroke-width", "1px")
                    // .attr("opacity", d=>d.depth == 0 || d.depth == 1 ? "0" : "1")
                    .attr("opacity", d=>d.depth == 0  ? "0.2" : "1")
                    // .attr("opacity", d => ` ${1 - d.depth * 0.4}`)
                // break;
                i += 1;
            }
        },
        test(){
            const width = 500;
            const height = 800;
            const data = book_data[0];
            console.log(data)
            // Create the color scale.
            const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

            // Compute the layout.
            const hierarchy = d3.hierarchy(data)
                .sum(d => d.is_leaf ? 1: 0)
                // .sort((a, b) => b.height - a.height || b.value.length - a.value.length);

            console.log(hierarchy);

            const root = d3.treemapSlice()
                .tile(d3.treemapSlice)
                .size([height, (hierarchy.height + 1) * width / 3])
                (hierarchy);

            console.log(root)
            // Create the SVG container.
            const svg = d3.select("#canvas")

            // Append cells.
            const cell = svg
                .selectAll("g")
                .data(root.descendants())
                .join("g")
                .attr("transform", d => `translate(${d.y0},${d.x0})`);

            const rect = cell.append("rect")
                .attr("width", d => d.y1 - d.y0 - 1)
                .attr("height", d => rectHeight(d))
                .attr("fill-opacity", 0.6)
                .attr("fill", d => {
                    if (!d.depth) return "#ccc";
                    while (d.depth > 1) d = d.parent;
                    return color(d.data.name);
                })
                .style("cursor", "pointer")
                .on("click", clicked);

            const text = cell.append("text")
                .style("user-select", "none")
                .attr("pointer-events", "none")
                .attr("x", 4)
                .attr("y", 13)
                .attr("fill-opacity", d => +labelVisible(d));

            text.append("tspan")
                .text(d => d.data.name);

            const format = d3.format(",d");
            const tspan = text.append("tspan")
                .attr("fill-opacity", d => labelVisible(d) * 0.7)
                .text(d => ` ${format(d.value)}`);

            cell.append("title")
                .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

            // On click, change the focus and transitions it into view.
            let focus = root;
            function clicked(event, p) {
                focus = focus === p ? p = p.parent : p;

                root.each(d => d.target = {
                x0: (d.x0 - p.x0) / (p.x1 - p.x0) * height,
                x1: (d.x1 - p.x0) / (p.x1 - p.x0) * height,
                y0: d.y0 - p.y0,
                y1: d.y1 - p.y0
                });

                const t = cell.transition().duration(750)
                    .attr("transform", d => `translate(${d.target.y0},${d.target.x0})`);

                rect.transition(t).attr("height", d => rectHeight(d.target));
                text.transition(t).attr("fill-opacity", d => +labelVisible(d.target));
                tspan.transition(t).attr("fill-opacity", d => labelVisible(d.target) * 0.7);
            }
            
            function rectHeight(d) {
                return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2);
            }

            function labelVisible(d) {
                return d.y1 <= width && d.y0 >= 0 && d.x1 - d.x0 > 16;
            }
            
            return svg.node();
        }
    },
    mounted(){
        // this.test();
        this.init();
    },

}
</script>


<style scoped>

</style>
