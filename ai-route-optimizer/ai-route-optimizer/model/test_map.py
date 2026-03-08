import folium

m = folium.Map(location=[18.52, 73.85], zoom_start=12)
m.save("test_map.html")