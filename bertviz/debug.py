from bertviz.visualization import AttentionVisualizer
from bertviz.attention import _get_attentions, show
from bertviz.pytorch_pretrained_bert import BertTokenizer, BertModel, BertConfig
import numpy as np
import unittest


config = BertConfig.from_json_file('tests/fixtures/config.json')
model = BertModel(config)
tokenizer = BertTokenizer('tests/fixtures/vocab.txt')
attention_visualizer = AttentionVisualizer(model, tokenizer)
sentence1 = 'The quickest brown fox jumped over the lazy dog'
sentence2 = "the quick brown fox jumped over the laziest lazy elmo"
tokens_a, tokens_b, attn = attention_visualizer.get_viz_data(sentence1, sentence2)
show(tokens_a, tokens_b, attn)