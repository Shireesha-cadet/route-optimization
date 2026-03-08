import math

def calculate_distance(lat1, lon1, lat2, lon2):
    return math.sqrt((lat1 - lat2)**2 + (lon1 - lon2)**2)


def find_best_route(data):

    locations = data.to_dict('records')

    warehouse = locations[0]
    customers = locations[1:]

    route = [warehouse]
    current = warehouse

    while customers:

        nearest = min(
            customers,
            key=lambda x: calculate_distance(
                current["Latitude"], current["Longitude"],
                x["Latitude"], x["Longitude"]
            )
        )

        route.append(nearest)
        customers.remove(nearest)
        current = nearest

    return route