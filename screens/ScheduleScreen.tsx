import React, { useState } from 'react';

import { View, Container, KEY_COLOR } from '../components/Themed';
import { ScheduleList } from '../components/ScheduleList';
import { DateSelector } from '../components/DateSelector';

export default function ScheduleScreen({ openMenu }) {
  let dayOfWeek = new Date().getDay();
  if ( dayOfWeek == 0 || dayOfWeek == 6 ) dayOfWeek = 1;
  const [selectedDay,setSelectedDay] = useState(dayOfWeek - 1);

  return (
    <Container title="SCHEDULE" menuButton={{
      icon: "bars",
      action: openMenu
    }} upperChildren={(
      <View style={{
        padding: 5
      }}>
        <DateSelector refWeek={0} setSelectedDate={({index,date}) => setSelectedDay(index)} inverted={true} />
      </View>
    )}>
      <ScheduleList selectedDay={selectedDay} />
    </Container>
  );
}

