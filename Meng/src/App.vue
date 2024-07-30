<template>
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
            <Title />
        </div>
        <Transition name="fade">
            <div ref="overlay" 
                id="overlay"
                v-if="show_image"
                style="position: absolute; width: 100vw; height: 100vh; background-color: rgb(0,0,0,0.4);  display: flex; align-items: center;" @click="show_image = false">
                <div style="position: absolute; top: 4%; right: 4%;">
                    <img :src="close_svg" alt="" style="width: 50px; cursor: pointer;" @click="show_image = false">
                </div>
                <div style="flex: 1; display: flex; justify-content: center; flex-direction: column; align-items: center;">
                    <div style="color: antiquewhite; position: absolute; top: 10%; display: flex; flex-direction: column; width: 40%;">
                        <div style="font-size: xx-large;">
                            《{{ cite_book_name }}》引文与原图
                        </div>
                        <div style="font-size: large;">
                            {{ text }}
                        </div>
                    </div>
                    <img :src="leftSrc" alt="no exist" style="width: 80%;">
                </div>
                <div style="width: 2px; background-color: antiquewhite; height: 80%;"></div>
                <div style="flex: 1; display: flex; justify-content: center; flex-direction: column; align-items: center;">
                    <div style="color: antiquewhite; font-size: xx-large; position: absolute; top: 20%;">
                        《 梦溪笔谈 》原图
                    </div>
                    <div style="color: antiquewhite; font-size: large; position: absolute; top: 30%; width: 40%;">
                        <!-- {{ text }} -->
                    </div>
                    <!-- <img src="http://localhost:5173/src/assets/item_image/5.png" alt="no exist" style="width: 80%;"> -->
                    <!-- <img :src="rightSrc" alt="no exist"> -->
                </div>
            </div>
        </Transition>
    </div>
</template>


<script>
import * as d3 from 'd3';
import book_data from '@/assets/cited_tree.json';
import meng_data from '@/assets/meng_full.json';
import packedSquare from "@/js/packedSquare"
import tree from "@/js/tree"
import { calRelBoundingBox, concatName, count, curve_generator, groupBy, getItemImageUrl, angleWithNegativeXAxis, getRandomNumber } from '@/js/utils'
import Timeline from '@/components/timeline.vue';
import transition from '@/js/transition.js'
import { mapActions, mapState, mapWritableState } from 'pinia'
import { useGlobalStore } from "@/stores/global.js"
import closeSvg from "@/assets/close.svg"
import Title from './components/title.vue';

var h_books = book_data.sort((a, b) => b.writing_year - a.writing_year).map(book => tree(book))
export var meng_root = tree(meng_data);

export default{
    data() {
        return {
            totalWidth: 0,
            totalHeight: 0,
            bottomHeightRatio: 0.1,
            book_height: 0,
            padding: 30,
            selectedNodes: [],
            showNextLevel: true,
            rightSrc: "",
            leftSrc: "",
            cite_book_name: "",
            close_svg: closeSvg,
            show_image: false,
            text: ""
        }
    },
    components:{
        Timeline: Timeline,
        Title: Title
    },
    computed:{
        ...mapState(useGlobalStore, ['cite_depth', 'meng_depth', 'loc_model', 'selected_book']),
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
                            .data(root.descendants())
                            .join("g")
                            .attr("class", d => `mg${d.depth}`)
                            .attr("transform", d => `translate(${d.x0},${d.y0})`)

            this.addMengTexts = (cell) =>{

                    const text_group = cell
                        .append("g")
                        .attr("class","info_text")
                        .attr("transfrom",`translate(0.45rem, 0)`)
                        .classed("hide_text", d=> d.depth != this.meng_depth);

                    const first_text = text_group.append("text")
                        .text(d => d.data.name ? d.data.name : "")
                        .attr("x", "0.45rem")
                        .attr("y", 0)
                        .attr("cursor", "default")
                        .attr("pointer-events", "none")
                        .classed("vertcal_text_meng",true);

                    const former_height = first_text.nodes().map(n => n.getBBox().height);

                    text_group.append("text")
                        .text(d => d.value)
                        .attr("x", "")
                        .attr("y", (d, i) =>`${former_height[i] + 13}`)
                        .attr("cursor", "default")
                        .attr("pointer-events", "none")

                    
                    // text_group.append("text")
                    //     .text("上")
                    //     .attr("class", d => `${d.data.name}`)
                    //     .attr("x", 0)
                    //     .attr("y", -5)
                    //     .attr("font-size", "12")
                    //     .attr("cursor", "default")
                    //     // .classed("hide_text", d => d.depth <= this.meng_depth || d.depth === 3);
                    //     .classed("hide_text", d => {
                    //         return d.depth <= this.meng_depth});
            }
            cell.append("rect")
                .attr("class", d=>`m${d.depth}`)
                .attr("width", d => d.x1 - d.x0)
                .attr("height", d => d.y1 - d.y0)
                .attr("name", d=>d.data.name ? d.data.name : "null")
                .attr("fill", d=>{
                    let l1_node = d.find_parent_by_level(1);
                    if(!l1_node) return this.$color[undefined]
                    return this.$color[l1_node.data.name ? l1_node.data.name : "null"]})
                .attr("stroke", "black")
                .attr("stroke-width", "0px")
                .attr("opacity", d => d.depth == this.meng_depth ? 1 : 0)
                .classed("no_available", d => d.depth != this.meng_depth)
                .classed("active", d => d.depth == this.meng_depth)
                .attr('cursor', 'pointer')
                .on("dblclick", this.mengChange);
            cell.call(this.addMengTexts);
        },
        // mengChange(event, current_meng){
        //     let focus = meng_root;
        //     console.log(meng_root)
        //     this.remove_sankey()
        //     const meng_container = d3.select(".meng")
        //     if(current_meng.data.is_leaf){
        //         return
        //     }
        //     this.meng_depth = focus === current_meng ? (current_meng.depth - 1 > 0 ? current_meng.depth - 1 : 0) : current_meng.depth + 1;
        //     focus = focus === current_meng ? current_meng = current_meng.parent : current_meng;
        //     // console.log(current_meng)
        //     const new_root = this.assign_position(current_meng);
        //     const new_d = new_root.children ? [new_root, ...new_root.children] : [new_root];
        //     console.log(new_d);
        //     meng_container.selectAll("g").remove();

        //     const cell = meng_container.selectAll("g").data(new_d)
        //             .join("g")
        //             .attr("transform", d => `translate(${d.x0},${d.y0})`);

        //     cell.append("rect")
        //         .attr("class", d=>`m${d.depth}`)
        //         .attr("width", d => d.x1 - d.x0)
        //         .attr("height", d => d.y1 - d.y0)
        //         .attr("name", d=>d.data.name)
        //         .attr("fill", (d, i)=>{
        //             return i == 0 ? "none": this.$color[d.find_parent_by_level(1).data.name]
        //         })
        //         .attr("stroke", "black")
        //         .attr("stroke-width", "0px")
        //         .attr("opacity", d=>{
        //             if(d.depth == this.meng_depth) return "1"
        //             else if(d.depth == this.meng_depth + 1) return "0.2"
        //             else return "0"
        //         })
        //         .attr('cursor', 'pointer')
        //         .on("mouseenter", (_e, d) => {
        //             d3.select(_e.target).attr("stroke", "red");
        //             if(d.depth === 0){
        //                 return null;
        //             }
        //             const all_cited_nodes = h_books.map(b=>b.get_cited_nodes_by_depth(this.cite_depth, d.depth, d.data.name)).flat();
        //             const all_names = all_cited_nodes.map(d=> concatName(d))
        //             this.selectedNodes = d3.selectAll(`.l${this.cite_depth}`).filter( d => all_names.includes(concatName(d))).attr("fill", "red");
        //         })
        //         .on("mouseleave", (_e, d) => {
        //             d3.select(_e.target).attr("stroke", "black")
        //             if(d.depth === 0) return null;
        //             this.selectedNodes.attr("fill", "none");
        //             this.selectedNodes = [];
        //         })
        //         .on("click", this.mengChange)
        //     cell.call(this.addMengTexts);
        //     this.init_sankey();
        // },
        mengChange(event, current_meng){
            current_meng.retain = false;
            const show_meng_level = current_meng.depth + 1;
            const father = d3.select(event.target.parentNode);
            const childrens_name = current_meng.children.map(d=>d.data.name);
            const children = d3.selectAll(`.m${show_meng_level}`)
                .filter(d=>childrens_name.includes(d.data.name))
                .classed("no_available", false)
                .classed("active", true);
            children.transition(750)
                .attr("opacity", 1);
            d3.select(event.target)
                .classed("no_available", true)
                .classed("active", false)
                .transition(750)
                .attr("opacity", 0);
            father.selectAll("text").classed("hide_text", true);
            // father.select(`back_${concatName(current_meng)}`).classed("hide_text", true);
            
            if(show_meng_level !== 3){
                setTimeout(()=>{
                    children.each((d,i,nodes) => {
                        d3.select(nodes[i].parentNode)
                        .select(".info_text")
                        .classed("hide_text", false);
                    })
                }, 400)
            }
            this.init_sankey();
        },
        lengthCal(v){
            const nodes_arr = h_books.map(node => node.get_nodes_by_depth(this.cite_depth));
            const _ = nodes_arr.flat().map(d=>d.value);
            const length_arr = nodes_arr.map(d=>d.length);
            const value_range = [d3.min(_), d3.max(_)];

            let max_length = this.totalWidth / d3.max(length_arr);
            let min_length = max_length * 0.2 > 20 ? max_length * 0.2 : 20;
            if(this.cite_depth === 3){
                min_length /= 3
                max_length /= 3
            }
            if(this.cite_depth === 0){
                min_length /= 1
                max_length -= 100
            }
            return d3.scaleLinear().domain(value_range).range([min_length, max_length])(v);
        },
        initUpper(){
            const svg = d3.select("#canvas");
            // 创建一个映射，将"type"字段映射到一个特定的x位置
            const typeToX = {
                "经": this.padding*7,
                "史": (this.totalWidth - this.padding*7) / 4 * 1,
                "子": (this.totalWidth - this.padding*7) / 4 * 2,
                "集": (this.totalWidth - this.padding*7) / 4 * 3,
            };
            const typeToX2 = {
                "哲学宗教": this.padding*7,
                "政治法礼": (this.totalWidth - this.padding*7) / 7 * 1,
                "文化艺术": (this.totalWidth - this.padding*7) / 7 * 2,
                "历史地理": (this.totalWidth - this.padding*7) / 7 * 3,
                "科学医药": (this.totalWidth - this.padding*7) / 7 * 4,
                "记闻杂谈": (this.totalWidth - this.padding*7) / 7 * 5,
                "": (this.totalWidth - this.padding*7) / 7 * 6,
            };
            const typeCounts = {};
            const citeBooksContainer = svg.selectAll(".line_container")
                                .data(h_books)
                                .join('g')
                                .attr('class', book => `${book.data.name}`)
                                .attr("transform", (node, i, arr) => {
                                    return `translate(${this.padding}, ${this.upperHeight * 0.9 / arr.length * i})`})

            this.addNodes = (citeBooksContainer) => citeBooksContainer.selectAll('g')
                                .attr("class", "node_container")
                                .data(book => book.get_nodes_by_depth(this.cite_depth))
                                .join("g")
                                .attr("name", d=>d.data.name)
                                .attr("transform", (d, i, arr) => {
                                    if(this.loc_model == 2){
                                        let x;
                                        if(d.depth == 0){
                                            console.log(d.data)
                                            x = typeToX[arr[0].__data__.data.type];
                                            return `translate(${x}, 0)`;
                                        }
                                        // if(d.depth == 1){

                                        // }
                                        if(d.depth == 2){
                                            // console.log(arr[0].__data__.data.主题0顺序)
                                            const type = arr[0].__data__.data.主题0归类;
                                            // 如果这个"type"还没有被计数过，就初始化它
                                            if (!typeCounts[type]) {
                                                typeCounts[type] = 0;
                                            }
                                            // 计算x的位置，然后更新这个"type"的计数
                                            x = typeToX2[type] + typeCounts[type] * 0;  // 偏移量可以根据你的需求进行调整
                                            typeCounts[type]++;
                                            return `translate(${x}, 0)`;
                                        }
                                        // if(d.depth == 3){

                                        // }
                                        else{
                                            return `translate(${(this.totalWidth-this.padding*7) / arr.length * i}, 0)`;
                                        }
                                    }
                                    else{
                                        // let random_start = getRandomNumber(this.padding, 500)
                                        let random_start =0
                                        if(arr.length == 1){
                                            random_start = getRandomNumber(this.padding, this.totalWidth - this.padding - this.lengthCal(d.value))
                                        }
                                        // this.lengthCal(d.value)
                                        // console.log('how many',d.value, this.lengthCal(d.value))
                                        // console.log('test:', arr.length)
                                        if(d.data.name === "新雕皇朝类苑") random_start = 0
                                        return `translate(${(this.totalWidth-this.padding - random_start) / arr.length * i + random_start}, 0)`;
                                    }
                                })
                                .selectAll("g")
                                .data(node => {
                                    const assign_position = packedSquare()
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
                    .attr("pointer-events", "none")
                    .classed("vertcal_text_upper",true)
                    .classed("hide_text",true)

            }
            this.openDetail = (event, d) => {
                console.log("openDetail")
                this.show_image = true;
            }
            this.addRect = (upperCell) => {
                return upperCell.append("rect")
                    .attr("width", d => (d.x1 - d.x0))
                    .attr("height", d => (d.y1 - d.y0))
                    .attr("fill", "transparent")
                    .attr("stroke", "black")
                    .attr("stroke-width", "0px")
                    .attr("opacity", d => d.depth == this.cite_depth ? 1 : 0)
                    .attr("class", (d, i)=>{
                        return `l${d.data.level}`;
                    })
                    .attr("pointer-events", d => d.depth === this.cite_depth ? null : "none")
                    .style("cursor", "pointer")
                    .on("click", (e, d) => {
                        if(d.depth === 3){
                            const v = d.data.children[0].value[0];
                            const i = v.name.replace('n','')
                            this.text = v.text;
                            this.cite_book_name = d.find_parent_by_level(0).data.name;
                            this.leftSrc = getItemImageUrl(i);
                            this.openDetail()
                        }
                    })
            }

            const upperCell = this.addNodes(citeBooksContainer);
            const upperRect = this.addRect(upperCell);
            const upperText = this.addText(upperCell);
            return [citeBooksContainer, upperCell, upperRect, upperText]
        },
        init_sankey(){
            this.main_svg.selectAll(".mask").remove();
            let meng_g = []
            const meng_rect = d3.select(".meng").selectAll(".active").each((d,i,nodes)=>meng_g.push(nodes[i].parentNode));
            const all_cited_rect = d3.selectAll(`.l${this.cite_depth}`);
            meng_g = d3.selectAll(meng_g)
            const grouped_g = groupBy(meng_rect.data(), (x) => x.depth);
            for(let [level, group] of Object.entries(grouped_g)){
                grouped_g[level] = new Set(group.map(d=>d.data.name));
            }
            const levels = Object.keys(grouped_g);
            all_cited_rect.each((d,i,nodes) => {
                let total_cited_dict = {}
                const n = nodes[i];
                const parent = d3.select(n.parentNode);
                let bbox = n.getBBox();
                for(let l of levels){
                    let _ = d.cite[l].filter(i=>grouped_g[l].has(i));
                    total_cited_dict = Object.assign(total_cited_dict, count(_))
                }
                const total_cited_num = d3.sum(Object.values(total_cited_dict));
                let _start = 0;
                d.cite_rect = {}
                // meng_root.find_node_and_get_its_parent()
                for (const [key, value] of Object.entries(total_cited_dict)) {
                    d.cite_rect[key] = {
                        x: _start, y:0, w: value / total_cited_num  * bbox.width, h: bbox.height, num: value
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
                        .classed("mask", true)
                        .attr("pointer-events", "none")
                }
            })
            all_cited_rect.on("mouseover", (event, d) => {
                const g = d3.select(event.target.parentNode).select("text").classed("hide_text", false).raise();
                d3.select(`.${d.find_parent_by_level(0).data.name}`).raise()
                const lower_rects = meng_g
                                    .selectAll(`.${concatName(d)}`)
                                    // .selectAll(".active")
                                    .classed("hl", true).raise();
                const upper_rects = d3.select(event.target.parentNode).selectAll(".mask");
                let curves = []
                for(let lr of lower_rects){
                    const node_data = d3.select(lr).data()[0];
                    let lower_name = node_data.data.name;
                    let upper_rect = upper_rects.filter(function(){
                        let _ = d3.select(this).attr("class").replace(" mask", "");
                        if(_ == "null") _ = "";
                        return _ == lower_name;
                    }).node()
                    curves.push({
                        d: curve_generator(this.main_svg.node(), upper_rect, lr),
                        color: this.$color[lower_name],
                        meng_depth: node_data.depth,
                    })
                }
                this.draw_sankey(d.data.name, curves)        
            })
            .on("mouseout", (event, d) => {
                d3.select(event.target.parentNode).select("text").classed("hide_text", true);
                d3.selectAll(".hl").classed("hl", false);
                this.remove_sankey(d.data.name)        
            })

            meng_rect.each((d,i,nodes) => {
                    // d3.selectAll()
                    const bbox = nodes[i].getBBox();
                    const parent = d3.select(nodes[i].parentNode);
                    const all_citation = d.count_cited_nodes_by_cite_depth(h_books, this.cite_depth);
                    const cited_num = count(all_citation);
                    const meng_dom = calRelBoundingBox(this.main_svg.node(), nodes[i])
                    const meng_center = [meng_dom.x, meng_dom.y + meng_dom.height / 2]

                    // 排序 d.get_cited_doms_by_m_node(h_books, this.cite_depth)获取所有引用该meng节点的书 
                    let position_dict = {}
                    d.get_cited_doms_by_m_node(h_books, this.cite_depth)
                    .each( (_d, i, nodes) => {
                        const selected_node = d3.select(nodes[i].parentNode).select(`.${d.data.name ? d.data.name : "null"}`);
                        let _bbox = calRelBoundingBox(this.main_svg.node(), selected_node.node());
                        let _c = [_bbox.x, _bbox.y + _bbox.height]
                        position_dict[concatName(_d)] = _c
                    })
                    const sorted_key = Object.keys(position_dict)
                    .sort((a, b) => {
                        let _a = position_dict[a]
                        let _b = position_dict[b]
                        return angleWithNegativeXAxis(meng_center, _b) - angleWithNegativeXAxis(meng_center, _a)
                        // if(_a.x !== _b.x) {
                        //     console.log(_a.x, _b.x)
                        //     return _a.x - _b.x
                        // }
                        // else if(_a.x == _b.x){
                        //     return _a.y - _b.y;
                        // }
                    })
                    let _start = 0;
                    d.cite_rect = {}
                    for(let key of sorted_key){
                        const value = cited_num[key];
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
                            .classed("mask", true)
                    }
            })
            meng_rect.on("mouseover click", (event,d)=>{
                    if(event.type === "click") d.retain = !d.retain;
                    let curves = []
                    d.get_cited_doms_by_m_node(h_books, this.cite_depth)
                    .each((_d, i, nodes) => {
                        const selected_node = d3.select(nodes[i].parentNode).select(`.${d.data.name ? d.data.name : "null"}`)
                        .classed("hl",true).raise();
                        d3.select(`.${_d.find_parent_by_level(0).data.name}`).raise()
                        const meng_node = d3.select(".meng")
                            .selectAll(`.${concatName(_d)}`)
                            .filter(meng_node=>meng_node.data.name == d.data.name)
                            .node();
                        d3.select(nodes[i].parentNode).select("text").classed("hide_text", false);
                        if(d.depth === 3){
                            var img_url = getItemImageUrl(d.data.value[0].name.replace("n", ""));
                        }
                        // console.log(d)
                        curves.push({
                            d: curve_generator(this.main_svg.node(),selected_node.node(), meng_node),
                            color: this.$color[d.find_parent_by_level(1).data.name],
                            meng_depth: d.depth,
                            book: _d.find_parent_by_level(0).data.name,
                            url: img_url,
                            text: d.data.value ? d.data.value[0].text : ""
                        })
                    })
                    this.draw_sankey(d.data.name, curves)
            })
            .on("mouseout", (e, d) => {
                    d3.select("#canvas").selectAll("text").classed("hide_text", true);
                    d3.selectAll(".hl").classed("hl", false);
                    if(!d.retain) this.remove_sankey(d.data.name)
            })

        },
        draw_sankey(sankey_name, curves){
            this.main_svg.selectAll(`.sankey${sankey_name}`)
                        .data(curves)
                        .join("path")
                        .attr("d", _d=>_d.d)
                        .classed(`sankey${sankey_name}`, true)
                        .classed("sankey", true)
                        .attr("fill", _d => _d.color)
                        .attr("opacity", 0.3)
                        .attr("cursor",  d => d.meng_depth !== 3 ? "default" : "pointer")
                        .on("mouseover", (e, d) => {
                            if(d.meng_depth !== 3) return
                            // d3.select(e.target).attr("stroke", "red").attr("stroke-width", "2")
                        })
                        .on("mouseout", (e, d) => {
                            if(d.meng_depth !== 3) return
                            d3.select(e.target).attr("stroke", null).attr("stroke-width", "0")
                        })
                        .on("click", (event, d) => {
                            if(3 !== d.meng_depth){
                                return
                            }
                            this.show_image = true;
                            this.cite_book_name = d.book;
                            this.leftSrc = d.url;
                            this.text = d.text;
                        })
        },
        remove_sankey(sankey_name){
            if(!sankey_name){
                this.main_svg.selectAll(".sankey").remove();
                this.main_svg.selectAll(".hl").classed("hl", false);
                this.canvas.selectAll("text").classed("hide_text", true);
                return 
            }
            this.main_svg.selectAll(`.sankey${sankey_name}`).remove();
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
                    else if(d.depth == this.cite_depth + 1) return "1"
                    else return "0"
                })
                // .style("display", d=> d.depth == this.cite_depth || this.showNextLevel ? null : "none");
                // .style("display", d=> d.depth == this.cite_depth || this.showNextLevel ? null : "none");
        },
        selected_book(v){
            if(!v){
                this.remove_sankey();
                return
            };
            let meng_g = []
            const meng_rect = d3.select(".meng").selectAll(".active").each((d,i,nodes)=>meng_g.push(nodes[i].parentNode));
            meng_g = d3.selectAll(meng_g)
            const children = v.get_nodes_by_depth(this.cite_depth);
            d3.select(`.${v.data.name}`)
                .selectAll(`.l${this.cite_depth}`)
                .each((d, i, nodes) => {
                    d.retain = false;
                    const g = d3.select(nodes[i].parentNode).select("text").classed("hide_text", false).raise();
                    d3.select(`.${d.find_parent_by_level(0).data.name}`).raise()
                    const lower_rects = meng_g
                                        .selectAll(`.${concatName(d)}`)
                                        // .selectAll(".active")
                                        .classed("hl", true).raise();
                    const upper_rects = d3.select(nodes[i].parentNode).selectAll(".mask");
                    let curves = []
                    for(let lr of lower_rects){
                        const node_data = d3.select(lr).data()[0];
                        let lower_name = node_data.data.name;
                        let upper_rect = upper_rects.filter(function(){
                            let _ = d3.select(this).attr("class").replace(" mask", "");
                            if(_ == "null") _ = "";
                            return _ == lower_name;
                        }).node()
                        curves.push({
                            d: curve_generator(this.main_svg.node(), upper_rect, lr),
                            color: this.$color[lower_name],
                            meng_depth: node_data.depth,
                        })
                    }
                    this.draw_sankey(d.data.name, curves)     
                })
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
    height: 100%; 
    overflow: scroll; 
    display:flex; 
    position: relative;
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

.no_available{
    pointer-events: none;
}
</style>
