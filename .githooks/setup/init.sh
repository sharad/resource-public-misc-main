#!/usr/bin/env bash


if [ -d .githooks ]
then
    git lconfig core.hooksPath .githooks
    echo "✅ NOTICE: set hook path to .githooks dir in repository."
else
    echo "⚠️  WARNING: no $(pwd)/.githooks exists for setting hook path."
fi



