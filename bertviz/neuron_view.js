/**
 * @fileoverview Transformer Visualization D3 javascript code.
 *
 * Based on https://github.com/tensorflow/tensor2tensor/blob/master/tensor2tensor/visualization/attention.js
 *
 * Change log:
 *
 * 12/19/18  Jesse Vig   Assorted cleanup. Changed orientation of attention matrices.
 * 12/22/18  Jesse Vig   Display attention details: query/key vectors
 * 01/01/21  Jesse Vig   Change to bertviz-specific naming conventions so as not to interfere with other html elements
 * 01/16/21  Jesse Vig   Dark mode
 * 02/06/21  Jesse Vig   Move require config from separate jupyter notebook step
 * 03/23/22  Daniel SC   Update requirement URLs for d3 and jQuery (source of bug not allowing end result to be displayed on browsers)
 * 04/02/22  Jesse Vig   Enable multiple neuron views per notebook
 **/

require.config({
    paths: {
        d3: 'https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min',
        jquery: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.0/jquery.min',
    }
});

requirejs(['jquery', 'd3'],
    function ($, d3) {

        const params = window.bertviz_params
        const config = {};
        initialize();

        const HEADING_TEXT_SIZE = 16;
        const HEADING_HEIGHT = 42;
        const TEXT_SIZE = 15;
        const MATRIX_WIDTH = 200;
        const BOXWIDTH = TEXT_SIZE * 8;
        const BOXHEIGHT = 26;
        const HEIGHT_PADDING = 100;
        const PADDING_WIDTH = 25;
        const DOT_WIDTH = 70;
        const SOFTMAX_WIDTH = 70;
        const ATTENTION_WIDTH = 150;
        const PALETTE = {
            'dark': {
                'attn': '#2994de',
                'neg': '#ff6318',
                'pos': '#2090dd',
                'text': '#ccc',
                'selected_text': 'white',
                'heading_text': 'white',
                'text_highlight_left': "#1b86cd",
                'text_highlight_right': "#1b86cd",
                'vector_border': "#444",
                'connector': "#2994de",
                'background': 'black',
                'dropdown': 'white',
                'icon': 'white'
            },
            'light': {
                'attn': 'blue',
                'neg': '#ff6318',
                'pos': '#0c36d8',
                'text': '#202020',
                'selected_text': 'black',
                'heading_text': 'black',
                'text_highlight_left': "#e5e5e5",
                'text_highlight_right': "#478be8",
                'vector_border': "#EEE",
                'connector': "blue",
                'background': 'white',
                'dropdown': 'black',
                'icon': '#888'
            }
        }


        const MIN_CONNECTOR_OPACITY = 0

        function render() {

            var attnData = config.attention[config.filter];
            var leftText = attnData.left_text;
            var rightText = attnData.right_text;
            var queries = attnData.queries[config.layer][config.head];
            var keys = attnData.keys[config.layer][config.head];
            var att = attnData.attn[config.layer][config.head];

            $(`#${config.rootDivId} #vis`).empty();
            var height = config.initialTextLength * BOXHEIGHT + HEIGHT_PADDING;
            var svg = d3.select(`#${config.rootDivId} #vis`)
                .append('svg')
                .attr("width", "100%")
                .attr("height", height + "px");

            d3.select(`#${config.rootDivId}`)
                .style("background-color", getColor('background'));
            d3.selectAll(`#${config.rootDivId} .dropdown-label`)
                .style("color", getColor('dropdown'))

            renderVisExpanded(svg, leftText, rightText, queries, keys);
            renderVisCollapsed(svg, leftText, rightText, att);
            if (config.expanded == true) {
                showExpanded();
            } else {
                showCollapsed();
            }
        }

        function renderVisCollapsed(svg, leftText, rightText) {

            var posLeftText = 0;
            var posAttention = posLeftText + BOXWIDTH;
            var posRightText = posAttention + ATTENTION_WIDTH + PADDING_WIDTH;

            svg = svg.append("g")
                .attr("id", "collapsed")
                .attr("visibility", "hidden");

            renderText(svg, leftText, "leftText", posLeftText, false);
            renderAttn(svg, posAttention, posRightText, false);
            renderText(svg, rightText, "rightText", posRightText, false);
        }

        function renderVisExpanded(svg, leftText, rightText, queries, keys) {

            var posLeftText = 0;
            var posQueries = posLeftText + BOXWIDTH + PADDING_WIDTH;
            var posKeys = posQueries + MATRIX_WIDTH + PADDING_WIDTH * 1.5;
            var posProduct = posKeys + MATRIX_WIDTH + PADDING_WIDTH;
            var posDotProduct = posProduct + MATRIX_WIDTH + PADDING_WIDTH;
            var posRightText = posDotProduct + BOXHEIGHT + PADDING_WIDTH;

            svg = svg.append("g")
                .attr("id", "expanded")
                .attr("visibility", "hidden");

            renderHeadingsExpanded(svg, posQueries, posKeys, posProduct, posDotProduct, posRightText);
            renderText(svg, leftText, "leftText", posLeftText, true);
            renderTextQueryLines(svg, posQueries - PADDING_WIDTH, posQueries - 2);
            renderVectors(svg, "keys", keys, posKeys);
            renderQueryKeyLines(svg, posQueries + MATRIX_WIDTH + 1, posKeys - 3);
            renderVectors(svg, "queries", queries, posQueries);
            renderHorizLines(svg, "hlines1", posProduct - PADDING_WIDTH + 1, posProduct - 1);
            renderVectors(svg, "product", keys, posProduct);
            renderHorizLines(svg, "hlines2", posDotProduct - PADDING_WIDTH + 2, posDotProduct);
            var dotProducts = new Array(rightText.length).fill(0);
            renderDotProducts(svg, dotProducts, posDotProduct);
            renderText(svg, rightText, "rightText", posRightText, true);
            renderHorizLines(svg, "hlines3", posRightText - PADDING_WIDTH - 2, posRightText);
            renderVectorHighlights(svg, "key-vector-highlights", posKeys);
            renderVectorHighlights(svg, "product-vector-highlights", posProduct)
        }

        function renderHeadingsExpanded(svg, posQueries, posKeys, posProduct, posDotProduct, posSoftmax) {
            var headingContainer = svg.append("svg:g")
                .attr("id", "heading")

            var queryHeadingContainer = headingContainer.append("text")
                .attr("x", posQueries + 68)
                .attr("y", HEADING_HEIGHT - 12)
                .attr("height", BOXHEIGHT)
                .attr("width", MATRIX_WIDTH)
                .style('fill', getColor('heading_text'));

            queryHeadingContainer.append('tspan')
                .text('Query ')
                .attr("y", HEADING_HEIGHT - 12)
                .attr("font-size", HEADING_TEXT_SIZE + "px");

            queryHeadingContainer.append('tspan')
                .text('q')
                .attr("y", HEADING_HEIGHT - 12)
                .attr("font-size", HEADING_TEXT_SIZE + "px");

            var keyHeadingContainer = headingContainer.append("text")
                .attr("x", posKeys + 73)
                .attr("y", HEADING_HEIGHT - 12)
                .attr("height", BOXHEIGHT)
                .attr("width", MATRIX_WIDTH)
                .attr("font-size", HEADING_TEXT_SIZE + "px")
                .style('fill', getColor('heading_text'));

            keyHeadingContainer.append('tspan')
                .text('Key ')
                .style('font-size', HEADING_TEXT_SIZE + "px")
                .attr("y", HEADING_HEIGHT - 12);

            keyHeadingContainer.append('tspan')
                .text('k ')
                .style('font-size', HEADING_TEXT_SIZE + "px")
                .attr("y", HEADING_HEIGHT - 12);

            var productHeadingContainer = headingContainer.append("text")
                .attr("x", posProduct + 28)
                .attr("y", HEADING_HEIGHT - 12)
                .attr("height", BOXHEIGHT)
                .attr("width", MATRIX_WIDTH)
                .attr("font-size", HEADING_TEXT_SIZE + "px")
                .style('fill', getColor('heading_text'));

            productHeadingContainer.append('tspan')
                .text('q \u00D7 k (elementwise)')
                .style('font-size', HEADING_TEXT_SIZE + "px")
                .attr("y", HEADING_HEIGHT - 12);

            var dotProductHeadingContainer = headingContainer.append("text")
                .attr("x", posDotProduct - 6)
                .attr("y", HEADING_HEIGHT - 12)
                .attr("height", BOXHEIGHT)
                .attr("width", MATRIX_WIDTH)
                .attr("font-size", HEADING_TEXT_SIZE + "px")
                .style('fill', getColor('heading_text'));

            dotProductHeadingContainer.append('tspan')
                .text('q')
                .style('font-size', HEADING_TEXT_SIZE + "px")
                .attr("y", HEADING_HEIGHT - 12);

            dotProductHeadingContainer.append('tspan')
                .text(' \u2219 k')
                .style('font-size', HEADING_TEXT_SIZE + "px")
                .attr("y", HEADING_HEIGHT - 12);

            headingContainer.append("text")
                .attr("x", posSoftmax + 9)
                .attr("y", HEADING_HEIGHT - 12)
                .attr("height", BOXHEIGHT)
                .attr("width", SOFTMAX_WIDTH)
                .attr("font-size", HEADING_TEXT_SIZE + "px")
                .style("text-anchor", "start")
                .style('fill', getColor('heading_text'))
                .text("Softmax");

            headingContainer.append("text")
                .attr("id", "placeholder")
                .attr("x", posProduct + 55)
                .attr("y", HEADING_HEIGHT + 55)
                .attr("height", BOXHEIGHT)
                .attr("width", SOFTMAX_WIDTH + MATRIX_WIDTH + DOT_WIDTH)
                .attr("font-size", 20 + "px")
                .text("No token selected")
                .attr("fill", getColor('text_highlighted'));
        }

        function renderHorizLines(svg, id, start_pos, end_pos) {
            var attnMatrix = config.attention[config.filter].attn[config.layer][config.head];
            var linesContainer = svg.append("svg:g")
                .attr("id", id);
            linesContainer.selectAll("g")
                .data(attnMatrix)
                .enter()
                .append("g") // Add group for each source token
                .classed('horiz-line-group', true)
                .style("opacity", 0)
                .attr("source-index", function (d, i) { // Save index of source token
                    return i;
                })
                .selectAll("line")
                .data(function (d) { // Loop over all target tokens
                    return d;
                })
                .enter() // When entering
                .append("line")
                .attr("x1", start_pos)
                .attr("y1", function (d, targetIndex) {
                    return targetIndex * BOXHEIGHT + HEADING_HEIGHT + BOXHEIGHT / 2;
                })
                .attr("x2", end_pos)
                .attr("y2", function (d, targetIndex) {
                    return targetIndex * BOXHEIGHT + HEADING_HEIGHT + BOXHEIGHT / 2;
                })
                .attr("stroke-width", 2)
                .attr("stroke", getColor('connector'))
                .attr("stroke-opacity", function (d) {
                    if (d == 0) {
                        return 0;
                    } else {
                        return Math.max(MIN_CONNECTOR_OPACITY, Math.tanh(Math.abs(1.8 * d)));
                    }
                });
        }

        function renderVectorHighlights(svg, id, start_pos) {
            var attnMatrix = config.attention[config.filter].attn[config.layer][config.head];
            var vectorHighlightsContainer = svg.append("svg:g")
                .attr("id", id);
            vectorHighlightsContainer.selectAll("g")
                .data(attnMatrix)
                .enter()
                .append("g") // Add group for each source token
                .classed('vector-highlight-group', true)
                .style("opacity", 0)
                .attr("source-index", function (d, i) { // Save index of source token
                    return i;
                })
                .selectAll("rect")
                .data(function (d) { // Loop over all target tokens
                    return d;
                })
                .enter() // When entering
                .append("rect")
                .attr("x", start_pos - 1)
                .attr("y", function (d, targetIndex) {
                    return targetIndex * BOXHEIGHT + HEADING_HEIGHT;
                })
                .attr("height", BOXHEIGHT - 5)
                .attr("width", MATRIX_WIDTH + 3)
                .style("fill-opacity", 0)
                .attr("stroke-width", 2)
                .attr("stroke", getColor('connector'))
                .attr("stroke-opacity", function (d) {
                    return Math.tanh(Math.abs(1.8 * d));
                });
        }

        function renderQueryKeyLines(svg, start_pos, end_pos) {
            var attnMatrix = config.attention[config.filter].attn[config.layer][config.head];
            var linesContainer = svg.append("svg:g");
            var lineFunction = d3.line()
                .x(function (d) {
                    return d.x;
                })
                .y(function (d) {
                    return d.y;
                });

            linesContainer.selectAll("g")
                .data(attnMatrix)
                .enter()
                .append("g") // Add group for each source token
                .classed('qk-line-group', true)
                .style("opacity", 0)
                .attr("source-index", function (d, i) { // Save index of source token
                    return i;
                })
                .selectAll("path")
                .data(function (d) { // Loop over all target tokens
                    return d;
                })
                .enter() // When entering
                .append("path")
                .attr("d", function (d, targetIndex) {
                    var sourceIndex = +this.parentNode.getAttribute("source-index");
                    var y1 = sourceIndex * BOXHEIGHT + HEADING_HEIGHT + BOXHEIGHT / 2;
                    var y2 = targetIndex * BOXHEIGHT + HEADING_HEIGHT + BOXHEIGHT / 2;
                    var x1 = start_pos;
                    var x2 = (start_pos + end_pos) / 2 + 1;
                    var x3 = end_pos;

                    return lineFunction([
                        {'x': x1, 'y': y1},
                        {'x': x2, 'y': y1},
                        {'x': x2, 'y': y2},
                        {'x': x3, 'y': y2},

                    ])
                })
                .attr("fill", "none")
                .attr("stroke-width", 2)
                .attr("stroke", getColor('connector'))
                .attr("stroke-opacity", function (d) {
                    if (d == 0) {
                        return 0;
                    } else {
                        return Math.max(MIN_CONNECTOR_OPACITY, Math.tanh(Math.abs(1.8 * d)));
                    }
                });
        }

        function renderTextQueryLines(svg, start_pos, end_pos) {
            var attnData = config.attention[config.filter];
            var leftText = attnData.left_text; // Use for shape not values
            var linesContainer = svg.append("svg:g");
            linesContainer.selectAll("line")
                .data(leftText)
                .enter()
                .append("line") // Add line
                .classed('text-query-line', true)
                .style("opacity", 0)
                .attr("x1", start_pos)
                .attr("y1", function (d, i) {
                    return i * BOXHEIGHT + HEADING_HEIGHT + BOXHEIGHT / 2;
                })
                .attr("x2", end_pos)
                .attr("y2", function (d, i) {
                    return i * BOXHEIGHT + HEADING_HEIGHT + BOXHEIGHT / 2;
                })
                .attr("stroke-width", 2)
                .attr("stroke", getColor('connector'))
        }

        function renderAttn(svg, start_pos, end_pos, expanded) {
            var attnMatrix = config.attention[config.filter].attn[config.layer][config.head];
            var attnContainer = svg.append("svg:g");
            attnContainer.selectAll("g")
                .data(attnMatrix)
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
                .attr("x1", start_pos)
                .attr("y1", function (d) {
                    var sourceIndex = +this.parentNode.getAttribute("source-index");
                    return sourceIndex * BOXHEIGHT + HEADING_HEIGHT + BOXHEIGHT / 2;
                })
                .attr("x2", end_pos)
                .attr("y2", function (d, targetIndex) {
                    return targetIndex * BOXHEIGHT + HEADING_HEIGHT + BOXHEIGHT / 2;
                })
                .attr("stroke-width", 2)
                .attr("stroke", getColor('attn'))
                .attr("stroke-opacity", function (d) {
                    return d;
                });
        }

        function renderVectors(svg, id, vectors, leftPos) {
            var vectorContainer = svg.append("svg:g")
                .attr("id", id);

            if (id == "product") {
                vectorContainer.style("opacity", 0);
            }

            var vector = vectorContainer.append("g") //.classed("attention_boxes", true) // Add outer group
                .selectAll("g")
                .data(vectors) // Loop over query/key vectors, one for each token
                .enter()
                .append("g") // Add (sub) group for each token
                .classed('vector', true)
                .attr("data-index", function (d, i) {
                    return i;
                }) // make parent index available from DOM

            if (id == "queries") {
                vector.append("rect")
                    .classed("vectorborder", true)
                    .attr("x", leftPos - 1)
                    .attr("y", function (d, i) {
                        return i * BOXHEIGHT + HEADING_HEIGHT;
                    })
                    .attr("width", MATRIX_WIDTH + 2)
                    .attr("height", BOXHEIGHT - 5)
                    .style("fill-opacity", 0)
                    .style("stroke-width", 1)
                    .style("stroke", getColor('vector_border'))
                    .attr("rx", 1)
                    .attr("ry", 1)
                    .style("stroke-opacity", 1)
            } else if (id == "keys") {
                vector.append("rect")
                    .classed("vectorborder", true)
                    .attr("x", leftPos - 1)
                    .attr("y", function (d, i) {
                        return i * BOXHEIGHT + HEADING_HEIGHT;
                    })
                    .attr("width", MATRIX_WIDTH + 2)
                    .attr("height", BOXHEIGHT - 6)
                    .style("fill-opacity", 0)
                    .style("stroke-width", 1)
                    .style("stroke", getColor('vector_border'))
                    .attr("rx", 1)
                    .attr("ry", 1)
                    .style("stroke-opacity", 1)
            } else {
                vector.append("rect")
                    .classed("vectorborder", true)
                    .attr("x", leftPos - 1)
                    .attr("y", function (d, i) {
                        return i * BOXHEIGHT + HEADING_HEIGHT;
                    })
                    .attr("width", MATRIX_WIDTH + 2)
                    .attr("height", BOXHEIGHT - 6)
                    .style("fill-opacity", 0)
                    .style("stroke-width", 1)
                    .style("stroke", getColor('vector_border'))
                    .attr("rx", 1)
                    .attr("ry", 1)
                    .style("stroke-opacity", 1)
            }

            vector.selectAll(".element")
                .data(function (d) {
                    return d;
                }) // loop over elements within each query vector
                .enter() // When entering
                .append("rect") // Add rect element for each token index (j), vector index (i)
                .classed('element', true)
                .attr("x", function (d, i) { // i is vector index, j is index of token
                    return leftPos + i * MATRIX_WIDTH / config.vectorSize;
                })
                .attr("y", function (d, i) {
                    var j = +this.parentNode.getAttribute("data-index");
                    return j * BOXHEIGHT + HEADING_HEIGHT;
                })
                .attr("width", MATRIX_WIDTH / config.vectorSize)
                .attr("height", BOXHEIGHT - 6)
                .attr("rx", .7)
                .attr("ry", .7)
                .attr("data-value", function (d) {
                    return d
                })
                .style("fill", function (d) {
                    if (d >= 0) {
                        return getColor('pos');
                    } else {
                        return getColor('neg')
                    }
                })
                .style("opacity", function (d) {
                    return Math.tanh(Math.abs(d) / 4);
                })
        }

        function renderText(svg, text, id, leftPos, expanded) {

            var tokenContainer = svg.append("svg:g")
                .attr("id", id)
                .selectAll("g")
                .data(text)
                .enter()
                .append("g");
            if (id == "leftText" || id == "rightText") {
                var fillColor;
                if (id == "rightText") {
                    fillColor = getColor('text_highlight_right');
                }
                if (id == "leftText") {
                    fillColor = getColor('text_highlight_left');
                }

                tokenContainer.append("rect")
                    .classed("highlight", true)
                    .attr("fill", fillColor)
                    .style("opacity", 0.0)
                    .attr("height", BOXHEIGHT)
                    .attr("width", BOXWIDTH)
                    .attr("x", leftPos)
                    .attr("y", function (d, i) {
                        return i * BOXHEIGHT + HEADING_HEIGHT - 1;
                    });
            }

            var offset;
            if (id == "leftText") {
                offset = -8;
            } else {
                offset = 8;
            }

            var textContainer = tokenContainer.append("text")
                .classed("token", true)
                .text(function (d) {
                    return d;
                })
                .attr("font-size", TEXT_SIZE + "px")
                .style("fill", getColor('text'))
                .style("cursor", "default")
                .style("-webkit-user-select", "none")
                .attr("x", leftPos + offset)
                .attr("y", function (d, i) {
                    return i * BOXHEIGHT + HEADING_HEIGHT;
                })
                .attr("height", BOXHEIGHT)
                .attr("width", BOXWIDTH)
                .attr("dy", TEXT_SIZE);

            if (id == "leftText") {
                textContainer.style("text-anchor", "end")
                    .attr("dx", BOXWIDTH - 2);
                tokenContainer.on("mouseover", function (d, index) {
                    config.index = index;
                    highlightSelection(svg, index);
                    showComputation(svg, index);
                });
                tokenContainer.on("mouseleave", function () {
                    config.index = null;
                    unhighlightSelection(svg);
                    hideComputation(svg)
                });

                if (expanded) {
                    tokenContainer.append('path')
                        .attr("d", "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zM124 296c-6.6 0-12-5.4-12-12v-56c0-6.6 5.4-12 12-12h264c6.6 0 12 5.4 12 12v56c0 6.6-5.4 12-12 12H124z")
                        .classed("minus-sign", true)
                        .attr("fill", getColor('icon'))
                        .style('font-size', "17px")
                        .style('font-weight', 900)
                        .style('opacity', 0)
                        .attr("dy", 17)
                        .attr("transform", function (d, i) {
                            var x = leftPos + 5;
                            var y = i * BOXHEIGHT + HEADING_HEIGHT + 4;
                            return "translate(" + x + " " + y + ")" +
                                "scale(0.03 0.03) "
                        });
                    tokenContainer.append('rect')
                        .attr("x", leftPos + 5)
                        .attr("y", function (d, i) {
                            return i * BOXHEIGHT + HEADING_HEIGHT + 4;
                        })
                        .style('opacity', 0)
                        .attr("dy", 17)
                        .attr("height", 16)
                        .attr("width", 16)
                        .on("click", function (d, i) {
                            config.expanded = false;
                            showCollapsed();
                        })
                        .on("mouseover", function (d, i) {
                            d3.select(this).style("cursor", "pointer");
                        })
                        .on("mouseout", function (d, i) {
                            d3.select(this).style("cursor", "default");
                        })

                } else {
                    tokenContainer.append('path')
                        .attr("d", "M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm144 276c0 6.6-5.4 12-12 12h-92v92c0 6.6-5.4 12-12 12h-56c-6.6 0-12-5.4-12-12v-92h-92c-6.6 0-12-5.4-12-12v-56c0-6.6 5.4-12 12-12h92v-92c0-6.6 5.4-12 12-12h56c6.6 0 12 5.4 12 12v92h92c6.6 0 12 5.4 12 12v56z")
                        .classed("plus-sign", true)
                        .attr("fill", getColor('icon'))
                        .style('font-size', "17px")
                        .style('font-weight', 900)
                        .style('opacity', 0)
                        .attr("dy", 17)
                        .attr("transform", function (d, i) {
                            var x = leftPos + 5;
                            var y = i * BOXHEIGHT + HEADING_HEIGHT + 4;
                            return "translate(" + x + " " + y + ")" +
                                "scale(0.03 0.03) "
                        });
                    tokenContainer.append('rect')
                        .attr("x", leftPos + 5)
                        .attr("y", function (d, i) {
                            return i * BOXHEIGHT + HEADING_HEIGHT + 4;
                        })
                        .style('opacity', 0)
                        .attr("dy", 17)
                        .attr("height", 16)
                        .attr("width", 16)
                        .on("click", function (d, i) {
                            config.expanded = true;
                            showExpanded();
                        })
                        .on("mouseover", function (d, i) {
                            d3.select(this).style("cursor", "pointer");
                        })
                        .on("mouseout", function (d, i) {
                            d3.select(this).style("cursor", "default");
                        })
                }
            }
        }

        function updateTextAttention(svg, attn) {
            var container = svg.select('#rightText');
            container.selectAll(".highlight")
                .data(attn)
                .style("opacity", function (d) {
                    return d;
                })
        }

        function renderDotProducts(svg, dotProducts, leftPos) {
            svg.append("svg:g")
                .attr("id", "dotproducts")
                .style("opacity", 0)
                .selectAll("rect")
                .data(dotProducts)
                .enter()
                .append("rect")
                .classed('dotproduct', true)
                .attr("x", leftPos + 1)
                .attr("y", function (d, i) {
                    return i * BOXHEIGHT + HEADING_HEIGHT;
                })
                .attr("height", BOXHEIGHT - 4)
                .attr("width", BOXHEIGHT - 4)
                .style("stroke-width", 1.2)
                .style("stroke", getColor('vector_border'))
                .style("stroke-opacity", 1)
                .style("fill-opacity", 0)
                .attr("rx", 2)
                .attr("ry", 2)
        }

        function updateDotProducts(svg, dotProducts) {
            var vectorContainer = svg.select('#dotproducts').style("opacity", 1);
            vectorContainer.selectAll(".dotproduct")
                .data(dotProducts)
                .style("fill", function (d) {
                    if (d >= 0) {
                        return getColor('pos');
                    } else {
                        return getColor('neg');
                    }
                })
                .style("fill-opacity", function (d) {
                    return Math.tanh(Math.abs(d) / 4);
                })
                .style("stroke", function (d) {
                    if (d >= 0) {
                        return getColor('pos');
                    } else {
                        return getColor('neg');
                    }
                })
                .style("stroke-opacity", function (d) {
                    // Set border to slightly higher opacity
                    return Math.max(Math.tanh(Math.abs(d) / 2), .35);
                })
                .attr("data-value", function (d) {
                    return d
                })
        }

        function updateSoftmax(svg, softmax) {
            var vectorContainer = svg.select('#softmaxes').style("opacity", 1);
            vectorContainer.selectAll(".softmax")
                .data(softmax)
                .attr("width", function (d) {
                    return Math.max(d * SOFTMAX_WIDTH, 1);
                })
                .attr("data-value", function (d) {
                    return d
                })

        }

        function highlightSelection(svg, index) {
            svg.select("#queries")
                .selectAll(".vector")
                .style("opacity", 1);
            svg.select("#queries")
                .selectAll(".vectorborder")
                .style("stroke", function (d, i) {
                    return i == index ? getColor('connector') : getColor('vector_border');
                })
                .style("stroke-width", function (d, i) {
                    return i == index ? 2 : 1;
                })
            ;
            svg.select("#queries")
                .select(".matrixborder")
                .style("stroke-opacity", 0);
            svg.select("#leftText")
                .selectAll(".highlight")
                .style("opacity", function (d, i) {
                    return i == index ? 1.0 : 0.0;
                });
            svg.select("#leftText")
                .selectAll(".token")
                .style("fill", function (d, i) {
                    return i == index ? getColor('selected_text') : getColor('text');
                });
            if (config.expanded) {
                svg.select("#leftText")
                    .selectAll(".minus-sign")
                    .style("opacity", function (d, i) {
                        return i == index ? 1.0 : 0.0;
                    })
            } else {
                svg.select("#leftText")
                    .selectAll(".plus-sign")
                    .style("opacity", function (d, i) {
                        return i == index ? 1.0 : 0.0;
                    })
            }
            svg.selectAll(".i-index")
                .text(index);
            svg.selectAll(".attn-line-group")
                .style("opacity", function (d, i) {
                    return i == index ? 1.0 : 0.0;
                });
            svg.selectAll(".qk-line-group")
                .style("opacity", function (d, i) {
                    return i == index ? 1.0 : 0.0;
                });
            if (config.bidirectional) {
                svg.select("#keys")
                    .selectAll(".vectorborder")
                    .style("stroke-opacity", 1);
            } else {
                svg.select("#product")
                    .selectAll(".vector")
                    .style("opacity", function (d, i) {
                        return i <= index ? 1.0 : 0.0;
                    });
                svg.select("#dotproducts")
                    .selectAll("rect")
                    .style("opacity", function (d, i) {
                        return i <= index ? 1.0 : 0.0;
                    });
            }
            svg.select('#hlines1')
                .selectAll(".horiz-line-group")
                .style("opacity", function (d, i) {
                    return i == index ? 1.0 : 0.0;
                });
            svg.select('#hlines2')
                .selectAll(".horiz-line-group")
                .style("opacity", function (d, i) {
                    return i == index ? 1.0 : 0.0;
                });
            svg.select('#hlines3')
                .selectAll(".horiz-line-group")
                .style("opacity", function (d, i) {
                    return i == index ? 1.0 : 0.0;
                });
            svg.select('#key-vector-highlights')
                .selectAll(".vector-highlight-group")
                .style("opacity", function (d, i) {
                    return i == index ? 1.0 : 0.0;
                });
            svg.select('#product-vector-highlights')
                .selectAll(".vector-highlight-group")
                .style("opacity", function (d, i) {
                    return i == index ? 1.0 : 0.0;
                });
            svg.selectAll(".text-query-line")
                .style("opacity", function (d, i) {
                    return i == index ? 1.0 : 0.0;
                })
        }

        function unhighlightSelection(svg) {
            svg.select("#queries")
                .selectAll(".vector")
                .style("opacity", 1.0);
            svg.select("#queries")
                .selectAll(".vectorborder")
                .style("stroke", getColor('vector_border'))
                .style("stroke-width", 1);
            svg.select("#queries")
                .select(".matrixborder")
                .style("stroke-opacity", 1);
            svg.select("#leftText")
                .selectAll(".highlight")
                .style("opacity", 0.0);
            svg.select("#leftText")
                .selectAll(".token")
                .style("fill", getColor('text'));
            svg.select("#leftText")
                .selectAll(".minus-sign")
                .style("opacity", 0);
            svg.select("#leftText")
                .selectAll(".plus-sign")
                .style("opacity", 0);
            svg.selectAll(".i-index")
                .text("i");
            if (!config.expanded) {
                svg.selectAll(".attn-line-group")
                    .style("opacity", 1)
            }
            svg.selectAll(".qk-line-group")
                .style("opacity", 0);
            svg.selectAll(".horiz-line-group")
                .style("opacity", 0);
            svg.selectAll(".vector-highlight-group")
                .style("opacity", 0);
            svg.selectAll(".text-query-line")
                .style("opacity", 0);

            if (!config.bidirectional) {
                svg.select("#keys")
                    .selectAll(".vector")
                    .style("opacity", 1);
                svg.select("#right_text")
                    .selectAll("text")
                    .style("opacity", 1);
            }
        }

        function showComputation(svg, query_index) {
            var attnData = config.attention[config.filter];
            var query_vector = attnData.queries[config.layer][config.head][query_index];
            var keys = attnData.keys[config.layer][config.head];
            var att = attnData.attn[config.layer][config.head][query_index];

            var seq_len = keys.length;
            var productVectors = [];
            var dotProducts = [];
            for (var i = 0; i < seq_len; i++) {
                var key_vector = keys[i];
                var productVector = [];
                var dotProduct = 0;
                for (var j = 0; j < config.vectorSize; j++) {
                    var product = query_vector[j] * key_vector[j];
                    productVector.push(product); // Normalize to be on similar scale as query/key
                    dotProduct += product;
                }
                productVectors.push(productVector);
                var scaledDotProduct = dotProduct / Math.sqrt(config.vectorSize)
                dotProducts.push(scaledDotProduct);
            }
            updateVectors(svg, 'product', productVectors);
            updateDotProducts(svg, dotProducts);
            updateSoftmax(svg, att);
            updateTextAttention(svg, att);
            svg.select("#placeholder").style("opacity", 0);

        }

        function hideComputation(svg) {
            svg.select("#product").style("opacity", 0);
            svg.select("#dotproducts").style("opacity", 0);
            svg.select("#softmaxes").style("opacity", 0);
            svg.select('#rightText').selectAll("rect").style("opacity", 0);
            svg.select("#placeholder").style("opacity", 1);
        }

        function updateVectors(svg, id, data) {
            var vectorContainer = svg.select('#' + id).style("opacity", 1);
            var vectors = vectorContainer.selectAll(".vector");
            vectors
                .data(data)
                .selectAll(".element") // loop over elements rects within each vector
                .data(function (d) {
                    return d;
                }) // Bind them to array of elements from parent array
                .style("fill", function (d) {

                    if (d >= 0) {
                        return getColor('pos');
                    } else {
                        return getColor('neg');
                    }
                })
                .attr("data-value", function (d) {
                    return d
                })
                .style("opacity", function (d) {
                    return Math.tanh(Math.abs(d) / 4);
                });
        }

        function showCollapsed() {
            if (config.index != null) {
                var svg = d3.select(`#${config.rootDivId} #vis`);
                highlightSelection(svg, config.index);
            }
            d3.select(`#${config.rootDivId} #expanded`).attr("visibility", "hidden");
            d3.select(`#${config.rootDivId} #collapsed`).attr("visibility", "visible");
        }

        function showExpanded() {
            if (config.index != null) {
                var svg = d3.select("#vis");
                highlightSelection(svg, config.index);
                showComputation(svg, config.index);
            }
            d3.select(`#${config.rootDivId} #expanded`).attr("visibility", "visible");
            d3.select(`#${config.rootDivId} #collapsed`).attr("visibility", "hidden")
        }

        function getColor(name) {
            return PALETTE[config.mode][name]
        }

        function initialize() {
            config.attention = params['attention'];
            config.filter = params['default_filter'];
            var attentionFilter = config.attention[config.filter];
            config.nLayers = attentionFilter['attn'].length;
            config.nHeads = attentionFilter['attn'][0].length;
            config.vectorSize = attentionFilter['queries'][0][0][0].length; // Layer 0, head 0, position 0 length
            config.headVis = new Array(config.nHeads).fill(true);
            config.initialTextLength = attentionFilter.right_text.length;
            config.expanded = false;
            config.bidirectional = params['bidirectional'];
            config.mode = params['display_mode'];
            config.layer = (params['layer'] == null ? 0 : params['layer'])
            config.head = (params['head'] == null ? 0 : params['head'])
            config.rootDivId = params['root_div_id'];

            const layerSelect = $(`#${config.rootDivId} #layer`);
            layerSelect.empty();
            for (var i = 0; i < config.nLayers; i++) {
                layerSelect.append($("<option />").val(i).text(i));
            }
            layerSelect.val(config.layer).change();
            layerSelect.on('change', function (e) {
                config.layer = +e.currentTarget.value;
                render();
            });

            const headSelect = $(`#${config.rootDivId} #att_head`);
            headSelect.empty();
            for (var i = 0; i < config.nHeads; i++) {
                headSelect.append($("<option />").val(i).text(i));
            }
            headSelect.val(config.head).change();
            headSelect.on('change', function (e) {
                config.head = +e.currentTarget.value;
                render();
            });

            $(`#${config.rootDivId} #filter`).on('change', function (e) {
                config.filter = e.currentTarget.value;
                render();
            });
        }

        render();

    });
