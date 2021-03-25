import pandas as pd
from sklearn.preprocessing import LabelEncoder

def wrangle_df(dataframe):
    df = dataframe.copy()
    df.continentName = df.continentName.fillna('Unknown')
    df.countryCode = df.countryCode.fillna('UNK')
    df.countryName = df.countryName.fillna('Unknown')

    df['country'] = df.countryName
    df.drop(labels="countryName", axis=1, inplace=True)

    df.country = df.country.str.title()
    df.continentName = df.continentName.str.title()
    df.domain = df.domain.str.title()
    df.industry = df.industry.str.title()
    df.occupation = df.occupation.str.title()

    df.loc[df.country.str.startswith('The Netherlands'), 'country'] = 'Netherlands'

    # remove Unknown birthyear
    try:
        df.birthyear = df.birthyear.str.strip('s?')
        df = df.loc[df.birthyear != 'Unknown']
        df.birthyear = pd.to_numeric(df.birthyear)
    except AttributeError:
        pass

    def merge_fields(x):
        year = f'{x.birthcity}, {x.country.title()} ({int(abs(x.birthyear))}'
        year += ')' if x.birthyear > 0 else ' BC)'
        return year

    df['birth'] = df.apply(merge_fields, axis=1)
    return df


def objectify(x):
    return {
        "geometry": {
            "type": "Point",
            "coordinates": [x.LON, x.LAT]
        },
        "type": "Feature",
        "properties": {
            "en_curid": x['en_curid'],
            "name": x['name'],
            "birth": x.birth,
            "country": x.country,
            "continent": x.continentName,
            "domain": x.domain,
            "occupation": x.occupation,
            "hpi": x.HPI,
        }
    }


def export_map(dataframe):

    df = dataframe.copy()
    le = LabelEncoder()
    df.domain = le.fit_transform(df.domain)

    return {
        "type": "FeatureCollection",
        "features": list(df.apply(objectify, axis=1)),
        "properties": {
            "fields": {
                "en_curid": {
                    "name": "ID"
                },
                "name": {
                   "name": "Name"
                },
                "birth": {
                   "name": "Birth"
                },
                "continent": {
                   "name": "Continent"
                },
                "country": {
                   "name": "Country"
                },
                "domain": {
                    #"lookup": dict(zip(df.domain.unique(), [str(i) for i in range(len(df.domain.unique()))])),
                    "lookup": dict(zip(list(range(len(le.classes_))), le.classes_)),
                    "name": "Domain"
                },
                "occupation": {
                   "name": "Occupation"
                },
                "hpi": {
                   "name": "Popularity"
                },
            },
            "attribution": "Pantheon dataset",
            "description": "Famous people"
        }
    }


def fix_coordinates(dataframe, code):

    df = dataframe.copy()
    for i, x in df.loc[df.loc[:, ['LON', 'LAT']].isna().any(axis=1)].iterrows():
        try:
            df.loc[i,'LON'] = code[code.Code == x.countryCode].Longitude.item()
            df.loc[i,'LAT'] = code[code.Code == x.countryCode].Latitude.item()
        except ValueError:
            df.loc[i,'LON'] = 0
            df.loc[i,'LAT'] = -75
    return df

