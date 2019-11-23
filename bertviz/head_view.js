/**
 * @fileoverview Transformer Visualization D3 javascript code.
 *
 *
 *  Based on: https://github.com/tensorflow/tensor2tensor/blob/master/tensor2tensor/visualization/attention.js
 *
 * Change log:
 *
 * 12/19/18  Jesse Vig   Assorted cleanup. Changed orientation of attention matrices.
 */

requirejs(['jquery', 'd3'], function($, d3) {

const TEXT_SIZE = 15;
const BOXWIDTH = 110;
const BOXHEIGHT = 22.5;
const MATRIX_WIDTH = 115;
const CHECKBOX_SIZE = 20;
const TEXT_TOP = 30;
const HEAD_COLORS = d3.scale.category10();

var params = window.params;
var config = {};
initialize();

function lighten(color) {
  var c = d3.hsl(color);
  var increment = (1 - c.l) * 0.6;
  c.l += increment;
  c.s -= increment;
  return c;
}

function transpose(mat) {
  return mat[0].map(function(col, i) {
    return mat.map(function(row) {
      return row[i];
    });
  });
}

function zip(a, b) {
  return a.map(function (e, i) {
    return [e, b[i]];
  });
}

function render() {

  var attnData = config.attention[config.filter];
  var leftText = attnData.left_text;
  var rightText = attnData.right_text;
  var attentionHeads = attnData.attn[config.layer];

  $("#vis svg").empty();
  $("#vis").empty();

  var height = config.initialTextLength * BOXHEIGHT + TEXT_TOP;
  var svg = d3.select("#vis")
            .append('svg')
            .attr("width", "100%")
            .attr("height", height + "px");

  var attData = [];
  for (var i=0; i < config.nHeads; i++) {
    var att = attentionHeads[i];
    var att_trans = transpose(att);
    attData.push(zip(att_trans, att));
  }

  renderText(svg, leftText, true, attData, 0);
  renderText(svg, rightText, false, attData, MATRIX_WIDTH + BOXWIDTH);

  renderAttentionHighlights(svg, attData);

  svg.append("g").classed("attentionHeads", true);

  renderAttention(svg, attentionHeads);

  drawCheckboxes(0, svg, attentionHeads);

}

function renderText(svg, text, isLeft, attData, leftPos) {
  // attData: list of tuples (att, att_trans), one for each layer. att and att_trans are attention matrics for each layer.
  //           att is of shape [nHeads, source_len, target_len)
  var id = isLeft ? "left" : "right";
  var textContainer = svg.append("svg:g")
                         .attr("id", id);

  textContainer.append("g").classed("attentionBoxes", true)
               .selectAll("g")
               .data(attData)
               .enter()
               .append("g")
               .selectAll("rect")
               .data(function(d) {return d;})
               .enter()
               .append("rect")
               .attr("x", function(d, i, j) {
                 return leftPos + boxOffsets(j);
               })
               .attr("y", function(d, i) {
                 return (+1) * BOXHEIGHT;
               })
               .attr("width", BOXWIDTH / activeHeads())
               .attr("height", function() { return BOXHEIGHT; })
               .attr("fill", function(d, i, j) {
                  return HEAD_COLORS(j);
                })
               .style("opacity", 0.0);

  var tokenContainer = textContainer.append("g").selectAll("g")
                                    .data(text)
                                    .enter()
                                    .append("g");

  tokenContainer.append("rect")
                .classed("background", true)
                .style("opacity", 0.0)
                .attr("fill", "lightgray")
                .attr("x", leftPos)
                .attr("y", function(d, i) {
                  return TEXT_TOP + i * BOXHEIGHT;
                })
                .attr("width", BOXWIDTH)
                .attr("height", BOXHEIGHT);

  var textEl = tokenContainer.append("text")
                              .text(function(d) { return d; })
                              .attr("font-size", TEXT_SIZE + "px")
                              .style("cursor", "default")
                              .style("-webkit-user-select", "none")
                              .attr("x", leftPos)
                              .attr("y", function(d, i) {
                                return TEXT_TOP + i * BOXHEIGHT;
                              });

  if (isLeft) {
    textEl.style("text-anchor", "end")
           .attr("dx", BOXWIDTH - 0.5 * TEXT_SIZE)
           .attr("dy", TEXT_SIZE);
  } else {
    textEl.style("text-anchor", "start")
           .attr("dx", + 0.5 * TEXT_SIZE)
           .attr("dy", TEXT_SIZE);
  }

  tokenContainer.on("mouseover", function(d, index) {
    textContainer.selectAll(".background")
                 .style("opacity", function(d, i) {
                   return i == index ? 1.0 : 0.0;
                 });

    svg.selectAll(".attentionHeads").style("display", "none");

    svg.selectAll(".lineHeads")  // To get the nesting to work.
       .selectAll(".attLines")
       .attr("stroke-opacity", function(d) {
          return 1.0;
        })
       .attr("y1", function(d, i) {
        if (isLeft) {
          return TEXT_TOP + index * BOXHEIGHT + (BOXHEIGHT/2);
        } else {
          return TEXT_TOP + i * BOXHEIGHT + (BOXHEIGHT/2);
        }
     })
     .attr("x1", BOXWIDTH)
     .attr("y2", function(d, i) {
       if (isLeft) {
          return TEXT_TOP + i * BOXHEIGHT + (BOXHEIGHT/2);
        } else {
          return TEXT_TOP + index * BOXHEIGHT + (BOXHEIGHT/2);
        }
     })
     .attr("x2", BOXWIDTH + MATRIX_WIDTH)
     .attr("stroke-width", 2)
     .attr("stroke", function(d, i, j) {
        return HEAD_COLORS(j);
      })
     .attr("stroke-opacity", function(d, i, j) {
      if (isLeft) {d = d[0];} else {d = d[1];}
      if (config.headVis[j]) {
        if (d) {
          return d[index];
        } else {
          return 0.0;
        }
      } else {
        return 0.0;
      }
     });

    function updateAttentionBoxes() {
      var id = isLeft ? "right" : "left";
      var leftPos = isLeft ? MATRIX_WIDTH + BOXWIDTH : 0;
      svg.select("#" + id)
         .selectAll(".attentionBoxes")
         .selectAll("g")
         .selectAll("rect")
         .attr("x", function(d, i, j) { return leftPos + boxOffsets(j); })
         .attr("y", function(d, i) { return TEXT_TOP + i * BOXHEIGHT; })
         .attr("width", BOXWIDTH/activeHeads())
         .attr("height", function() { return BOXHEIGHT; })
         .style("opacity", function(d, i, j) {
            if (isLeft) {d = d[0];} else {d = d[1];}
            if (config.headVis[j])
              if (d) {
                return d[index];
              } else {
                return 0.0;
              }
            else
              return 0.0;
         });
    }

    updateAttentionBoxes();
  });

  textContainer.on("mouseleave", function() {
    d3.select(this).selectAll(".background")
                   .style("opacity", 0.0);
    svg.selectAll(".attLines").attr("stroke-opacity", 0.0);
    svg.selectAll(".attentionHeads").style("display", "inline");
    svg.selectAll(".attentionBoxes")
       .selectAll("g")
       .selectAll("rect")
       .style("opacity", 0.0);
  });
}

function renderAttentionHighlights(svg, attention) {
  var line_container = svg.append("g");
  line_container.selectAll("g")
                .data(attention)
                .enter()
                .append("g")
                .classed("lineHeads", true)
                .selectAll("line")
                .data(function(d){return d;})
                .enter()
                .append("line").classed("attLines", true);
}

function renderAttention(svg, attentionHeads) {
  var line_container = svg.selectAll(".attentionHeads");
  line_container.html(null);
  for(var h=0; h<attentionHeads.length; h++) {
    for(var s=0; s<attentionHeads[h].length; s++) {
      for(var a=0; a<attentionHeads[h][s].length; a++) {
        line_container.append("line")
        .attr("y1", TEXT_TOP + s * BOXHEIGHT + (BOXHEIGHT/2))
        .attr("x1", BOXWIDTH)
        .attr("y2", TEXT_TOP + a * BOXHEIGHT + (BOXHEIGHT/2))
        .attr("x2", BOXWIDTH + MATRIX_WIDTH)
        .attr("stroke-width", 2)
        .attr("stroke", HEAD_COLORS(h))
        .attr("stroke-opacity", function() {
          if (config.headVis[h]) {
            return attentionHeads[h][s][a]/activeHeads();
          } else {
            return 0.0;
          }
        }());
      }
    }
  }
}

// Checkboxes
function boxOffsets(i) {
  var numHeadsAbove = config.headVis.reduce(
      function(acc, val, cur) {return val && cur < i ? acc + 1: acc;}, 0);
  return numHeadsAbove * (BOXWIDTH / activeHeads());
}

function activeHeads() {
  return config.headVis.reduce(function(acc, val) {
    return val ? acc + 1: acc;
  }, 0);
}

function drawCheckboxes(top, svg, attentionHeads) {
  var checkboxContainer = svg.append("g");
  var checkbox = checkboxContainer.selectAll("rect")
                                  .data(config.headVis)
                                  .enter()
                                  .append("rect")
                                  .attr("fill", function(d, i) {
                                    return HEAD_COLORS(i);
                                  })
                                  .attr("x", function(d, i) {
                                    return i * CHECKBOX_SIZE;
                                  })
                                  .attr("y", top)
                                  .attr("width", CHECKBOX_SIZE)
                                  .attr("height", CHECKBOX_SIZE);

  function updateCheckboxes() {
    checkboxContainer.selectAll("rect")
                              .data(config.headVis)
                              .attr("fill", function(d, i) {
      var headColor = HEAD_COLORS(i);
      var color = d ? headColor : lighten(headColor);
      return color;
    });
  }

  updateCheckboxes();

  checkbox.on("click", function(d, i) {
    if (config.headVis[i] && activeHeads() == 1) return;
    config.headVis[i] = !config.headVis[i];
    updateCheckboxes();
    renderAttention(svg, attentionHeads);
  });

  checkbox.on("dblclick", function(d, i) {
    // If we double click on the only active head then reset
    if (config.headVis[i] && activeHeads() == 1) {
      config.headVis = new Array(config.nHeads).fill(true);
    } else {
      config.headVis = new Array(config.nHeads).fill(false);
      config.headVis[i] = true;
    }
    updateCheckboxes();
    renderAttention(svg, attentionHeads);
  });
}

function initialize() {
  config.attention = params['attention'];
  config.filter = params['default_filter'];
  config.nLayers = config.attention[config.filter]['attn'].length;
  console.log('num layers')
  console.log(config.nLayers)
  config.nHeads = config.attention[config.filter]['attn'][0].length;
  config.headVis  = new Array(config.nHeads).fill(true);
  config.layer = 0;
  config.initialTextLength = config.attention[config.filter].right_text.length;
  console.log('initial text length')
  console.log(config.initialTextLength)
}

$("#layer").empty();
for(var i=0; i<config.nLayers; i++) {
  $("#layer").append($("<option />").val(i).text(i));
}

$("#layer").on('change', function(e) {
  config.layer = +e.currentTarget.value;
  render();
});

$("#filter").on('change', function(e) {
  config.filter = e.currentTarget.value;
  render();
});

render();

});