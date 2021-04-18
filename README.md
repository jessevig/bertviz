# BertViz

BertViz is a tool for visualizing attention in the Transformer model, supporting most models from the [transformers](https://github.com/huggingface/transformers) library (BERT, GPT-2, XLNet, RoBERTa, XLM, CTRL, etc.). It extends the [Tensor2Tensor visualization tool](https://github.com/tensorflow/tensor2tensor/tree/master/tensor2tensor/visualization) by [Llion Jones](https://medium.com/@llionj) and the [transformers](https://github.com/huggingface/transformers) library from [HuggingFace](https://github.com/huggingface).

## Resources

🕹️ [<b>Colab tutorial</b>](https://colab.research.google.com/drive/1YoJqS9cPGu3HL2_XExw3kCsRBtySQS2v?usp=sharing)

✍️ [<b>Blog post</b>](https://towardsdatascience.com/deconstructing-bert-part-2-visualizing-the-inner-workings-of-attention-60a16d86b5c1) 

📖 [<b>Paper</b>](https://www.aclweb.org/anthology/P19-3007.pdf)


## Overview

### Head View
The *head view* visualizes the attention patterns produced by one or more attention heads in a given 
transformer layer. It is based on the excellent [Tensor2Tensor visualization tool](https://github.com/tensorflow/tensor2tensor/tree/master/tensor2tensor/visualization) by [Llion Jones](https://medium.com/@llionj). 

🕹 Try out this [interactive Colab Notebook](https://colab.research.google.com/drive/1PEHWRHrvxQvYr9NFRC-E_fr3xDq1htCj)
 with the head view pre-loaded.

![head view](https://raw.githubusercontent.com/jessevig/bertviz/master/images/head-view.gif) 

The head view supports all models from the Transformers library, including:  
BERT: [[Notebook]](head_view_bert.ipynb)
  [[Colab]](https://colab.research.google.com/drive/1PEHWRHrvxQvYr9NFRC-E_fr3xDq1htCj)  
GPT-2:
  [[Notebook]](head_view_gpt2.ipynb)
[[Colab]](https://colab.research.google.com/drive/1c9kBsbvSqpKkmd62u7nfqVhvWr0W8_Lx)  
XLNet: [[Notebook]](head_view_xlnet.ipynb)  
RoBERTa: [[Notebook]](head_view_roberta.ipynb)  
XLM: [[Notebook]](head_view_xlm.ipynb)  
ALBERT: [[Notebook]](head_view_albert.ipynb)  
DistilBERT: [[Notebook]](head_view_distilbert.ipynb)
(and others)

### Model View 

The *model view* provides a birds-eye view of attention across all of the model’s layers  and heads.

🕹 Try out this [interactive Colab Notebook](https://colab.research.google.com/drive/1c73DtKNdl66B0_HF7QXuPenraDp0jHRS) with
 the model view pre-loaded.

![model view](https://github.com/jessevig/bertviz/raw/master/images/model-view-dark.gif)

The model view supports all models from the Transformers library, including:  
BERT: [[Notebook]](model_view_bert.ipynb)
[[Colab]](https://colab.research.google.com/drive/1c73DtKNdl66B0_HF7QXuPenraDp0jHRS)  
GPT2: [[Notebook]](model_view_gpt2.ipynb)
[[Colab]](https://colab.research.google.com/drive/1y-wfC95Z0aASawYqA34LQeV0_qC9mOto)  
XLNet: [[Notebook]](model_view_xlnet.ipynb)  
RoBERTa: [[Notebook]](model_view_roberta.ipynb)  
XLM: [[Notebook]](model_view_xlm.ipynb)  
ALBERT: [[Notebook]](model_view_albert.ipynb)  
DistilBERT: [[Notebook]](model_view_distilbert.ipynb) 
(and others)

### Neuron View 
The *neuron view* visualizes the individual neurons in the query and key vectors and shows how they are used to compute attention.

🕹 Try out this [interactive Colab Notebook](https://colab.research.google.com/drive/1m37iotFeubMrp9qIf9yscXEL1zhxTN2b)
 with the neuron view pre-loaded (requires Chrome).

![neuron view](https://github.com/jessevig/bertviz/raw/master/images/neuron-view-dark.gif)

The neuron view supports the following three models:  
BERT: [[Notebook]](neuron_view_bert.ipynb) 
[[Colab]](https://colab.research.google.com/drive/1m37iotFeubMrp9qIf9yscXEL1zhxTN2b)  
GPT-2 [[Notebook]](neuron_view_gpt2.ipynb) 
[[Colab]](https://colab.research.google.com/drive/1s8XCCyxsKvNRWNzjWi5Nl8ZAYZ5YkLm_)  
RoBERTa
[[Notebook]](neuron_view_roberta.ipynb) 

## Installation
```
pip install bertviz
```
You must also have [Jupyter Notebook](https://jupyter.org/install) installed.

## Execution

First start Jupyter Notebook:

```
jupyter notebook
```

Click *New* to start a Jupter notebook, then follow the instructions below.

### Head view / model view
First load a Huggingface model, either a pre-trained model as shown below, or your own fine-tuned model. Be sure to set `output_attention=True`.
```
from transformers import AutoTokenizer, AutoModel
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
model = AutoModel.from_pretrained("bert-base-uncased", output_attentions=True)
inputs = tokenizer.encode("The cat sat on the mat", return_tensors='pt')
outputs = model(inputs)
attention = outputs[-1]  # Output includes attention weights when output_attentions=True
tokens = tokenizer.convert_ids_to_tokens(inputs[0]) 
```

Then display the returned attention weights using the BertViz `head_view` or `model_view` function:

```
from bertviz import head_view
head_view(attention, tokens)
```

For more advanced use cases, e.g., specifying a two-sentence input to the model, please refer to the
 sample notebooks.

### Neuron view

The neuron view is invoked differently than the head view or model view, due to requiring access to the model's
query/key vectors, which are not returned through the Huggingface API. It is currently limited to custom versions of BERT, GPT-2, and
RoBERTa included with BertViz.

```
# Import specialized versions of models (that return query/key vectors)
from bertviz.transformers_neuron_view import BertModel, BertTokenizer

from bertviz.neuron_view import show

model = BertModel.from_pretrained(model_version, output_attentions=True)
tokenizer = BertTokenizer.from_pretrained(model_version, do_lower_case=do_lower_case)
model_type = 'bert'
show(model, model_type, tokenizer, sentence_a, sentence_b, layer=2, head=0)
```

### Running a sample notebook

```
git clone https://github.com/jessevig/bertviz.git
cd bertviz
jupyter notebook
```

Click on any of the sample notebooks. You can view a notebook's cached output visualizations by selecting `File > Trust Notebook` (and confirming in dialog)
or you can run the notebook yourself. Note that the sample notebooks do not cover all Huggingface models, but the code should be similar for those not included. 


### Advanced options
#### Pre-selecting layer/head(s)

For the head view, you may pre-select a specific `layer` and collection of `heads`, e.g.:

```
head_view(attention, tokens, layer=2, heads=[3,5])
```

You may also pre-select a specific `layer` and single `head` for the neuron view.

#### Dark/light mode

The model view and neuron view support dark (default) and light modes. You may turn off dark mode in these views using
the `display_mode` parameter:

```
model_view(attention, tokens, display_mode="light")
```

#### Non-huggingface models

The `head_view` and `model_view` functions may technically be used to visualize self-attention for any Transformer model,
as long as the attention weights are available and follow the format specified in `model_view` and `head_view` (which is the format 
returned from Huggingface models). In some case, Tensorflow checkpoints may be loaded as Huggingface models as described in the
 [Huggingface docs](https://huggingface.co/transformers/). 
 
 
## Limitations

### Tool
* The visualizations works best with shorter inputs (e.g. a single sentence) and may run slowly if the input text is very long, especially for the model view.
* When running on Colab, some of the visualizations will fail (runtime disconnection) when the input text is long.
* The neuron view only supports the custom BERT, GPT-2, and RoBERTa models included with the tool. This view needs access to the query and key vectors, 
which required modifying the model code (see `transformers_neuron_view directory`), which has only been done for these three models.
Also, only one neuron view may be included per notebook.
* The visualization doesn't currently support sequence-to-sequence models out of the box. 
### Attention as "explanation"
Visualizing attention weights illuminates a particular mechanism within the model architecture but does not
necessarily provide a direct *explanation* for model predictions. See [[1](https://arxiv.org/pdf/1909.11218.pdf)], [[2](https://arxiv.org/abs/1902.10186)], [[3](https://arxiv.org/pdf/1908.04626.pdf)].

## Authors

[Jesse Vig](https://jessevig.com)

## Citation

When referencing BertViz, please cite [this paper](https://www.aclweb.org/anthology/P19-3007.pdf).

```
@inproceedings{vig-2019-multiscale,
    title = "A Multiscale Visualization of Attention in the Transformer Model",
    author = "Vig, Jesse",
    booktitle = "Proceedings of the 57th Annual Meeting of the Association for Computational Linguistics: System Demonstrations",
    month = jul,
    year = "2019",
    address = "Florence, Italy",
    publisher = "Association for Computational Linguistics",
    url = "https://www.aclweb.org/anthology/P19-3007",
    doi = "10.18653/v1/P19-3007",
    pages = "37--42",
}
```

## License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details

## Acknowledgments
We are grateful to the authors of the following projects, which are incorporated into this repo:
* https://github.com/tensorflow/tensor2tensor
* https://github.com/huggingface/pytorch-pretrained-BERT
