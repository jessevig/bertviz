# BertViz

BertViz is a tool for visualizing attention in the [Transformer](https://jalammar.github.io/illustrated-transformer/) model, supporting most models from the
 [transformers](https://github.com/huggingface/transformers) library (BERT, GPT-2, XLNet, RoBERTa, XLM, CTRL, BART,
  etc.). It extends the
   [Tensor2Tensor visualization tool](https://github.com/tensorflow/tensor2tensor/tree/master/tensor2tensor/visualization)
    by [Llion Jones](https://medium.com/@llionj) and the [transformers](https://github.com/huggingface/transformers) library from [HuggingFace](https://github.com/huggingface).

[⚡️ <b>Quickstart</b>](#---getting-started)
| 🕹️ [<b>Colab tutorial</b>](https://colab.research.google.com/drive/1YoJqS9cPGu3HL2_XExw3kCsRBtySQS2v?usp=sharing)
| 📖 [<b>Documentation</b>](#---documentation)
| ✍️ [<b>Blog post</b>](https://towardsdatascience.com/deconstructing-bert-part-2-visualizing-the-inner-workings-of-attention-60a16d86b5c1) 
| 🔬 [<b>Paper</b>](#---paper)

## Quick Tour

### Head View
The *head view* visualizes the attention patterns produced by one or more attention heads in a given 
transformer layer. It is based on the excellent [Tensor2Tensor visualization tool](https://github.com/tensorflow/tensor2tensor/tree/master/tensor2tensor/visualization) by [Llion Jones](https://medium.com/@llionj). 

🕹 Try out this [interactive Colab Notebook](https://colab.research.google.com/drive/1PEHWRHrvxQvYr9NFRC-E_fr3xDq1htCj)
 with the head view pre-loaded.

![head view](https://raw.githubusercontent.com/jessevig/bertviz/master/images/head-view.gif) 

The head view supports most models from the Transformers library. Example notebooks:  
BERT: [[Notebook]](notebooks/head_view_bert.ipynb)
  [[Colab]](https://colab.research.google.com/drive/1PEHWRHrvxQvYr9NFRC-E_fr3xDq1htCj)  
GPT-2:
  [[Notebook]](notebooks/head_view_gpt2.ipynb)
[[Colab]](https://colab.research.google.com/drive/1c9kBsbvSqpKkmd62u7nfqVhvWr0W8_Lx)  
XLNet: [[Notebook]](notebooks/head_view_xlnet.ipynb)  
RoBERTa: [[Notebook]](notebooks/head_view_roberta.ipynb)  
XLM: [[Notebook]](notebooks/head_view_xlm.ipynb)  
ALBERT: [[Notebook]](notebooks/head_view_albert.ipynb)  
DistilBERT: [[Notebook]](notebooks/head_view_distilbert.ipynb)   
BART (encoder-decoder): [[Notebook]](notebooks/head_view_bart.ipynb)

### Model View 

The *model view* provides a birds-eye view of attention across all of the model’s layers  and heads.

🕹 Try out this [interactive Colab Notebook](https://colab.research.google.com/drive/1c73DtKNdl66B0_HF7QXuPenraDp0jHRS) with
 the model view pre-loaded.

![model view](https://github.com/jessevig/bertviz/raw/master/images/model-view-dark.gif)

The model view supports most models from the Transformers library. Examples:  
BERT: [[Notebook]](notebooks/model_view_bert.ipynb)
[[Colab]](https://colab.research.google.com/drive/1c73DtKNdl66B0_HF7QXuPenraDp0jHRS)  
GPT2: [[Notebook]](notebooks/model_view_gpt2.ipynb)
[[Colab]](https://colab.research.google.com/drive/1y-wfC95Z0aASawYqA34LQeV0_qC9mOto)  
XLNet: [[Notebook]](notebooks/model_view_xlnet.ipynb)  
RoBERTa: [[Notebook]](notebooks/model_view_roberta.ipynb)  
XLM: [[Notebook]](notebooks/model_view_xlm.ipynb)  
ALBERT: [[Notebook]](notebooks/model_view_albert.ipynb)  
DistilBERT: [[Notebook]](notebooks/model_view_distilbert.ipynb)   
BART (encoder-decoder): [[Notebook]](notebooks/model_view_bart.ipynb)

### Neuron View 
The *neuron view* visualizes the individual neurons in the query and key vectors and shows how they are used to compute attention.

🕹 Try out this [interactive Colab Notebook](https://colab.research.google.com/drive/1m37iotFeubMrp9qIf9yscXEL1zhxTN2b)
 with the neuron view pre-loaded.

![neuron view](https://github.com/jessevig/bertviz/raw/master/images/neuron-view-dark.gif)

The neuron view supports the following three models:  
BERT: [[Notebook]](notebooks/neuron_view_bert.ipynb) 
[[Colab]](https://colab.research.google.com/drive/1m37iotFeubMrp9qIf9yscXEL1zhxTN2b)  
GPT-2 [[Notebook]](notebooks/neuron_view_gpt2.ipynb) 
[[Colab]](https://colab.research.google.com/drive/1s8XCCyxsKvNRWNzjWi5Nl8ZAYZ5YkLm_)  
RoBERTa
[[Notebook]](notebooks/neuron_view_roberta.ipynb) 

## ⚡️ Getting Started

### Installation

```bash
pip install bertviz
```
You must also have Jupyter Notebook and ipywidgets installed in order to run BertViz in a notebook:

```bash
pip install jupyterlab
pip install ipywidgets
```
For more details on installing Jupyter or ipywidgets, consult the documentation [here](https://jupyter.org/install) and [here](https://ipywidgets.readthedocs.io/en/stable/user_install.html).

### Quickstart

Start Jupyter Notebook:

```bash
jupyter notebook
```

Click *New* to create a new notebook.

Add the following cell:

```python
from transformers import AutoTokenizer, AutoModel, utils
from bertviz import model_view

utils.logging.set_verbosity_error()  # Remove line to see warnings
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
model = AutoModel.from_pretrained("distilbert-base-uncased", output_attentions=True)
inputs = tokenizer.encode("The cat sat on the mat", return_tensors='pt')
outputs = model(inputs)
attention = outputs[-1]  # Output includes attention weights when output_attentions=True
tokens = tokenizer.convert_ids_to_tokens(inputs[0]) 
model_view(attention, tokens)
```

And run it! The visualization may take a few seconds to load.

### Running example notebooks

You may also run any of the sample [notebooks](notebooks/):

```bash
git clone --depth 1 git@github.com:jessevig/bertviz.git
cd bertviz/notebooks
jupyter notebook
```
 
## 📖 Documentation

### Table of Contents

- [Self-Attention Models (BERT, GPT-2, etc.)](#self-attention-models--bert--gpt-2--etc-)
  * [Head and Model Views](#head-and-model-views)
  * [Neuron View](#neuron-view)
- [Encoder-Decoder Models (BART, MarianMT, etc.)](#encoder-decoder-models--bart--marianmt--etc-)
- [Installing from source](#installing-from-source)
- [Additional options](#additional-options)
  * [Dark / light mode](#dark---light-mode)
  * [Filtering layers](#filtering-layers)
  * [Setting default layer/head(s)](#setting-default-layer-head-s-)
  * [Non-Huggingface models](#non-huggingface-models)

### Self-Attention Models (BERT, GPT-2, etc.)

#### Head and Model Views
First load a Huggingface model, either a pre-trained model as shown below, or your own fine-tuned model.
 Be sure to set `output_attention=True`.
```python
from transformers import AutoTokenizer, AutoModel, utils
utils.logging.set_verbosity_error()  # Remove this line to see warnings
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
model = AutoModel.from_pretrained("bert-base-uncased", output_attentions=True)
```

Then prepare inputs and compute attention:

```python
inputs = tokenizer.encode("The cat sat on the mat", return_tensors='pt')
outputs = model(inputs)
attention = outputs[-1]  # Output includes attention weights when output_attentions=True
tokens = tokenizer.convert_ids_to_tokens(inputs[0]) 
```

Finally, display the attention weights using the `head_view` or `model_view` function:

```python
from bertviz import head_view
head_view(attention, tokens)
```

For more advanced use cases, e.g., specifying a two-sentence input to the model, please refer to the
 sample notebooks.

#### Neuron View

The neuron view is invoked differently than the head view or model view, due to requiring access to the model's
query/key vectors, which are not returned through the Huggingface API. It is currently limited to custom versions of BERT, GPT-2, and
RoBERTa included with BertViz.

```python
# Import specialized versions of models (that return query/key vectors)
from bertviz.transformers_neuron_view import BertModel, BertTokenizer
from bertviz.neuron_view import show

model_type = 'bert'
model_version = 'bert-base-uncased'
model = BertModel.from_pretrained(model_version, output_attentions=True)
tokenizer = BertTokenizer.from_pretrained(model_version, do_lower_case=do_lower_case)
show(model, model_type, tokenizer, sentence_a, sentence_b, layer=2, head=0)
```

### Encoder-Decoder Models (BART, MarianMT, etc.)

The head view and model view both support encoder-decoder models.

First, load an encoder-decoder model:

```python
from transformers import AutoTokenizer, AutoModel

tokenizer = AutoTokenizer.from_pretrained("Helsinki-NLP/opus-mt-en-de")
model = AutoModel.from_pretrained("Helsinki-NLP/opus-mt-en-de", output_attentions=True)
```

Then prepare the inputs and compute attention:
```python
encoder_input_ids = tokenizer("She sees the small elephant.", return_tensors="pt", add_special_tokens=True).input_ids
decoder_input_ids = tokenizer("Sie sieht den kleinen Elefanten.", return_tensors="pt", add_special_tokens=True).input_ids

outputs = model(input_ids=encoder_input_ids, decoder_input_ids=decoder_input_ids)

encoder_text = tokenizer.convert_ids_to_tokens(encoder_input_ids[0])
decoder_text = tokenizer.convert_ids_to_tokens(decoder_input_ids[0])
```

Finally, display the visualization using either `head_view` or `model_view`.
```python
from bertviz import model_view
model_view(
    encoder_attention=outputs.encoder_attentions,
    decoder_attention=outputs.decoder_attentions,
    cross_attention=outputs.cross_attentions,
    encoder_tokens= encoder_text,
    decoder_tokens = decoder_text
)
```

You may select `Encoder`, `Decoder`, or `Cross` attention from the drop-down in the upper left corner of the visualization.


### Installing from source
```bash
git clone https://github.com/jessevig/bertviz.git
cd bertviz
python setup.py develop
```

### Additional options

#### Dark / light mode

The model view and neuron view support dark (default) and light modes. You may set the mode using
the `display_mode` parameter:
```python
model_view(attention, tokens, display_mode="light")
```


#### Filtering layers

To improve the responsiveness of the tool when visualizing larger models or inputs, you may set the `include_layers`
 parameter to restrict the visualization to a subset of layers (zero-indexed). This option is available in the head view and model
view.

**Example:** Render model view with only layers 5 and 6 displayed
```python
model_view(attention, tokens, include_layers=[5, 6])
```

For the model view, you may also restrict the visualization to a subset of attention heads (zero-indexed) by setting the 
`include_heads` parameter. 


#### Setting default layer/head(s)

In the head view, you may choose a specific `layer` and collection of `heads` as the default selection when the
 visualization first renders. Note: this is different from the `include_heads`/`include_layers` parameter (above), which 
 removes layers and heads from the visualization completely.

**Example:** Render head view with layer 2 and heads 3 and 5 pre-selected
```python
head_view(attention, tokens, layer=2, heads=[3,5])
```

You may also pre-select a specific `layer` and single `head` for the neuron view. 

#### Non-Huggingface models

The `head_view` and `model_view` functions may technically be used to visualize self-attention for any Transformer model,
as long as the attention weights are available and follow the format specified in `model_view` and `head_view` (which is the format 
returned from Huggingface models). In some case, Tensorflow checkpoints may be loaded as Huggingface models as described in the
 [Huggingface docs](https://huggingface.co/transformers/). 
 
 
## ⚠️ Limitations

### Tool
* This tool is designed for shorter inputs and may run slowly if the input text is very long and/or the model is very large.
 To mitigate this, you may wish to filter the layers displayed by setting the **`include_layers`** parameter, as described [above](#filtering-layers).
* When running on Colab, some of the visualizations will fail (runtime disconnection) when the input text is long.  To mitigate this, you may wish to filter the layers displayed by setting the **`include_layers`** parameter, as described [above](#filtering-layers).
* The *neuron view* only supports the custom BERT, GPT-2, and RoBERTa models included with the tool. This view needs access to the query and key vectors, 
which required modifying the model code (see `transformers_neuron_view` directory), which has only been done for these three models.
Also, only one neuron view may be included per notebook.

### Attention as "explanation"
Visualizing attention weights illuminates a particular mechanism within the model architecture but does not
necessarily provide a direct *explanation* for model predictions. See [[1](https://arxiv.org/pdf/1909.11218.pdf), [2](https://arxiv.org/abs/1902.10186), [3](https://arxiv.org/pdf/1908.04626.pdf)].

## 👋 Authors

Jesse Vig [(homepage)](https://jessevig.com)

## 🔬 Paper

[<b>A Multiscale Visualization of Attention in the Transformer Model</b>](https://www.aclweb.org/anthology/P19-3007.pdf) (ACL 2019 System Demonstrations).


### Citation
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

## 🙏 Acknowledgments
We are grateful to the authors of the following projects, which are incorporated into this repo:
* https://github.com/tensorflow/tensor2tensor
* https://github.com/huggingface/pytorch-pretrained-BERT
