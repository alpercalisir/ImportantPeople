# Visual Analytics Project: Important People 
*Contributors:* Alper Calisir, Artur Back de Luca, and Stefano Cappai

# Dataset
We propose to use the [Pantheon 1.0](https://dataverse.harvard.edu/dataset.xhtml?persistentId=doi:10.7910/DVN/28201&version=1.0) dataset.
It includes 11,341 biographies that have support of more than 25 languages in Wikipedia.
These are further enriched with manually verified demographic information (place and date of birth, gender), occupations classifying each biography at three levels of aggregation and two measures of global popularity including the number of languages in which a biography is present in Wikipedia (L), and the Historical Popularity Index (HPI) a metric that combines information on L, time since birth, and page-views (2008-2013).

# General idea
Our general idea consists of creating a dashboard in which the end-user may explore the registered biographies geografically and temporally. We also provide the user some analyses regarding the popularity of someone's work with respect to its demographic information and occupation.

# Try Here
The data visualization tool can be previewed [here](https://calisir.github.io/ImportantPeople/).

## Features

- **World Map**: located on the first left tab, it allows the user to interact with data
organized geographically
- **Scatter Plot**: on the second left tab, it displays historical information reduced to
three dimensions
- **Tree Map**: on the third left tab, it displays the hierarchical composition of domains
and occupations ranked by its 5 most relevant personalities
- **Cities Map**: on the first right tab, it displays the most important countries and cities
of birth
- **Parallel Map**: on the second right tab, it shows the summary of 4 features (continent,
gender, domain, and industry);
- **Internet Results**: once a point in the scatter plot is clicked, a tab on the right section
displays the Wikipedia article that corresponds to the historical figure selected.


## Tech Stack
- [D3.js]
- [Bootstrap]
- [Node.js]

## Documentation
You can read the technical report [here](https://github.com/calisir/ImportantPeople/blob/master/Report.pdf).

## Installation

```sh
git clone https://github.com/calisir/ImportantPeople.git
npm install
npm run start
```

   [D3.js]: <https://d3js.org>
   [Bootstrap]: <https://getbootstrap.com>
   [Node.js]: <https://nodejs.org/en/>
