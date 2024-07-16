<template>
    <svg id="title" width="100%" height="100%" style="overflow: visible; background-color: #f0f0f0;">
    </svg>
</template>


<script>
import * as d3 from 'd3';
import book_data from '@/assets/cited_tree.json';
import tree from "@/js/tree";

export default{
    props: ['citeDepth', 'mengDepth', 'locModel'],
    watch: {
        citeDepth(newDepth, oldDepth) {
            // 当 citeDepth 改变时，重新渲染按钮
            this.renderButtons();
        }
    },
    data() {
        return {
            books: book_data.map(book => {
                // console.log(tree(book).data.writing_year);
                return tree(book);
            }),
            totalWidth: 0,
            totalHeight: 0,
            bottomHeightRatio: 0.1,
        }
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
        renderButtons() {
            d3.selectAll("text.titlebutton").remove();
            const svg = d3.select("#title");
            const width = svg.node().getBoundingClientRect().width;  // 获取SVG容器的宽度
            const height = svg.node().getBoundingClientRect().height;  // 获取SVG容器的高度

            const title = "《梦溪笔谈》知识流传可视化";
            const characters = title.split('');
            const lineHeight = height * 0.025;  // 行高，根据容器的高度计算

            const levelMap= {
                    '书': 0,
                    '类': 1,
                    '卷': 2,
                    '条': 3
                }
            const modelMap= {
                '级': 1,
                '题': 2
            }

            // // 添加第一个框
            // svg.append("rect")
            //     .attr("x", width * 0.2)
            //     .attr("y", 0)
            //     .attr("width", width * 0.6)
            //     .attr("height", characters.length * lineHeight + height * 0.04)
            //     .style("fill", "rgba(255, 255, 255, 1)")  // 设置颜色和透明度
            //     .style("stroke", "black")  // 设置边框颜色
            //     .style("stroke-width", 0);  // 设置边框宽度

            // // 添加第二个框
            // svg.append("rect")
            //     .attr("x", width * 0.3)
            //     .attr("y", height * 0.01)
            //     .attr("width", width * 0.4)
            //     .attr("height", characters.length * lineHeight + height * 0.02)
            //     .style("fill", "rgba(255, 255, 255, 1)")  // 设置颜色和透明度
            //     .style("stroke", "rgba(211,63,62,1)")  // 设置边框颜色
            //     .style("stroke-width", width * 0.005);  // 设置边框宽度

                characters.forEach((char, i) => {
                    let text = svg.append("text")
                        .attr("x", width * 0.5)
                        .attr("y", height * 0.03 + i * lineHeight)
                        .attr("text-anchor", "middle")
                        .style("font-size", width * 0.28)
                        .style("font-family", "FangSong")
                        .style("fill", "black")
                        .text(char)
                        .attr("class", 'titlebutton');
                    if (char === "《" || char === "》") {
                        text.attr("transform", `rotate(90, ${width * 0.5}, ${height * 0.03 + i * lineHeight})`);
                    }
                });


            // 定义按钮的选项
            const options = ["书", "类", "卷", "条"];
            // 对每组按钮进行处理
            // for (let i = 0; i < 3; i++) {
                // 对每个选项进行处理
                options.forEach((option, j) => {
                    // 添加正方形
                    svg.append("rect")
                        .attr("x", width * 0.2 )  // 按钮的 x 坐标，设置为一个固定的值
                        .attr("y", characters.length * lineHeight + height * 0.1 + j * 30)  // 选项的 y 坐标，根据选项的索引计算
                        .attr("width", height * 0.02)
                        .attr("height", height * 0.02) 
                        // .style("fill", "#D33E3E")
                        // .style("fill", "#F7F7F7")
                        .style("fill", levelMap[option] === this.citeDepth ? "#D33E3E" : "#F7F7F7")  // 如果当前的深度等于 citeDepth，那么填充颜色为红色，否则为灰色
                        .style("stroke", "black")  
                        .style("stroke-width", levelMap[option] === this.citeDepth ? 0 : 0.1)
                        .on("click", () => {
                            this.$emit('level-selected', levelMap[option]);
                        });
                    svg.append("text")
                        .attr("x", width * 0.2 + width * 0.12)  // 文本的 x 坐标，设置为一个固定的值
                        .attr("y", characters.length * lineHeight + height * 0.1 +  + j * 30 + height * 0.012)  // 文本的 y 坐标，根据选项的索引计算
                        .attr("text-anchor", "middle")
                        .style("font-size", width * 0.2)
                        .style("font-family", "FangSong") 
                        .style("fill", levelMap[option] === this.citeDepth ? "#ffffff" : "#A5A5A5")
                        .text(option)
                        .on("click", () => {
                            this.$emit('level-selected', levelMap[option]);
                        });
                });
            // }

            const options2 = ["类", "卷", "条"];
            options2.forEach((option, j) => {
                // 添加正方形
                svg.append("rect")
                    .attr("x", width * 0.2)  // 按钮的 x 坐标，设置为一个固定的值
                    .attr("y", characters.length * lineHeight + height * 0.25 + j * 30)  // 选项的 y 坐标，根据选项的索引计算
                    .attr("width", height * 0.02)
                    .attr("height", height * 0.02) 
                    // .style("fill", "#D33E3E")
                    .style("fill", levelMap[option] === this.mengDepth ? "#D33E3E" : "#F7F7F7")
                    .style("stroke", "black")  
                    .style("stroke-width", levelMap[option] === this.mengDepth ? 0 : 0.1)
                    .on("click", () => {
                        this.$emit('level-selected-meng', option);
                    });

                svg.append("text")
                    .attr("x", width * 0.2 + width * 0.12)  // 文本的 x 坐标，设置为一个固定的值
                    .attr("y", characters.length * lineHeight + height * 0.25 + j * 30 + height * 0.012)  // 文本的 y 坐标，根据选项的索引计算
                    .attr("text-anchor", "middle")
                    .style("font-size", width * 0.2)
                    .style("font-family", "FangSong") 
                    .style("fill", levelMap[option] === this.mengDepth ? "#ffffff" : "#A5A5A5")
                    .text(option)
                    .on("click", () => {
                        this.$emit('level-selected-meng', option);
                    });
            });

            const options3 = ["级", "题"];
            options3.forEach((option, j) => {
                // 添加正方形
                svg.append("rect")
                    .attr("x", width * 0.2)  // 按钮的 x 坐标，设置为一个固定的值
                    .attr("y", characters.length * lineHeight + height * 0.4 + j * 30)  // 选项的 y 坐标，根据选项的索引计算
                    .attr("width", height * 0.02)
                    .attr("height", height * 0.02) 
                    .style("fill", modelMap[option] === this.locModel ? "#D33E3E" : "#F7F7F7")
                    .style("stroke", "black")
                    .style("stroke-width", modelMap[option] === this.locModel ? 0 : 0.1)
                    .on("click", () => {
                        this.$emit('loc-model', modelMap[option]);
                    });

                svg.append("text")
                    .attr("x", width * 0.2 + width * 0.12)  // 文本的 x 坐标，设置为一个固定的值
                    .attr("y", characters.length * lineHeight + height * 0.4 +  + j * 30 + height * 0.012)  // 文本的 y 坐标，根据选项的索引计算
                    .attr("text-anchor", "middle")
                    .style("font-size", width * 0.2)
                    .style("font-family", "FangSong") 
                    .style("fill", modelMap[option] === this.locModel ? "#ffffff" : "#A5A5A5")
                    .text(option)
                    .on("click", () => {
                        this.$emit('loc-model', modelMap[option]);
                    });
            });


            // 定义“引文层级”的文字
            const citationLevel = "引文层级".split('');
            // 添加“引文层级”的文字
            citationLevel.forEach((char, i) => {
                svg.append("text")
                    .attr("x", width * 0.7)  // 文本的 x 坐标，根据需要调整
                    .attr("y", characters.length * lineHeight + height * 0.1 + i * height * 0.017)  // 文本的 y 坐标，根据需要调整
                    .attr("text-anchor", "middle")
                    .style("font-size", width * 0.13)
                    .style("font-family", "FangSong")
                    .style("fill", "black")
                    .text(char)
                    .attr("class", 'titlebutton');
            });

            const citationLevel2 = "原文层级".split('');
            citationLevel2.forEach((char, i) => {
                svg.append("text")
                    .attr("x", width * 0.7)  // 文本的 x 坐标，根据需要调整
                    .attr("y", characters.length * lineHeight + height * 0.25 + i * height * 0.017)  // 文本的 y 坐标，根据需要调整
                    .attr("text-anchor", "middle")
                    .style("font-size", width * 0.13)
                    .style("font-family", "FangSong")
                    .style("fill", "black")
                    .text(char)
                    .attr("class", 'titlebutton');
            });

            const display = "展示状态".split('');
            display.forEach((char, i) => {
                svg.append("text")
                    .attr("x", width * 0.7)  // 文本的 x 坐标，根据需要调整
                    .attr("y", characters.length * lineHeight + height * 0.4 + i * height * 0.017)  // 文本的 y 坐标，根据需要调整
                    .attr("text-anchor", "middle")
                    .style("font-size", width * 0.13)
                    .style("font-family", "FangSong")
                    .style("fill", "black")
                    .text(char)
                    .attr("class", 'titlebutton');
            });
        
        }
    },
    mounted(){
        this.renderButtons();
    }




}

</script>

<style>
    @font-face {
        font-family: 'FangSong';
        src: url('../assets/fonts/FangSong.ttf') format('truetype');
    }

    #title text {
        dominant-baseline: middle;
        text-anchor: middle;
    }
</style>

