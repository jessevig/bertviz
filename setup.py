import pathlib
from setuptools import setup

# The directory containing this file
HERE = pathlib.Path(__file__).parent

# The text of the README file
README = (HERE / "README.md").read_text()

# This call to setup() does all the work
setup(
    name="bertviz",
    version="1.4.1",
    description="Attention visualization tool for NLP Transformer models.",
    long_description=README,
    long_description_content_type="text/markdown",
    url="https://github.com/jessevig/bertviz",
    author="Jesse Vig",
    license="Apache 2.0",
    packages=["bertviz"],
    include_package_data=True,
    install_requires=["transformers>=2.0", "torch>=1.0", "tqdm", "boto3", "requests", "regex", "sentencepiece", "IPython>=7.14"],
)