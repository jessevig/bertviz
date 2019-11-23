# BertViz

Tool for visualizing attention in BERT, GPT-2, XLNet, and RoBERTa. Extends [Tensor2Tensor visualization tool](https://github.com/tensorflow/tensor2tensor/tree/master/tensor2tensor/visualization) by [Llion Jones](https://medium.com/@llionj) and [pytorch-transformers](https://github.com/huggingface/pytorch-transformers) from [HuggingFace](https://github.com/huggingface).

Blog posts:
* [Deconstructing BERT, Part 2: Visualizing the Inner Workings of Attention](https://towardsdatascience.com/deconstructing-bert-part-2-visualizing-the-inner-workings-of-attention-60a16d86b5c1)
* [OpenAI GPT-2: Understanding Language Generation through Visualization](https://towardsdatascience.com/openai-gpt-2-understanding-language-generation-through-visualization-8252f683b2f8)
* [Deconstructing BERT: Distilling 6 Patterns from 100 Million Parameters](https://towardsdatascience.com/deconstructing-bert-distilling-6-patterns-from-100-million-parameters-b49113672f77)


Paper:
* [A Multiscale Visualization of Attention in the Transformer Model](https://arxiv.org/pdf/1906.05714.pdf)

## Attention-head view

The *attention-head view* visualizes the attention patterns produced by one or more attention heads in a given transformer layer.

![Attention-head view](https://raw.githubusercontent.com/jessevig/bertviz/master/images/head_thumbnail_left.png) ![Attention-head view animated](https://raw.githubusercontent.com/jessevig/bertviz/master/images/head_thumbnail_right.gif)

 BERT:
 [[Notebook]](https://github.com/jessevig/bertviz/blob/master/head_view_bert.ipynb)
  [[Colab]](https://colab.research.google.com/drive/1pS-eegmUz9EqXJw22VbVIHlHoXjNaYuc)<br>
 GPT-2:
  [[Notebook]](https://github.com/jessevig/bertviz/blob/master/head_view_gpt2.ipynb)
[[Colab]](https://colab.research.google.com/drive/1qEJ4HiKy9XUKgu0t5SBNurkPAdEPnzke)<br>
 XLNet: [[Notebook]](https://github.com/jessevig/bertviz/blob/master/head_view_xlnet.ipynb)
[[Colab]](https://colab.research.google.com/drive/1zy_yHOdcz3KpCA6HYrxrEx6cL1VZ4sSq)<br>
RoBERTa: [[Notebook]](https://github.com/jessevig/bertviz/blob/master/head_view_roberta.ipynb)
[[Colab]](https://colab.research.google.com/drive/1nk72i9cwaYNujpzKoqoEoaWtB76f9a0i)

## Model view 

The *model view* provides a birds-eye view of attention across all of the model’s layers  and heads.

![Model view](https://raw.githubusercontent.com/jessevig/bertviz/master/images/model_thumbnail.jpg)

BERT: [[Notebook]](https://github.com/jessevig/bertviz/blob/master/model_view_bert.ipynb)
[[Colab]](https://colab.research.google.com/drive/1A6xDAwAY-8MGHs3sCmy1QKUjC5O9f-4K)<br>
GPT-2
[[Notebook]](https://github.com/jessevig/bertviz/blob/master/model_view_gpt2.ipynb)
[[Colab]](https://colab.research.google.com/drive/1lwo9tG1ncmCX7FAEnqSxbPVECdZRy8Nn)<br>
 XLNet: [[Notebook]](https://github.com/jessevig/bertviz/blob/master/model_view_xlnet.ipynb)
 [[Colab]](https://colab.research.google.com/drive/1u4f3GIwusU9xiIRbxOxDUlDaMUUq6-Ba)<br>
 RoBERTa: [[Notebook]](https://github.com/jessevig/bertviz/blob/master/model_view_roberta.ipynb)
 [[Colab]](https://colab.research.google.com/drive/190BnK5UPeoVrRA9VkmQxWng2-K2RhfyH)

## Neuron view 
The *neuron view* visualizes the individual neurons in the query and key vectors and shows how they are used to compute attention.

![Neuron view](https://raw.githubusercontent.com/jessevig/bertviz/master/images/neuron_thumbnail.png)

BERT: [[Notebook]](https://github.com/jessevig/bertviz/blob/master/neuron_view_bert.ipynb) 
[[Colab]](https://colab.research.google.com/drive/1m37iotFeubMrp9qIf9yscXEL1zhxTN2b)<br>
GPT-2
[[Notebook]](https://github.com/jessevig/bertviz/blob/master/neuron_view_gpt2.ipynb) 
[[Colab]](https://colab.research.google.com/drive/1s8XCCyxsKvNRWNzjWi5Nl8ZAYZ5YkLm_)<br>
RoBERTa
[[Notebook]](https://github.com/jessevig/bertviz/blob/master/neuron_view_roberta.ipynb) 
[[Colab]](https://colab.research.google.com/drive/1rsHzCWXibhp4sgfVlqE39W3UB5NnongL)


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
