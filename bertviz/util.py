import torch

def format_attention(attention):
    squeezed = []
    for layer_attention in attention:
        # num_heads x seq_len x seq_len
        squeezed.append(layer_attention.squeeze(0))
    # num_layers x num_heads x seq_len x seq_len
    return torch.stack(squeezed)

def format_special_chars(tokens):
    return [t.replace('Ġ', ' ').replace('▁', ' ').replace('</w>', '') for t in tokens]
