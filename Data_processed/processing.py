import os.path
import pandas as pd
import numpy as np

Before_data_folder =  os.path.join(os.path.abspath(os.path.dirname(__file__)),  "../Data/")
After_data_folder = os.path.abspath(os.path.dirname(__file__))

races_df = pd.read_csv(Before_data_folder + "races.csv")
circuits_df = pd.read_csv(Before_data_folder + "circuits.csv")
Full_df = races_df.merge(circuits_df,on='circuitId',suffixes=['_x',''])[['circuitId','year','name','lat', 'lng']]
Full_df['TOT'] = np.ones((Full_df.shape[0],1))


Full_df.to_csv(After_data_folder+"/races.csv")