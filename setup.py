from setuptools import setup

setup(
    name='bertviz',
    version='0.1',
    description='Visualize attention layers in BERT',
    author='Jesse Vig',
    author_email='jesse.vig@gmail.com',
    packages=['bertviz'],
    install_requires=['torch>=0.4.1',
                      'numpy',
                      'boto3',
                      'requests',
                      'tqdm'])
