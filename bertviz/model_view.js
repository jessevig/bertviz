/**
 * @fileoverview Transformer Visualization D3 javascript code.
 *
 * Based on: https://github.com/tensorflow/tensor2tensor/blob/master/tensor2tensor/visualization/attention.js
 *
 * Change log:
 *
 * 02/01/19  Jesse Vig   Initial implementation
 * 12/31/20  Jesse Vig   Support multiple visualizations in single notebook.
 * 01/19/21  Jesse Vig   Support light/dark modes
 * 02/06/21  Jesse Vig   Move require config from separate jupyter notebook step
 * 05/03/21  Jesse Vig   Adjust visualization height dynamically
 * 03/23/22  Daniel SC   Update requirement URLs for d3 and jQuery (source of bug not allowing end result to be displayed on browsers)
*  05/15/22  Jesse Vig   Changes to supporting exporting images
 **/

// require.config({
//   paths: {
//       d3: 'https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min',
//     jquery: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.0/jquery.min'
//   }
// });

require.config({
  paths: {
      d3: 'https://cdnjs.cloudflare.com/ajax/libs/d3/5.7.0/d3.min',
    jquery: 'https://cdnjs.cloudflare.com/ajax/libs/jquery/2.0.0/jquery.min',
      pdfkit: 'https://cdn.jsdelivr.net/npm/pdfkit@0.13.0/js/pdfkit.standalone.min',
      // svgToPdfKit: 'https://cdn.jsdelivr.net/npm/svg-to-pdfkit@0.1.8/source.min',
      blobstream: 'https://cdn.jsdelivr.net/npm/blob-stream@0.1.3/index.min'
  }
});

requirejs(['jquery', 'd3', 'pdfkit', 'blobstream'], function($, d3, PDFDocument, blobStream) {

        const params = PYTHON_PARAMS; // HACK: PYTHON_PARAMS is a template marker that is replaced by actual params.
        const config = {};

        const MIN_X = 0;
        const MIN_Y = 0;
        const DIV_WIDTH = 970;
        const THUMBNAIL_PADDING = 5;
        const DETAIL_WIDTH = 300;
        const DETAIL_ATTENTION_WIDTH = 140;
        const DETAIL_BOX_WIDTH = 80;
        const DETAIL_BOX_HEIGHT = 18;
        const DETAIL_PADDING = 15;
        const ATTN_PADDING = 0;
        const DETAIL_HEADING_HEIGHT = 25;
        const HEADING_TEXT_SIZE = 15;
        const HEADING_PADDING = 5;
        const TEXT_SIZE = 13;
        const TEXT_PADDING = 5;
        const LAYER_COLORS = d3.schemeCategory10;
        const PALETTE = {
            'light': {
                'text': 'black',
                'background': 'white',
                'highlight': '#F5F5F5'
            },
            'dark': {
                'text': '#ccc',
                'background': 'black',
                'highlight': '#222'
            }
        }

        function render() {

            // Set global state variables

            var attData = config.attention[config.filter];
            config.leftText = attData.left_text;
            config.rightText = attData.right_text;
            config.attn = attData.attn;
            config.numLayers = config.attn.length;
            config.numHeads = config.attn[0].length;
            config.thumbnailBoxHeight = 7 * (12 / config.totalHeads);
            const axisSize = HEADING_TEXT_SIZE + HEADING_PADDING + TEXT_SIZE + TEXT_PADDING;
            config.thumbnailHeight = Math.max(config.leftText.length, config.rightText.length) * config.thumbnailBoxHeight + 2 * THUMBNAIL_PADDING;
            config.thumbnailWidth = (DIV_WIDTH - axisSize) / config.totalHeads;
            config.detailHeight = Math.max(config.leftText.length, config.rightText.length) * DETAIL_BOX_HEIGHT + 2 * DETAIL_PADDING + DETAIL_HEADING_HEIGHT;
            config.divHeight = Math.max(config.numLayers * config.thumbnailHeight + axisSize, config.detailHeight);

            const vis = $(`#${config.rootDivId} #vis`)
            vis.empty();
            vis.attr("height", config.divHeight);
            config.svg = d3.select(`#${config.rootDivId} #vis`)
                .append('svg')
                .attr("width", DIV_WIDTH)
                .attr("height", config.divHeight)
                .style("font-family", "\"Helvetica Neue\", Helvetica, Arial, sans-serif")
                .attr("xmlns", "http://www.w3.org/2000/svg")
                .attr("fill", getBackgroundColor());

            renderAxisLabels();

            var i;
            var j;
            for (i = 0; i < config.numLayers; i++) {
                for (j = 0; j < config.numHeads; j++) {
                    renderThumbnail(i, j);
                }
            }
        }

        function renderAxisLabels() {
            const axisSize = HEADING_TEXT_SIZE + HEADING_PADDING + TEXT_SIZE + TEXT_PADDING;
            const tableWidth = config.thumbnailWidth * config.heads.length;
            config.svg.append("text")
                .text("Heads")
                .attr("fill", "black")
                .attr("font-weight", "bold")
                .attr("font-size", HEADING_TEXT_SIZE + "px")
                .attr("x", axisSize + tableWidth / 2)
                .attr("text-anchor", "middle")
                .attr("y", 0)
                .attr("dy", HEADING_TEXT_SIZE);
            for (let i = 0; i < config.numHeads; i++) {
                config.svg.append("text")
                    .text(config.heads[i])
                    .attr("fill", "black")
                    .attr("font-size", TEXT_SIZE + "px")
                    .attr("x", axisSize + (i + .5) * config.thumbnailWidth)
                    .attr("text-anchor", "middle")
                    .attr("y", HEADING_TEXT_SIZE + HEADING_PADDING)
                    .attr("dy", TEXT_SIZE);
            }
            let x = 0;
            let y = axisSize + config.thumbnailHeight * config.layers.length / 2;
            console.log("x", x, y)
            config.svg.append("text")
                .text("Layers")
                .attr("fill", "black")
                .attr("font-weight", "bold")
                .attr("transform", "rotate(270, " + x  + ", " + y + ")")
                .attr("font-size", HEADING_TEXT_SIZE + "px")
                .attr("x", x)
                .attr("text-anchor", "middle")
                .attr("y", y)
                .attr("dy", HEADING_TEXT_SIZE);
            for (let i = 0; i < config.numLayers; i++) {
                x = HEADING_TEXT_SIZE + HEADING_PADDING + TEXT_SIZE; // HACK
                y = axisSize + (i + .5) * config.thumbnailHeight;
                config.svg.append("text")
                    .text(config.layers[i])
                    .attr("fill", "black")
                    .attr("font-size", TEXT_SIZE + "px")
                    .attr("x", x)
                    .attr("text-anchor", "end")
                    .attr("y", y)
                    .attr("dy", TEXT_SIZE / 2);
            }
        }

        function renderThumbnail(layerIndex, headIndex) {
            const axisSize = HEADING_TEXT_SIZE + HEADING_PADDING + TEXT_SIZE + TEXT_PADDING
            const x = headIndex * config.thumbnailWidth + axisSize;
            const y = layerIndex * config.thumbnailHeight + axisSize;
            renderThumbnailAttn(x, y, config.attn[layerIndex][headIndex], layerIndex, headIndex);
        }

        function renderDetail(att, layerIndex, headIndex) {
            const axisSize = TEXT_SIZE + HEADING_PADDING + TEXT_SIZE + TEXT_PADDING;
            var xOffset = .8 * config.thumbnailWidth;
            var maxX = DIV_WIDTH;
            var maxY = config.divHeight - 3;
            var leftPos = axisSize + headIndex * config.thumbnailWidth;
            var x = leftPos + THUMBNAIL_PADDING + xOffset;
            if (x < MIN_X) {
                x = MIN_X;
            } else if (x + DETAIL_WIDTH > maxX) {
                x = leftPos + THUMBNAIL_PADDING - DETAIL_WIDTH + 8;
            }
            var posLeftText = x;
            var posAttention = posLeftText + DETAIL_BOX_WIDTH;
            var posRightText = posAttention + DETAIL_ATTENTION_WIDTH;
            var thumbnailHeight = Math.max(config.leftText.length, config.rightText.length) * config.thumbnailBoxHeight + 2 * THUMBNAIL_PADDING;
            var yOffset = 20;
            var y = layerIndex * thumbnailHeight + THUMBNAIL_PADDING + yOffset;
            if (y < MIN_Y) {
                y = MIN_Y;
            } else if (y + config.detailHeight > maxY) {
                y = maxY - config.detailHeight;
            }
            renderDetailFrame(x, y, layerIndex);
            y = y + DETAIL_PADDING;
            renderDetailHeading(x, y, layerIndex, headIndex);
            y = y + DETAIL_HEADING_HEIGHT;
            renderDetailText(config.leftText, "leftText", posLeftText, y , layerIndex);
            renderDetailAttn(posAttention, y, att, layerIndex, headIndex);
            renderDetailText(config.rightText, "rightText", posRightText, y, layerIndex);
        }

        function savePng(svgEl) {
                // to filestream, add the starter
                var xml = new XMLSerializer().serializeToString(svgEl);
                var imgsrc = 'data:image/svg+xml;base64,' + btoa(xml);
                // update src to show the image
                var canvas = document.createElement('canvas');
                // set canvas size according to current div width and height, plus some padding
                canvas.width = DIV_WIDTH + 30;
                canvas.height = config.divHeight + 30;
                var context = canvas.getContext('2d');
                var image = new Image;
                image.src = imgsrc;
                image.onload = function () {
                    context.drawImage(image, 0, 0);
                    var canvasData = canvas.toDataURL("image/png");
                    var a = document.createElement("a");
                    a.download = "bertviz_model_view.png";
                    a.href = canvasData;
                    document.getElementById("vis").appendChild(a);
                    a.click();
                }
        }

        // const svgToPdfExample = (svg) => {
        //     const doc = new window.PDFDocument();
        //     const chunks = [];
        //     const stream = doc.pipe({
        //         // writable stream implementation
        //         write: (chunk) => chunks.push(chunk),
        //         end: () => {
        //             const pdfBlob = new Blob(chunks, {
        //                 type: 'application/octet-stream'
        //             });
        //             var blobUrl = URL.createObjectURL(pdfBlob);
        //             window.open(blobUrl);
        //         },
        //         // readable streaaam stub iplementation
        //         on: (event, action) => {
        //         },
        //         once: (...args) => {
        //         },
        //         emit: (...args) => {
        //         },
        //     });
        //
        //     window.SVGtoPDF(doc, svg, 0, 0);
        //
        //     doc.end();
        // };

        function testPdf() {
            // const PDFDocument = require('pdfkit');
            // const blobStream = require('blob-stream');
  //
  //   // create a document the same way as above
            const doc = new PDFDocument();
            const blobStream = require('blob-stream');

  //
    // pipe the document to a blob
            const chunks = [];
            const stream = doc.pipe({
                // writable stream implementation
                write: (chunk) => chunks.push(chunk),
                end: () => {
                    // const pdfBlob = new Blob(chunks, {
                    //     type: 'application/octet-stream'
                    // });
                    // var blobUrl = URL.createObjectURL(pdfBlob);
                    // const a = document.createElement('a');
                    // a.download = 'bertviz_model_view.pdf';
                    // a.href = blobUrl;
                    // a.click();
                }
            });


            doc.end();
  //
  //   // add your content to the document here, as usual
  //           doc
  // .font('fonts/PalatinoBold.ttf')
  // .fontSize(25)
  // .text('Some text with an embedded font!', 100, 100);
  //
  //
  //   // get a blob when you're done
  //           doc.end();
  //           stream.on('finish', function () {
  //               // get a blob you can do whatever you like with
  //               // const blob = stream.toBlob('application/pdf');
  //
  //               // or get a blob URL for display in the browser
  //               const url = stream.toBlobURL('application/pdf');
  //               iframe.src = url;
  //           });
        }

        // function savePdf(svgEl) {
        //
        //     const doc = new PDFDocument();
        //     // window.SVGtoPDF(doc, svgEl, 0, 0);
        //     // doc.pipe(fs.createWriteStream('bertviz_model_view.pdf'));
        //     // doc.end();
        //
        //     const chunks = [];
        //     const stream = doc.pipe({
        //         // writable stream implementation
        //         write: (chunk) => chunks.push(chunk),
        //         end: () => {
        //             const pdfBlob = new Blob(chunks, {
        //                 type: 'application/octet-stream'
        //             });
        //             var blobUrl = URL.createObjectURL(pdfBlob);
        //             const a = document.createElement('a');
        //             a.download = 'bertviz_model_view.pdf';
        //             a.href = blobUrl;
        //             a.click();
        //         }
        //     });
        //
        //
        //     doc.end();
        //
        // }
        // function savePdf(svgEl) {
        //
        //     const doc = new PDFDocument();
        //     window.SVGtoPDF(doc, svgEl, 0, 0);
        //     // doc.pipe(fs.createWriteStream('bertviz_model_view.pdf'));
        //     // doc.end();
        //
        //     const stream = doc.pipe(blobStream());
        //
        //     // add your content to the document here, as usual
        //
        //     // get a blob when you're done
        //     doc.end();
        //     stream.on('finish', function () {
        //         // get a blob you can do whatever you like with
        //         // const blob = stream.toBlob('application/pdf');
        //
        //         // or get a blob URL for display in the browser
        //         const url = stream.toBlobURL('application/pdf');
        //         const a = document.createElement('a');
        //         a.download = 'bertviz_model_view.pdf';
        //         a.href = url;
        //         a.click();
        //
        //     });


            // const base64doc = btoa(unescape(encodeURIComponent(svgEl.outerHTML)));
            // const a = document.createElement('a');
            // a.download = 'bertviz_model_view.pdf';
            // a.href = 'data:application/pdf;base64,' + base64doc;
            // a.click();


        // }

        // function savePdf(svgEl) {
        //         // to filestream, add the starter
        //         var xml = new XMLSerializer().serializeToString(svgEl);
        //         var imgsrc = 'data:image/svg+xml;base64,' + btoa(xml);
        //         // update src to show the image
        //         var canvas = document.createElement('canvas');
        //         // set canvas size according to current div width and height, plus some padding
        //         canvas.width = DIV_WIDTH + 30;
        //         canvas.height = config.divHeight + 30;
        //         var context = canvas.getContext('2d');
        //         var image = new Image;
        //         image.src = imgsrc;
        //         image.onload = function () {
        //             context.drawImage(image, 0, 0);
        //             var canvasData = canvas.toDataURL("image/png");
        //             var doc = new jspdf.jsPDF('p', 'mm');
        //             doc.addImage(canvasData, 'PNG', 10, 10);
        //             doc.save('bertviz_model_view.pdf');
        //         }
        // }

        function saveSvg(svgEl) {
            const base64doc = btoa(unescape(encodeURIComponent(svgEl.outerHTML)));
            const a = document.createElement('a');
            a.download = 'bertviz_model_view.svg';
            a.href = 'data:image/svg+xml;base64,' + base64doc;
            a.click();
        }

        function renderDetailHeading(x, y, layerIndex, headIndex) {
            var fillColor = getTextColor();
            config.svg.append("text")
                .classed("detail", true)
                .text('Layer ' + config.layers[layerIndex] + ", Head " + config.heads[headIndex])
                .attr("font-size", TEXT_SIZE + "px")
                .attr("font-weight", "bold")
                .style("cursor", "default")
                .style("-webkit-user-select", "none")
                .attr("fill", fillColor)
                .attr("x", x + DETAIL_WIDTH / 2)
                .attr("text-anchor", "middle")
                .attr("y", y)
                .attr("height", DETAIL_HEADING_HEIGHT)
                .attr("width", DETAIL_WIDTH)
                .attr("dy", HEADING_TEXT_SIZE);
        }

        function renderDetailText(text, id, x, y, layerIndex) {
            var tokenContainer = config.svg.append("svg:g")
                .classed("detail", true)
                .selectAll("g")
                .data(text)
                .enter()
                .append("g");

            var fillColor = getTextColor();

            tokenContainer.append("rect")
                .classed("highlight", true)
                .attr("fill", fillColor)
                .style("opacity", 0.0)
                .attr("height", DETAIL_BOX_HEIGHT)
                .attr("width", DETAIL_BOX_WIDTH)
                .attr("x", x)
                .attr("y", function (d, i) {
                    return y + i * DETAIL_BOX_HEIGHT;
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
            config.svg.select("#leftText")
                .selectAll(".highlight")
                .style("opacity", function (d, i) {
                    return i == index ? 1.0 : 0.0;
                });
            config.svg.selectAll(".attn-line-group")
                .style("opacity", function (d, i) {
                    return i == index ? 1.0 : 0.0;
                });
        }

        function unhighlightSelection() {
            config.svg.select("#leftText")
                .selectAll(".highlight")
                .style("opacity", 0.0);
            config.svg.selectAll(".attn-line-group")
                .style("opacity", 1);
        }

        function renderThumbnailAttn(x, y, att, layerIndex, headIndex) {

            var attnContainer = config.svg.append("svg:g");

            var attnBackground = attnContainer.append("rect")
                .attr("id", 'attn_background_' + layerIndex + "_" + headIndex)
                .classed("attn_background", true)
                .attr("x", x)
                .attr("y", y)
                .attr("height", config.thumbnailHeight)
                .attr("width", config.thumbnailWidth)
                .attr("stroke-width", 2)
                .attr("stroke", getLayerColor(layerIndex))
                .attr("stroke-opacity", 0)
                .attr("fill", getBackgroundColor());
            var x1 = x + THUMBNAIL_PADDING;
            var x2 = x1 + config.thumbnailWidth - 14;
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
                    return y1 + (sourceIndex + .5) * config.thumbnailBoxHeight;
                })
                .attr("x2", x2)
                .attr("y2", function (d, targetIndex) {
                    return y1 + (targetIndex + .5) * config.thumbnailBoxHeight;
                })
                .attr("stroke-width", 2.2)
                .attr("stroke", getLayerColor(layerIndex))
                .attr("stroke-opacity", function (d) {
                    return d;
                });

            var clickRegion = attnContainer.append("rect")
                .attr("x", x)
                .attr("y", y)
                .attr("height", config.thumbnailHeight)
                .attr("width", config.thumbnailWidth)
                .style("opacity", 0);

            clickRegion.on("click", function (d, index) {
                var attnBackgroundOther = config.svg.selectAll(".attn_background");
                attnBackgroundOther.attr("fill", getBackgroundColor());
                attnBackgroundOther.attr("stroke-opacity", 0);

                config.svg.selectAll(".detail").remove();
                if (config.detail_layer != layerIndex || config.detail_head != headIndex) {
                    renderDetail(att, layerIndex, headIndex);
                    config.detail_layer = layerIndex;
                    config.detail_head = headIndex;
                    attnBackground.attr("fill", getHighlightColor());
                    attnBackground.attr("stroke-opacity", .8);
                } else {
                    config.detail_layer = null;
                    config.detail_head = null;
                    attnBackground.attr("fill", getBackgroundColor());
                    attnBackground.attr("stroke-opacity", 0);
                }
            });

            clickRegion.on("mouseover", function (d) {
                d3.select(this).style("cursor", "pointer");
            });
        }

        function renderDetailFrame(x, y, layerIndex) {
            var detailFrame = config.svg.append("rect")
                .classed("detail", true)
                .attr("x", x)
                .attr("y", y)
                .attr("height", config.detailHeight)
                .attr("width", DETAIL_WIDTH)
                .style("opacity", 1)
                .attr("stroke-width", 1.5)
                .attr("stroke-opacity", 0.7)
                .attr("stroke", getLayerColor(layerIndex));
        }

        function renderDetailAttn(x, y, att, layerIndex) {
            var attnContainer = config.svg.append("svg:g")
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
                .attr("x1", x + ATTN_PADDING)
                .attr("y1", function (d) {
                    var sourceIndex = +this.parentNode.getAttribute("source-index");
                    return y + (sourceIndex + .5) * DETAIL_BOX_HEIGHT;
                })
                .attr("x2", x + DETAIL_ATTENTION_WIDTH - ATTN_PADDING)
                .attr("y2", function (d, targetIndex) {
                    return y + (targetIndex + .5) * DETAIL_BOX_HEIGHT;
                })
                .attr("stroke-width", 2.2)
                .attr("stroke", getLayerColor(layerIndex))
                .attr("stroke-opacity", function (d) {
                    return d;
                });
        }

        function getLayerColor(layer) {
          return LAYER_COLORS[config.layers[layer] % 10];
        }

        function getTextColor() {
            return PALETTE[config.mode]['text']
        }

        function getBackgroundColor() {
           return PALETTE[config.mode]['background']
        }

        function getHighlightColor() {
           return PALETTE[config.mode]['highlight']
        }

        function initialize() {
            config.attention = params['attention'];
            config.filter = params['default_filter'];
            config.mode = params['display_mode'];
            config.layers = params['include_layers']
            config.heads = params['include_heads']
            config.totalHeads = params['total_heads']
            config.rootDivId = params['root_div_id'];
            $(`#${config.rootDivId} #filter`).on('change', function (e) {
                config.filter = e.currentTarget.value;
                render();
            });

        }

        initialize();
        render();
        $(`#${config.rootDivId} #downloadButton`)
            .css("visibility", "visible")
            .click(function () {
                const imageFormat = $('input[name=imageFormat]:checked').val()
                const svgEl = $(`#${config.rootDivId} svg`)[0];
                if (imageFormat === "PNG") {
                    savePng(svgEl)
                } else if (imageFormat === "SVG") {
                    saveSvg(svgEl);
                }
                // else {
                //     testPdf();
                //     // savePdf(svgEl);
                // }
            });
        // After render the chart, add a button that trigger image generation
        // var downloadButton = document.createElement("button");
        // downloadButton.id = "downloadButton";
        // downloadButton.innerText = "Save as image";
        // downloadButton.style = "display: flex; justify-content: flex-end"
        // document.getElementById("vis").appendChild(downloadButton);
    

    });