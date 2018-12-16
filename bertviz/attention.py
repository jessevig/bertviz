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
# Changes made by Jesse Vig on 12/12/18
# - Adapted to BERT model


"""Module for postprocessing and displaying transformer attentions.

This module is designed to be called from an ipython notebook.
"""

import json
import os

import IPython.display as display

import numpy as np

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
    """Compute representation of the attention ready for the d3 visualization.

    Args:
      tokens_a: list of strings, words to be displayed on the left of the vis
      tokens_b: list of strings, words to be displayed on the right of the vis
      attn: numpy array, attention
          [num_layers, batch_size, num_heads, seq_len, seq_len]


    Returns:
      Dictionary of attention representations with the structure:
      {
        'all': Representations for showing all attentions at the same time.
        'a': Sentence A self-attention
        'b': Sentence B self-attention
        'ab': Sentence A -> Sentence B attention
        'ba': Sentence B -> Sentence A attention
      }
      and each sub-dictionary has structure:
      {
        'att': list of inter attentions matrices, one for each attention head
        'top_text': list of strings, words to be displayed on the left of the vis
        'bot_text5': list of strings, words to be displayed on the right of the vis
      }
    """
    def format_mat(mat):
        return mat.transpose(0, 2, 1).tolist()


    all_attns = []
    a_attns = []
    b_attns = []
    ab_attns = []
    ba_attns = []
    slice_a = slice(0, len(tokens_a))
    slice_b = slice(len(tokens_a), len(tokens_a) + len(tokens_b))
    num_layers = len(attn)
    for layer in range(num_layers):
        layer_attn = attn[layer][0]
        all_attns.append(format_mat(layer_attn))
        a_attns.append(format_mat(layer_attn[:, slice_a, slice_a]))
        b_attns.append(format_mat(layer_attn[:, slice_b, slice_b]))
        ab_attns.append(format_mat(layer_attn[:, slice_a, slice_b]))
        ba_attns.append(format_mat(layer_attn[:, slice_b, slice_a]))

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
