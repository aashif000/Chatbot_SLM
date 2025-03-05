#!/bin/bash

# Create models directory if it doesn't exist
mkdir -p client/public/models

# Download DistilGPT-2 model
curl -L https://huggingface.co/distilgpt2/resolve/main/model.onnx -o client/public/models/distilgpt2-model.onnx

echo "Model downloaded successfully"
