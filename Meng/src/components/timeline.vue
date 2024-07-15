<template>
    <svg id="timeline" width="100%" height="100%" style="overflow: visible;">

    </svg>
</template>

<script>
import * as d3 from 'd3';
import book_data from '@/assets/book_tree_full.json';
import tree from "@/js/tree";

export default{
    data() {
        return {
            books: book_data.map(book => {
                // console.log(tree(book).data.writing_year);
                return tree(book);
            })
        }
    },
    methods:{
        drawTimeline() {
            const svg = d3.select("#timeline");
            const height = svg.node().getBoundingClientRect().height * 0.9;
            const width = svg.node().getBoundingClientRect().width
            const padding_w = width * 0.5;
            const padding_h = 2;

            // 先按照 writing_year 对 books 进行排序
            this.books.sort((a, b) => b.data.writing_year - a.data.writing_year);

            const bookNames = this.books.map(book => book.data.name);  // 使用书名作为域
            console.log(this.books)

            const yScale = d3.scaleBand()
                .domain(bookNames)  // 使用书名作为域
                .range([0, 0.9 * height])
                .padding(0.1); // 为每个日期留出一些空间

            // 获取所有的书的类型
            const bookTypes = [...new Set(this.books.map(book => book.data.type))];

            // 创建一个比例尺来映射书的类型到x轴的位置
            const xScale = d3.scaleBand()
                .domain(bookTypes)  // 使用书的类型作为域
                .range([padding_w, padding_w*1.2])  // x轴的位置范围
                .padding(0.1);  // 为每个类型留出一些空间

            const yAxis = d3.axisRight(yScale)
                            .tickSize(0);

            // 找到所有书的三级条目数量的最大值和最小值
            const minItems = d3.min(this.books, book => book.descendants().filter(node => node.data.level === 3).length);
            const maxItems = d3.max(this.books, book => book.descendants().filter(node => node.data.level === 3).length);


            // 创建一个颜色插值函数
            const colorInterpolator = d3.interpolate("#F7F7F7", "#8C8C8C");  // 从浅灰色到深灰色
            // 创建一个颜色比例尺
            const colorScale = d3.scaleSequential()
                .domain([minItems, maxItems])
                .interpolator(colorInterpolator);

            let dynasties = [
                {name: "唐", start: 618, end: 907},
                {name: "宋", start: 960, end: 1279},
                {name: "元", start: 1271, end: 1368},
                {name: "明", start: 1368, end: 1644},
                {name: "清", start: 1644, end: 1912}
            ];

            const colorScale_dyn = d3.scaleOrdinal()
                .domain(dynasties.map(d => d.name))
                .range(["#1f77b4", "#E0DFEA", "#EDD3D7", "#B3CCE6", "#F1E6E4"]);



            let rect;  // 将 rect 变量定义在 forEach 循环的外部

            // // 先添加 rect
            // this.books.forEach(book => {
            //     const level3Items = book.descendants().filter(node => node.data.level === 3);  // 找到所有三级条目
            //     const rectWidth = width*0.2;  // 将所有 rect 的宽度设置为等大小
            //     const rectColor = colorScale(level3Items.length);  // 使用颜色比例尺计算颜色

            //     rect = svg.append("rect")  // 在循环内部为 rect 变量赋值
            //         .attr("x", padding_w)
            //         // .attr("x", xScale(book.data.type))  // 根据书的类型设置 x 的位置
            //         .attr("y", yScale(book.data.name))
            //         .attr("width", rectWidth)
            //         .attr("height", yScale.bandwidth())
            //         .attr("fill", rectColor)
            //         .attr("stroke", "black")
            //         .attr("stroke-width", 0.2)
            //         .attr("class", book.data.name.replace(/\s+/g, '-'))
            //         .on("mouseover", (event, d) => {
            //             // console.log(book.data.name)
            //             this.$emit('book-hover', book.data.name);
            //             // // 放大当前的书
            //             // rect.attr("width", rectWidth * 1.5)
            //             //     .attr("height", yScale.bandwidth() * 1.5);
            //             // 显示书名
            //             svg.append("text")
            //                 .attr("x", padding_w + rectWidth * 1.5)
            //                 .attr("y", yScale(book.data.name))
            //                 .attr("writing-mode", "tb")  // 设置文字从上到下排列
            //                 .text(book.data.name);
            //         })
            //         .on("mouseout", (event, d) => {
            //             this.$emit('book-unhover', book.data.name);
            //             // 恢复书的大小
            //             rect.attr("width", rectWidth)
            //                 .attr("height", yScale.bandwidth());
            //             // 移除书名
            //             svg.select("text").remove();
            //         })
            // });


            // 先添加 image
            this.books.forEach(book => {
                const level3Items = book.descendants().filter(node => node.data.level === 3);  // 找到所有三级条目
                const rectWidth = width*0.2;  // 将所有 image 的宽度设置为等大小

                let imagePath = new URL('../assets/images/' + book.data.name + '.png', import.meta.url).href;  // 生成图片路径

                let image = svg.append("image")  // 在循环内部为 image 变量赋值
                    .attr("x", padding_w)  // 使用与 rect 相同的 x 值
                    .attr("y", yScale(book.data.name))  // 使用与 rect 相同的 y 值
                    .attr("width", rectWidth)
                    .attr("height", yScale.bandwidth())
                    .attr("href", imagePath)  // 使用相对路径来引用图片
                    .attr("class", book.data.name.replace(/\s+/g, '-'))
                    .on("mouseover", (event, d) => {
                        this.$emit('book-hover', book.data.name);
                        // 放大当前的图片
                        image.attr("width", rectWidth * 3)
                            .attr("height", yScale.bandwidth() * 3);
                        // 缩小其他的图片
                        svg.selectAll("image")
                        .filter(":not(." + book.data.name.replace(/\s+/g, '-') + ")")
                        .attr("width", rectWidth * 0)
                        .attr("height", yScale.bandwidth() * 0);
                        // 显示书名
                        svg.append("text")
                            .attr("x", padding_w - 12)
                            .attr("y", yScale(book.data.name))
                            .attr("writing-mode", "tb")  // 设置文字从上到下排列
                            .text(book.data.name);
                    })
                    .on("mouseout", (event, d) => {
                        // 恢复当前的图片
                        image.attr("width", rectWidth)
                            .attr("height", yScale.bandwidth());
                        // 恢复其他的图片
                        svg.selectAll("image")
                        .attr("width", rectWidth)
                        .attr("height", yScale.bandwidth());
                        this.$emit('book-unhover', book.data.name);
                        // 移除书名
                        svg.select("text").remove();
                    })
            });





            // 再添加 y 轴
            // svg.append("g")
            // .attr("transform", (d, i) => `translate(${padding_w}, ${padding_h})`)  // 使用和书相同的位置
            //     .call(yAxis);


            this.books.forEach(book => {
                // 根据 writing_year 确定朝代
                let dynasty = dynasties.find(d => book.data.writing_year >= d.start && book.data.writing_year <= d.end);
                let lineColor = colorScale_dyn(dynasty.name);  // 使用颜色比例尺计算颜色

                // svg.append("line")
                //     .attr("x1", padding_w + 24)
                //     .attr("y1", yScale(book.data.name))
                //     .attr("x2", padding_w +24)
                //     .attr("y2", yScale(book.data.name) + yScale.bandwidth() + 3)
                //     .attr("stroke", lineColor)
                //     .attr("stroke-width", 1.5)
                //     .attr("stroke-dasharray", "4,1");

                svg.append("line")
                    .attr("x1", padding_w - 4)
                    .attr("y1", yScale(book.data.name))
                    .attr("x2", padding_w - 4)
                    .attr("y2", yScale(book.data.name) + yScale.bandwidth() + 3)
                    .attr("stroke", lineColor)
                    .attr("stroke-width", 1.5)
                    .attr("stroke-dasharray", "4,1");
            });




        }

            },
            mounted(){
                this.drawTimeline();
            },
        }

</script>

<style>
#timeline .tick line {
    stroke: none;
}


#timeline .tick text {
    fill: rgba(1,1,1,1);
    font-family: 'FangSong';
    font-size: 8px;
    letter-spacing: 0px  !important;
    /* font-weight: bold; */
}

</style>
