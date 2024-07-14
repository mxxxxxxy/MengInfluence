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
                .attr("opacity", d=>d.depth == 1 ? "1" : "0.2")
                .attr("class", d => {
                        // console.log(d.data.name);  // 打印d的值
                        return `${d.data.name}`
                    });

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

                // 添加每个方格的class 和下面的target key对应
                function getClassName(d) {
                    // 如果节点有父节点，那么类名应该包含父节点的名称
                    if (d.parent) {
                        let name = d.data.name ? d.data.name : "default";
                        return getClassName(d.parent) + '-' + name;
                    }
                    // 否则，类名就是节点自己的名称，或者"default"如果名称为空
                    else {
                        return d.data.name ? d.data.name : "default";
                    }
                }


                cell.append("rect")
                    .attr("width", d => d.x1 - d.x0)
                    .attr("height", d => d.y1 - d.y0)
                    .attr("fill", "none")
                    .attr("stroke", "black")
                    .attr("stroke-width", "1px")
                    // .attr("opacity", d=>d.depth == 0 || d.depth == 1 ? "0" : "1")
                    .attr("opacity", d=>d.depth == 0  ? "0.2" : "1")
                    // .attr("opacity", d => ` ${1 - d.depth * 0.4}`)
                    .attr("class", d => {
                        // console.log(d);  // 打印d的值
                        return getClassName(d);  // 设置类名
                    });
                // break;
                i += 1;
            }

            // tt
            // 三级的对应关系：引文相同
            const links_3 = [];
            // 遍历meng_data和book_data，找到相同的引文
            for (const meng of meng_data.children) {
                for (const meng_child of meng.children) {
                    for (const meng_grandchild of meng_child.children) {
                        if (meng_grandchild.level === 3) {
                            for (const book of book_data) {
                                for (const book_child of book.children) {
                                    for (const book_grandchild of book_child.children) {
                                        for (const book_grandgrandchild of book_grandchild.children) {
                                            const quote = book_grandgrandchild.value[0]["引文"]
                                            if (meng_grandchild.text == quote) {
                                                // 如果找到相同的引文，创建一个新的流
                                                links_3.push({
                                                    source: meng_grandchild,
                                                    target: {
                                                        value: book_grandgrandchild,
                                                        name_3: book_grandgrandchild.name,
                                                        name_0: book.name,  // 零级信息
                                                        name_1: book_child.name,  // 一级信息
                                                        name_2: book_grandchild.name,  // 二级信息
                                                    }
                                                });
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            console.log(links_3);


            // 二级的对应关系：所有connect_2相同的source + 所有name_2相同的target
            const groupedSources_2 = {};
            // 遍历links_3数组
            for (const link of links_3) {
                // 获取source节点的connect_2值
                const key = link.source.connect_2;

                // 如果这个connect_2值之前没有被使用过，那么初始化它的值为一个空对象
                if (!groupedSources_2[key]) {
                    groupedSources_2[key] = {};
                }

                // 获取target节点的name_0, name_1和name_2值
                const name_0 = link.target.name_0 ? link.target.name_0 : "default";
                const name_1 = link.target.name_1 ? link.target.name_1 : "default";
                const name_2 = link.target.name_2 ? link.target.name_2 : "default";

                const targetKey = name_0 + '-' + name_1 + '-' + name_2;

                // 如果这个name_2值之前没有被使用过，那么初始化它的值为一个空数组
                if (!groupedSources_2[key][targetKey]) {
                    groupedSources_2[key][targetKey] = [];
                }

                // 将target节点添加到对应的数组中
                groupedSources_2[key][targetKey].push(link.target);
            }
            console.log(groupedSources_2);


            // 一级的对应关系：所有connect_1相同的source + 所有name_1相同的target
            const groupedSources_1 = {};
            // 遍历links_3数组
            for (const link of links_3) {
                // 获取source节点的connect_2值
                const key = link.source.connect_1;

                // 如果这个connect_2值之前没有被使用过，那么初始化它的值为一个空对象
                if (!groupedSources_1[key]) {
                    groupedSources_1[key] = {};
                }

                // 获取target节点的name_2值
                const name_0 = link.target.name_0 ? link.target.name_0 : "default";
                const name_1 = link.target.name_1 ? link.target.name_1 : "default";
                const targetKey = name_0 + '-' + name_1;

                // 如果这个name_2值之前没有被使用过，那么初始化它的值为一个空数组
                if (!groupedSources_1[key][targetKey]) {
                    groupedSources_1[key][targetKey] = [];
                }

                // 将target节点添加到对应的数组中
                groupedSources_1[key][targetKey].push(link.target);
            }
            console.log(groupedSources_1);


            // 尝试根据class匹配rect
            const className = "新雕皇朝类苑-default-风俗杂志-西域山水";  // 你要查找的类名
            const gElement = d3.select(`.${className}`);  // 选择具有该类名的g元素
            console.log(gElement)


            // 创建一个linkHorizontal生成器
            const link_1 = d3.linkHorizontal()
                .source(d => [d.source.x, d.source.y])  // 使用x1和y1作为源节点的位置
                .target(d => [d.target.x, d.target.y]);  // 使用x1和y1作为目标节点的位置

            // 遍历groupedSources_1
            for (const sourceKey in groupedSources_1) {
                for (const targetKey in groupedSources_1[sourceKey]) {
                    for (const target of groupedSources_1[sourceKey][targetKey]) {
                        // 获取源节点和目标节点
                        const sourceNode = d3.select(document.querySelector(`.${sourceKey}`));
                        const targetNode = d3.select(document.querySelector(`.${targetKey}`));
                        console.log(sourceNode.node().getBoundingClientRect().x)

                        const source_pos = sourceNode.node().getBoundingClientRect();
                        const target_pos = targetNode.node().getBoundingClientRect();

                        // 创建一个路径数据对象
                        const pathData = {
                            source: source_pos,
                            target: target_pos
                        };

                        // 添加路径元素
                        svg.append("path")
                            .attr("d", link_1(pathData))
                            .attr("fill", "none")
                            .attr("stroke", "rgba(0,0,0,1)");
                    }
                }
            }
            // 现在获取到的位置是不对的 好像是transform前的？
            // tt
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
