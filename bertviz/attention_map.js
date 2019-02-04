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
        const TEXT_SIZE = 3;
        const BOXWIDTH = TEXT_SIZE * 8;
        const BOXHEIGHT = 7;
        const WIDTH = 5000;
        const HEIGHT = 60000;
        // const HEIGHT = attention.all.right_text.length * BOXHEIGHT * 2 + 100 + 700;
        // const PADDING_WIDTH = 25;
        // const ATTENTION_WIDTH = 175;
        // const HEADING_HEIGHT = 50; //TODO Remove
        const CELL_WIDTH = 80;
        const CELL_HEIGHT = 160;
        const ATTENTION_WIDTH = 65;

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
                    renderCell(svg, left_text, right_text, att, i, j);
                }
            }
        }

        function renderCell(svg, left_text, right_text, att, layer_index, head_index) {
            var x1 = head_index * CELL_WIDTH + 10;
            var x2 = (head_index + 1) * CELL_WIDTH - 10;
            var y = layer_index * CELL_HEIGHT;

            // renderText(svg, left_text, "left_text", posLeftText, y);
            renderAttn(svg, x1, x2, y, att[layer_index][head_index], layer_index, head_index);
            // renderText(svg, right_text, "right_text", posRightText, y);
        }

        // function renderCell(svg, left_text, right_text, att, layer_index, head_index) {
        //     var posLeftText = head_index * CELL_WIDTH;
        //     var posAttention = posLeftText + BOXWIDTH;
        //     var posRightText = posAttention + ATTENTION_WIDTH;
        //     var y = layer_index * CELL_HEIGHT;
        //
        //     renderText(svg, left_text, "left_text", posLeftText, y);
        //     renderAttn(svg, posAttention, y, att[layer_index][head_index], layer_index, head_index);
        //     renderText(svg, right_text, "right_text", posRightText, y);
        // }


         function renderText(svg, text, id, x, y) {
            var tokenContainer = svg.append("svg:g")
                // .attr("id", id)
                .selectAll("g")
                .data(text)
                .enter()
                .append("g");
            // if (id == "left_text" || id == "right_text") {
                var fillColor;
                if (id == "right_text") {
                    fillColor = '#1f77b4';
                }
                if (id == "left_text") {
                    fillColor = 'lightgray';
                }

                tokenContainer.append("rect")
                    .classed("highlight", true)
                    .attr("fill", fillColor)
                    .style("opacity", 0.0)
                    .attr("height", BOXHEIGHT)
                    .attr("width", BOXWIDTH)
                    .attr("x", x)
                    .attr("y", function (d, i) {
                        return y + i * BOXHEIGHT - 1;
                    });
            // }

            // var offset;
            // if (id == "left_text") {
            //     offset = -10;
            // } else {
            //     offset = 10;
            // }

            var textContainer = tokenContainer.append("text")
                .classed("token", true)
                .text(function (d) {
                    return d;
                })
                .attr("font-size", TEXT_SIZE + "px")
                .style("cursor", "default")
                .style("-webkit-user-select", "none")
                .attr("x", x)
                .attr("y", function (d, i) {
                    return i * BOXHEIGHT + y;
                })
                .attr("height", BOXHEIGHT)
                .attr("width", BOXWIDTH)
                .attr("dy", TEXT_SIZE);

            if (id == "left_text") {
                textContainer.style("text-anchor", "end")
                    .attr("dx", BOXWIDTH - 2);
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

        function renderAttn(svg, x1, x2, y, att) {
            var attnContainer = svg.append("svg:g");
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
                    return sourceIndex * BOXHEIGHT + y + BOXHEIGHT / 2;
                })
                .attr("x2", x2)
                .attr("y2", function (d, targetIndex) {
                    return targetIndex * BOXHEIGHT + y + BOXHEIGHT / 2;
                })
                .attr("stroke-width", 2)
                .attr("stroke", "blue")
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