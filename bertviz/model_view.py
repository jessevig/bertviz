import json
from IPython.core.display import display, HTML, Javascript
import os
from .util import format_special_chars, format_attention

def model_view(attention, tokens, prettify_tokens=True):
    """Render model view

        Args:
            attention: list of ``torch.FloatTensor``(one for each layer) of shape
                ``(batch_size(must be 1), num_heads, sequence_length, sequence_length)``
            tokens: list of tokens
    """

    vis_html = """
      <div id='vis'></div> 
    """

    display(HTML(vis_html))
    __location__ = os.path.realpath(
        os.path.join(os.getcwd(), os.path.dirname(__file__)))
    vis_js = open(os.path.join(__location__, 'model_view.js')).read()

    if prettify_tokens:
        tokens = format_special_chars(tokens)
    formatted_attention = format_attention(attention)
    attn_seq_len = len(formatted_attention[0][0])
    if attn_seq_len != len(tokens):
        raise ValueError(f"Attention has {attn_seq_len} positions, while number of tokens is {len(tokens)}")
    attn_data = {
        'all': {
            'attn': formatted_attention,
            'left_text': tokens,
            'right_text': tokens
        }
    }
    params = {
        'attention': attn_data,
        'default_filter': "all"
    }
    display(Javascript('window.params = %s' % json.dumps(params)))
    display(Javascript(vis_js))