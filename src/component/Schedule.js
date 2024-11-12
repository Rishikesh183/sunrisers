import React, { useEffect } from 'react'
import { useState } from 'react';
import ScheduleCard from './ScheduleCard';
import '../Styles/Matches.css'

const Schedule = () => {

  const [Matches, setMatches] = useState([]);
  useEffect(() => {
    async function fetchItems() {
      try {
        const response = await fetch('https://sunrisers-8841a-default-rtdb.firebaseio.com/.json');
        const data = await response.json();

        if (!data || !data.Details) return; // Ensure data and Details are available

        // Use the Details array directly
        const transformedData = data.Details.map((match, index) => ({
          ...match,
          id: index,
        }));

        setMatches(transformedData);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    }
    fetchItems();
  }, []);

  return (
    <>
      <div className='bg-gray-100 pt-6'>
        <div><h1 className='font-bold text-3xl text-orange-600 uppercase container max-w-[60vw] m-auto pb-3'>SRH SCHEDULE 2024 - schedule & results</h1></div>
        <div className='bg-Image container max-w-[60vw] m-auto min-h-[92vh]'>
          {
            Matches.map(item => (
              <ScheduleCard key={item.id} data={item} />
            ))
          }
        </div>
      </div>
    </>
  )
}

export default Schedule




