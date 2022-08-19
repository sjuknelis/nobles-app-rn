import React, { useState } from 'react';

import { View, Container, KEY_COLOR } from '../components/Themed';
import { ScheduleList } from '../components/ScheduleList';
import { DateSelector } from '../components/DateSelector';

export function DirectoryScheduleScreen({ openMenu,options,setSubscreen,carryState }) {
  return (
    <ScheduleList selectedDay={carryState} providedPNO={options.pno} />
  );
}

