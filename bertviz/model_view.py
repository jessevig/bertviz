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
from bertviz.attention import get_attention
from IPython.core.display import display, HTML, Javascript
import os

def show(model, model_type, tokenizer, sentence_a, sentence_b=None):

    if sentence_b:
        vis_html = """
          <span style="user-select:none">
            Attention: <select id="filter">
              <option value="all">All</option>
              <option value="aa">Sentence A -> Sentence A</option>
              <option value="ab">Sentence A -> Sentence B</option>
              <option value="ba">Sentence B -> Sentence A</option>
              <option value="bb">Sentence B -> Sentence B</option>
            </select>
          </span>
          <div id='vis'></div> 
        """
    else:
        vis_html = """
          <div id='vis'></div> 
        """

    display(HTML(vis_html))
    __location__ = os.path.realpath(
        os.path.join(os.getcwd(), os.path.dirname(__file__)))
    vis_js = open(os.path.join(__location__, 'model_view.js')).read()
    attn_data = get_attention(model, model_type, tokenizer, sentence_a, sentence_b)
    params = {
        'attention': attn_data,
        'default_filter': "all"
    }
    display(Javascript('window.params = %s' % json.dumps(params)))
    display(Javascript(vis_js))

