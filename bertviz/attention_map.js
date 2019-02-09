/**
 * @fileoverview Transformer Visualization D3 javascript code.
 *
 * Change log:
 *
 * 02/01/19  Jesse Vig   Initial implementation
 */

requirejs(['jquery', 'd3'],
    function ($, d3) {

        var attention = window.attention;
        const WIDTH = 5000;
        const HEIGHT = 60000;
        const MIN_X = 0;
        const MAX_X = WIDTH;
        const MIN_Y = 0;
        const MAX_Y = HEIGHT

        // const HEIGHT = attention.all.right_text.length * BOXHEIGHT * 2 + 100 + 700;
        // const PADDING_WIDTH = 25;
        // const ATTENTION_WIDTH = 175;
        // const HEADING_HEIGHT = 50; //TODO Remove
        const THUMBNAIL_WIDTH = 79;
        // const THUMBNAIL_HEIGHT = 160;
        const THUMBNAIL_BOX_HEIGHT = 7;
        const THUMBNAIL_ATTENTION_WIDTH = 65;
        const THUMBNAIL_PADDING = 5;

        const DETAIL_WIDTH = 300;
        // const DETAIL_HEIGHT = 900;
        const DETAIL_ATTENTION_WIDTH = 140;
        const DETAIL_BOX_WIDTH = 80;
        const DETAIL_BOX_HEIGHT = 20;
        const DETAIL_PADDING = 5;
        const DETAIL_HEADING_HEIGHT = 20;
        const TEXT_SIZE = 13;

        const LAYER_COLORS = d3.scaleOrdinal(d3.schemeCategory10);

        function render() {
            var att_data = config.attention[config.att_type];
            var left_text = att_data.left_text;
            var right_text = att_data.right_text;
            var att = att_data.att;

            $("#vis").empty();
            var svg = d3.select("#vis")
                .append('svg')
                .attr("width", WIDTH)
                .attr("height", HEIGHT)

            var num_layers =  att.length
            var num_heads =  att[0].length
            var i;
            var j;
            for (i = 0; i < num_layers; i++) {
                for (j = 0; j < num_heads; j++) {
                    renderThumbnail(svg, left_text, right_text, att, i, j);
                }
            }
        }

        function renderThumbnail(svg, left_text, right_text, att, layer_index, head_index) {
            var x = head_index * THUMBNAIL_WIDTH;
            var height = Math.max(left_text.length, right_text.length) * THUMBNAIL_BOX_HEIGHT + 2 * THUMBNAIL_PADDING;
            var y = layer_index * height;
            renderThumbnailAttn(svg, left_text, right_text, x, y, att[layer_index][head_index], layer_index, head_index);
        }

        function renderDetail(svg, left_text, right_text, att, layer_index, head_index) {
            var xOffset = 10;
            var x = head_index * THUMBNAIL_WIDTH + THUMBNAIL_PADDING + xOffset;
            if (x < MIN_X) {
                x = MIN_X;
            } else if (x + DETAIL_WIDTH > MAX_X) {
                x = MAX_X - DETAIL_WIDTH;
            }
            var posLeftText = x;
            var posAttention = posLeftText + DETAIL_BOX_WIDTH;
            var posRightText = posAttention + DETAIL_ATTENTION_WIDTH;
            var thumbnailHeight = Math.max(left_text.length, right_text.length) * THUMBNAIL_BOX_HEIGHT + 2 * THUMBNAIL_PADDING;
            var yOffset = 12;
            var y = layer_index * thumbnailHeight + THUMBNAIL_PADDING + yOffset;
            var height = Math.max(left_text.length, right_text.length) * DETAIL_BOX_HEIGHT + 2 * DETAIL_PADDING;
            if (y < MIN_Y) {
                y = MIN_Y;
            } else if (y + height > MAX_Y) {
                y = MAX_Y - height;
            }
            renderDetailFrame(svg, x, y, left_text, right_text, layer_index)
            renderText(svg, left_text, "left_text", posLeftText, y, layer_index);
            renderDetailAttn(svg, posAttention, y, att, layer_index, head_index);
            renderText(svg, right_text, "right_text", posRightText, y, layer_index);
        }

        // function renderDetail(svg, left_text, right_text, att, layer_index, head_index) {
        //     var xMidpoint = (head_index + .5) * THUMBNAIL_WIDTH;
        //     var x = xMidpoint - .5 * DETAIL_WIDTH
        //     if (x < MIN_X) {
        //         x = MIN_X;
        //     } else if (x + DETAIL_WIDTH > MAX_X) {
        //         x = MAX_X - DETAIL_WIDTH;
        //     }
        //     var posLeftText = x;
        //     var posAttention = posLeftText + DETAIL_BOX_WIDTH;
        //     var posRightText = posAttention + DETAIL_ATTENTION_WIDTH;
        //     var yMidpoint = (layer_index + .5) * THUMBNAIL_HEIGHT;
        //     var height = Math.max(left_text.length, right_text.length) * DETAIL_BOX_HEIGHT;
        //     var y = yMidpoint - .5 * height
        //     if (y < MIN_Y) {
        //         y = MIN_Y;
        //     } else if (y + height > MAX_Y) {
        //         y = MAX_Y - height;
        //     }
        //     renderDetailFrame(svg, x, y, left_text, right_text)
        //     renderText(svg, left_text, "left_text", posLeftText, y, layer_index);
        //     renderDetailAttn(svg, posAttention, y, att, layer_index, head_index);
        //     renderText(svg, right_text, "right_text", posRightText, y, layer_index);
        // }

         function renderText(svg, text, id, x, y, layer_index) {
            var tokenContainer = svg.append("svg:g")
                .classed("detail", true)
                .attr("pointer-events", "none")
                // .attr("id", id)
                .selectAll("g")
                .data(text)
                .enter()
                .append("g");
            // if (id == "left_text" || id == "right_text") {

                tokenContainer.append("rect")
                    .classed("highlight", true)
                    // .attr("fill", fillColor)
                    .style("opacity", 0.0)
                    .attr("height", DETAIL_BOX_HEIGHT)
                    .attr("width", DETAIL_BOX_WIDTH)
                    .attr("x", x)
                    .attr("y", function (d, i) {
                        return y + i * DETAIL_BOX_HEIGHT - 1;
                    });
            // }

            // var offset;
            // if (id == "left_text") {
            //     offset = -10;
            // } else {
            //     offset = 10;
            // }
             var fillColor = LAYER_COLORS(layer_index % 10)

            var textContainer = tokenContainer.append("text")
                .classed("token", true)
                .text(function (d) {
                    return d;
                })
                .attr("font-size", TEXT_SIZE + "px")
                .style("cursor", "default")
                .style("-webkit-user-select", "none")
                .attr("fill", fillColor)

                .attr("x", x)
                .attr("y", function (d, i) {
                    return i * DETAIL_BOX_HEIGHT + y;
                })
                .attr("height", DETAIL_BOX_HEIGHT)
                .attr("width", DETAIL_BOX_WIDTH)
                .attr("dy", TEXT_SIZE);

            if (id == "left_text") {
                textContainer.style("text-anchor", "end")
                    .attr("dx", DETAIL_BOX_WIDTH - 2);
                // tokenContainer.on("mouseover", function (d, index) {
                //     config.index = index;
                //     highlightSelection(svg, index);
                //     showComputation(svg, index);
                // });
                // tokenContainer.on("mouseleave", function () {
                //     unhighlightSelection(svg);
                //     hideComputation(svg)
                // });
            }
        }

        function renderThumbnailAttn(svg, left_text, right_text, x, y, att, layer_index, head_index) {

            var attnContainer = svg.append("svg:g");

            var x1 = x + THUMBNAIL_PADDING
            var x2 = x1 + THUMBNAIL_ATTENTION_WIDTH
            var y1 = y + THUMBNAIL_PADDING;

            attnContainer.selectAll("g")
                .data(att)
                .enter()
                .append("g") // Add group for each source token
                .classed('attn-line-group', true)
                .attr("source-index", function (d, i) { // Save index of source token
                    return i;
                })
                .selectAll("line")
                .data(function (d) { // Loop over all target tokens
                    return d;
                })
                .enter() // When entering
                .append("line")
                .attr("x1", x1)
                .attr("y1", function (d) {
                    var sourceIndex = +this.parentNode.getAttribute("source-index");
                    return y1 + (sourceIndex + .5) * THUMBNAIL_BOX_HEIGHT;
                })
                .attr("x2", x2)
                .attr("y2", function (d, targetIndex) {
                    return y1 + (targetIndex + .5) * THUMBNAIL_BOX_HEIGHT;
                })
                .attr("stroke-width", 3)
                // .attr("stroke", "blue")
                .attr("stroke", LAYER_COLORS(layer_index % 10))
                .attr("stroke-opacity", function (d) {
                    return d;
                });

            var height = Math.max(left_text.length, right_text.length) * THUMBNAIL_BOX_HEIGHT + 2 * THUMBNAIL_PADDING;

            var hoverRegion = attnContainer.append("rect")
                .attr("x", x)
                .attr("y", y)
                .attr("height", height)
                .attr("width", THUMBNAIL_WIDTH)
                .style("opacity", 0)

            hoverRegion.on("mouseenter", function (d, index) {
                renderDetail(svg, left_text, right_text, att, layer_index, head_index)
                console.log('mouseenter on layer ' + layer_index + ' head ' + head_index)
            });
            hoverRegion.on("mouseleave", function () {
                svg.selectAll(".detail").remove();
                console.log('mouseleave on layer ' + layer_index + ' head ' + head_index)
            });
        }

        function renderDetailFrame(svg, x, y, left_text, right_text, layer_index) {
            var height = Math.max(left_text.length, right_text.length) * DETAIL_BOX_HEIGHT + 2 * DETAIL_PADDING;
            // var width = 2 * DETAIL_BOX_WIDTH + DETAIL_ATTENTION_WIDTH
            svg.append("rect")
                .classed("detail", true)
                .attr("pointer-events", "none")
                .attr("x", x)
                .attr("y", y)
                .attr("height", height)
                .attr("width", DETAIL_WIDTH)
                .style("opacity", 0.9)
                .attr("fill", "white")

                // .attr("stroke-width", 2)
                // .attr("stroke", LAYER_COLORS(layer_index % 10))

        }

        function renderDetailAttn(svg, x, y, att, layer_index) {
            var attnContainer = svg.append("svg:g")
                            .classed("detail", true)
                            .attr("pointer-events", "none");

            console.log("att")
            console.log(att);
            attnContainer.
                selectAll("g")
                .data(att)
                .enter()
                .append("g") // Add group for each source token
                .classed('attn-line-group', true)
                .attr("source-index", function (d, i) { // Save index of source token
                    return i;
                })
                .selectAll("line")
                .data(function (d) { // Loop over all target tokens
                    return d;
                })
                .enter() // When entering
                .append("line")
                .attr("x1", x + DETAIL_PADDING)
                .attr("y1", function (d) {
                    var sourceIndex = +this.parentNode.getAttribute("source-index");
                    return y + (sourceIndex + .5) * DETAIL_BOX_HEIGHT;
                })
                .attr("x2", x + DETAIL_ATTENTION_WIDTH - DETAIL_PADDING)
                .attr("y2", function (d, targetIndex) {
                    return y + (targetIndex + .5) * DETAIL_BOX_HEIGHT;
                })
                .attr("stroke-width", 3)
                // .attr("stroke", "blue")
                .attr("stroke", LAYER_COLORS(layer_index % 10))
                .attr("stroke-opacity", function (d) {
                    return d;
                });
        }


        var config = {
            // layer: 0,
            // att_head: 0,
            att_type: 'all'
        };

        function visualize() {
            // config.vector_size = attention['all']['att'][0][0][0].length; // Layer 0, head 0, position 0 length
            config.attention = attention;
            render();
        }


        $("#layer").empty();
        for (var i = 0; i < 12; i++) {
            $("#layer").append($("<option />").val(i).text(i));
        }

        $("#layer").on('change', function (e) {
            config.layer = +e.currentTarget.value;
            render();
        });

        $("#att_head").empty();
        for (var i = 0; i < 12; i++) {
            $("#att_head").append($("<option />").val(i).text(i));
        }

        $("#att_head").on('change', function (e) {
            config.att_head = +e.currentTarget.value;
            render();
        });

        $("#att_type").on('change', function (e) {
            config.att_type = e.currentTarget.value;
            render();
        });

        // $("button").on('click', visualize);

        visualize();

    });