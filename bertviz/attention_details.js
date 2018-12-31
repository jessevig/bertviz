/**
 * @fileoverview Transformer Visualization D3 javascript code.
 *
 * Change log:
 *
 * 12/19/18  Jesse Vig   Assorted cleanup. Changed orientation of attention matrices.
 * 12/22/18  Jesse Vig   Display attention details: query/key vectors
 */

requirejs(['jquery', 'd3'],
  function ($, d3) {

    var attention = window.attention;

    const TEXT_SIZE = 15;
    const MATRIX_WIDTH = 175;
    const BOXWIDTH = TEXT_SIZE * 8;
    const BOXHEIGHT = TEXT_SIZE * 1.5;
    const WIDTH = 3000;
    const HEIGHT = attention.all.right_text.length * BOXHEIGHT * 2 + 100 + 700;
    const PADDING_WIDTH = 20;
    const DOT_WIDTH = 70;
    const SOFTMAX_WIDTH = 70;
    const HEADING_HEIGHT = 40;
    //const HEAD_COLORS = d3.scaleOrdinal(d3.schemeCategory20);
    // const HEAD_COLORS = d3.scaleOrdinal().range(d3.schemeCategory20);

// const CHECKBOX_SIZE = 20;
//     var numeric_colors = d3.scaleSequential(d3.interpolateRdBu);
//     var productContainer = null;

    function renderVis(id, left_text, right_text, queries, keys, att, config) {
      $(id).empty();

      var posLeftText = 0;
      var posQueries = posLeftText + BOXWIDTH + PADDING_WIDTH / 2;
      var posKeys = posQueries + MATRIX_WIDTH + 1 * PADDING_WIDTH;
      var posProduct = posKeys + MATRIX_WIDTH + 1 * PADDING_WIDTH;
      var posDotProduct = posProduct + MATRIX_WIDTH + PADDING_WIDTH;
      var posSoftMax = posDotProduct + DOT_WIDTH+ PADDING_WIDTH;
      var posText = posSoftMax + SOFTMAX_WIDTH + PADDING_WIDTH;
      var width = posText + BOXWIDTH

      var svg = d3.select(id)
        .append('svg')
        .attr("width", width)
        .attr("height", HEIGHT);


      renderHeadings(svg, posQueries, posKeys, posProduct, posDotProduct, posSoftMax)
      renderText(svg, left_text, "left_text", posLeftText);
      renderVectors(svg, "keys", keys, posKeys);
      renderVectors(svg, "queries", queries, posQueries);
      renderVectors(svg, "product", keys, posProduct);
      var dotProducts = new Array(right_text.length).fill(0);
      renderDotProducts(svg, dotProducts, posDotProduct);
      var softMax = new Array(right_text.length).fill(0);
      renderSoftmax(svg, softMax, posSoftMax);
      renderText(svg, right_text, "right_text", posText);
      // renderSeperator(svg, posProduct - PADDING_WIDTH)
    }

    function renderSeperator(svg, left_pos) {
      svg.append("svg:g")
        .append("line")
        .attr("x1", left_pos)
        .attr("x2", left_pos)
        .attr("y1", HEADING_HEIGHT)
        .attr("y2", HEADING_HEIGHT + BOXHEIGHT * config.vector_size)
        .style("stroke-width", 1.5)
        .style("stroke", "lightgray")
    }

    function renderHeadings(svg, posQueries, posKeys, posProduct, posDotProduct, posSoftmax) {
      var headingContainer = svg.append("svg:g")
        .attr("id", "heading");

      var queryHeadingContainer = headingContainer.append("text")
        // .attr("x", posQueries + MATRIX_WIDTH / 2 - TEXT_SIZE * 2)
        .attr("x", 185)
        .attr("y", HEADING_HEIGHT - 10)
        .attr("height", BOXHEIGHT)
        .attr("width", MATRIX_WIDTH)
        .attr("font-size", TEXT_SIZE + "px")
        // .attr("text-anchor", "middle")
        // .html("Query <sub>sub</sub>sub>")
        // .html('Query (Q')

      queryHeadingContainer.append('tspan')
          .text('Query (q')
          .style('font-size', TEXT_SIZE + "px")
          // .attr('dx', '0em')
        .attr("y", HEADING_HEIGHT - 10)

      queryHeadingContainer.append('tspan')
        .classed('i-index', 'true')
          .text('i')
          .style('font-size', Math.floor(TEXT_SIZE / 1.4) + "px")
          .attr("y", HEADING_HEIGHT - 8)
          .attr('dx', '1px')
          .attr('dy', '0px')

      queryHeadingContainer.append('tspan')
          .text(')')
          .style('font-size', TEXT_SIZE + "px")
          // .attr('dx', '0em')
        .attr("y", HEADING_HEIGHT - 10)


          // .attr('dy', '-.6em')

      // headingContainer.append("text")
      //   .attr("x", posQueries + MATRIX_WIDTH / 2)
      //   .attr("y", HEADING_HEIGHT - 10)
      //   .attr("height", BOXHEIGHT)
      //   .attr("width", MATRIX_WIDTH)
      //   .attr("font-size", TEXT_SIZE + "px")
      //   .style("text-anchor", "middle")
      //
      //   // .append('tspan')
        //   .text('Query (Q')
        //   .style('font-size', TEXT_SIZE + "px")
        //   .append('tspan')
        //   .text('i')
        //   .style('font-size', Math.floor(TEXT_SIZE / 2) + "px")
        //   .attr('dx', '.1em')
        //   .attr('dy', '.9em')
        //   .append('tspan')
        //   .text(')')
        //   .style('font-size', TEXT_SIZE + "px")

      var keyHeadingContainer = headingContainer.append("text")
        // .attr("x", posKeys + MATRIX_WIDTH / 2)
        .attr("x", 385)
        .attr("y", HEADING_HEIGHT - 10)
        // .attr("dy", TEXT_SIZE)
        .attr("height", BOXHEIGHT)
        .attr("width", MATRIX_WIDTH)
        .attr("font-size", TEXT_SIZE + "px")
        // .style("text-anchor", "middle")
        // .attr("dy", TEXT_SIZE)
        // .style("font-weight", "bold")
        // .text("Key (K)")

      keyHeadingContainer.append('tspan')
          .text('Key (k')
          .style('font-size', TEXT_SIZE + "px")
          // .attr('dx', '0em')
        .attr("y", HEADING_HEIGHT - 10)

      keyHeadingContainer.append('tspan')
          .text('j')
          .style('font-size', Math.floor(TEXT_SIZE / 1.4) + "px")
          .attr("y", HEADING_HEIGHT - 8)
          .attr('dx', '1px')

      keyHeadingContainer.append('tspan')
          .text(')')
          .style('font-size', TEXT_SIZE + "px")
          // .attr('dx', '0em')
        .attr("y", HEADING_HEIGHT - 10)


      // headingContainer.append("text")
      //   .attr("x", posProduct + MATRIX_WIDTH / 2)
      //   .attr("y", HEADING_HEIGHT - 10)
      //   // .attr("dy", TEXT_SIZE)
      //   .attr("height", BOXHEIGHT)
      //   .attr("width", MATRIX_WIDTH)
      //   .attr("font-size", TEXT_SIZE + "px")
      //   .style("text-anchor", "middle")
      //   // .attr("dy", TEXT_SIZE)
      //   // .style("font-weight", "bold")
      //   //.text("Query \u2218 Key")
      //   .text("Q \u25CB K")



      var productHeadingContainer = headingContainer.append("text")
        // .attr("x", posKeys + MATRIX_WIDTH / 2)
        .attr("x", 580)
        .attr("y", HEADING_HEIGHT - 10)
        // .attr("dy", TEXT_SIZE)
        .attr("height", BOXHEIGHT)
        .attr("width", MATRIX_WIDTH)
        .attr("font-size", TEXT_SIZE + "px")
        // .style("text-anchor", "middle")
        // .attr("dy", TEXT_SIZE)
        // .style("font-weight", "bold")
        // .text("Key (K)")

      productHeadingContainer.append('tspan')
          .text('q')
          .style('font-size', TEXT_SIZE + "px")
          // .attr('dx', '0em')
        .attr("y", HEADING_HEIGHT - 10)

      productHeadingContainer.append('tspan')
        .classed('i-index', 'true')
          .text('i')
          .style('font-size', Math.floor(TEXT_SIZE / 1.4) + "px")
          .attr("y", HEADING_HEIGHT - 8)
          .attr('dx', '1px')

      productHeadingContainer.append('tspan')
          .text(' \u25CB k')
          .style('font-size', TEXT_SIZE + "px")
          // .attr('dx', '0em')
        .attr("y", HEADING_HEIGHT - 10)

      productHeadingContainer.append('tspan')
          .text('j')
          .style('font-size', Math.floor(TEXT_SIZE / 1.4) + "px")
          .attr("y", HEADING_HEIGHT - 8)
          .attr('dx', '1px')



      // headingContainer.append("text")
      //   .attr("x", posDotProduct)
      //   .attr("y", HEADING_HEIGHT - 10)
      //   // .attr("dy", TEXT_SIZE)
      //   .attr("height", BOXHEIGHT)
      //   .attr("width", DOT_WIDTH)
      //   .attr("font-size", TEXT_SIZE + "px")
      //   .style("text-anchor", "start")
      //   // .attr("dy", TEXT_SIZE)
      //   // .style("font-weight", "bold")
      //   // .text("Q \u25CF K")
      //   .text("Q \u2219 K")
      //

      var dotProductHeadingContainer = headingContainer.append("text")
        // .attr("x", posKeys + MATRIX_WIDTH / 2)
        .attr("x", 714)
        .attr("y", HEADING_HEIGHT - 10)
        // .attr("dy", TEXT_SIZE)
        .attr("height", BOXHEIGHT)
        .attr("width", MATRIX_WIDTH)
        .attr("font-size", TEXT_SIZE + "px")
        // .style("text-anchor", "middle")
        // .attr("dy", TEXT_SIZE)
        // .style("font-weight", "bold")
        // .text("Key (K)")

      dotProductHeadingContainer.append('tspan')
          .text('q')
          .style('font-size', TEXT_SIZE + "px")
          // .attr('dx', '0em')
        .attr("y", HEADING_HEIGHT - 10)

      dotProductHeadingContainer.append('tspan')
        .classed('i-index', 'true')
          .text('i')
          .style('font-size', Math.floor(TEXT_SIZE / 1.4) + "px")
          .attr("y", HEADING_HEIGHT - 8)
          .attr('dx', '1px')

      dotProductHeadingContainer.append('tspan')
          .text(' \u2219 k')
          .style('font-size', TEXT_SIZE + "px")
          // .attr('dx', '0em')
        .attr("y", HEADING_HEIGHT - 10)

      dotProductHeadingContainer.append('tspan')
          .text('j')
          .style('font-size', Math.floor(TEXT_SIZE / 1.4) + "px")
          .attr("y", HEADING_HEIGHT - 8)
          .attr('dx', '1px')

      headingContainer.append("text")
        .attr("x", posSoftmax)
        .attr("y", HEADING_HEIGHT - 10)
        // .attr("dy", TEXT_SIZE)
        .attr("height", BOXHEIGHT)
        .attr("width", SOFTMAX_WIDTH)
        .attr("font-size", TEXT_SIZE + "px")
        .style("text-anchor", "start")
        // .attr("dy", TEXT_SIZE)
        // .style("font-weight", "bold")
        .text("Softmax")

      headingContainer.append("text")
        .attr("id", "placeholder")
        .attr("x", posSoftmax + SOFTMAX_WIDTH - (SOFTMAX_WIDTH + MATRIX_WIDTH + DOT_WIDTH)/2)
        .attr("y", HEADING_HEIGHT + 55)
        // .attr("dy", TEXT_SIZE)
        .attr("height", BOXHEIGHT)
        .attr("width", SOFTMAX_WIDTH + MATRIX_WIDTH + DOT_WIDTH)
        .attr("font-size", 23 + "px")
        .style("text-anchor", "middle")
        // .attr("dy", TEXT_SIZE)
        // .style("font-weight", "bold")
        .text("No token selected")
        .attr("fill", "darkgray")
    }

    function renderVectors(svg, id, vectors, left_pos) {
      // text: list of tokens
      // queries: query vectors [seq_len, vector_size]

      // Create vectorContainer of type svg:g ad w/id left or right
      var vectorContainer = svg.append("svg:g")
        .attr("id", id);

      if (id=="product") {
        vectorContainer.style("opacity", 0);
      }
      //config.vector_size = 15;

      // if (id == "keys") {
        vectorContainer.append("rect")
          .classed("matrixborder", true)
          .attr("x", left_pos - 2)
          .attr("y", HEADING_HEIGHT)
          .attr("width", MATRIX_WIDTH + 4)
          .attr("height", BOXHEIGHT * vectors.length - 2)
          .style("fill-opacity", 0)
          // .style("stroke-opacity", 0)
          .style("stroke-width", 2)
          .style("stroke", "#b3aaaa")
          .attr("rx", 2)
          .attr("ry", 2)
      // }


      //       svg.select("#queries")
      //   .selectAll(".vector")
      //   .style("opacity", 1.0)
      // svg.select("#queries")
      //   .selectAll(".vectorborder")



      var vector = vectorContainer.append("g") //.classed("attention_boxes", true) // Add outer group
        .selectAll("g")
        .data(vectors) // Loop over query/key vectors, one for each token
        .enter()
        .append("g") // Add (sub) group for each token
        .classed('vector', true)
        .attr("data-index", function (d, i) {
          return i;
        }) // make parent index available from DOM

      if (id=="queries") {
        vector.append("rect")
          .classed("vectorborder", true)
          .attr("x", left_pos - 2)
          .attr("y", function (d, i) {
            return i * BOXHEIGHT + HEADING_HEIGHT;
          })
          .attr("width", MATRIX_WIDTH)
          .attr("height", BOXHEIGHT - 2)
          .style("fill-opacity", 0)
          .style("stroke-opacity", 0)
          .style("stroke-width", 2)
          .style("stroke", "#b3aaaa")
          .attr("rx", 2)
          .attr("ry", 2)
      }
        // if (id=="queries") {
        //   vector.append("line")
        //     .classed("joinline", true)
        //     .attr("x1", left_pos + MATRIX_WIDTH + PADDING_WIDTH - 2)
        //     .attr("y1", function (d, i) {
        //       return i * BOXHEIGHT + HEADING_HEIGHT + 1;
        //     })
        //     .attr("x2", left_pos + MATRIX_WIDTH + PADDING_WIDTH - 2)
        //     .attr("y2", function (d, i) {
        //       return (i + 1) * BOXHEIGHT + HEADING_HEIGHT - 3;
        //     })
        //     .style("stroke-width", 2)
        //     .style("stroke", "white")
        // }

      // }

      vector.selectAll(".element")
        .data(function (d) {
          return d;
        }) // loop over elements within each query vector
        .enter() // When entering
        .append("rect") // Add rect element for each token index (j), vector index (i)
        .classed('element', true)
        .attr("x", function (d, i) { // i is vector index, j is index of token
          return left_pos + i * MATRIX_WIDTH / config.vector_size;
                  // return left_pos + i * Math.floor(MATRIX_WIDTH / config.vector_size);

        })
        .attr("y", function (d, i) {
          var j = +this.parentNode.getAttribute("data-index");
          return j * BOXHEIGHT + HEADING_HEIGHT;
        })
        .attr("width", MATRIX_WIDTH / config.vector_size)
        .attr("height", BOXHEIGHT - 2)
        .attr("data-value", function (d) {
          return d
        })
        .style("fill", function (d) {
          if (d >= 0) {
            return 'blue';
          } else {
            return 'red'
          }
        })
        .style("opacity", function (d) {
          return Math.tanh(Math.abs(d) / 4);
        })
    }

    function renderText(svg, text, id, left_pos) {

      var tokenContainer = svg.append("svg:g")
        .attr("id", id)
        .selectAll("g")
        .data(text)
        .enter()
        .append("g");
      // var fillColor = HEAD_COLORS(config.att_head);
      if (id=="left_text" || id=="right_text") {
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
          .attr("x", left_pos)
          .attr("y", function (d, i) {
            return i * BOXHEIGHT + HEADING_HEIGHT;
          });
      }
      if (id=="left_text") {
        var plusSign = tokenContainer.append("g").style("opacity", 0.0)
          .classed("plus-sign", true)
        plusSign.append("rect")
          .attr("fill", "#3b3b3b")
          .attr("height", 15)
          .attr("width", 15)
          .attr("x", left_pos + 4.5)
          .attr("y", function (d, i) {
            return i * BOXHEIGHT + HEADING_HEIGHT + 4;
          });
        plusSign.append("rect")
          .attr("fill", "white")
          .attr("height", 4)
          .attr("width", 12)
          .attr("x", left_pos + 5.5)
          .attr("y", function (d, i) {
            return i * BOXHEIGHT + HEADING_HEIGHT + 9.5;
          });
        plusSign.append("rect")
          .attr("fill", "white")
          .attr("height", 12)
          .attr("width", 4)
          .attr("x", left_pos + 9)
          .attr("y", function (d, i) {
            return i * BOXHEIGHT + HEADING_HEIGHT + 6;
          });
      }


      var offset;
      if (id=="left_text") {
        offset = -10;
      } else {
        offset = 10;
      }

      var textContainer = tokenContainer.append("text")
        .classed("token", true)
        .text(function (d) {
          return d;
        })
        .attr("font-size", TEXT_SIZE + "px")
        .style("cursor", "default")
        .style("-webkit-user-select", "none")
        .attr("x", left_pos + offset)
        .attr("y", function (d, i) {
          return i * BOXHEIGHT + HEADING_HEIGHT;
        })
        .attr("height", BOXHEIGHT)
        .attr("width", BOXWIDTH)
        .attr("dy", TEXT_SIZE)
        // .style("fill", "#535354");

      if (id == "left_text") {
        textContainer.style("text-anchor", "end")
          .attr("dx", BOXWIDTH - 2)

        tokenContainer.on("mouseover", function (d, index) {
          highlightSelection(svg, index)
          showComputation(svg, index);
        });
        tokenContainer.on("mouseleave", function () {
          unhighlightSelection(svg)
          hideComputation(svg)
        });
      }
    }

    function updateTextAttention(svg, attn) {
      var container = svg.select('#right_text');
      container.selectAll(".highlight")
        .data(attn)
        .style("opacity", function (d) {
          return d;
        })
    }

    function renderDotProducts(svg, dotProducts, leftPos) {
      svg.append("svg:g")
        .attr("id", "dotproducts")
        .selectAll("rect")
        .data(dotProducts)
        .enter()
        .append("rect")
        .classed('dotproduct', true)
        .attr("x", leftPos)
        .attr("y", function (d, i) {
          return i * BOXHEIGHT + HEADING_HEIGHT;
        })
        .attr("height", BOXHEIGHT - 4)
        .attr("width", 0);
    }

    function updateDotProducts(svg, dotProducts) {
      var unitSize = Math.floor(MATRIX_WIDTH / config.vector_size) // Pixel width of individual element in vector
      var vectorContainer = svg.select('#dotproducts').style("opacity", 1);
      vectorContainer.selectAll(".dotproduct")
        .data(dotProducts)
        .attr("width", function (d) {
          return unitSize * Math.abs(d) / 8.0
        })
        .style("fill", function (d) {
          if (d >= 0) {
            //return '#1a8cff';
            return "blue"
          } else {
            //return '#ff5555'
            return "red"
          }
        })
        .style("stroke", function (d) {
          if (d >= 0) {
            return 'black';
          } else {
            return 'black'
          }
        })
        .attr("data-value", function (d) {
          return d
        })

    }
    function renderSoftmax(svg, softmax, leftPos) {
      svg.append("svg:g")
        .attr("id", "softmaxes")
        .selectAll("rect")
        .data(softmax)
        .enter()
        .append("rect")
        .classed('softmax', true)
        .attr("x", leftPos)
        .attr("y", function (d, i) {
          return i * BOXHEIGHT + HEADING_HEIGHT;
        })
        .attr("height", BOXHEIGHT - 4)
        .attr("width", 0)
        // .style("fill", "#c3c3c3")
        .style("fill", "#8d8d8d")
        .style("stroke", "black")
        // .stroke("stroke-width", 2)
      ;
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
        .style("opacity", function (d, i) {
          return i == index ? 1.0 : 0.4;
        })
      svg.select("#queries")
        .selectAll(".vectorborder")
        .style("stroke-opacity", function (d, i) {
          return i == index ? 1.0 : 0;
        })
      svg.select("#queries")
        .select(".matrixborder")
        .style("stroke-opacity", 0)
      // svg.select("#queries")
      //   .selectAll(".joinline")
      //   .style("stroke-opacity", function (d, i) {
      //     return i == index ? 1.0 : 0;
      //   })
      // svg.select("#keys")
      //   .selectAll(".matrixborder")
      //   .style("stroke-opacity", 1)
      // svg.select("#product")
      //   .selectAll(".matrixborder")
      //   .style("stroke-opacity", 1)
      svg.select("#left_text")
        .selectAll(".highlight")
        .style("opacity", function (d, i) {
          return i == index ? 1.0 : 0.0;
        })
      svg.select("#left_text")
        .selectAll(".plus-sign")
        .style("opacity", function (d, i) {
          return i == index ? 1.0 : 0.0;
        })
      svg.selectAll(".i-index")
        .text(index)

        // .style("font-weight", "bold")

      // .style("stroke-width", 3)
      // .style("stroke", "grey");
    }

    function unhighlightSelection(svg) {
      svg.select("#queries")
        .selectAll(".vector")
        .style("opacity", 1.0)
      svg.select("#queries")
        .selectAll(".vectorborder")
        .style("stroke-opacity", 0)
      // svg.select("queries")
      //   .selectAll(".joinline")
      //   .style("stroke-opacity", 0)
      svg.select("#queries")
        .select(".matrixborder")
        .style("stroke-opacity", 1)
      // svg.select("#keys")
      //   .selectAll(".matrixborder")
      //   .style("stroke-opacity", 0)
      // svg.select("#keys")
      //   .selectAll(".vectorborder")
      //   .style("stroke-opacity", 0)
      svg.select("#left_text")
        .selectAll(".highlight")
        .style("opacity", 0.0)
      svg.select("#left_text")
        .selectAll(".plus-sign")
        .style("opacity", 0)
      svg.selectAll(".i-index")
        .text("i")

        // .style("font-weight", "normal")
      // .style("stroke-width", 0);
    }

    function showComputation(svg, query_index) {
      var att_dets = config.attention[config.att_type];
      var query_vector = att_dets.queries[config.layer][config.att_head][query_index];
      var keys = att_dets.keys[config.layer][config.att_head];
      var att = att_dets.att[config.layer][config.att_head][query_index];

      // JSON.parse(JSON.stringify(keys)); // deep copy, just to initialize array with proper shape

      var seq_len = keys.length;
      var productVectors = []
      var dotProducts = [];
      for (var i = 0; i < seq_len; i++) {
        var key_vector = keys[i];
        var productVector = [];
        var dotProduct = 0;
        for (var j = 0; j < config.vector_size; j++) {
          var product = query_vector[j] * key_vector[j]
          productVector.push(product)
          dotProduct += product;
        }
        productVectors.push(productVector);
        dotProducts.push(dotProduct);
      }
      updateVectors(svg, 'product', productVectors)
      updateDotProducts(svg, dotProducts);
      updateSoftmax(svg, att);
      updateTextAttention(svg, att);
      svg.select("#placeholder").style("opacity", 0);

    }

    function hideComputation(svg) {
      svg.select("#product").style("opacity", 0);
      svg.select("#dotproducts").style("opacity", 0);
      svg.select("#softmaxes").style("opacity", 0);
      svg.select('#right_text').selectAll("rect").style("opacity", 0);
      svg.select("#placeholder").style("opacity", 1);
    }

    function updateVectors(svg, id, data) {
      var vectorContainer = svg.select('#' + id).style("opacity", 1)//.attr("hidden", false);
      var vectors = vectorContainer.selectAll(".vector");
      vectors
        .data(data)
        .selectAll(".element") // loop over elements rects within each vector
        .data(function (d) {
          return d;
        }) // Bind them to array of elements from parent array
        .style("fill", function (d) {
          if (d >= 0) {
            return 'blue';
          } else {
            return 'red'
          }
        })
        .attr("data-value", function (d) {
          return d
        })
        .style("opacity", function (d) {
          return Math.tanh(Math.abs(d) / 4);
        });
    }


    var config = {
      layer: 0,
      att_head: 0,
      att_type: 'all'
    };

    function visualize() {
      var num_heads = attention['all']['queries'][0].length; // Num heads for layer 0 (same as for all layers)
      //config.head_vis  = new Array(num_heads).fill(true);
      //config.num_heads = num_heads;
      config.vector_size = attention['all']['queries'][0][0][0].length // Layer 0, head 0, position 0 length
      config.attention = attention;
      render();
    }

    function render() {
      var att_dets = config.attention[config.att_type];
      var left_text = att_dets.left_text;
      var right_text = att_dets.right_text;
      var queries = att_dets.queries[config.layer][config.att_head];
      var keys = att_dets.keys[config.layer][config.att_head];
      var att = att_dets.att[config.layer][config.att_head];
      $("#vis svg").empty();
      renderVis("#vis", left_text, right_text, queries, keys, att, config);
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

    $("button").on('click', visualize);

    visualize();

  });