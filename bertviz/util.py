def format_attention(attention):
    formatted = []
    for layer_attention in attention:
        # num_heads x seq_len x seq_len
        layer_attention = layer_attention.squeeze(0)
        formatted.append(layer_attention.tolist())
    # List of shape num_layers x num_heads x seq_len x seq_len
    return formatted

def format_special_chars(tokens):
    return [t.replace('Ġ', ' ').replace('▁', ' ') for t in tokens]
