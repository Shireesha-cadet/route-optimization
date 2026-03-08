import pandas as pd
from model.route_optimizer import find_best_route

data = pd.read_csv("data/delivery_locations.csv")

print("Delivery Locations Dataset:\n")
print(data)

route = find_best_route(data)

print("\nOptimized Delivery Route:\n")

for stop in route:
    print(stop["Location"])