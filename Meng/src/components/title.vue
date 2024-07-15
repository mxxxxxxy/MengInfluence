<template>
    <svg id="title" width="100%" height="100%">
        <rect
            @click="$emit('level-selected', option)"
        ></rect>
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
        

    },
    mounted(){
        const svg = d3.select("#title");
        const width = svg.node().getBoundingClientRect().width;  // 获取SVG容器的宽度
        const height = svg.node().getBoundingClientRect().height;  // 获取SVG容器的高度

        const title = "梦溪笔谈知识流传可视化";
        const characters = title.split('');
        const lineHeight = height * 0.035;  // 行高，根据容器的高度计算

        // 添加第一个框
        svg.append("rect")
            .attr("x", width * 0.2)
            .attr("y", 0)
            .attr("width", width * 0.6)
            .attr("height", characters.length * lineHeight + height * 0.04)
            .style("fill", "rgba(255, 255, 255, 1)")  // 设置颜色和透明度
            .style("stroke", "black")  // 设置边框颜色
            .style("stroke-width", 0);  // 设置边框宽度

        // 添加第二个框
        svg.append("rect")
            .attr("x", width * 0.3)
            .attr("y", height * 0.01)
            .attr("width", width * 0.4)
            .attr("height", characters.length * lineHeight + height * 0.02)
            .style("fill", "rgba(255, 255, 255, 1)")  // 设置颜色和透明度
            .style("stroke", "rgba(211,63,62,1)")  // 设置边框颜色
            .style("stroke-width", width * 0.005);  // 设置边框宽度

        characters.forEach((char, i) => {
            svg.append("text")
                .attr("x", width * 0.5)
                .attr("y", height * 0.035 + i * lineHeight)
                .attr("text-anchor", "middle")
                .style("font-size", width * 0.28)
                .style("font-family", "FangSong")
                .style("fill", "black")
                .text(char);
        });

        // 定义按钮的选项
        const options = ["类", "卷", "条"];
        // 对每组按钮进行处理
        // for (let i = 0; i < 3; i++) {
            // 对每个选项进行处理
            options.forEach((option, j) => {
                // 添加正方形
                svg.append("rect")
                    .attr("x", width * 0.2 )  // 按钮的 x 坐标，设置为一个固定的值
                    .attr("y", characters.length * lineHeight + height * 0.1 + j * 40)  // 选项的 y 坐标，根据选项的索引计算
                    .attr("width", height * 0.03)
                    .attr("height", height * 0.03) 
                    // .style("fill", "#D33E3E")
                    .style("fill", "#F7F7F7")
                    .style("stroke", "black")  
                    .style("stroke-width", 0.1)
                    .on("click", () => {
                        this.$emit('level-selected', option);
                    });
                svg.append("text")
                    .attr("x", width * 0.2 + width * 0.2)  // 文本的 x 坐标，设置为一个固定的值
                    .attr("y", characters.length * lineHeight + height * 0.1 +  + j * 40 + height * 0.017)  // 文本的 y 坐标，根据选项的索引计算
                    .attr("text-anchor", "middle")
                    .style("font-size", width * 0.2)
                    .style("font-family", "FangSong") 
                    .style("fill", "black")
                    .text(option)
                    .on("click", () => {
                        this.$emit('level-selected', option);
                    });
            });
        // }

        const options2 = ["类", "卷", "条"];
        options2.forEach((option, j) => {
            // 添加正方形
            svg.append("rect")
                .attr("x", width * 0.2)  // 按钮的 x 坐标，设置为一个固定的值
                .attr("y", characters.length * lineHeight + height * 0.3 + j * 40)  // 选项的 y 坐标，根据选项的索引计算
                .attr("width", height * 0.03)
                .attr("height", height * 0.03) 
                // .style("fill", "#D33E3E")
                .style("fill", "#F7F7F7")
                .style("stroke", "black")  
                .style("stroke-width", 0.1)
                .on("click", () => {
                    this.$emit('level-selected-meng', option);
                });

            svg.append("text")
                .attr("x", width * 0.2 + width * 0.2)  // 文本的 x 坐标，设置为一个固定的值
                .attr("y", characters.length * lineHeight + height * 0.3 +  + j * 40 + height * 0.017)  // 文本的 y 坐标，根据选项的索引计算
                .attr("text-anchor", "middle")
                .style("font-size", width * 0.2)
                .style("font-family", "FangSong") 
                .style("fill", "black")
                .text(option)
                .on("click", () => {
                    this.$emit('level-selected-meng', option);
                });
        });

        // const options3 = ["图", "文"];
        // options3.forEach((option, j) => {
        //     // 添加正方形
        //     svg.append("rect")
        //         .attr("x", width * 0.2)  // 按钮的 x 坐标，设置为一个固定的值
        //         .attr("y", characters.length * lineHeight + height * 0.5 + j * 40)  // 选项的 y 坐标，根据选项的索引计算
        //         .attr("width", width * 0.3)
        //         .attr("height", height * 0.03) 
        //         // .style("fill", "#D33E3E")
        //         .style("fill", "#F7F7F7")
        //         .style("stroke", "black")  
        //         .style("stroke-width", 0.1);  

        //     svg.append("text")
        //         .attr("x", width * 0.2 + width * 0.15)  // 文本的 x 坐标，设置为一个固定的值
        //         .attr("y", characters.length * lineHeight + height * 0.5 +  + j * 40 + height * 0.017)  // 文本的 y 坐标，根据选项的索引计算
        //         .attr("text-anchor", "middle")
        //         .style("font-size", width * 0.2)
        //         .style("font-family", "FangSong") 
        //         .style("fill", "black")
        //         .text(option);
        // });


        // 定义“引文层级”的文字
        const citationLevel = "引文层级".split('');
        // 添加“引文层级”的文字
        citationLevel.forEach((char, i) => {
            svg.append("text")
                .attr("x", width * 0.7)  // 文本的 x 坐标，根据需要调整
                .attr("y", characters.length * lineHeight + height * 0.1 + i * height * 0.015)  // 文本的 y 坐标，根据需要调整
                .attr("text-anchor", "middle")
                .style("font-size", width * 0.13)
                .style("font-family", "FangSong")
                .style("fill", "black")
                .text(char);
        });

        const citationLevel2 = "原文层级".split('');
        citationLevel2.forEach((char, i) => {
            svg.append("text")
                .attr("x", width * 0.7)  // 文本的 x 坐标，根据需要调整
                .attr("y", characters.length * lineHeight + height * 0.3 + i * height * 0.015)  // 文本的 y 坐标，根据需要调整
                .attr("text-anchor", "middle")
                .style("font-size", width * 0.13)
                .style("font-family", "FangSong")
                .style("fill", "black")
                .text(char);
        });

        // const display = "展示状态".split('');
        // display.forEach((char, i) => {
        //     svg.append("text")
        //         .attr("x", width * 0.7)  // 文本的 x 坐标，根据需要调整
        //         .attr("y", characters.length * lineHeight + height * 0.5 + i * height * 0.015)  // 文本的 y 坐标，根据需要调整
        //         .attr("text-anchor", "middle")
        //         .style("font-size", width * 0.13)
        //         .style("font-family", "FangSong")
        //         .style("fill", "black")
        //         .text(char);
        // });
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

