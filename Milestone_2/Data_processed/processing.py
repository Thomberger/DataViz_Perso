import os.path
import pandas as pd
import numpy as np

Before_data_folder =  os.path.join(os.path.abspath(os.path.dirname(__file__)),  "../Data/")
After_data_folder = os.path.abspath(os.path.dirname(__file__))

# %% Circuits

races_df = pd.read_csv(Before_data_folder + "races.csv")
circuits_df = pd.read_csv(Before_data_folder + "circuits.csv")
Full_df = races_df.merge(circuits_df,on='circuitId',suffixes=['_x',''])[['location','country','circuitId','year','name','lat', 'lng']]
Full_df['TOT'] = np.ones((Full_df.shape[0],1))


Full_df.to_csv(After_data_folder+"/races.csv",index=False)

# %% lapt times

laptimes_df = pd.read_csv(Before_data_folder + "lap_times.csv")
drivers_df = pd.read_csv(Before_data_folder + "drivers.csv")

Full_df = laptimes_df.merge(races_df,on='raceId',suffixes=['_x',''])[['driverId','milliseconds','year','circuitId']]

Full_df = Full_df.loc[Full_df.groupby(['year', 'circuitId'])["milliseconds"].idxmin()]


t=Full_df.merge(drivers_df,on='driverId',suffixes=['_x','']).sort_values(['circuitId','year'])[['circuitId','driverId','milliseconds','year','forename','surname']]

t.to_csv(After_data_folder+"/laps.csv",index=False)
