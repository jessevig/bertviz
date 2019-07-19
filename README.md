# BertViz

Tool for visualizing attention in BERT, GPT-2, and XLNet. Extends [Tensor2Tensor visualization tool](https://github.com/tensorflow/tensor2tensor/tree/master/tensor2tensor/visualization) by [Llion Jones](https://medium.com/@llionj) and [pytorch-transformers](https://github.com/huggingface/pytorch-transformers) from [HuggingFace](https://github.com/huggingface).

Blog posts:
* [OpenAI GPT-2: Understanding Language Generation through Visualization](https://towardsdatascience.com/openai-gpt-2-understanding-language-generation-through-visualization-8252f683b2f8)
* [Deconstructing BERT: Distilling 6 Patterns from 100 Million Parameters](https://towardsdatascience.com/deconstructing-bert-distilling-6-patterns-from-100-million-parameters-b49113672f77)
* [Deconstructing BERT Part 2: Visualizing the Inner Workings of Attention](https://towardsdatascience.com/deconstructing-bert-part-2-visualizing-the-inner-workings-of-attention-60a16d86b5c1)

Paper:
* [A Multiscale Visualization of Attention in the Transformer Model](https://arxiv.org/pdf/1906.05714.pdf)

## Attention-head view

The *attention-head view* visualizes the attention patterns produced by one or more attention heads in a given transformer layer.

![Attention-head view](https://raw.githubusercontent.com/jessevig/bertviz/master/images/attention_head_thumbnail.jpeg)

 BERT:
 [[Notebook]](https://github.com/jessevig/bertviz/blob/master/head_view_bert.ipynb)
  [[Colab]](https://colab.research.google.com/drive/18cHLnifWDO-fPXzySfZfi_2tZfzOGj0I)<br>
 GPT-2:
  [[Notebook]](https://github.com/jessevig/bertviz/blob/master/head_view_gpt2.ipynb)
[[Colab]](https://colab.research.google.com/drive/1YY8I0TY-l6s5i7IJ8Us2OJ8O6o6gb_1H)<br>
 XLNet: [[Notebook]](https://github.com/jessevig/bertviz/blob/master/head_view_xlnet.ipynb)
[[Colab]](https://colab.research.google.com/drive/16IIiEZSux5WKl_dIdDgbSDwWDauaY-Yl)

## Model view 

The *model view* provides a birds-eye view of attention across all of the model’s layers  and heads.

![Model view](https://raw.githubusercontent.com/jessevig/bertviz/master/images/model_thumbnail.png)

BERT: [[Notebook]](https://github.com/jessevig/bertviz/blob/master/model_view_bert.ipynb)
[[Colab]](https://colab.research.google.com/drive/1XztAoiWCALh1Gda8VxrA4R5_IfrwCvRu)<br>
GPT-2
[[Notebook]](https://github.com/jessevig/bertviz/blob/master/model_view_gpt2.ipynb)
[[Colab]](https://colab.research.google.com/drive/1ul6VNBv156m33ZgFbrKB6RdqEJ7-pfbo)<br>
 XLNet: [[Notebook]](https://github.com/jessevig/bertviz/blob/master/head_view_xlnet.ipynb)
 [[Colab]](https://colab.research.google.com/drive/1N8WuZtrSWyaJ_UpfM1vvJZf0rufJtaXL)

## Neuron view 
The *neuron view* visualizes the individual neurons in the query and key vectors and shows how they are used to compute attention.

![Neuron view](https://raw.githubusercontent.com/jessevig/bertviz/master/images/neuron_thumbnail.png)

BERT: [[Notebook]](https://github.com/jessevig/bertviz/blob/master/neuron_view_bert.ipynb) 
[[Colab]](https://colab.research.google.com/drive/1VnmBBpZgKat1rxJhKALNIBJkSogOFH-V)<br>
GPT-2
[[Notebook]](https://github.com/jessevig/bertviz/blob/master/neuron_view_gpt2.ipynb) 
[[Colab]](https://colab.research.google.com/drive/10l_0rZ3lQWPIyqzasPwzGGJTn898aD4d)


## Requirements

* [PyTorch](https://pytorch.org/) >=0.4.1
* [Jupyter](https://jupyter.org/install)
* [tqdm](https://pypi.org/project/tqdm/)
* [boto3](https://pypi.org/project/boto3/)
* [IPython](https://pypi.org/project/ipython/)
* [requests](https://pypi.org/project/requests/)
* [regex](https://pypi.org/project/regex/)
* [sentencepiece](https://pypi.org/project/sentencepiece/)

(See [requirements.txt](https://github.com/jessevig/bertviz/blob/master/requirements.txt))

## Execution

```
git clone https://github.com/jessevig/bertviz.git
cd bertviz
jupyter notebook
```

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
