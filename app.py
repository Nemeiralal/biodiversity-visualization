
from flask import Flask, jsonify, render_template, request, flash, redirect


import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func, desc,select

import pandas as pd
import numpy as np

engine = create_engine("sqlite:///db/belly_button_biodiversity.sqlite",connect_args={'check_same_thread': False})
Base = automap_base()
Base.prepare(engine, reflect=True)

Otu = Base.classes.otu
Samples = Base.classes.samples
Samples_Metadata= Base.classes.samples_metadata

session = Session(engine)

app = Flask(__name__)
@app.route("/")
def landing():
    return render_template("myindex.html")



@app.route('/otu')
def otu():
    """Return Otu details"""
    results = session.query(Otu.lowest_taxonomic_unit_found).all()

    otu_list = list(np.ravel(results))
    return jsonify(otu_list)

@app.route('/names')
def names():
    """List of samples by their name."""

    stmt = session.query(Samples).statement
    df = pd.read_sql_query(stmt, session.bind)
    df.set_index('otu_id', inplace=True)

    return jsonify(list(df.columns))

@app.route('/metadata/<sample>')
def sample_detail(sample):
    """Return the details of sample passed to it."""
    sel = [Samples_Metadata.SAMPLEID, Samples_Metadata.ETHNICITY,
           Samples_Metadata.GENDER, Samples_Metadata.AGE,
           Samples_Metadata.LOCATION, Samples_Metadata.BBTYPE]

    results = session.query(*sel).\
        filter(Samples_Metadata.SAMPLEID == sample[3:]).all()

    sample_data = {}
    for result in results:
        sample_data['SAMPLEID'] = result[0]
        sample_data['ETHNICITY'] = result[1]
        sample_data['GENDER'] = result[2]
        sample_data['AGE'] = result[3]
        sample_data['LOCATION'] = result[4]
        sample_data['BBTYPE'] = result[5]

    return jsonify(sample_data)

@app.route('/washfreq/<sample>')
def sample_washfreq(sample):
    """Weekly Washing Frequency as no."""

    results = session.query(Samples_Metadata.WFREQ).\
        filter(Samples_Metadata.SAMPLEID == sample[3:]).all()
    wfreq = np.ravel(results)

    return jsonify(int(wfreq[0]))

@app.route('/samples/<sample>')
def samples(sample):
    
    stmt = session.query(Samples).statement
    df = pd.read_sql_query(stmt, session.bind)

    if sample not in df.columns:
        return jsonify(f"Oooo! Sample: {sample} Missing!"), 400

    df = df[df[sample] > 1]

    df = df.sort_values(by=sample, ascending=0)

    data = [{
        "otu_ids": df[sample].index.values.tolist(),
        "sample_values": df[sample].values.tolist()
    }]
    return jsonify(data)
if __name__ == "__main__":
    app.run(debug=True)
   
    