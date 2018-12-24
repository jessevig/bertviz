/**
 * @fileoverview Transformer Visualization D3 javascript code.
 *
 * Change log:
 *
 * 12/19/18  Jesse Vig   Assorted cleanup. Changed orientation of attention matrices.
 * 12/22/18  Jesse Vig   Display attention details: query/key vectors
 */

requirejs(['jquery', 'd3'],
function($, d3) {

var attention = window.attention;

const TEXT_SIZE = 15;
const BOXWIDTH = TEXT_SIZE * 12;
const BOXHEIGHT = TEXT_SIZE * 1.5;
const WIDTH = 2000;
const HEIGHT = attention.all.right_text.length * BOXHEIGHT * 2 + 100 + 700;
const MATRIX_WIDTH = 150;
const vector_colors = d3.scale.category20();
// const CHECKBOX_SIZE = 20;

function lighten(colour) {
  var c = d3.hsl(colour);
  var increment = (1 - c.l) * 0.6;
  c.l += increment;
  c.s -= increment;
  return c;
}

// function transpose(mat) {
//   return mat[0].map(function(col, i) {
//     return mat.map(function(row) {
//       return row[i];
//     });
//   });
// }
//
// function zip(a, b) {
//   return a.map(function (e, i) {
//     return [e, b[i]];
//   });
// }


function renderVis(id, left_text, right_text, queries, keys, config) {
  $(id).empty();
  var svg = d3.select(id)
            .append('svg')
            .attr("width", WIDTH)
            .attr("height", HEIGHT);

  // var att_data = [];
  // var num_heads = attention_heads.length;
  // for (var i=0; i < num_heads; i++) {
  //   var att = attention_heads[i];
  //   var att_trans = transpose(att);
  //   att_data.push(zip(att_trans, att));
  // }

  renderText(svg, left_text, true, queries, keys, 0);
  renderText(svg, right_text, false, queries, keys, MATRIX_WIDTH + BOXWIDTH);

  // renderAttentionHighlights(svg, att_data);
  //
  // svg.append("g").classed("attention_heads", true);
  //
  // renderAttention(svg, attention_heads);

  // draw_checkboxes(config, 0, svg, attention_heads);
}


function renderText(svg, text, is_left, queries, keys, left_pos) {

  // text: list of tokens
  // queries: query vectors [seq_len, vector_size]


  var id = is_left ? "left" : "right";

  var vectors = is_left ? queries : keys; // shape (seq_len, vector_size)

  // Create textContainer of type svg:g ad w/id left or right
  var textContainer = svg.append("svg:g")
                         .attr("id", id);

    // Iterates over att_data
    // First adds attention boxes for each token, with opactity 0

    // Add query/key vectors for each token

  // var vector_size = vectors[0].length

    textContainer.append("g").classed("attention_boxes", true) // Add outer group
               .selectAll("g") // Within group just added
               .data(queries) // Loop over query vectors, one for each token
               .enter()
               .append("g") // Add (sub) group for each token
               .selectAll("rect")
               .data(function(d) {console.log('top level');console.log(d);return d;}) // loop over elements within each query vector
               .enter() // When entering
               .append("rect") // Add rect element for each token index (j), vector index (i)
               .attr("x", function(d, i, j) { // i is vector index, j is index of token
                 console.log('next level, i, j:');
                 console.log(i);
                 console.log(j);
                 console.log(BOXWIDTH)
                 console.log(config.vector_size)
                 console.log(Math.floor(i * BOXWIDTH / config.vector_size))
                 return left_pos + Math.floor(i * BOXWIDTH / config.vector_size);
               })
               .attr("y", function(d, i, j) {
                 // console.log('next level 2');
                 // console.log(d)
                 // console.log(i)
                 return (j+1) * BOXHEIGHT; // What does this do?????
               })
               .attr("width", Math.floor(BOXWIDTH/ config.vector_size))
               .attr("height", function() { return BOXHEIGHT - 2; })
               .attr("fill", function(d, i, j) {
                 // console.log('next level 3');
                 // console.log(d)
                 // console.log(i)
                 // console.log(j)
                  return vector_colors(i); // Fill with vector index color
                })
               .style("opacity", 1.0); // Sets them all as invisible

  // Iterates over text
  // Add second group within textContainer
  // Add group for each token
  var tokenContainer = textContainer.append("g").selectAll("g")
                                    .data(text)
                                    .enter()
                                    .append("g");


  // Adding rect within group, y position is function of index of token, light gray for highlighting
  // Has class of backgorund,
  tokenContainer.append("rect")
                .classed("background", true)
                .style("opacity", 0.0)
                .attr("fill", "lightgray")
                .attr("x", left_pos)
                .attr("y", function(d, i) {
                  return (i+1) * BOXHEIGHT;
                })
                .attr("width", BOXWIDTH)
                .attr("height", BOXHEIGHT);

  // Add actual text
  var theText = tokenContainer.append("text")
                              .text(function(d) { return d; })
                              .attr("font-size", TEXT_SIZE + "px")
                              .style("cursor", "default")
                              .style("-webkit-user-select", "none")
                              .attr("x", left_pos)
                              .attr("y", function(d, i) {
                                return (i+1) * BOXHEIGHT;
                              });

  if (is_left) {
    theText.style("text-anchor", "end")
           .attr("dx", BOXWIDTH - TEXT_SIZE)
           .attr("dy", TEXT_SIZE);
  } else {
    theText.style("text-anchor", "start")
           .attr("dx", + TEXT_SIZE)
           .attr("dy", TEXT_SIZE);
  }

  // // On mousevoer of tokencontainer, if
  // tokenContainer.on("mouseover", function(d, index) {
  //   textContainer.selectAll(".background")
  //                .style("opacity", function(d, i) {
  //                  return i == index ? 1.0 : 0.0;
  //                });
  //
  //   svg.selectAll(".attention_heads").style("display", "none");
  //
  //   svg.selectAll(".line_heads")  // To get the nesting to work.
  //      .selectAll(".att_lines")
  //      .attr("stroke-opacity", function(d) {
  //         return 1.0;
  //       })
  //      .attr("y1", function(d, i) {
  //       if (is_left) {
  //         return (index+1) * BOXHEIGHT + (BOXHEIGHT/2);
  //       } else {
  //         return (i+1) * BOXHEIGHT + (BOXHEIGHT/2);
  //       }
  //    })
  //    .attr("x1", BOXWIDTH)
  //    .attr("y2", function(d, i) {
  //      if (is_left) {
  //         return (i+1) * BOXHEIGHT + (BOXHEIGHT/2);
  //       } else {
  //         return (index+1) * BOXHEIGHT + (BOXHEIGHT/2);
  //       }
  //    })
  //    .attr("x2", BOXWIDTH + MATRIX_WIDTH)
  //    .attr("stroke-width", 2)
  //    .attr("stroke", function(d, i, j) {
  //       return head_colours(j);
  //     })
  //    .attr("stroke-opacity", function(d, i, j) {
  //     if (is_left) {d = d[0];} else {d = d[1];}
  //     if (config.head_vis[j]) {
  //       if (d) {
  //         return d[index];
  //       } else {
  //         return 0.0;
  //       }
  //     } else {
  //       return 0.0;
  //     }
  //    });
  //
  //
  //   function updateAttentionBoxes() {
  //     var id = is_left ? "bottom" : "left";
  //     var the_left_pos = is_left ? MATRIX_WIDTH + BOXWIDTH : 0;
  //     svg.select("#" + id)
  //        .selectAll(".attention_boxes")
  //        .selectAll("g")
  //        .selectAll("rect")
  //        .attr("x", function(d, i, j) { return the_left_pos + box_offset(j); })
  //        .attr("y", function(d, i) { return (i+1) * BOXHEIGHT; })
  //        .attr("width", BOXWIDTH/active_heads())
  //        .attr("height", function() { return BOXHEIGHT; })
  //        .style("opacity", function(d, i, j) {
  //           if (is_left) {d = d[0];} else {d = d[1];}
  //           if (config.head_vis[j])
  //             if (d) {
  //               return d[index];
  //             } else {
  //               return 0.0;
  //             }
  //           else
  //             return 0.0;
  //
  //        });
  //   }
  //
  //   updateAttentionBoxes();
  // });

  // textContainer.on("mouseleave", function() {
  //   d3.select(this).selectAll(".background")
  //                  .style("opacity", 0.0);
  //
  //   svg.selectAll(".att_lines").attr("stroke-opacity", 0.0);
  //   svg.selectAll(".attention_heads").style("display", "inline");
  //   svg.selectAll(".attention_boxes")
  //      .selectAll("g")
  //      .selectAll("rect")
  //      .style("opacity", 0.0);
  // });
}

function renderAttentionHighlights(svg, attention) {
  var line_container = svg.append("g");
  line_container.selectAll("g")
                .data(attention)
                .enter()
                .append("g")
                .classed("line_heads", true)
                .selectAll("line")
                .data(function(d){return d;})
                .enter()
                .append("line").classed("att_lines", true);
}

function renderAttention(svg, attention_heads) {
  var line_container = svg.selectAll(".attention_heads");
  line_container.html(null);
  for(var h=0; h<attention_heads.length; h++) {
    for(var s=0; s<attention_heads[h].length; s++) {
      for(var a=0; a<attention_heads[h][s].length; a++) {
        line_container.append("line")
        .attr("y1", (s+1) * BOXHEIGHT + (BOXHEIGHT/2))
        .attr("x1", BOXWIDTH)
        .attr("y2", (a+1) * BOXHEIGHT + (BOXHEIGHT/2))
        .attr("x2", BOXWIDTH + MATRIX_WIDTH)
        .attr("stroke-width", 2)
        .attr("stroke", head_colours(h))
        .attr("stroke-opacity", function() {
          if (config.head_vis[h]) {
            return attention_heads[h][s][a]/active_heads();
          } else {
            return 0.0;
          }
        }());
      }
    }
  }
}

// Checkboxes
function box_offset(i) {
  var num_head_above = config.head_vis.reduce(
      function(acc, val, cur) {return val && cur < i ? acc + 1: acc;}, 0);
  return num_head_above*(BOXWIDTH / active_heads());
}

function active_heads() {
  return config.head_vis.reduce(function(acc, val) {
    return val ? acc + 1: acc;
  }, 0);
}

// function draw_checkboxes(config, left, svg, attention_heads) {
//   var checkboxContainer = svg.append("g");
//   var checkbox = checkboxContainer.selectAll("rect")
//                                   .data(config.head_vis)
//                                   .enter()
//                                   .append("rect")
//                                   .attr("fill", function(d, i) {
//                                     return head_colours(i);
//                                   })
//                                   .attr("x", function(d, i) {
//                                     return (i+1) * CHECKBOX_SIZE;
//                                   })
//                                   .attr("y", left)
//                                   .attr("width", CHECKBOX_SIZE)
//                                   .attr("height", CHECKBOX_SIZE);
//
//   function update_checkboxes() {
//     checkboxContainer.selectAll("rect")
//                               .data(config.head_vis)
//                               .attr("fill", function(d, i) {
//       var head_colour = head_colours(i);
//       var colour = d ? head_colour : lighten(head_colour);
//       return colour;
//     });
//   }
//
//   update_checkboxes();
//
//   checkbox.on("click", function(d, i) {
//     if (config.head_vis[i] && active_heads() == 1) return;
//     config.head_vis[i] = !config.head_vis[i];
//     update_checkboxes();
//     renderAttention(svg, attention_heads);
//   });
//
//   checkbox.on("dblclick", function(d, i) {
//     // If we double click on the only active head then reset
//     if (config.head_vis[i] && active_heads() == 1) {
//       config.head_vis = new Array(config.num_heads).fill(true);
//     } else {
//       config.head_vis = new Array(config.num_heads).fill(false);
//       config.head_vis[i] = true;
//     }
//     update_checkboxes();
//     renderAttention(svg, attention_heads);
//   });
// }


var config = {
  layer: 0,
  att_head: 0,
  att_type: 'all'
};

function visualize() {
  console.log('attention')
  console.log(attention)
  console.log('attention all')
  console.log(attention['all'])
  var num_heads = attention['all']['queries'][0].length; // Num heads for layer 0 (same as for all layers)
  //config.head_vis  = new Array(num_heads).fill(true);
  //config.num_heads = num_heads;
  config.vector_size = attention['all']['queries'][0][0][0].length // Layer 0, head 0, position 0 length
  config.attention = attention;
  render();
}

function render() {
  console.log('CONFIG')
  console.log(config)
  var att_dets = config.attention[config.att_type];
  var left_text = att_dets.left_text;
  var right_text = att_dets.right_text;
  var queries = att_dets.queries[config.layer][config.att_head];
  var keys = att_dets.keys[config.layer][config.att_head];

  $("#vis svg").empty();
  renderVis("#vis", left_text, right_text, queries, keys, config);
}

$("#layer").empty();
for(var i=0; i<12; i++) {
  $("#layer").append($("<option />").val(i).text(i));
}

$("#layer").on('change', function(e) {
  config.layer = +e.currentTarget.value;
  render();
});

$("#att_head").empty();
for(var i=0; i<12; i++) {
  $("#att_head").append($("<option />").val(i).text(i));
}

$("#att_head").on('change', function(e) {
  config.att_head = +e.currentTarget.value;
  render();
});

$("#att_type").on('change', function(e) {
  config.att_type = e.currentTarget.value;
  render();
});

$("button").on('click', visualize);

visualize();

});