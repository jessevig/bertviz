# BertViz

Tool for visualizing attention in BERT and OpenAI GPT-2. Extends [Tensor2Tensor visualization tool](https://github.com/tensorflow/tensor2tensor/tree/master/tensor2tensor/visualization)  and [pytorch-pretrained-BERT](https://github.com/huggingface/pytorch-pretrained-BERT).

Blog posts:
* [Deconstructing BERT: Distilling 6 Patterns from 100 Million Parameters](https://towardsdatascience.com/deconstructing-bert-distilling-6-patterns-from-100-million-parameters-b49113672f77)
* [Deconstructing BERT Part 2: Visualizing the Inner Workings of Attention](https://towardsdatascience.com/deconstructing-bert-part-2-visualizing-the-inner-workings-of-attention-60a16d86b5c1)
* [OpenAI GPT-2: Understanding Language Generation through Visualization](https://towardsdatascience.com/openai-gpt-2-understanding-language-generation-through-visualization-8252f683b2f8)

Paper:
* [Visualizing Attention in Transformer-Based Language Representation Models](https://arxiv.org/pdf/1904.02679.pdf)

## Attention-head view

The *attention-head view* visualizes the attention patterns produced by one or more attention heads in a given transformer layer.

![Attention-head view](https://raw.githubusercontent.com/jessevig/bertviz/master/images/attention_head_thumbnail.jpeg)

 BERT:
 [[Notebook]](https://github.com/jessevig/bertviz/blob/master/bertviz_summary.ipynb)
  [[Colab]](https://colab.research.google.com/drive/1vlOJ1lhdujVjfH857hvYKIdKPTD9Kid8)
  
 OpenAI GPT-2:
  [[Notebook]](https://github.com/jessevig/bertviz/blob/master/bertviz_summary_gpt2.ipynb)
[[Colab]](https://colab.research.google.com/drive/1AcE98QfdpHK47YkYvzNeY0BO2nx5CEpc)

## Model view 

The *model view* provides a birds-eye view of attention across all of the model’s layers  and heads.

![Model view](https://raw.githubusercontent.com/jessevig/bertviz/master/images/model_thumbnail.png)

BERT: [[Notebook]](https://github.com/jessevig/bertviz/blob/master/bertviz_map.ipynb)
[[Colab]](https://colab.research.google.com/drive/1OmKa1PHPt5fzGmxstDObn5acUrdvjA_j)

OpenAI GPT-2
[[Notebook]](https://github.com/jessevig/bertviz/blob/master/bertviz_map_gpt2.ipynb)
[[Colab]](https://colab.research.google.com/drive/1RL5JYIUaVrSsyPDxyn6wBZn6W4JRnNoH)


## Neuron view 
The *neuron view* visualizes the individual neurons in the query and key vectors and shows how they are used to compute attention.

![Neuron view](https://raw.githubusercontent.com/jessevig/bertviz/master/images/neuron_thumbnail.png)

BERT: [[Notebook]](https://github.com/jessevig/bertviz/blob/master/bertviz_detail.ipynb) 
[[Colab]](https://colab.research.google.com/drive/1Nlhh2vwlQdKleNMqpmLDBsAwrv_7NnrB)


OpenAI GPT-2
[[Notebook]](https://github.com/jessevig/bertviz/blob/master/bertviz_detail_gpt2.ipynb) 
[[Colab]](https://colab.research.google.com/drive/12qHRVqfefS8kdmZ605q1SULQ6z3q2lF-)


## Authors

* [Jesse Vig](https://github.com/jessevig)

## Citation

When referencing BertViz, please cite [this paper](https://arxiv.org/abs/1904.02679).

```
@article{vig2019transformervis,
  author    = {Jesse Vig},
  title     = {Visualizing Attention in Transformer-Based Language Representation Models},
  journal   = {arXiv preprint arXiv:1904.02679},
  year      = {2019},
  url       = {https://arxiv.org/abs/1904.02679}
}
```

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

This project incorporates code from the following repos:
* https://github.com/tensorflow/tensor2tensor
* https://github.com/huggingface/pytorch-pretrained-BERT
