import torch
import json
import os
import IPython.display as display
from collections import defaultdict

class AttentionDetailsData:
    """Represents data needed for attention details visualization"""

    def __init__(self, model, tokenizer):
        self.model = model
        self.tokenizer = tokenizer
        self.model.eval()

    def get_data(self, sentence_a, sentence_b):
        tokens_tensor, token_type_tensor, tokens_a, tokens_b = self._get_inputs(sentence_a, sentence_b)
        _, _, attn_data_list = self.model(tokens_tensor, token_type_ids=token_type_tensor)
        query_tensor = torch.stack([attn_data['query_layer'] for attn_data in attn_data_list])
        key_tensor = torch.stack([attn_data['key_layer'] for attn_data in attn_data_list])
        return tokens_a, tokens_b, query_tensor.data.numpy(), key_tensor.data.numpy()

    def _get_inputs(self, sentence_a, sentence_b):
        tokens_a = self.tokenizer.tokenize(sentence_a)
        tokens_b = self.tokenizer.tokenize(sentence_b)
        tokens_a_delim = ['[CLS]'] + tokens_a + ['[SEP]']
        tokens_b_delim = tokens_b + ['[SEP]']
        token_ids = self.tokenizer.convert_tokens_to_ids(tokens_a_delim + tokens_b_delim)
        tokens_tensor = torch.tensor([token_ids])
        token_type_tensor = torch.LongTensor([[0] * len(tokens_a_delim) + [1] * len(tokens_b_delim)])
        return tokens_tensor, token_type_tensor, tokens_a_delim, tokens_b_delim


vis_html = """
  <span style="user-select:none">
    Layer: <select id="layer"></select>
    Head: <select id="att_head"></select>
    Attention: <select id="att_type">
      <option value="all">All</option>
      <option value="a">Sentence A -> Sentence A</option>
      <option value="b">Sentence B -> Sentence B</option>
      <option value="ab">Sentence A -> Sentence B</option>
      <option value="ba">Sentence B -> Sentence A</option>
    </select>
  </span>
  <div id='vis'></div>
"""

__location__ = os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__)))
vis_js = open(os.path.join(__location__, 'attention_details.js')).read()


def show(tokens_a, tokens_b, query_vectors, key_vectors):
    """Displays attention visualization"""
    attention_details = _get_attention_details(tokens_a, tokens_b, query_vectors, key_vectors)
    att_json = json.dumps(attention_details)
    display.display(display.HTML(vis_html))
    display.display(display.Javascript('window.attention = %s' % att_json))
    display.display(display.Javascript(vis_js))


def _get_attention_details(tokens_a, tokens_b, query_vectors, key_vectors):
    """Compute representation of the attention to pass to the d3 visualization

    Args:
      tokens_a: tokens in sentence A
      tokens_b: tokens in sentence B
      query_vectors: numpy array, [num_layers, batch_size, num_heads, seq_len, vector_size]
      key_vectors: numpy array, [num_layers, batch_size, num_heads, seq_len, vector_size]

    Returns:
      Dictionary of query/key representations with the structure:
      {
        'all': All attention (source = AB, target = AB)
        'aa': Sentence A self-attention (source = A, target = A)
        'bb': Sentence B self-attention (source = B, target = B)
        'ab': Sentence A -> Sentence B attention (source = A, target = B)
        'ba': Sentence B -> Sentence A attention (source = B, target = A)
      }
      and each sub-dictionary has structure:
      {
        'left_text': list of source tokens, to be displayed on the left of the vis
        'right_text': list of target tokens, to be displayed on the right of the vis
        'queries': list of query vector arrays, one for each layer. Each is nested list, shape (num_heads, source_seq_len, vector_size)
        'keys': list of key vector arrays, one for each layer. Each is nested list, shape (num_heads, target_seq_len, vector_size)
      }
    """

    key_vectors_dict = defaultdict(list)
    query_vectors_dict = defaultdict(list)

    slice_a = slice(0, len(tokens_a))  # Positions corresponding to sentence A in input
    slice_b = slice(len(tokens_a), len(tokens_a) + len(tokens_b))  # Position corresponding to sentence B in input
    num_layers = len(query_vectors)
    for layer in range(num_layers):
        query_vector = query_vectors[layer][0] # assume batch_size=1; shape = [num_heads, seq_len, vector_size]
        key_vector = key_vectors[layer][0] # assume batch_size=1; shape = [num_heads, seq_len, vector_size]
        query_vectors_dict['all'].append(query_vector.tolist())
        key_vectors_dict['all'].append(key_vector.tolist())
        query_vectors_dict['a'].append(query_vector[:, slice_a, :].tolist())
        key_vectors_dict['a'].append(key_vector[:, slice_a, :].tolist())
        query_vectors_dict['b'].append(query_vector[:, slice_b, :].tolist())
        key_vectors_dict['b'].append(key_vector[:, slice_b, :].tolist())

    attentions =  {
        'all': {
            'queries': query_vectors_dict['all'],
            'keys': key_vectors_dict['all'],
            'left_text': tokens_a + tokens_b,
            'right_text': tokens_a + tokens_b
        },
        'aa': {
            'queries': query_vectors_dict['a'],
            'keys': key_vectors_dict['a'],
            'left_text': tokens_a,
            'right_text': tokens_a
        },
        'bb': {
            'queries': query_vectors_dict['b'],
            'keys': key_vectors_dict['b'],
            'left_text': tokens_b,
            'right_text': tokens_b
        },
        'ab': {
            'queries': query_vectors_dict['a'],
            'keys': key_vectors_dict['b'],
            'left_text': tokens_a,
            'right_text': tokens_b
        },
        'ba': {
            'queries': query_vectors_dict['b'],
            'keys': key_vectors_dict['a'],
            'left_text': tokens_b,
            'right_text': tokens_a
        }
    }
    return attentions
