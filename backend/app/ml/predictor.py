import pandas as pd
import numpy as np

from .model import categorical_columns,training_columns,model

def preprocess_features(features:dict):
    df=pd.DataFrame([features])
    df=pd.get_dummies(
        df,
        columns=categorical_columns,
        drop_first=True
    )

    df=df.reindex(
        columns=training_columns,
        fill_value=0
    )
    return df

def predict_return(features:dict):
    x=preprocess_features(features)
    prediction=model.predict(x)
    prob=model.predict_proba(x)[0][1]

    return {
        "prediction":int(prediction),
        "return_prob":round(float(prob),2)
    }
