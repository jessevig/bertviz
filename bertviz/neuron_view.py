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
# 12/30/20  Jesse Vig   Enable multiple visualizations in one notebook
# 01/16/21  Jesse Vig   Dark mode


"""Module for postprocessing and displaying transformer attentions.

This module is designed to be called from an ipython notebook.
"""

import json
import os
import uuid
from collections import defaultdict

import torch
from IPython.display import display, HTML, Javascript


def show(model, model_type, tokenizer, sentence_a, sentence_b=None, display_mode='dark', layer=None, head=None,
         html_action='view'):

    if sentence_b:
        attn_dropdown = """
            <span class="dropdown-label">Attention: </span><select id="filter">
              <option value="all">All</option>
              <option value="aa">Sentence A -> Sentence A</option>
              <option value="ab">Sentence A -> Sentence B</option>
              <option value="ba">Sentence B -> Sentence A</option>
              <option value="bb">Sentence B -> Sentence B</option>
            </select>
        """
    else:
        attn_dropdown = ""

    # Generate unique div id to enable multiple visualizations in one notebook
    vis_id = 'bertviz-%s' % (uuid.uuid4().hex)
    vis_html = f"""
        <div id={vis_id} style="padding:8px;font-family:'Helvetica Neue', Helvetica, Arial, sans-serif;">
          <span style="user-select:none">
            <span class="dropdown-label">Layer: </span><select id="layer"></select>
            <span class="dropdown-label">Head: </span> <select id="att_head"></select>
            {attn_dropdown}
          </span>
          <div id='vis'></div>
        </div>
     """

    __location__ = os.path.realpath(
        os.path.join(os.getcwd(), os.path.dirname(__file__)))
    attn_data = get_attention(model, model_type, tokenizer, sentence_a, sentence_b, include_queries_and_keys=True)
    if model_type == 'gpt2':
        bidirectional = False
    else:
        bidirectional = True
    params = {
        'attention': attn_data,
        'default_filter': "all",
        'root_div_id': vis_id,
        'bidirectional': bidirectional,
        'display_mode': display_mode,
        'layer': layer,
        'head': head
    }
    vis_js = open(os.path.join(__location__, 'neuron_view.js')).read()
    html1 = HTML('<script src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js"></script>')
    html2 = HTML(vis_html)

    if html_action == 'view':
        display(html1)
        display(html2)
        display(Javascript('window.bertviz_params = %s' % json.dumps(params)))
        display(Javascript(vis_js))
    elif html_action == 'return':
        script1 = '\n<script type="text/javascript">\n' + Javascript(
            'window.bertviz_params = %s' % json.dumps(params)).data + '\n</script>\n'
        script2 = '\n<script type="text/javascript">\n' + Javascript(vis_js).data + '\n</script>\n'
        neuron_html = HTML(html1.data + html2.data + script1 + script2)
        return neuron_html
    else:
        raise ValueError("'html_action' parameter must be 'view' or 'return")


def get_attention(model, model_type, tokenizer, sentence_a, sentence_b=None, include_queries_and_keys=False):
    """Compute representation of attention to pass to the d3 visualization

    Args:
        model: pytorch-transformers model
        model_type: type of model. Valid values 'bert', 'gpt2', 'xlnet', 'roberta'
        tokenizer: pytorch-transformers tokenizer
        sentence_a: Sentence A string
        sentence_b: Sentence B string
        include_queries_and_keys: Indicates whether to include queries/keys in results

    Returns:
      Dictionary of attn representations with the structure:
      {
        'all': All attention (source = AB, target = AB)
        'aa': Sentence A self-attention (source = A, target = A) (if sentence_b is not None)
        'bb': Sentence B self-attention (source = B, target = B) (if sentence_b is not None)
        'ab': Sentence A -> Sentence B attention (source = A, target = B) (if sentence_b is not None)
        'ba': Sentence B -> Sentence A attention (source = B, target = A) (if sentence_b is not None)
      }
      where each value is a dictionary:
      {
        'left_text': list of source tokens, to be displayed on the left of the vis
        'right_text': list of target tokens, to be displayed on the right of the vis
        'attn': list of attention matrices, one for each layer. Each has shape [num_heads, source_seq_len, target_seq_len]
        'queries' (optional): list of query vector arrays, one for each layer. Each has shape (num_heads, source_seq_len, vector_size)
        'keys' (optional): list of key vector arrays, one for each layer. Each has shape (num_heads, target_seq_len, vector_size)
      }
    """

    if model_type not in ('bert', 'gpt2', 'xlnet', 'roberta'):
        raise ValueError("Invalid model type:", model_type)
    if not sentence_a:
        raise ValueError("Sentence A is required")
    is_sentence_pair = bool(sentence_b)
    if is_sentence_pair and model_type not in ('bert', 'roberta', 'xlnet'):
        raise ValueError(f'Model {model_type} does not support sentence pairs')
    if is_sentence_pair and model_type == 'xlnet':
        raise NotImplementedError("Sentence-pair inputs for XLNet not currently supported.")

    # Prepare inputs to model
    tokens_a = None
    tokens_b = None
    token_type_ids = None
    if not is_sentence_pair:  # Single sentence
        if model_type in ('bert', 'roberta'):
            tokens_a = [tokenizer.cls_token] + tokenizer.tokenize(sentence_a) + [tokenizer.sep_token]
        elif model_type == 'xlnet':
            tokens_a = tokenizer.tokenize(sentence_a) + [tokenizer.sep_token] + [tokenizer.cls_token]
        else:
            tokens_a = tokenizer.tokenize(sentence_a)
    else:
        if model_type == 'bert':
            tokens_a = [tokenizer.cls_token] + tokenizer.tokenize(sentence_a) + [tokenizer.sep_token]
            tokens_b = tokenizer.tokenize(sentence_b) + [tokenizer.sep_token]
            token_type_ids = torch.LongTensor([[0] * len(tokens_a) + [1] * len(tokens_b)])
        elif model_type == 'roberta':
            tokens_a = [tokenizer.cls_token] + tokenizer.tokenize(sentence_a) + [tokenizer.sep_token]
            tokens_b = [tokenizer.sep_token] + tokenizer.tokenize(sentence_b) + [tokenizer.sep_token]
            # Roberta doesn't use token type embeddings per https://github.com/huggingface/pytorch-transformers/blob/master/pytorch_transformers/convert_roberta_checkpoint_to_pytorch.py
        else:
            tokens_b = tokenizer.tokenize(sentence_b)

    token_ids = tokenizer.convert_tokens_to_ids(tokens_a + (tokens_b if tokens_b else []))
    tokens_tensor = torch.tensor(token_ids).unsqueeze(0)

    # Call model to get attention data
    model.eval()
    if token_type_ids is not None:
        output = model(tokens_tensor, token_type_ids=token_type_ids)
    else:
        output = model(tokens_tensor)
    attn_data_list = output[-1]

    # Populate map with attn data and, optionally, query, key data
    attn_dict = defaultdict(list)
    if include_queries_and_keys:
        queries_dict = defaultdict(list)
        keys_dict = defaultdict(list)

    if is_sentence_pair:
        slice_a = slice(0, len(tokens_a))  # Positions corresponding to sentence A in input
        slice_b = slice(len(tokens_a), len(tokens_a) + len(tokens_b))  # Position corresponding to sentence B in input
    for layer, attn_data in enumerate(attn_data_list):
        # Process attention
        attn = attn_data['attn'][0]  # assume batch_size=1; shape = [num_heads, source_seq_len, target_seq_len]
        attn_dict['all'].append(attn.tolist())
        if is_sentence_pair:
            attn_dict['aa'].append(
                attn[:, slice_a, slice_a].tolist())  # Append A->A attention for layer, across all heads
            attn_dict['bb'].append(
                attn[:, slice_b, slice_b].tolist())  # Append B->B attention for layer, across all heads
            attn_dict['ab'].append(
                attn[:, slice_a, slice_b].tolist())  # Append A->B attention for layer, across all heads
            attn_dict['ba'].append(
                attn[:, slice_b, slice_a].tolist())  # Append B->A attention for layer, across all heads
        # Process queries and keys
        if include_queries_and_keys:
            queries = attn_data['queries'][0]  # assume batch_size=1; shape = [num_heads, seq_len, vector_size]
            keys = attn_data['keys'][0]  # assume batch_size=1; shape = [num_heads, seq_len, vector_size]
            queries_dict['all'].append(queries.tolist())
            keys_dict['all'].append(keys.tolist())
            if is_sentence_pair:
                queries_dict['a'].append(queries[:, slice_a, :].tolist())
                keys_dict['a'].append(keys[:, slice_a, :].tolist())
                queries_dict['b'].append(queries[:, slice_b, :].tolist())
                keys_dict['b'].append(keys[:, slice_b, :].tolist())

    tokens_a = format_special_chars(tokens_a)
    if tokens_b:
        tokens_b = format_special_chars(tokens_b)
    if model_type != 'gpt2':
        tokens_a = format_delimiters(tokens_a, tokenizer)
        if tokens_b:
            tokens_b = format_delimiters(tokens_b, tokenizer)

    results = {
        'all': {
            'attn': attn_dict['all'],
            'left_text': tokens_a + (tokens_b if tokens_b else []),
            'right_text': tokens_a + (tokens_b if tokens_b else [])
        }
    }
    if is_sentence_pair:
        results.update({
            'aa': {
                'attn': attn_dict['aa'],
                'left_text': tokens_a,
                'right_text': tokens_a
            },
            'bb': {
                'attn': attn_dict['bb'],
                'left_text': tokens_b,
                'right_text': tokens_b
            },
            'ab': {
                'attn': attn_dict['ab'],
                'left_text': tokens_a,
                'right_text': tokens_b
            },
            'ba': {
                'attn': attn_dict['ba'],
                'left_text': tokens_b,
                'right_text': tokens_a
            }
        })
    if include_queries_and_keys:
        results['all'].update({
            'queries': queries_dict['all'],
            'keys': keys_dict['all'],
        })
        if is_sentence_pair:
            results['aa'].update({
                'queries': queries_dict['a'],
                'keys': keys_dict['a'],
            })
            results['bb'].update({
                'queries': queries_dict['b'],
                'keys': keys_dict['b'],
            })
            results['ab'].update({
                'queries': queries_dict['a'],
                'keys': keys_dict['b'],
            })
            results['ba'].update({
                'queries': queries_dict['b'],
                'keys': keys_dict['a'],
            })
    return results


def format_special_chars(tokens):
    return [t.replace('Ġ', ' ').replace('▁', ' ') for t in tokens]


def format_delimiters(tokens, tokenizer):
    formatted_tokens = []
    for t in tokens:
        if tokenizer.sep_token:
            t = t.replace(tokenizer.sep_token, '[SEP]')
        if tokenizer.cls_token:
            t = t.replace(tokenizer.cls_token, '[CLS]')
        formatted_tokens.append(t)
    return formatted_tokens
