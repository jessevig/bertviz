from bertviz.attention_details import AttentionDetailsData, _get_attention_details
from bertviz.pytorch_pretrained_bert import BertTokenizer, BertModel, BertConfig
import numpy as np
import unittest


class TestAttentionDetails(unittest.TestCase):

    def setUp(self):
        self.config = BertConfig.from_json_file('fixtures/config.json')
        model = BertModel(self.config)
        tokenizer = BertTokenizer('fixtures/vocab.txt')
        self.attention_details_data = AttentionDetailsData(model, tokenizer)

    def test_get_inputs(self):
        sentence1 = 'The quickest brown fox jumped over the lazy dog'
        tokens_ids1 = [2, 3, 4, 5, 6, 8, 9, 2, 14, 12]
        sentence2 = "the quick brown fox jumped over the laziest lazy elmo"
        token_ids2 = [2, 3, 5, 6, 8, 9, 2, 15, 10, 11, 14, 1]
        tokens_tensor, token_type_tensor, tokens_a, tokens_b = self.attention_details_data._get_inputs(sentence1, sentence2)
        cls_id = 17
        sep_id = 16
        self.assertEqual(tokens_tensor.tolist()[0],
                         [cls_id] + tokens_ids1 + [sep_id] + token_ids2 + [sep_id])
        self.assertEqual(token_type_tensor.tolist()[0],
                         ([0] * 12) + ([1] * 13))

    def test_get_data(self):
        sentence1 = 'The quickest brown fox jumped over the lazy dog'
        tokens1 = ['the', 'quick', '##est', 'brown', 'fox', 'jumped', 'over', 'the', 'lazy', 'dog']
        sentence2 = "the quick brown fox jumped over the laziest lazy elmo"
        tokens2 = ['the', 'quick', 'brown', 'fox', 'jumped', 'over', 'the', 'la', '##zie', '##st', 'lazy', '[UNK]']
        tokens_a, tokens_b, queries, keys, atts = self.attention_details_data.get_data(sentence1, sentence2)
        self.assertEqual(tokens_a, ['[CLS]'] + tokens1 + ['[SEP]'])
        self.assertEqual(tokens_b, tokens2 + ['[SEP]'])
        batch_size = 1
        query_key_size = self.config.hidden_size / self.config.num_attention_heads
        seq_len = len(tokens_a) + len(tokens_b)
        expected_shape = (self.config.num_hidden_layers, batch_size, self.config.num_attention_heads, seq_len, query_key_size)
        self.assertEqual(queries.shape, expected_shape)
        self.assertEqual(keys.shape, expected_shape)
        expected_shape = (self.config.num_hidden_layers, batch_size, self.config.num_attention_heads, seq_len, seq_len)
        self.assertEqual(atts.shape, expected_shape)

    def test_get_attention_details(self):
        sentence1 = 'The quickest brown fox jumped over the lazy dog'
        sentence2 = "the quick brown fox jumped over the laziest lazy elmo"
        tokens_a, tokens_b, queries, keys, atts = self.attention_details_data.get_data(sentence1, sentence2)
        attention_details = _get_attention_details(tokens_a, tokens_b, queries, keys, atts)
        queries_squeezed = np.squeeze(queries)
        expected_all_queries = queries_squeezed.tolist()
        self.assertEqual(attention_details['all']['queries'], expected_all_queries)
        keys_squeezed = np.squeeze(keys)
        expected_all_keys = keys_squeezed.tolist()
        self.assertEqual(attention_details['all']['keys'], expected_all_keys)
        num_layers = self.config.num_hidden_layers
        num_heads = self.config.num_attention_heads
        vector_size = self.config.hidden_size / num_heads
        self.assertEqual(np.array(attention_details['aa']['queries']).shape,
                         (num_layers, num_heads, len(tokens_a), vector_size))
        self.assertEqual(np.array(attention_details['aa']['keys']).shape,
                         (num_layers, num_heads, len(tokens_a), vector_size))
        self.assertEqual(np.array(attention_details['bb']['queries']).shape,
                         (num_layers, num_heads, len(tokens_b), vector_size))
        self.assertEqual(np.array(attention_details['bb']['keys']).shape,
                         (num_layers, num_heads, len(tokens_b), vector_size))
        self.assertEqual(np.array(attention_details['ab']['queries']).shape,
                         (num_layers, num_heads, len(tokens_a), vector_size))
        self.assertEqual(np.array(attention_details['ab']['keys']).shape,
                         (num_layers, num_heads, len(tokens_b), vector_size))
        self.assertEqual(np.array(attention_details['ba']['queries']).shape,
                         (num_layers, num_heads, len(tokens_b), vector_size))
        self.assertEqual(np.array(attention_details['ba']['keys']).shape,
                         (num_layers, num_heads, len(tokens_a), vector_size))

        atts_squeezed = np.squeeze(atts)
        expected_all_attention = atts_squeezed.tolist()
        self.assertEqual(attention_details['all']['att'], expected_all_attention)
        attn_a = np.array(attention_details['aa']['att'])
        attn_b = np.array(attention_details['bb']['att'])
        attn_ab = np.array(attention_details['ab']['att'])
        attn_ba = np.array(attention_details['ba']['att'])
        expected_top_half = atts_squeezed[:, :, :len(tokens_a), :]
        top_half = np.concatenate((attn_a, attn_ab), axis=-1)
        self.assertEqual(top_half.shape, expected_top_half.shape)
        self.assertTrue(np.array_equal(top_half, expected_top_half))
        expected_bottom_half = atts_squeezed[:, :, len(tokens_a):, :]
        bottom_half = np.concatenate((attn_ba, attn_b), axis=-1)
        self.assertEqual(bottom_half.shape, expected_bottom_half.shape)
        all = np.concatenate((top_half, bottom_half), axis=-2)
        self.assertEqual(all.shape, atts_squeezed.shape)
        self.assertTrue(np.allclose(all, atts_squeezed, atol=1e-06))


if __name__ == "__main__":
    unittest.main()

