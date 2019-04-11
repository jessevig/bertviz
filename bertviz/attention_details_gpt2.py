import torch
import json
import os
import IPython.display as display
from collections import defaultdict
from bertviz.attention import _get_attentions

class AttentionDetailsGpt2Data:
    """Represents data needed for attention details visualization"""

    def __init__(self, model, tokenizer):
        self.model = model
        self.tokenizer = tokenizer
        self.model.eval()

    def get_data(self, text):
        tokens_tensor, tokens = self._get_inputs(text)
        _, _, attn_data_list = self.model(tokens_tensor)
        query_tensor = torch.stack([attn_data['query'] for attn_data in attn_data_list])
        key_tensor = torch.stack([attn_data['key'] for attn_data in attn_data_list])
        attn_tensor = torch.stack([attn_data['attn_probs'] for attn_data in attn_data_list])
        return tokens, query_tensor.data.numpy(), key_tensor.data.numpy(), attn_tensor.data.numpy()

    def _get_inputs(self, text):
        token_ids = self.tokenizer.encode(text)
        tokens = [self.tokenizer.decode([t]).strip() for t in token_ids]
        tokens_tensor = torch.tensor([token_ids])
        return tokens_tensor, tokens


vis_html = """
  <span style="user-select:none">
    Layer: <select id="layer"></select>
    Head: <select id="att_head"></select>
  </span>
  <div id='vis'></div>
"""

__location__ = os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__)))
vis_js = open(os.path.join(__location__, 'attention_details_gpt2.js')).read()


def show(text, query_vectors, key_vectors, attn):
    """Displays attention visualization"""
    attention_details = _get_attention_details(text, query_vectors, key_vectors, attn)
    att_json = json.dumps(attention_details)
    display.display(display.HTML(vis_html))
    display.display(display.Javascript('window.attention = %s' % att_json))
    display.display(display.Javascript(vis_js))


def _get_attention_details(tokens, query_vectors, key_vectors, atts):
    """Compute representation of the attention to pass to the d3 visualization

    Args:
      tokens: tokens in input text
      query_vectors: numpy array, [num_layers, batch_size, num_heads, seq_len, vector_size]
      key_vectors: numpy array, [num_layers, batch_size, num_heads, seq_len, vector_size]
      atts: numpy array, attention
          [num_layers, batch_size, num_heads, seq_len, seq_len]

    Returns:
        Dict with following keys:
            'left_text': list of source tokens, to be displayed on the left of the vis
            'right_text': list of target tokens, to be displayed on the right of the vis
            'queries': list of query vector arrays, one for each layer. Each is nested list, shape (num_heads, source_seq_len, vector_size)
            'keys': list of key vector arrays, one for each layer. Each is nested list, shape (num_heads, target_seq_len, vector_size)
            'att': list of inter attentions matrices, one for each layer. Each is of shape [num_heads, source_seq_len, target_seq_len]
    """

    all_attns = []
    all_queries = []
    all_keys = []
    num_layers = len(query_vectors)
    for layer in range(num_layers):
        layer_attn = atts[layer][0] # assume batch_size=1; shape = [num_heads, source_seq_len, target_seq_len]
        all_attns.append(layer_attn.tolist())
        layer_query = query_vectors[layer][0]  # assume batch_size=1; shape = [num_heads, seq_len, vector_size]
        all_queries.append(layer_query.tolist())
        layer_key = key_vectors[layer][0]  # assume batch_size=1; shape = [num_heads, seq_len, vector_size]
        all_keys.append(layer_key.tolist())


    return {
            'queries': all_queries,
            'keys': all_keys,
            'att': all_attns,
            'left_text': tokens,
            'right_text': tokens
    }


