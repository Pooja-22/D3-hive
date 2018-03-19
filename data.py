from pyhive import hive
import pandas as pd

def getData():
    conn = hive.Connection(host="52.48.118.224", auth="CUSTOM", username='hive', password="pvXxHTsdqrt8", port=10000, database='tapro_atg')
    df = pd.read_sql("select * from sales_data_leisure_view", conn)
    records = df.head(n=100000)
    print(records.to_json(orient='records'))

getData();

