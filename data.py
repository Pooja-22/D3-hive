from pyhive import hive
import pandas as pd

def getData():
    conn = hive.Connection(host="54.194.54.83", auth="CUSTOM", username='hive', password="pvXxHTsdqrt8", port=10000)
    df = pd.read_sql("select * from test_sales", conn)
    records = df.head(n=170)
    print(records.to_json(orient='records'))

getData();

