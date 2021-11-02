import os.path
import pandas as pd
import numpy as np

Before_data_folder =  "../../Data/"
After_data_folder = "./"

# %% Circuits

races_df = pd.read_csv(Before_data_folder + "races.csv")
races_df = races_df[races_df.year != 2021]

circuits_df = pd.read_csv(Before_data_folder + "circuits.csv")
Full_df = races_df.merge(circuits_df,on='circuitId',suffixes=['_x',''])[['location','country','circuitId','year','name','lat', 'lng','alt']]
Full_df['TOT'] = np.ones((Full_df.shape[0],1))


Full_df.to_csv(After_data_folder+"/races.csv",index=False)

# %% lapt times

laptimes_df = pd.read_csv(Before_data_folder + "lap_times.csv")
drivers_df = pd.read_csv(Before_data_folder + "drivers.csv")

Full_df = laptimes_df.merge(races_df,on='raceId',suffixes=['_x',''])[['driverId','milliseconds','year','circuitId']]

Full_df = Full_df.loc[Full_df.groupby(['year', 'circuitId'])["milliseconds"].idxmin()]


t=Full_df.merge(drivers_df,on='driverId',suffixes=['_x','']).sort_values(['circuitId','year'])[['circuitId','driverId','milliseconds','year','forename','surname']]

t.to_csv(After_data_folder+"/laps.csv",index=False)

# %% Standings

driverstanding_df = pd.read_csv(Before_data_folder + "driver_standings.csv")
results_df = pd.read_csv(Before_data_folder + "results.csv")

t2 = races_df.groupby(['year'], sort=False)['raceId'].max().sort_index(ascending=False)
t3 = driverstanding_df[driverstanding_df['raceId'].isin(t2)].sort_values(['raceId','points'],ascending=False)[['raceId','driverId','points','position']]
t3['raceId'] = t3['raceId'].replace(t2.tolist(),t2.index.tolist())
t3 = t3.rename(columns={'raceId': 'year'}).merge(drivers_df,on='driverId',suffixes=['_x','']).sort_values(['year','points'],ascending=False)[['year','driverId', 'points','position','forename','surname']]
t3['name'] = t3.forename + " " + t3.surname
t3 = t3.drop(['forename','surname'],axis=1)

results_df=results_df.merge(races_df, on='raceId')

podium = results_df[results_df['positionOrder'].astype('int') <= 3].groupby(['year','driverId'])['positionOrder'].count()
racedone = results_df[results_df['positionOrder'].astype('int') <= 999].groupby(['year','driverId'])['positionOrder'].count()
win  = results_df[results_df['positionOrder'].astype('int') == 1].groupby(['year','driverId'])['positionOrder'].count()
pole = results_df[results_df['grid'].astype('int') == 1].groupby(['year','driverId'])['grid'].count()

t3 = t3.merge(podium,on=['year','driverId'],how='left')
t3 = t3.merge(win,on=['year','driverId'],how='left')
t3 = t3.merge(racedone,on=['year','driverId'],how='left')
t3 = t3.merge(pole,on=['year','driverId'],how='left').fillna(0)
t3 = t3.rename(columns={'positionOrder_x': 'podium','positionOrder_y': 'wins','positionOrder': 'racedone','grid': 'pole'})

t3.to_csv(After_data_folder+"/Driver_standings.csv",index=False,float_format="%d")
#
constructorstanding_df = pd.read_csv(Before_data_folder + "constructor_standings.csv")
constructors_df = pd.read_csv(Before_data_folder + "constructors.csv")

t4 = constructorstanding_df[constructorstanding_df['raceId'].isin(t2)].sort_values(['raceId','points'],ascending=False)[['raceId','constructorId','points','position']]
t4['raceId'] = t4['raceId'].replace(t2.tolist(),t2.index.tolist())
t4 = t4.rename(columns={'raceId': 'year'}).merge(constructors_df,on='constructorId',suffixes=['_x','']).sort_values(['year','points'],ascending=False)[['year','constructorId', 'points','position','name']]



podium = results_df[results_df['positionOrder'].astype('int') <= 3].groupby(['year','constructorId'])['positionOrder'].count()
racedone = results_df[results_df['positionOrder'].astype('int') <= 999].groupby(['year','constructorId','raceId'])['positionOrder'].count()
racedone = racedone.groupby(['year','constructorId']).count()
win  = results_df[results_df['positionOrder'].astype('int') == 1].groupby(['year','constructorId'])['positionOrder'].count()
pole = results_df[results_df['grid'].astype('int') == 1].groupby(['year','constructorId'])['grid'].count()

t4 = t4.merge(podium,on=['year','constructorId'],how='left')
t4 = t4.merge(win,on=['year','constructorId'],how='left')
t4 = t4.merge(racedone,on=['year','constructorId'],how='left')
t4 = t4.merge(pole,on=['year','constructorId'],how='left').fillna(0)
t4 = t4.rename(columns={'positionOrder_x': 'podium','positionOrder_y': 'wins','positionOrder': 'racedone','grid': 'pole'})

t4.to_csv(After_data_folder+"/Constructor_standings.csv",index=False,float_format="%d")

# %% Find maximums


championshipC = t4[t4['position'] == 1 ].groupby('constructorId')['position'].count()
t4 = t4.groupby(['constructorId']).sum()
t4['ratio'] = t4.wins/t4.racedone

championshipD = t3[t3['position'] == 1 ].groupby('driverId')['position'].count()
t3 = t3.groupby(['driverId']).sum()
t3['ratio'] = t3.wins/t3.racedone

ceircuit = pd.read_json(f1-circuits.geojson)