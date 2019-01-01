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
    const ATTENTION_WIDTH = 175;

    function renderVisCollapsed(svg, left_text, right_text) {

      var posLeftText = 0;
      var posAttention = posLeftText + BOXWIDTH;
      var posRightText = posAttention + ATTENTION_WIDTH + PADDING_WIDTH;
      var width = posRightText + BOXWIDTH

      // var svg = d3.select(id)
      //   .append('svg')
      //   .attr("id", "collapsed")
      //   .attr("width", width)
      //   .attr("height", HEIGHT)
      //   .attr("visibility", "hidden");

      svg = svg.append("g")
        .attr("id", "collapsed")
        .attr("visibility", "hidden")

      renderHeadingsCollapsed(svg, posAttention)
      renderText(svg, left_text, "left_text", posLeftText, false);
      renderAttn(svg, posAttention, posRightText, false)
      renderText(svg, right_text, "right_text", posRightText, false);
    }


    function renderVisExpanded(svg, left_text, right_text, queries, keys) {

      var posLeftText = 0;
      var posQueries = posLeftText + BOXWIDTH + PADDING_WIDTH;
      var posKeys = posQueries + MATRIX_WIDTH + PADDING_WIDTH;
      var posProduct = posKeys + MATRIX_WIDTH + PADDING_WIDTH;
      var posDotProduct = posProduct + MATRIX_WIDTH + PADDING_WIDTH;
      var posSoftMax = posDotProduct + DOT_WIDTH + PADDING_WIDTH;
      var posRightText = posSoftMax + SOFTMAX_WIDTH + PADDING_WIDTH;
      var width = posRightText + BOXWIDTH

      svg = svg.append("g")
        .attr("id", "expanded")
        .attr("visibility", "hidden")

      renderHeadingsExpanded(svg, posQueries, posKeys, posProduct, posDotProduct, posSoftMax)
      renderText(svg, left_text, "left_text", posLeftText, true);
     // renderAttn(svg, posLeftText + BOXWIDTH, posRightText, true);
      renderVectors(svg, "keys", keys, posKeys);
      renderVectors(svg, "queries", queries, posQueries);
      renderVectors(svg, "product", keys, posProduct);
      var dotProducts = new Array(right_text.length).fill(0);
      renderDotProducts(svg, dotProducts, posDotProduct);
      var softMax = new Array(right_text.length).fill(0);
      renderSoftmax(svg, softMax, posSoftMax);
      renderText(svg, right_text, "right_text", posRightText, true);

    }

    function renderHeadingsCollapsed(svg, posAttn) {
      var headingContainer = svg.append("svg:g")
        .attr("id", "heading");

      // Add expand icon
      headingContainer.append('text')
        .classed("plus-sign", true)
        .attr("x", posAttn - 20)
        .attr("y", HEADING_HEIGHT - 5)
        .attr("fill", "#909090")
        .style('font-family', 'FontAwesome')
        .style('font-size', "17px")
        .style('opacity', 0)
        .text(function (d) {
          return '\uf055';
        })
        .on("click", function (d, i) {
          config.expanded = true;
          render();
        })
        .on("mouseover", function (d, i) {
          d3.select(this).style("cursor", "pointer");
        })
        .on("mouseout", function (d, i) {
          d3.select(this).style("cursor", "default");
        })
    }

    function renderHeadingsExpanded(svg, posQueries, posKeys, posProduct, posDotProduct, posSoftmax) {
      var headingContainer = svg.append("svg:g")
        .attr("id", "heading");

      // Add expand icon
      headingContainer.append('text')
        .classed("minus-sign", true)
        .attr("x", posQueries - 20)
        .attr("y", HEADING_HEIGHT - 5)
        .attr("fill", "#909090")
        .style('font-family', 'FontAwesome')
        .style('font-size', "17px")
        .style('opacity', 0)
        .text(function (d) {
          return '\uf056';
        })
        .on("click", function (d, i) {
          config.expanded = false;
          render();
        })
        .on("mouseover", function (d, i) {
          d3.select(this).style("cursor", "pointer");
        })
        .on("mouseout", function (d, i) {
          d3.select(this).style("cursor", "default");
        })


      var queryHeadingContainer = headingContainer.append("text")
        .attr("x", 185)
        .attr("y", HEADING_HEIGHT - 10)
        .attr("height", BOXHEIGHT)
        .attr("width", MATRIX_WIDTH)
        .attr("font-size", TEXT_SIZE + "px")

      queryHeadingContainer.append('tspan')
        .text('Query (q')
        .style('font-size', TEXT_SIZE + "px")
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
        .attr("y", HEADING_HEIGHT - 10)

      var keyHeadingContainer = headingContainer.append("text")
        .attr("x", 385)
        .attr("y", HEADING_HEIGHT - 10)
        .attr("height", BOXHEIGHT)
        .attr("width", MATRIX_WIDTH)
        .attr("font-size", TEXT_SIZE + "px")

      keyHeadingContainer.append('tspan')
        .text('Key (k')
        .style('font-size', TEXT_SIZE + "px")
        .attr("y", HEADING_HEIGHT - 10)

      keyHeadingContainer.append('tspan')
        .text('j')
        .style('font-size', Math.floor(TEXT_SIZE / 1.4) + "px")
        .attr("y", HEADING_HEIGHT - 8)
        .attr('dx', '1px')

      keyHeadingContainer.append('tspan')
        .text(')')
        .style('font-size', TEXT_SIZE + "px")
        .attr("y", HEADING_HEIGHT - 10)

      var productHeadingContainer = headingContainer.append("text")
        .attr("x", 580)
        .attr("y", HEADING_HEIGHT - 10)
        .attr("height", BOXHEIGHT)
        .attr("width", MATRIX_WIDTH)
        .attr("font-size", TEXT_SIZE + "px")

      productHeadingContainer.append('tspan')
        .text('q')
        .style('font-size', TEXT_SIZE + "px")
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
        .attr("y", HEADING_HEIGHT - 10)

      productHeadingContainer.append('tspan')
        .text('j')
        .style('font-size', Math.floor(TEXT_SIZE / 1.4) + "px")
        .attr("y", HEADING_HEIGHT - 8)
        .attr('dx', '1px')

      var dotProductHeadingContainer = headingContainer.append("text")
        .attr("x", 714)
        .attr("y", HEADING_HEIGHT - 10)
        .attr("height", BOXHEIGHT)
        .attr("width", MATRIX_WIDTH)
        .attr("font-size", TEXT_SIZE + "px")

      dotProductHeadingContainer.append('tspan')
        .text('q')
        .style('font-size', TEXT_SIZE + "px")
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
        .attr("y", HEADING_HEIGHT - 10)

      dotProductHeadingContainer.append('tspan')
        .text('j')
        .style('font-size', Math.floor(TEXT_SIZE / 1.4) + "px")
        .attr("y", HEADING_HEIGHT - 8)
        .attr('dx', '1px')

      headingContainer.append("text")
        .attr("x", posSoftmax)
        .attr("y", HEADING_HEIGHT - 10)
        .attr("height", BOXHEIGHT)
        .attr("width", SOFTMAX_WIDTH)
        .attr("font-size", TEXT_SIZE + "px")
        .style("text-anchor", "start")
        .text("Softmax")

      headingContainer.append("text")
        .attr("id", "placeholder")
        .attr("x", posSoftmax + SOFTMAX_WIDTH - (SOFTMAX_WIDTH + MATRIX_WIDTH + DOT_WIDTH) / 2)
        .attr("y", HEADING_HEIGHT + 55)
        .attr("height", BOXHEIGHT)
        .attr("width", SOFTMAX_WIDTH + MATRIX_WIDTH + DOT_WIDTH)
        .attr("font-size", 23 + "px")
        .style("text-anchor", "middle")
        .text("No token selected")
        .attr("fill", "darkgray")

    }

    function renderAttn(svg, start_pos, end_pos, expanded) {

      var attnMatrix = config.attention[config.att_type].att[config.layer][config.att_head];
      console.log('attn matrix')
      console.log(attnMatrix)
      var attnContainer = svg.append("svg:g")
        .attr("id", "attn");
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
        .attr("stroke", "blue")
        .attr("stroke-opacity", function (d) {
          if (expanded) {
            return d;
          } else {
            return d;
          }
        });
      // if (do_fade) {
      //   attnContainer.transition().duration(500).style("opacity", 0)
      // }
    }

    function renderVectors(svg, id, vectors, left_pos, fadeIn) {
      // text: list of tokens
      // queries: query vectors [seq_len, vector_size]

      // Create vectorContainer of type svg:g ad w/id left or right
      var vectorContainer = svg.append("svg:g")
        .attr("id", id);

      if (id == "product") {
        vectorContainer.style("opacity", 0);
      }

      vectorContainer.append("rect")
        .classed("matrixborder", true)
        .attr("x", left_pos - 2)
        .attr("y", HEADING_HEIGHT)
        .attr("width", MATRIX_WIDTH + 4)
        .attr("height", BOXHEIGHT * vectors.length - 2)
        .style("fill-opacity", 0)
        .style("stroke-width", 2)
        .style("stroke", "#b3aaaa")
        .attr("rx", 2)
        .attr("ry", 2)

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

      vector.selectAll(".element")
        .data(function (d) {
          return d;
        }) // loop over elements within each query vector
        .enter() // When entering
        .append("rect") // Add rect element for each token index (j), vector index (i)
        .classed('element', true)
        .attr("x", function (d, i) { // i is vector index, j is index of token
          return left_pos + i * MATRIX_WIDTH / config.vector_size;
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

      // if (fadeIn) {
      //   vectorContainer.style("opacity", 0).transition().delay(100).duration(500).style("opacity", 1);
      // }
    }

    function renderText(svg, text, id, left_pos, expanded) {

      var tokenContainer = svg.append("svg:g")
        .attr("id", id)
        .selectAll("g")
        .data(text)
        .enter()
        .append("g");
      if (id == "left_text" || id == "right_text") {
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

      var offset;
      if (id == "left_text") {
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

        // if (config.expanded == true) {
        if (expanded) {
          tokenContainer.append('text')
            .classed("minus-sign", true)
            .attr("x", left_pos + 4)
            .attr("y", function (d, i) {
              return i * BOXHEIGHT + HEADING_HEIGHT;
            })
            .attr("fill", "#909090")
            .style('font-family', 'FontAwesome')
            .style('font-size', "17px")
            .style('opacity', 0)
            .attr("dy", 17)
            .text(function (d) {
              return '\uf056';
            })
            .on("click", function (d, i) {
              config.expanded = false;
              console.log("clicked on minus sign")
              showCollapsed();
            })
            .on("mouseover", function (d, i) {
              d3.select(this).style("cursor", "pointer");
            })
            .on("mouseout", function (d, i) {
              d3.select(this).style("cursor", "default");
            })
        } else {
          tokenContainer.append('text')
            .classed("plus-sign", true)
            .attr("x", left_pos + 4)
            .attr("y", function (d, i) {
              return i * BOXHEIGHT + HEADING_HEIGHT;
            })
            .attr("fill", "#909090")
            .style('font-family', 'FontAwesome')
            .style('font-size', "17px")
            .style('opacity', 0)
            .attr("dy", 17)
            .text(function (d) {
              return '\uf055';
            })
            .on("click", function (d, i) {
              console.log("clicked on plus sign")
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
            return "blue"
          } else {
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
        .style("fill", "#8d8d8d")
        .style("stroke", "black")
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
      svg.select("#left_text")
        .selectAll(".highlight")
        .style("opacity", function (d, i) {
          return i == index ? 1.0 : 0.0;
        })
      if (config.expanded) {
        svg.select("#left_text")
          .selectAll(".minus-sign")
          .style("opacity", function (d, i) {
            return i == index ? 1.0 : 0.0;
          })
      } else {
        svg.select("#left_text")
          .selectAll(".plus-sign")
          .style("opacity", function (d, i) {
            return i == index ? 1.0 : 0.0;
          })
      }

      svg.selectAll(".i-index")
        .text(index)
      svg.selectAll(".attn-line-group")
        .style("opacity", function (d, i) {
          return i == index ? 1.0 : 0.0;
        })
    }

    function unhighlightSelection(svg) {
      svg.select("#queries")
        .selectAll(".vector")
        .style("opacity", 1.0)
      svg.select("#queries")
        .selectAll(".vectorborder")
        .style("stroke-opacity", 0)
      svg.select("#queries")
        .select(".matrixborder")
        .style("stroke-opacity", 1)
      svg.select("#left_text")
        .selectAll(".highlight")
        .style("opacity", 0.0)
      svg.select("#left_text")
        .selectAll(".minus-sign")
        .style("opacity", 0)
      svg.select("#left_text")
        .selectAll(".plus-sign")
        .style("opacity", 0)
      svg.selectAll(".i-index")
        .text("i")
      if (!config.expanded) {
        svg.selectAll(".attn-line-group")
          .style("opacity", 1)
      }
    }

    function showComputation(svg, query_index) {
      var att_dets = config.attention[config.att_type];
      var query_vector = att_dets.queries[config.layer][config.att_head][query_index];
      var keys = att_dets.keys[config.layer][config.att_head];
      var att = att_dets.att[config.layer][config.att_head][query_index];

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
      config.vector_size = attention['all']['queries'][0][0][0].length // Layer 0, head 0, position 0 length
      config.attention = attention;
      config.expanded = true;
      render();
    }

    function showCollapsed() {
      d3.select("#expanded").attr("visibility", "hidden")
      d3.select("#collapsed").attr("visibility", "visible")
    }

    function showExpanded() {
      d3.select("#expanded").attr("visibility", "visible")
      d3.select("#collapsed").attr("visibility", "hidden")
    }


    function render() {
      var att_dets = config.attention[config.att_type];
      var left_text = att_dets.left_text;
      var right_text = att_dets.right_text;
      var queries = att_dets.queries[config.layer][config.att_head];
      var keys = att_dets.keys[config.layer][config.att_head];
      var att = att_dets.att[config.layer][config.att_head];
      // $("#vis svg").empty();

      // if (config.expanded == true) {
      //   renderVisExpanded("#vis", left_text, right_text, queries, keys);
      // } else {
      //   renderVisCollapsed("#vis", left_text, right_text, att)
      // }

      $("vis").empty();
      var svg = d3.select("#vis")
        .append('svg')
      .attr("width", WIDTH)
      .attr("height", HEIGHT)
      .attr("visibility", "hidden")

      renderVisExpanded(svg, left_text, right_text, queries, keys);
      renderVisCollapsed(svg, left_text, right_text, att)
      if (config.expanded == true) {
        showExpanded();
      } else {
        showCollapsed();
      }
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