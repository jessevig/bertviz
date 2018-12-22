import torch


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