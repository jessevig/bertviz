# BertViz

Tool for visualizing attention in BERT and OpenAI GPT-2. Extends [Tensor2Tensor visualization tool](https://github.com/tensorflow/tensor2tensor/tree/master/tensor2tensor/visualization) by [Llion Jones](https://medium.com/@llionj) and [pytorch-pretrained-BERT](https://github.com/huggingface/pytorch-pretrained-BERT).

Blog posts:
* [Deconstructing BERT: Distilling 6 Patterns from 100 Million Parameters](https://towardsdatascience.com/deconstructing-bert-distilling-6-patterns-from-100-million-parameters-b49113672f77)
* [Deconstructing BERT Part 2: Visualizing the Inner Workings of Attention](https://towardsdatascience.com/deconstructing-bert-part-2-visualizing-the-inner-workings-of-attention-60a16d86b5c1)
* [OpenAI GPT-2: Understanding Language Generation through Visualization](https://towardsdatascience.com/openai-gpt-2-understanding-language-generation-through-visualization-8252f683b2f8)

Paper:
* [A Multiscale Visualization of Attention in the Transformer Model](https://arxiv.org/pdf/1906.05714.pdf)

## Attention-head view

The *attention-head view* visualizes the attention patterns produced by one or more attention heads in a given transformer layer.

![Attention-head view](https://raw.githubusercontent.com/jessevig/bertviz/master/images/attention_head_thumbnail.jpeg)

 BERT:
 [[Notebook]](https://github.com/jessevig/bertviz/blob/master/head_view_bert.ipynb)
  [[Colab]](https://colab.research.google.com/drive/1g2nhY9vZG-PLC3w3dcHGqwsHBAXnD9EY)
  
 OpenAI GPT-2:
  [[Notebook]](https://github.com/jessevig/bertviz/blob/master/head_view_gpt2.ipynb)
[[Colab]](https://colab.research.google.com/drive/1kgcQlzDuVKvoqv_-MXJaleAQ8ZfZZ8aP)

## Model view 

The *model view* provides a birds-eye view of attention across all of the model’s layers  and heads.

![Model view](https://raw.githubusercontent.com/jessevig/bertviz/master/images/model_thumbnail.png)

BERT: [[Notebook]](https://github.com/jessevig/bertviz/blob/master/model_view_bert.ipynb)
[[Colab]](https://colab.research.google.com/drive/16_fS8H7tTNLWBdGL4NcYMO5xnV9EUsdL)

OpenAI GPT-2
[[Notebook]](https://github.com/jessevig/bertviz/blob/master/model_view_gpt2.ipynb)
[[Colab]](https://colab.research.google.com/drive/13_SWsQGFoUKNCZsNSP2JkxrXjT_9LCl4)


## Neuron view 
The *neuron view* visualizes the individual neurons in the query and key vectors and shows how they are used to compute attention.

![Neuron view](https://raw.githubusercontent.com/jessevig/bertviz/master/images/neuron_thumbnail.png)

BERT: [[Notebook]](https://github.com/jessevig/bertviz/blob/master/neuron_view_bert.ipynb) 
[[Colab]](https://colab.research.google.com/drive/1aiEETps5JW-yjnIkD4BO0ElKwULnf1ik)


OpenAI GPT-2
[[Notebook]](https://github.com/jessevig/bertviz/blob/master/neuron_view_gpt2.ipynb) 
[[Colab]](https://colab.research.google.com/drive/1ZdTA-cO6rSRDHYrP-Lmd-MN7SRkj3sYs)


## Authors

* [Jesse Vig](https://github.com/jessevig)

## Citation

When referencing BertViz, please cite [this paper](https://arxiv.org/abs/1906.05714).

```
@article{vig2019transformervis,
  author    = {Jesse Vig},
  title     = {A Multiscale Visualization of Attention in the Transformer Model},
  journal   = {arXiv preprint arXiv:1906.05714},
  year      = {2019},
  url       = {https://arxiv.org/abs/1906.05714}
}
```

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

This project incorporates code from the following repos:
* https://github.com/tensorflow/tensor2tensor
* https://github.com/huggingface/pytorch-pretrained-BERT
