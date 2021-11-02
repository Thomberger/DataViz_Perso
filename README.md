# Project of Data Visualization (COM-480)

## 🏎 Formula 1 Visualization 🏎️

**To see the final website, you can visit the following [link](https://thomberger.github.io/DataViz_Perso/Milestone_3/index.html).**


[Milestone 1](#milestone-1-23rd-april-5pm) • [Milestone 2](#milestone-2-7th-may-5pm) • [Milestone 3](#milestone-3-4th-june-5pm)

## Milestone 1 (23rd April, 5pm)

**10% of the final grade**

### Dataset

Our work will focus on the "Formula 1 World Championship (1950 - 2021)" dataset extracted from [Kaggle](https://www.kaggle.com/rohanrao/formula-1-world-championship-1950-2020).

The dataset contains all the information about races, drivers, circuits, and constructors over more than 70 years of racing. Additionally, the data set contains all the points received after each race by the drivers and the constructors. Furthermore, for some years it even contains all the qualifying (1994-2021), lap-times (1996-2021), pit-stops (2011-2021) information.<br>
The dataset is already clean and ready to use, a data exploration will be needed to get a grasp on how the data is organized and what visualization is possible to achieve.


### Problematic

The main aspect we would like to show with our visualization is the gigantic history of Formula 1 racing. We want the general public to get a grasp on how Formula 1 evolved through time, and discover more details about the tracks and how performance is always increasing.<br>
We also want the "hardcore" fan to be able to explore the history of racing discovering interesting facts they didn't know. By analyzing past seasons or races or checking pilots' summaries.

Therefore we think about multiple views we would like to cover.
 - Geographic positions and evolution of tracks through time.
 - Details about tracks ( SVG, best lap-times through history, ...)
 - Past seasons overview (Driver standings, constructors standings, race locations)
 - Details about pilots and constructors (evolution through years)
 - Details about every Grand Prix (Podium, time deltas, best lap, ...)

The main idea is to be able to see general data allowing you to understand the general history of F1 and be able to dive into really precise points you want to know about.

The main schematic is to have a page containing a time range and and world map with all circuits locations during this time range.<br>
 - By clicking on a certain object the page will transform to view the object selected on the linked time range. <br>You can click on a circuit (on the map), on a pilot or on a team (on the second view)<br>
 - By clicking on a specific date you can view the pilots standing for this season, the constructors standing for this season and details about this specific Grand Prix.<br>The pilot and constructor standing should be clickable and bring you to the detailed view of one pilot/constructor over the linked time range.<br>

<p align="center">

| Main view | Statistic view with time range | Statistic view with specific time |
| :---------------: | :--------------------------------------------------: | :------------------------------------------------------: |
| <img src="/Images/Main_view.jpeg" width="300" > | <img src="/Images/Stat_View_time_range.jpeg" width="300" > | <img src="/Images/Stat_View_specific_time.jpeg" width="300" > |

</p>

### Exploratory Data Analysis

We explored the dataset in this [Jupyter Notebook](/Milestone_1/Exploratory_Data_Analysis.ipynb) using mainly the pandas library.  

### Related work

##### What others have already done with the data?

These previous works mainly focus on pilots or constructor history giving insights about the number of wins, podium, poles, points,... However, they all present an interesting way of interacting with the data.
 - [Data Visualization](https://f1-goat.herokuapp.com/#!/dashboard) | [Data Story](https://jasonjpaul.squarespace.com/formula-1-data-vis) : This visualization is well designed and give an interesting overview of pilot performance and a small recap about seasons. It also allows you to explore a lot of insight. However, some details are unclear and a lot of data may be unclear at first view.
 - [Data Visualization](https://public.tableau.com/en-us/gallery/visual-history-formula-1) | [Data Story](https://public.tableau.com/en-us/s/blog/2019/07/behind-viz-james-smith-talks-illustrator-tableau-public-and-formula-1) : This visualization is not interactive but it gives a lot of interesting fact on the whole history of formula 1. It speaks mostly about drivers and constructors but also give small facts about locations, tires, and engines
 - [Data Visualization](https://davidor.github.io/formula1-lap-charts/#/) | [Data Story](https://github.com/davidor/formula1-lap-charts) : This visualization show how each race evolved through laps. Compare to other similar visualization it's a clear way to see one race with only one graph. The possibility to focus on one driver makes the graph even easier to understand.

##### Why is your approach original?
However, our approach is interesting as it focuses on another aspect of formula 1 and gives insight into the different locations and race tracks. It will also allow to aggregate data over a custom time range which was not possible on the previous visualizations. Finally, our approach will allow getting details about drivers, constructors, and each Grand Prix all in the same place.


## Milestone 2 (7th May, 5pm)

The report of milestone 2 can be found here: [Report pdf](/Milestone_2/Report_Milestone2.pdf)<br>
The website of milestone 2 can be found here:  [Website skeleton](https://thomberger.github.io/DataViz_Perso/Milestone_2/index.html)


## Milestone 3 (4th June, 5pm)

**80% of the final grade**

To see the final website, you can visit the following [link](https://thomberger.github.io/DataViz_Perso/Milestone_3/index.html).

The video showing how the visualization works can be found in the following [link](https://www.youtube.com/watch?v=TbKRwhvaats).

The process book can be found [here](/Milestone_3/ProcessBook.pdf).

The project is structured as follows:

```       
├───Data/             				       Original dataset used
├───Images/      				            Images used in the readme
├───Milestone_1/         		            Files used for milestone 1
|    └───Exploratory_Data_Analysis.ipynb 	Notebook used for data exploration.       
|
├───Milestone_2/         			        Files used for milestone 2
|    ├───Circuit-svg/				        Svg of circuit tracks
|    ├───Data_processed/			         Data_processed for better used in website
|    ├───favicons/				           Favicons for website
|    └───files				               Website files and pdf report        
|
├───Milestone_3/         			        Files used for milestone 2
|    ├───Data_processed/			         Data_processed for better used in website
|    ├───favicons/				           Favicons for website
|    ├───Images/				             Images used for in the website
|    └───files			               	Website files and pdf report        
|
├───index.html: 			             	html file that redirects to the visualization
                                             (to ./Milestone_3/index.html).
```

To run our project locally, you need to do:

- Clone the repo
- Move into the `Milestone_3/` folder
- Start a local server (e.g. using ```python -m http-server```), the website is generally available at ```localhost:8000/```
