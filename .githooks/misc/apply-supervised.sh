#!/usr/bin/env bash




if git rev-parse --is-inside-work-tree >/dev/null 2>&1
then
    GIT_ROOT=$(git root)
    if git checkout supervised/template
    then
        if git ipull git@github.com:sharad/portablehome-org-template.git supervised/template
        then
            git status -uno
            if git checkout master
            then
                git imerge supervised/template
            fi
        fi
    else
        echo Can not chnage to supervised/template branch
    fi
else
    echo $(pwd) is not git repository
fi
