import React, { useState } from "react";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import axios from "axios";

export default function App() {
  const [value, setValue] = useState('');
  const [selectedStation, setSelectedStation] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchStations = async (query) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://apis.deutschebahn.com/db-api-marketplace/apis/ris-stations/v1/stop-places/by-name/${query}?limit=5`,
        {
          headers: {
            Accept: "application/vnd.de.db.ris+json",
            "DB-Client-ID": "29000f562786c177ff7d56f0e6f962b5",
            "DB-Api-Key": "065de587ce50d2d9144d7eaeabd2ebf2",
          }
        }
      );
      setStations(response.data.stopPlaces);
    } catch (error) {
      console.error("Error fetching stations:", error);
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchStations = debounce(fetchStations, 300);

  const onSelectionChange = (station) => {
    setSelectedStation(station.names.DE.nameLong);
  };
  
  const onInputChange = async (value) => {
    setValue(value);
    try {
      if (value.trim() !== "") {
        await debouncedFetchStations(value);
      } else {
        setStations([]);
      }
    } catch (error) {
      console.error("Error fetching stations:", error);
    }
  };

  return (
    <div className="flex w-full flex-col">
      <Autocomplete 
        label="Search for a station" 
        variant="bordered"
        className="max-w-xs" 
        allowsCustomValue={true}
        onSelectionChange={onSelectionChange}
        onInputChange={onInputChange}
        value={value}
        loading={loading}
      >
        {stations.map(station => (
          <AutocompleteItem key={station.evaNumber} value={station.names.DE.nameLong}>
            {station.names.DE.nameLong}
          </AutocompleteItem>
        ))}
      </Autocomplete>
      <p className="mt-1 text-small text-default-500">Current selected station: {selectedStation}</p>
    </div>
  );
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
