import torch
from collections import defaultdict

def get_attention(model, tokenizer, text, include_queries_and_keys=False):

    """Compute representation of the attention to pass to the d3 visualization

    Args:
      model: pytorch_transformers model
      tokenizer: pytorch_transformers tokenizer
      text: Input text
      include_queries_and_keys: Indicates whether to include queries/keys in results

    Returns:
      Dictionary of attn representations with the structure:
      {
        'left_text': list of source tokens, to be displayed on the left of the vis
        'right_text': list of target tokens, to be displayed on the right of the vis
        'attn': list of attention matrices, one for each layer. Each has shape (num_heads, source_seq_len, target_seq_len)
        'queries' (optional): list of query vector arrays, one for each layer. Each has shape (num_heads, source_seq_len, vector_size)
        'keys' (optional): list of key vector arrays, one for each layer. Each has shape (num_heads, target_seq_len, vector_size)
      }
    """

    # Prepare inputs to model
    token_ids = tokenizer.encode(text)
    tokens = [tokenizer.decode([t]).strip() for t in token_ids]
    tokens_tensor = torch.tensor(token_ids).unsqueeze(0)

    # Call model to get attention data
    model.eval()
    _, _, attn_data_list = model(tokens_tensor)

    # Format attention data for visualization
    all_attns = []
    all_queries = []
    all_keys = []
    for layer, attn_data in enumerate(attn_data_list):
        attn = attn_data['attn'][0]  # assume batch_size=1; output shape = (num_heads, seq_len, seq_len)
        all_attns.append(attn.tolist())
        if include_queries_and_keys:
            queries = attn_data['queries'][0]  # assume batch_size=1; output shape = (num_heads, seq_len, vector_size)
            all_queries.append(queries.tolist())
            keys = attn_data['keys'][0]  # assume batch_size=1; output shape = (num_heads, seq_len, vector_size)
            all_keys.append(keys.tolist())
    results = {
        'attn': all_attns,
        'left_text': tokens,
        'right_text': tokens
    }
    if include_queries_and_keys:
        results.update({
            'queries': all_queries,
            'keys': all_keys,
        })
    return {'all': results}


def get_attention_bert(model, tokenizer, sentence_a, sentence_b=None, include_queries_and_keys=False, bert_type='bert'):

    """Compute representation of the attention for BERT / RoBERTa to pass to the d3 visualization

    Args:
      model: BERT/RoBERTa model
      tokenizer: BERT/RoBERTa tokenizer
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

    assert bert_type in ('bert', 'roberta')

    # Prepare inputs to model
    tokens_a = [tokenizer.cls_token] + tokenizer.tokenize(sentence_a) + [tokenizer.sep_token]
    if sentence_b:
        tokens_b = ([tokenizer.sep_token] if bert_type == 'roberta' else []) + tokenizer.tokenize(sentence_b) + [tokenizer.sep_token]
    else:
        tokens_b = []
    token_ids = tokenizer.convert_tokens_to_ids(tokens_a + tokens_b)
    tokens_tensor = torch.tensor(token_ids).unsqueeze(0)

    # Call model to get attention data
    model.eval()
    if sentence_b and bert_type != 'roberta': # Roberta doesn't use token type embeddings per https://github.com/huggingface/pytorch-transformers/blob/master/pytorch_transformers/convert_roberta_checkpoint_to_pytorch.py
        try:
            num_token_type_embeddings = model.embeddings.token_type_embeddings.num_embeddings
        except:
            pass
        else:
            if num_token_type_embeddings != 2:
                raise Exception("Model must have two token type embeddings to support sentence pair inputs")
        token_type_tensor = torch.LongTensor([[0] * len(tokens_a) + [1] * len(tokens_b)])
        output = model(tokens_tensor, token_type_ids=token_type_tensor)
    else:
        output = model(tokens_tensor)
    attn_data_list = output[-1]

    # Populate map with attn data and, optionally, query, key data
    keys_dict = defaultdict(list)
    queries_dict = defaultdict(list)
    attn_dict = defaultdict(list)
    slice_a = slice(0, len(tokens_a))  # Positions corresponding to sentence A in input
    slice_b = slice(len(tokens_a), len(tokens_a) + len(tokens_b))  # Position corresponding to sentence B in input
    for layer, attn_data in enumerate(attn_data_list):
        # Process attention
        attn = attn_data['attn'][0]  # assume batch_size=1; shape = [num_heads, source_seq_len, target_seq_len]
        attn_dict['all'].append(attn.tolist())
        if sentence_b:
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
            if sentence_b:
                queries_dict['a'].append(queries[:, slice_a, :].tolist())
                keys_dict['a'].append(keys[:, slice_a, :].tolist())
                queries_dict['b'].append(queries[:, slice_b, :].tolist())
                keys_dict['b'].append(keys[:, slice_b, :].tolist())

    tokens_a = format_tokens(tokens_a, tokenizer)
    tokens_b = format_tokens(tokens_b, tokenizer)

    results = {
        'all': {
            'attn': attn_dict['all'],
            'left_text': tokens_a + tokens_b,
            'right_text': tokens_a + tokens_b
        }
    }
    if sentence_b:
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
        if sentence_b:
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


def format_tokens(tokens, tokenizer):
    return [t.replace('Ġ', ' ').replace(tokenizer.sep_token, '[SEP]').replace(tokenizer.cls_token, '[CLS]') for t in tokens]
