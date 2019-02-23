from bertviz.visualization import AttentionVisualizer
from bertviz.attention import _get_attentions
from bertviz.pytorch_pretrained_bert import BertTokenizer, BertModel, BertConfig
import numpy as np
import unittest


class TestAttention(unittest.TestCase):

    def setUp(self):
        self.config = BertConfig.from_json_file('fixtures/config.json')
        model = BertModel(self.config)
        tokenizer = BertTokenizer('fixtures/vocab.txt')
        self.attention_visualizer = AttentionVisualizer(model, tokenizer)

    def test_get_attentions(self):
        sentence1 = 'The quickest brown fox jumped over the lazy dog'
        sentence2 = "the quick brown fox jumped over the laziest lazy elmo"
        tokens_a, tokens_b, attn = self.attention_visualizer.get_viz_data(sentence1, sentence2)
        attentions = _get_attentions(tokens_a, tokens_b, attn)
        attn_squeezed = np.squeeze(attn)
        expected_all_attention = attn_squeezed.tolist()
        self.assertEqual(attentions['all']['att'], expected_all_attention)
        attn_a = np.array(attentions['a']['att'])
        attn_b = np.array(attentions['b']['att'])
        attn_ab = np.array(attentions['ab']['att'])
        attn_ba = np.array(attentions['ba']['att'])
        expected_top_half = attn_squeezed[:, :, :len(tokens_a), :]
        top_half = np.concatenate((attn_a, attn_ab), axis=-1)
        self.assertEqual(top_half.shape, expected_top_half.shape)
        self.assertTrue(np.array_equal(top_half, expected_top_half))
        expected_bottom_half = attn_squeezed[:, :, len(tokens_a):, :]
        bottom_half = np.concatenate((attn_ba, attn_b), axis=-1)
        self.assertEqual(bottom_half.shape, expected_bottom_half.shape)
        self.assertTrue(np.array_equal(bottom_half, expected_bottom_half))
        all = np.concatenate((top_half, bottom_half), axis=-2)
        self.assertEqual(all.shape, attn_squeezed.shape)
        self.assertTrue(np.allclose(all, attn_squeezed, atol=1e-06))

if __name__ == "__main__":
    unittest.main()

