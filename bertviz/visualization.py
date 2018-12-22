# coding=utf-8
# Copyright 2018 The Tensor2Tensor Authors.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
# Changes made by Jesse Vig on 12/12/18:
# - Adapted to BERT model
#


import torch

class AttentionVisualizer:

    def __init__(self, model, tokenizer):
        self.model = model
        self.tokenizer = tokenizer
        self.model.eval()

    def get_viz_data(self, sentence_a, sentence_b):
        tokens_tensor, token_type_tensor, tokens_a, tokens_b = self._get_inputs(sentence_a, sentence_b)
        attn = self._get_attention(tokens_tensor, token_type_tensor)
        return tokens_a, tokens_b, attn

    def _get_inputs(self, sentence_a, sentence_b):
        tokens_a = self.tokenizer.tokenize(sentence_a)
        tokens_b = self.tokenizer.tokenize(sentence_b)
        tokens_a_delim = ['[CLS]'] + tokens_a + ['[SEP]']
        tokens_b_delim = tokens_b + ['[SEP]']
        token_ids = self.tokenizer.convert_tokens_to_ids(tokens_a_delim + tokens_b_delim)
        tokens_tensor = torch.tensor([token_ids])
        token_type_tensor = torch.LongTensor([[0] * len(tokens_a_delim) + [1] * len(tokens_b_delim)])
        return tokens_tensor, token_type_tensor, tokens_a_delim, tokens_b_delim

    def _get_attention(self, tokens_tensor, token_type_tensor):
        _, _, attn_data_list = self.model(tokens_tensor, token_type_ids=token_type_tensor)
        attn_tensor = torch.stack([attn_data['attn_probs'] for attn_data in attn_data_list])
        return attn_tensor.data.numpy()



