import torch
from collections import defaultdict


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
    if not is_sentence_pair: # Single sentence
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
            attn_dict['aa'].append(attn[:, slice_a, slice_a].tolist())  # Append A->A attention for layer, across all heads
            attn_dict['bb'].append(attn[:, slice_b, slice_b].tolist())  # Append B->B attention for layer, across all heads
            attn_dict['ab'].append(attn[:, slice_a, slice_b].tolist())  # Append A->B attention for layer, across all heads
            attn_dict['ba'].append(attn[:, slice_b, slice_a].tolist())  # Append B->A attention for layer, across all heads
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