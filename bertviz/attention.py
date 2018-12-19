# coding=utf-8
# Copyright 2018 The Tensor2Tensor Authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# Change log
# 12/12/18  Jesse Vig   Adapted to BERT model
# 12/19/18  Jesse Vig   Assorted cleanup. Changed orientation of attention matrices. Updated comments.


"""Module for postprocessing and displaying transformer attentions.

This module is designed to be called from an ipython notebook.
"""

import json
import os

import IPython.display as display


vis_html = """
  <span style="user-select:none">
    Layer: <select id="layer"></select>
    Attention: <select id="att_type">
      <option value="all">All</option>
      <option value="a">Sentence A self-attention</option>
      <option value="b">Sentence B self-attention</option>
      <option value="ab">Sentence A -> Sentence B</option>
      <option value="ba">Sentence B -> Sentence A</option>
    </select>
  </span>
  <div id='vis'></div>
"""

__location__ = os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__)))
vis_js = open(os.path.join(__location__, 'attention.js')).read()


def show(tokens_a, tokens_b, attn):
    """Displays attention visualization"""
    attentions = _get_attentions(tokens_a, tokens_b, attn)
    att_json = json.dumps(attentions)
    _show_attention(att_json)


def _show_attention(att_json):
    display.display(display.HTML(vis_html))
    display.display(display.Javascript('window.attention = %s' % att_json))
    display.display(display.Javascript(vis_js))


def _get_attentions(tokens_a, tokens_b, attn):
    """Compute representation of the attention to pass to the d3 visualization

    Args:
      tokens_a: tokens in sentence A
      tokens_b: tokens in sentence B
      attn: numpy array, attention
          [num_layers, batch_size, num_heads, seq_len, seq_len]

    Returns:
      Dictionary of attention representations with the structure:
      {
        'all': Representations for showing all attentions at the same time. (source = AB, target = AB)
        'a': Sentence A self-attention (source = A, target = A)
        'b': Sentence B self-attention (source = B, target = B)
        'ab': Sentence A -> Sentence B attention (source = A, target = B)
        'ba': Sentence B -> Sentence A attention (source = B, target = A)
      }
      and each sub-dictionary has structure:
      {
        'att': list of inter attentions matrices, one for each layer. Each is of shape [num_heads, source_seq_len, target_seq_len]
        'top_text': list of source tokens, to be displayed on the left of the vis
        'bot_text': list of target tokens, to be displayed on the right of the vis
      }
    """

    all_attns = []
    a_attns = []
    b_attns = []
    ab_attns = []
    ba_attns = []
    slice_a = slice(0, len(tokens_a)) # Positions corresponding to sentence A in input
    slice_b = slice(len(tokens_a), len(tokens_a) + len(tokens_b)) # Position corresponding to sentence B in input
    num_layers = len(attn)
    for layer in range(num_layers):
        layer_attn = attn[layer][0] # Get layer attention (assume batch size = 1), shape = [num_heads, seq_len, seq_len]
        all_attns.append(layer_attn.tolist()) # Append AB->AB attention for layer, across all heads
        a_attns.append(layer_attn[:, slice_a, slice_a].tolist()) # Append A->A attention for layer, across all heads
        b_attns.append(layer_attn[:, slice_b, slice_b].tolist()) # Append B->B attention for layer, across all heads
        ab_attns.append(layer_attn[:, slice_a, slice_b].tolist()) # Append A->B attention for layer, across all heads
        ba_attns.append(layer_attn[:, slice_b, slice_a].tolist()) # Append B->A attention for layer, across all heads

    attentions =  {
        'all': {
            'att': all_attns,
            'top_text': tokens_a + tokens_b,
            'bot_text': tokens_a + tokens_b
        },
        'a': {
            'att': a_attns,
            'top_text': tokens_a,
            'bot_text': tokens_a
        },
        'b': {
            'att': b_attns,
            'top_text': tokens_b,
            'bot_text': tokens_b
        },
        'ab': {
            'att': ab_attns,
            'top_text': tokens_a,
            'bot_text': tokens_b
        },
        'ba': {
            'att': ba_attns,
            'top_text': tokens_b,
            'bot_text': tokens_a
        }
    }
    return attentions
