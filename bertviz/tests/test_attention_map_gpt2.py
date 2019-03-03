from bertviz.attention_details import AttentionDetailsData, _get_attention_details
from bertviz.attention_map_gpt2 import AttentionMapGPT2Data
from bertviz.pytorch_pretrained_bert import BertTokenizer, BertModel, BertConfig, GPT2Model, GPT2Tokenizer
import numpy as np
import unittest


class TestAttentionMapGPT2(unittest.TestCase):

    def setUp(self):
        model = GPT2Model.from_pretrained('gpt2')
        tokenizer = GPT2Tokenizer.from_pretrained('gpt2')
        self.attention_map_data = AttentionMapGPT2Data(model, tokenizer)

    def test_get_data(self):
        text = 'the cat sat on the mat'
        tokens, atts = self.attention_map_data.get_data(text)
        self.assertEqual(tokens, ['the', 'cat', 'sat', 'on', 'the', 'mat'] )
        batch_size = 1
        num_layers = 12
        num_heads = 12
        seq_len = len(tokens)
        expected_shape = num_layers, batch_size, num_heads, seq_len, seq_len
        self.assertEqual(atts.shape, expected_shape)
        att_matrix = atts[0][0][0]
        for i in range(seq_len):
            for j in range(seq_len):
                if i >= j:
                    self.assertNotEqual(att_matrix[i][j], 0)
                else:
                    self.assertEqual(att_matrix[i][j], 0)
        sum_probs = att_matrix.sum(axis=-1)
        self.assertTrue(np.allclose(sum_probs, 1))


if __name__ == "__main__":
    unittest.main()

