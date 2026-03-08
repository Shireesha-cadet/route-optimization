import folium

def create_route_map(route):
    # Start at the warehouse
    start_lat = route[0]["Latitude"]
    start_lon = route[0]["Longitude"]

    m = folium.Map(location=[start_lat, start_lon], zoom_start=13)

    points = []

    # Add markers and prepare route points
    for stop in route:
        lat = stop["Latitude"]
        lon = stop["Longitude"]
        points.append((lat, lon))

        folium.Marker(
            [lat, lon],
            popup=stop["Location"]
        ).add_to(m)

    # Draw the route line
    folium.PolyLine(points, color="blue", weight=2.5, opacity=1).add_to(m)

    # Save the map
    m.save("delivery_route_map.html")