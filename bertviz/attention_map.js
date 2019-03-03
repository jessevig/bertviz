/**
 * @fileoverview Transformer Visualization D3 javascript code.
 *
 * Based on: https://github.com/tensorflow/tensor2tensor/blob/master/tensor2tensor/visualization/attention.js
 *
 * Change log:
 *
 * 02/01/19  Jesse Vig   Initial implementation
 */

requirejs(['jquery', 'd3'],
    function ($, d3) {

        var attention = window.attention;

        const MIN_X = 0;
        const MIN_Y = 0;

        const THUMBNAIL_WIDTH = 79;
        const THUMBNAIL_BOX_HEIGHT = 7;
        const THUMBNAIL_ATTENTION_WIDTH = 65;
        const THUMBNAIL_PADDING = 5;

        const DETAIL_WIDTH = 300;
        const DETAIL_ATTENTION_WIDTH = 140;
        const DETAIL_BOX_WIDTH = 80;
        const DETAIL_BOX_HEIGHT = 20;
        const DETAIL_PADDING = 5;
        const DETAIL_HEADING_HEIGHT = 47;
        const DETAIL_HEADING_TEXT_SIZE = 17;
        const TEXT_SIZE = 13;

        const LAYER_COLORS = d3.scaleOrdinal(d3.schemeCategory10);

        function render() {

            // Set global state variables

            var attData = attention[bertmap.attType];
            bertmap.leftText = attData.left_text;
            bertmap.rightText = attData.right_text;
            bertmap.att = attData.att;
            bertmap.numLayers = bertmap.att.length;
            bertmap.numHeads = bertmap.att[0].length;
            bertmap.thumbnailHeight = Math.max(bertmap.leftText.length, bertmap.rightText.length) * THUMBNAIL_BOX_HEIGHT + 2 * THUMBNAIL_PADDING;
            bertmap.detailHeight = Math.max(bertmap.leftText.length, bertmap.rightText.length) * DETAIL_BOX_HEIGHT + 2 * DETAIL_PADDING + DETAIL_HEADING_HEIGHT;
            bertmap.divHeight = bertmap.numLayers * bertmap.thumbnailHeight;
            bertmap.divWidth = bertmap.numHeads * THUMBNAIL_WIDTH;

            $("#vis").empty();
            bertmap.svg = d3.select("#vis")
                .append('svg')
                .attr("width", bertmap.divWidth)
                .attr("height", bertmap.divHeight)
              .attr("fill", "black");

            var i;
            var j;
            for (i = 0; i < bertmap.numLayers; i++) {
                for (j = 0; j < bertmap.numHeads; j++) {
                    renderThumbnail(i, j);
                }
            }
        }

        function renderThumbnail(layerIndex, headIndex) {
            var x = headIndex * THUMBNAIL_WIDTH;
            var y = layerIndex * bertmap.thumbnailHeight;
            renderThumbnailAttn(x, y, bertmap.att[layerIndex][headIndex], layerIndex, headIndex);
        }

        function renderDetail(att, layerIndex, headIndex) {
            var xOffset = 64;
            var maxX = bertmap.divWidth;
            var maxY = bertmap.divHeight;
            var x = headIndex * THUMBNAIL_WIDTH + THUMBNAIL_PADDING + xOffset;
            if (x < MIN_X) {
                x = MIN_X;
            } else if (x + DETAIL_WIDTH > maxX) {
                x = headIndex * THUMBNAIL_WIDTH + THUMBNAIL_PADDING - DETAIL_WIDTH + 8;
            }
            var posLeftText = x;
            var posAttention = posLeftText + DETAIL_BOX_WIDTH;
            var posRightText = posAttention + DETAIL_ATTENTION_WIDTH;
            var thumbnailHeight = Math.max(bertmap.leftText.length, bertmap.rightText.length) * THUMBNAIL_BOX_HEIGHT + 2 * THUMBNAIL_PADDING;
            var yOffset = 20;
            var y = layerIndex * thumbnailHeight + THUMBNAIL_PADDING + yOffset;
            if (y < MIN_Y) {
                y = MIN_Y;
            } else if (y + bertmap.detailHeight > maxY) {
                y = maxY - bertmap.detailHeight;
            }
            renderDetailFrame(x, y, layerIndex);
            renderDetailHeading(x, y, layerIndex, headIndex);
            renderText(bertmap.leftText, "leftText", posLeftText, y + DETAIL_HEADING_HEIGHT, layerIndex);
            renderDetailAttn(posAttention, y + DETAIL_HEADING_HEIGHT, att, layerIndex, headIndex);
            renderText(bertmap.rightText, "rightText", posRightText, y + DETAIL_HEADING_HEIGHT, layerIndex);
        }

        function renderDetailHeading(x, y, layerIndex, headIndex) {
            var fillColor = LAYER_COLORS(layerIndex % 10);
            bertmap.svg.append("text")
                .classed("detail", true)
                .text('Layer ' + layerIndex + ", Head " + headIndex)
                .attr("font-size", DETAIL_HEADING_TEXT_SIZE + "px")
                .style("cursor", "default")
                .style("-webkit-user-select", "none")
                .attr("fill", fillColor)
                .attr("x", x + 88)
                .attr("y", y + 16)
                .attr("height", DETAIL_HEADING_HEIGHT)
                .attr("width", DETAIL_WIDTH)
                .attr("dy", DETAIL_HEADING_TEXT_SIZE);
        }

        function renderText(text, id, x, y, layerIndex) {
            var tokenContainer = bertmap.svg.append("svg:g")
                .classed("detail", true)
                .selectAll("g")
                .data(text)
                .enter()
                .append("g");

            var fillColor = LAYER_COLORS(layerIndex % 10);

            tokenContainer.append("rect")
                .classed("highlight", true)
                .attr("fill", fillColor)
                .style("opacity", 0.0)
                .attr("height", DETAIL_BOX_HEIGHT)
                .attr("width", DETAIL_BOX_WIDTH)
                .attr("x", x)
                .attr("y", function (d, i) {
                    return y + i * DETAIL_BOX_HEIGHT - 1;
                });

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

            if (id == "leftText") {
                textContainer.style("text-anchor", "end")
                    .attr("dx", DETAIL_BOX_WIDTH - 2);
                tokenContainer.on("mouseover", function (d, index) {
                    highlightSelection(index);
                });
                tokenContainer.on("mouseleave", function () {
                    unhighlightSelection();
                });
            }
        }

        function highlightSelection(index) {
            bertmap.svg.select("#leftText")
                .selectAll(".highlight")
                .style("opacity", function (d, i) {
                    return i == index ? 1.0 : 0.0;
                });
            bertmap.svg.selectAll(".attn-line-group")
                .style("opacity", function (d, i) {
                    return i == index ? 1.0 : 0.0;
                });
        }

        function unhighlightSelection() {
            bertmap.svg.select("#leftText")
                .selectAll(".highlight")
                .style("opacity", 0.0);
            bertmap.svg.selectAll(".attn-line-group")
                .style("opacity", 1);
        }

        function renderThumbnailAttn(x, y, att, layerIndex, headIndex) {

            var attnContainer = bertmap.svg.append("svg:g");

            var attnBackground = attnContainer.append("rect")
                .attr("id", 'attn_background_' + layerIndex + "_" + headIndex)
                .classed("attn_background", true)
                .attr("x", x)
                .attr("y", y)
                .attr("height", bertmap.thumbnailHeight)
                .attr("width", THUMBNAIL_WIDTH)
                .attr("stroke-width", 2)
                .attr("stroke", LAYER_COLORS(layerIndex % 10))
                .attr("stroke-opacity", 0);
            var x1 = x + THUMBNAIL_PADDING;
            var x2 = x1 + THUMBNAIL_ATTENTION_WIDTH;
            var y1 = y + THUMBNAIL_PADDING;

            attnContainer.selectAll("g")
                .data(att)
                .enter()
                .append("g") // Add group for each source token
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
                .attr("stroke", LAYER_COLORS(layerIndex % 10))
                .attr("stroke-opacity", function (d) {
                    return d;
                });

            var clickRegion = attnContainer.append("rect")
                .attr("x", x)
                .attr("y", y)
                .attr("height", bertmap.thumbnailHeight)
                .attr("width", THUMBNAIL_WIDTH)
                .style("opacity", 0);

            clickRegion.on("click", function (d, index) {
                var attnBackgroundOther = bertmap.svg.selectAll(".attn_background");
                attnBackgroundOther.attr("fill", "black");
                attnBackgroundOther.attr("stroke-opacity", 0);

                bertmap.svg.selectAll(".detail").remove();
                if (bertmap.detail_layer != layerIndex || bertmap.detail_head != headIndex) {
                    renderDetail(att, layerIndex, headIndex);
                    bertmap.detail_layer = layerIndex;
                    bertmap.detail_head = headIndex;
                    attnBackground.attr("fill", "#202020");
                    attnBackground.attr("stroke-opacity", .8);
                } else {
                    bertmap.detail_layer = null;
                    bertmap.detail_head = null;
                    attnBackground.attr("fill", "black");
                    attnBackground.attr("stroke-opacity", 0);
                }
            })

            clickRegion.on("mouseover", function (d) {
                d3.select(this).style("cursor", "pointer");
            });
        }

        function renderDetailFrame(x, y, layerIndex) {
            var detailFrame = bertmap.svg.append("rect")
                .classed("detail", true)
                .attr("x", x)
                .attr("y", y)
                .attr("height", bertmap.detailHeight)
                .attr("width", DETAIL_WIDTH)
                .style("opacity", 1)
                .attr("fill", "white")
                .attr("stroke-width", 2)
                .attr("stroke-opacity", 0.7)
                .attr("stroke", LAYER_COLORS(layerIndex % 10));
        }

        function renderDetailAttn(x, y, att, layerIndex) {
            var attnContainer = bertmap.svg.append("svg:g")
                .classed("detail", true)
                .attr("pointer-events", "none");
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
                .enter()
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
                .attr("stroke-width", 2)
                .attr("stroke", LAYER_COLORS(layerIndex % 10))
                .attr("stroke-opacity", function (d) {
                    return d;
                });
        }

        var bertmap = {
            attType: 'all'
        };

        $("#attType").on('change', function (e) {
            bertmap.attType = e.currentTarget.value;
            render();
        });

        render();

    });