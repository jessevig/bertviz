import torch
import json
import os
import IPython.display as display

class AttentionMapData:
    """Represents data needed for attention map visualization"""

    def __init__(self, model, tokenizer):
        self.model = model
        self.tokenizer = tokenizer
        self.model.eval()

    def get_data(self, sentence_a, sentence_b):
        tokens_tensor, token_type_tensor, tokens_a, tokens_b = self._get_inputs(sentence_a, sentence_b)
        _, _, attn_data_list = self.model(tokens_tensor, token_type_ids=token_type_tensor)
        attn_tensor = torch.stack([attn_data['attn_probs'] for attn_data in attn_data_list])
        return tokens_a, tokens_b, attn_tensor.data.numpy()

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
    Attention: <select id="attType">
      <option value="all">All</option>
      <option value="aa">Sentence A -> Sentence A</option>
      <option value="bb">Sentence B -> Sentence B</option>
      <option value="ab">Sentence A -> Sentence B</option>
      <option value="ba">Sentence B -> Sentence A</option>
    </select>
  </span>
  <div id='vis'></div>
"""

__location__ = os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__)))
vis_js = open(os.path.join(__location__, 'attention_map.js')).read()


def show(tokens_a, tokens_b, attn):
    """Displays attention visualization"""
    attention_details = _get_attentions(tokens_a, tokens_b, attn)
    att_json = json.dumps(attention_details)
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
        'left_text': list of source tokens, to be displayed on the left of the vis
        'right_text': list of target tokens, to be displayed on the right of the vis
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
            'left_text': tokens_a + tokens_b,
            'right_text': tokens_a + tokens_b
        },
        'aa': {
            'att': a_attns,
            'left_text': tokens_a,
            'right_text': tokens_a
        },
        'bb': {
            'att': b_attns,
            'left_text': tokens_b,
            'right_text': tokens_b
        },
        'ab': {
            'att': ab_attns,
            'left_text': tokens_a,
            'right_text': tokens_b
        },
        'ba': {
            'att': ba_attns,
            'left_text': tokens_b,
            'right_text': tokens_a
        }
    }
    return attentions

