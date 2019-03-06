import torch
import json
import os
import IPython.display as display

class AttentionMapGPT2Data:
    """Data needed for GPT2 attention map visualization"""

    def __init__(self, model, tokenizer):
        self.model = model
        self.tokenizer = tokenizer
        self.model.eval()

    def get_data(self, text):
        tokens_tensor, tokens = self._get_inputs(text)
        _, _, attn_data_list = self.model(tokens_tensor)
        attn_tensor = torch.stack([attn_data['attn_probs'] for attn_data in attn_data_list])
        return tokens, attn_tensor.data.numpy()

    def _get_inputs(self, text):
        token_ids = self.tokenizer.encode(text)
        tokens = [self.tokenizer.decode([t]).strip() for t in token_ids]
        tokens_tensor = torch.tensor([token_ids])
        return tokens_tensor, tokens


vis_html = """
  <div id='vis'></div>
"""

__location__ = os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__)))
vis_js = open(os.path.join(__location__, 'attention_map_gpt2.js')).read()


def show(text, attn):
    """Displays attention visualization"""
    attention_details = _get_attention(text, attn)
    att_json = json.dumps(attention_details)
    display.display(display.HTML(vis_html))
    display.display(display.Javascript('window.attention = %s' % att_json))
    display.display(display.Javascript(vis_js))


def _get_attention(tokens, attn):
    """Compute representation of the attention to pass to the d3 visualization

    Args:
      tokens: tokens in input text
      attn: numpy array, attention
          [num_layers, batch_size, num_heads, seq_len, seq_len]

    Returns:
      Dictionary:
      {
        'att': list of inter attentions matrices, one for each layer. Each is of shape [num_heads, source_seq_len, target_seq_len]
        'left_text': list of source tokens, to be displayed on the left of the vis
        'right_text': list of target tokens, to be displayed on the right of the vis
      }
    """

    all_attns = []
    num_layers = len(attn)
    for layer in range(num_layers):
        layer_attn = attn[layer][0] # Get layer attention (assume batch size = 1), shape = [num_heads, seq_len, seq_len]
        all_attns.append(layer_attn.tolist()) # Append attention for layer, across all heads

    return {
        'att': all_attns,
        'left_text': tokens,
        'right_text': tokens
    }
