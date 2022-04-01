/**
 * @fileoverview Transformer Visualization D3 javascript code.
 *
 *
 *  Based on: https://github.com/tensorflow/tensor2tensor/blob/master/tensor2tensor/visualization/attention.js
 *
 * Change log:
 *
 * 12/19/18  Jesse Vig   Assorted cleanup. Changed orientation of attention matrices.
 * 12/29/20  Jesse Vig   Significant refactor.
 * 12/31/20  Jesse Vig   Support multiple visualizations in single notebook.
 * 02/06/21  Jesse Vig   Move require config from separate jupyter notebook step
 * 05/03/21  Jesse Vig   Adjust height of visualization dynamically
 * 07/25/21  Jesse Vig   Support layer filtering
 * 03/23/22  Daniel SC   Update requirement URLs for d3 and jQuery (source of bug not allowing end result to be displayed on browsers)
 **/

require.config({
  paths: {
      d3: 'https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min',
    jquery: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.0/jquery.min',
  }
});

requirejs(['jquery', 'd3'], function ($, d3) {

    const params = PYTHON_PARAMS; // HACK: PYTHON_PARAMS is a template marker that is replaced by actual params.
    const TEXT_SIZE = 15;
    const BOXWIDTH = 110;
    const BOXHEIGHT = 22.5;
    const MATRIX_WIDTH = 115;
    const CHECKBOX_SIZE = 20;
    const TEXT_TOP = 30;

    console.log("d3 version", d3.version)
    let headColors;
    try {
        headColors = d3.scaleOrdinal(d3.schemeCategory10);
    } catch (err) {
        console.log('Older d3 version')
        headColors = d3.scale.category10();
    }
    let config = {};
    initialize();
    renderVis();

    function initialize() {
        config.attention = params['attention'];
        config.filter = params['default_filter'];
        config.rootDivId = params['root_div_id'];
        config.nLayers = config.attention[config.filter]['attn'].length;
        config.nHeads = config.attention[config.filter]['attn'][0].length;
        config.layers = params['include_layers']

        if (params['heads']) {
            config.headVis = new Array(config.nHeads).fill(false);
            params['heads'].forEach(x => config.headVis[x] = true);
        } else {
            config.headVis = new Array(config.nHeads).fill(true);
        }
        config.initialTextLength = config.attention[config.filter].right_text.length;
        config.layer_seq = (params['layer'] == null ? 0 : config.layers.findIndex(layer => params['layer'] === layer));
        config.layer = config.layers[config.layer_seq]

        let layerEl = $(`#${config.rootDivId} #layer`);
        for (const layer of config.layers) {
            layerEl.append($("<option />").val(layer).text(layer));
        }
        layerEl.val(config.layer).change();
        layerEl.on('change', function (e) {
            config.layer = +e.currentTarget.value;
            config.layer_seq = config.layers.findIndex(layer => config.layer === layer);
            renderVis();
        });

        $(`#${config.rootDivId} #filter`).on('change', function (e) {
            config.filter = e.currentTarget.value;
            renderVis();
        });
    }

    function renderVis() {

        // Load parameters
        const attnData = config.attention[config.filter];
        const leftText = attnData.left_text;
        const rightText = attnData.right_text;

        // Select attention for given layer
        const layerAttention = attnData.attn[config.layer_seq];

        // Clear vis
        $(`#${config.rootDivId} #vis`).empty();

        // Determine size of visualization
        const height = Math.max(leftText.length, rightText.length) * BOXHEIGHT + TEXT_TOP;
        const svg = d3.select(`#${config.rootDivId} #vis`)
            .append('svg')
            .attr("width", "100%")
            .attr("height", height + "px");

        // Display tokens on left and right side of visualization
        renderText(svg, leftText, true, layerAttention, 0);
        renderText(svg, rightText, false, layerAttention, MATRIX_WIDTH + BOXWIDTH);

        // Render attention arcs
        renderAttention(svg, layerAttention);

        // Draw squares at top of visualization, one for each head
        drawCheckboxes(0, svg, layerAttention);
    }

    function renderText(svg, text, isLeft, attention, leftPos) {

        const textContainer = svg.append("svg:g")
            .attr("id", isLeft ? "left" : "right");

        // Add attention highlights superimposed over words
        textContainer.append("g")
            .classed("attentionBoxes", true)
            .selectAll("g")
            .data(attention)
            .enter()
            .append("g")
            .attr("head-index", (d, i) => i)
            .selectAll("rect")
            .data(d => isLeft ? d : transpose(d)) // if right text, transpose attention to get right-to-left weights
            .enter()
            .append("rect")
            .attr("x", function () {
                var headIndex = +this.parentNode.getAttribute("head-index");
                return leftPos + boxOffsets(headIndex);
            })
            .attr("y", (+1) * BOXHEIGHT)
            .attr("width", BOXWIDTH / activeHeads())
            .attr("height", BOXHEIGHT)
            .attr("fill", function () {
                return headColors(+this.parentNode.getAttribute("head-index"))
            })
            .style("opacity", 0.0);

        const tokenContainer = textContainer.append("g").selectAll("g")
            .data(text)
            .enter()
            .append("g");

        // Add gray background that appears when hovering over text
        tokenContainer.append("rect")
            .classed("background", true)
            .style("opacity", 0.0)
            .attr("fill", "lightgray")
            .attr("x", leftPos)
            .attr("y", (d, i) => TEXT_TOP + i * BOXHEIGHT)
            .attr("width", BOXWIDTH)
            .attr("height", BOXHEIGHT);

        // Add token text
        const textEl = tokenContainer.append("text")
            .text(d => d)
            .attr("font-size", TEXT_SIZE + "px")
            .style("cursor", "default")
            .style("-webkit-user-select", "none")
            .attr("x", leftPos)
            .attr("y", (d, i) => TEXT_TOP + i * BOXHEIGHT);

        if (isLeft) {
            textEl.style("text-anchor", "end")
                .attr("dx", BOXWIDTH - 0.5 * TEXT_SIZE)
                .attr("dy", TEXT_SIZE);
        } else {
            textEl.style("text-anchor", "start")
                .attr("dx", +0.5 * TEXT_SIZE)
                .attr("dy", TEXT_SIZE);
        }

        tokenContainer.on("mouseover", function (d, index) {

            // Show gray background for moused-over token
            textContainer.selectAll(".background")
                .style("opacity", (d, i) => i === index ? 1.0 : 0.0)

            // Reset visibility attribute for any previously highlighted attention arcs
            svg.select("#attention")
                .selectAll("line[visibility='visible']")
                .attr("visibility", null)

            // Hide group containing attention arcs
            svg.select("#attention").attr("visibility", "hidden");

            // Set to visible appropriate attention arcs to be highlighted
            if (isLeft) {
                svg.select("#attention").selectAll("line[left-token-index='" + index + "']").attr("visibility", "visible");
            } else {
                svg.select("#attention").selectAll("line[right-token-index='" + index + "']").attr("visibility", "visible");
            }

            // Update color boxes superimposed over tokens
            const id = isLeft ? "right" : "left";
            const leftPos = isLeft ? MATRIX_WIDTH + BOXWIDTH : 0;
            svg.select("#" + id)
                .selectAll(".attentionBoxes")
                .selectAll("g")
                .attr("head-index", (d, i) => i)
                .selectAll("rect")
                .attr("x", function () {
                    const headIndex = +this.parentNode.getAttribute("head-index");
                    return leftPos + boxOffsets(headIndex);
                })
                .attr("y", (d, i) => TEXT_TOP + i * BOXHEIGHT)
                .attr("width", BOXWIDTH / activeHeads())
                .attr("height", BOXHEIGHT)
                .style("opacity", function (d) {
                    const headIndex = +this.parentNode.getAttribute("head-index");
                    if (config.headVis[headIndex])
                        if (d) {
                            return d[index];
                        } else {
                            return 0.0;
                        }
                    else
                        return 0.0;
                });
        });

        textContainer.on("mouseleave", function () {

            // Unhighlight selected token
            d3.select(this).selectAll(".background")
                .style("opacity", 0.0);

            // Reset visibility attributes for previously selected lines
            svg.select("#attention")
                .selectAll("line[visibility='visible']")
                .attr("visibility", null) ;
            svg.select("#attention").attr("visibility", "visible");

            // Reset highlights superimposed over tokens
            svg.selectAll(".attentionBoxes")
                .selectAll("g")
                .selectAll("rect")
                .style("opacity", 0.0);
        });
    }

    function renderAttention(svg, attention) {

        // Remove previous dom elements
        svg.select("#attention").remove();

        // Add new elements
        svg.append("g")
            .attr("id", "attention") // Container for all attention arcs
            .selectAll(".headAttention")
            .data(attention)
            .enter()
            .append("g")
            .classed("headAttention", true) // Group attention arcs by head
            .attr("head-index", (d, i) => i)
            .selectAll(".tokenAttention")
            .data(d => d)
            .enter()
            .append("g")
            .classed("tokenAttention", true) // Group attention arcs by left token
            .attr("left-token-index", (d, i) => i)
            .selectAll("line")
            .data(d => d)
            .enter()
            .append("line")
            .attr("x1", BOXWIDTH)
            .attr("y1", function () {
                const leftTokenIndex = +this.parentNode.getAttribute("left-token-index")
                return TEXT_TOP + leftTokenIndex * BOXHEIGHT + (BOXHEIGHT / 2)
            })
            .attr("x2", BOXWIDTH + MATRIX_WIDTH)
            .attr("y2", (d, rightTokenIndex) => TEXT_TOP + rightTokenIndex * BOXHEIGHT + (BOXHEIGHT / 2))
            .attr("stroke-width", 2)
            .attr("stroke", function () {
                const headIndex = +this.parentNode.parentNode.getAttribute("head-index");
                return headColors(headIndex)
            })
            .attr("left-token-index", function () {
                return +this.parentNode.getAttribute("left-token-index")
            })
            .attr("right-token-index", (d, i) => i)
        ;
        updateAttention(svg)
    }

    function updateAttention(svg) {
        svg.select("#attention")
            .selectAll("line")
            .attr("stroke-opacity", function (d) {
                const headIndex = +this.parentNode.parentNode.getAttribute("head-index");
                // If head is selected
                if (config.headVis[headIndex]) {
                    // Set opacity to attention weight divided by number of active heads
                    return d / activeHeads()
                } else {
                    return 0.0;
                }
            })
    }

    function boxOffsets(i) {
        const numHeadsAbove = config.headVis.reduce(
            function (acc, val, cur) {
                return val && cur < i ? acc + 1 : acc;
            }, 0);
        return numHeadsAbove * (BOXWIDTH / activeHeads());
    }

    function activeHeads() {
        return config.headVis.reduce(function (acc, val) {
            return val ? acc + 1 : acc;
        }, 0);
    }

    function drawCheckboxes(top, svg) {
        const checkboxContainer = svg.append("g");
        const checkbox = checkboxContainer.selectAll("rect")
            .data(config.headVis)
            .enter()
            .append("rect")
            .attr("fill", (d, i) => headColors(i))
            .attr("x", (d, i) => i * CHECKBOX_SIZE)
            .attr("y", top)
            .attr("width", CHECKBOX_SIZE)
            .attr("height", CHECKBOX_SIZE);

        function updateCheckboxes() {
            checkboxContainer.selectAll("rect")
                .data(config.headVis)
                .attr("fill", (d, i) => d ? headColors(i): lighten(headColors(i)));
        }

        updateCheckboxes();

        checkbox.on("click", function (d, i) {
            if (config.headVis[i] && activeHeads() === 1) return;
            config.headVis[i] = !config.headVis[i];
            updateCheckboxes();
            updateAttention(svg);
        });

        checkbox.on("dblclick", function (d, i) {
            // If we double click on the only active head then reset
            if (config.headVis[i] && activeHeads() === 1) {
                config.headVis = new Array(config.nHeads).fill(true);
            } else {
                config.headVis = new Array(config.nHeads).fill(false);
                config.headVis[i] = true;
            }
            updateCheckboxes();
            updateAttention(svg);
        });
    }

    function lighten(color) {
        const c = d3.hsl(color);
        const increment = (1 - c.l) * 0.6;
        c.l += increment;
        c.s -= increment;
        return c;
    }

    function transpose(mat) {
        return mat[0].map(function (col, i) {
            return mat.map(function (row) {
                return row[i];
            });
        });
    }

});