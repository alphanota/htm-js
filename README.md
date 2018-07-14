# htm-js

This is an ongoing (WIP) javascript implementation of the Hierarchical Triangular Mesh (HTM) method used to index the sphere.

It was a system developed by Szalay, et al., (https://arxiv.org/pdf/cs/0701164.pdf)

and was first used as part of the Sloan Digital Sky Survey.(http://www.skyserver.org/htm/)

There have been a couple of implementations of HTM algorithms and functions by the authors over time. Including
C, Java, and the most update current implementation C#.

However, at the time of this commit, (and to my knowledge) there are no publicly available ports of this system to javascript,
which can be easily run on a modern web browser.

##Structure of the code
The package source lives in 'modules'.
It is split up into two folders, 'core' and 'utils'

### core

The code in 'core' is meant to be a direct copy of HTM code and functionality as it
exists in current and past implementations of the original authors of HTM. It is currently
a WIP and only basic functionality is implemented for now, but these functions are meant
to be equivalent to the functions written in the java version of HTM developed by William O'Mullane. It is not the most current C# version but it is clean and concise and also my strongest language, and optimizations that work in C# are not likely to work in javascript anyway.

### utils

Code in utils is meant to be tools or functions that utilize HTM functionality in some way but were not originally part of HTM core functionality.

For more details on what HTM is and what it is/can be used for, please see
the publication by the authors ((https://arxiv.org/pdf/cs/0701164.pdf))
and its website (http://www.skyserver.org/htm/)
