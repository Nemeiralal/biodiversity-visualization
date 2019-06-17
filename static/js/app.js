function chart_Modify(Otu_data, Sample_data) {
    var value_of_sample = Sample_data[0]['sample_values'];
    var otu_Id = Sample_data[0]['otu_ids'];
    var labels = otu_Id.map(function(item) {
        return Otu_data[item]
    });
    var bubble_Chart = document.getElementById('bubble_Chart');
    Plotly.restyle(bubble_Chart, 'x', [otu_Id]);
    Plotly.restyle(bubble_Chart, 'y', [value_of_sample]);
    Plotly.restyle(bubble_Chart, 'text', [labels]);
    Plotly.restyle(bubble_Chart, 'marker.size', [value_of_sample]);
    Plotly.restyle(bubble_Chart, 'marker.color', [otu_Id]);
    var pie_Chart = document.getElementById('pie_Chart');
    var pie_chart_Modify = {
        values: [value_of_sample.slice(0, 10)],
        labels: [otu_Id.slice(0, 10)],
        hovertext: [labels.slice(0, 10)],
        hoverinfo: 'hovertext',
        type: 'pie'
    };
    Plotly.restyle(pie_Chart, pie_chart_Modify);
}

function chart_Creater(Otu_data, Sample_data) {
    var labels = Sample_data[0]['otu_ids'].map(function(item) {
        return Otu_data[item]
    });
    var bubble_Chart_Layout = {
        margin: { t: 0 },
        hovermode: 'closest',
        xaxis: { title: 'Otu Id' }
    };
    var bubble_Chart_Data = [{
        x: Sample_data[0]['otu_ids'],
        y: Sample_data[0]['sample_values'],
        text: labels,
        mode: 'markers',
        marker: {
            size: Sample_data[0]['sample_values'],
            color: Sample_data[0]['otu_ids'],
            colorscale: "Earth",
        }
    }];
    var bubble_Chart = document.getElementById('bubble_Chart');
    Plotly.plot(bubble_Chart, bubble_Chart_Data, bubble_Chart_Layout);
    console.log(Sample_data[0]['sample_values'].slice(0, 10))
    var pie_Chart_Layout = {
        margin: { t: 0, l: 0 }
    };
	var pie_Chart_Data = [{
        values: Sample_data[0]['sample_values'].slice(0, 10),
        labels: Sample_data[0]['otu_ids'].slice(0, 10),
        hovertext: labels.slice(0, 10),
        hoverinfo: 'hovertext',
        type: 'pie'
    }];
    var pie_Chart = document.getElementById('pie_Chart');
    Plotly.plot(pie_Chart, pie_Chart_Data, pie_Chart_Layout);
}

function refresh_metaData(details) {
    var sample_Detail_pnl = document.getElementById("sample-metadata");
    sample_Detail_pnl.innerHTML = '';
    for(var key in details) {
        h6tag = document.createElement("h6");
        h6Text = document.createTextNode(`${key}: ${details[key]}`);
        h6tag.append(h6Text);
        sample_Detail_pnl.appendChild(h6tag);
    }
}

function data_filler_and_chart_creater(sample, method_2_call) {
    Plotly.d3.json(`/samples/${sample}`, function(error, sample_data) {
        if (error) return console.warn(error);
        Plotly.d3.json('/otu', function(error, otu_data) {
            if (error) return console.warn(error);
            method_2_call(otu_data, sample_data);
        });
    });
    Plotly.d3.json(`/metadata/${sample}`, function(error, meta_data) {
        if (error) return console.warn(error);
        refresh_metaData(meta_data);
    })
    // now build the guage chart for which code is given in bonus.js
    Gauge(sample);
}
function initializer() {
    var selDataset = document.getElementById('selDataset');
    Plotly.d3.json('/names', function(error, samplesList) {
        for (var i = 0; i < samplesList.length;  i++) {
            var currentOption = document.createElement('option');
            currentOption.text = samplesList[i];
            currentOption.value = samplesList[i]
            selDataset.appendChild(currentOption);
        }
        data_filler_and_chart_creater(samplesList[0], chart_Creater);
    })
}
function optionChanged(sample_Selected) {
    data_filler_and_chart_creater(sample_Selected, chart_Modify);
}
function init() {
    initializer();
}
// dashboard initialization
init();

