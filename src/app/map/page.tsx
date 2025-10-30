"use client";

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Truck } from '@/lib/types';
import Map from '@/components/Map';
import { isTruckOpenNow } from '@/lib/utils';

export default function Page() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openNow, setOpenNow] = useState(false);
  const [center, setCenter] = useState<[number, number]>([52.1561, 5.3878]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [filteredTrucks, setFilteredTrucks] = useState<Truck[]>([]);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.warn('Geolocation not available or denied', error);
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchTrucks = async () => {
      const snapshot = await getDocs(collection(db, 'trucks'));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Truck),
      }));
      setTrucks(data);
    };
    fetchTrucks().catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    const now = new Date();
    const filtered = trucks.filter((truck) => {
      const nameMatch = truck.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const cuisineMatch = truck.cuisine?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSearch = !searchTerm || nameMatch || cuisineMatch;
      const matchesOpen = !openNow || isTruckOpenNow(truck, now);
      return matchesSearch && matchesOpen;
    });
    setFilteredTrucks(filtered);
  }, [searchTerm, openNow, trucks]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search trucks or cuisines..."
        className="px-3 py-2 border rounded w-full"
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={openNow}
          onChange={(e) => setOpenNow(e.target.checked)}
        />
        Open Now
      </label>
      <Map center={center} trucks={filteredTrucks} />
    </div>
  );
}
